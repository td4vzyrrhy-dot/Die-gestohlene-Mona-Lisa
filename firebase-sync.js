// ==========================
// FIREBASE
// ==========================
// Loaded dynamically only when DEMO_MODE is false. No npm/build step.
// Only the allowlisted group document is transmitted; personal notes, marks,
// answer drafts and notebook entries never pass through this adapter.
export const firebaseConfig = {
  apiKey: 'AIzaSyDUvjIzBrSipR5yBFPMozDzgprJ15X7NxU',
  authDomain: 'die-gestohlene-mona-lisa.firebaseapp.com',
  databaseURL: 'https://die-gestohlene-mona-lisa-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'die-gestohlene-mona-lisa',
  storageBucket: 'die-gestohlene-mona-lisa.firebasestorage.app',
  messagingSenderId: '376315789338',
  appId: '1:376315789338:web:8479c141c0b0af115c11a3'
};
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const list = value => Array.isArray(value) ? value.filter(v => v != null) : Object.values(value || {});
const keys = value => Object.keys(value || {}).filter(key => value[key]);
const roles = ['A','B','C','D','E'];
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function decodeGroup(code, raw) {
  if (!raw?.settings) return null;
  const board = raw.board || {};
  return {
    groupCode: code, groupSize: raw.settings.groupSize, createdAt: raw.settings.createdAt,
    instanceId: raw.settings.instanceId,
    members: Object.entries(raw.members || {}).map(([id,m]) => ({ id, role:m.role, joinedAt:m.joinedAt, online:m.online === true, simulated:false })).sort((a,b) => roles.indexOf(a.role)-roles.indexOf(b.role)),
    phase: raw.phase || 'waiting',
    readyMembers: keys(raw.readyMembers),
    board: {
      positions: board.positions || {}, connections: list(board.connections),
      discardedCards: keys(board.discardedCards), order:list(board.order),
      layoutVersion:board.layoutVersion || 0, cardBundleVersion:board.cardBundleVersion || 0,
      thoughts:{ text:board.thoughts?.text || '', strokes:list(board.thoughts?.strokes) }
    },
    usedJokers:keys(raw.jokers?.used).map(Number).sort(),
    jokersRemaining:raw.jokers?.remaining ?? 3,
    verdict:raw.verdict || null, solved:raw.solved === true,
    finalAnswers:raw.finalAnswers || {}
  };
}
export function encodeGroup(group) {
  const board = group.board;
  return {
    settings:{groupSize:group.groupSize,createdAt:group.createdAt,instanceId:group.instanceId},
    members:Object.fromEntries(group.members.map(m => [m.id,{role:m.role,joinedAt:m.joinedAt,online:m.online === true}])),
    phase:group.phase,
    readyMembers:Object.fromEntries(group.readyMembers.map(role => [role,true])),
    board:{
      positions:clone(board.positions),
      connections:Object.fromEntries(board.connections.map(c => [c.id,{id:c.id,from:c.from,to:c.to,label:c.label}])),
      discardedCards:Object.fromEntries(board.discardedCards.map(id => [id,true])),
      order:[...(board.order || [])], layoutVersion:board.layoutVersion || 0, cardBundleVersion:board.cardBundleVersion || 0,
      thoughts:{text:board.thoughts?.text || '',strokes:Object.fromEntries((board.thoughts?.strokes || []).map(s => [s.id,{id:s.id,author:s.author,points:s.points}]))}
    },
    jokers:{remaining:group.jokersRemaining,used:Object.fromEntries(group.usedJokers.map(i => [i,true]))},
    verdict:group.verdict || null, solved:group.solved === true,
    finalAnswers:clone(group.finalAnswers || {})
  };
}
export function firebaseErrorMessage(error) {
  const code = String(error?.code || error?.message || error);
  if (/configuration-not-found|operation-not-allowed|CONFIGURATION_NOT_FOUND/i.test(code)) return 'Die anonyme Geräteanmeldung ist noch nicht eingerichtet. Bitte in Firebase unter Authentication die Anmeldemethode „Anonym“ aktivieren.';
  if (/permission.?denied|PERMISSION_DENIED/i.test(code)) return 'Firebase verweigert den Zugriff. Bitte die mitgelieferten Datenbankregeln veröffentlichen.';
  if (/api-key|unauthorized-domain/i.test(code)) return 'Die Firebase-Konfiguration oder die Freigabe der Webadresse muss geprüft werden.';
  return error?.userMessage || 'Die Verbindung zur Ermittlungszentrale wurde unterbrochen.';
}
function failure(message) { const error = new Error(message); error.userMessage = message; return error; }
function randomId() { const bytes = new Uint32Array(4); crypto.getRandomValues(bytes); return Array.from(bytes,n => n.toString(36)).join('-'); }
function randomCode() { const bytes = new Uint32Array(4); crypto.getRandomValues(bytes); return Array.from(bytes,n => alphabet[n % alphabet.length]).join(''); }

export async function createFirebaseAdapter(callbacks) {
  const [appSDK, authSDK, databaseSDK] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js')
  ]);
  const app = appSDK.getApps().find(app => app.name === 'mona-lisa') || appSDK.initializeApp(firebaseConfig,'mona-lisa');
  const auth = authSDK.getAuth(app);
  await authSDK.setPersistence(auth,authSDK.browserLocalPersistence);
  await auth.authStateReady();
  if (!auth.currentUser) await authSDK.signInAnonymously(auth);
  // Firebase generates a random anonymous UID and persists it on this browser.
  const memberId = auth.currentUser.uid;
  return makeFirebaseAdapter(databaseSDK,databaseSDK.getDatabase(app),memberId,callbacks);
}

// The SDK is injected to exercise the identical adapter against a deterministic
// multi-client test backend as well as the real RTDB SDK.
export function makeFirebaseAdapter(sdk, db, memberId, callbacks = {}) {
  let code = '', instanceId = '', authoritative = null, cached = null;
  let connected = false, everConnected = false, disconnected = false;
  let subscriptions = [], generation = 0, queuedNotify = false, running = false;
  const pending = [];
  let disconnectRegistration = null;
  let destroyed = false;
  const groupRef = target => sdk.ref(db,'groups/'+target);
  const reportError = error => callbacks.onError?.(firebaseErrorMessage(error));
  const isPending = () => pending.length > 0;
  const rebuild = () => {
    cached = clone(authoritative);
    if (cached) for (const entry of pending) {
      if (entry.generation === generation) entry.change(cached);
    }
    // No optimistic final: only an acknowledged group decision opens the reveal.
    if (cached && !authoritative?.solved) cached.solved = false;
    return clone(cached);
  };
  const notify = () => {
    if (queuedNotify) return;
    queuedNotify = true;
    queueMicrotask(() => {
      queuedNotify = false;
      if (!destroyed && code) callbacks.onGroup?.(rebuild(),{pending:isPending()});
    });
  };
  async function presence(currentGeneration) {
    if (!connected || !code || currentGeneration !== generation) return;
    const targetCode = code;
    const onlineRef = sdk.ref(db,`groups/${targetCode}/members/${memberId}/online`);
    disconnectRegistration = sdk.onDisconnect(onlineRef);
    try {
      // Register onDisconnect before setting online, including every reconnect.
      await disconnectRegistration.set(false);
      if (currentGeneration === generation) {
        await sdk.runTransaction(groupRef(targetCode),raw => {
          if (!raw?.members?.[memberId] || raw.settings?.instanceId !== instanceId) return;
          raw.members[memberId].online = true;
          return raw;
        },{applyLocally:false});
      }
    } catch (error) { if (currentGeneration === generation) reportError(error); }
  }
  const stopConnection = sdk.onValue(sdk.ref(db,'.info/connected'), snapshot => {
    connected = snapshot.val() === true;
    if (connected) {
      const restored = disconnected;
      everConnected = true; disconnected = false;
      callbacks.onConnection?.(true,restored ? 'Verbindung wiederhergestellt.' : '');
      presence(generation);
      drain();
    } else {
      disconnected = everConnected;
      callbacks.onConnection?.(false,'Die Verbindung zur Ermittlungszentrale wurde unterbrochen.');
    }
  },reportError);
  async function waitConnected() {
    if (connected) return;
    await new Promise((resolve,reject) => {
      const timeout = setTimeout(() => { off(); reject(failure('Die Verbindung zur Ermittlungszentrale wurde unterbrochen.')); },12000);
      let off = () => {};
      off = sdk.onValue(sdk.ref(db,'.info/connected'),snap => { if (snap.val() === true) { clearTimeout(timeout); queueMicrotask(off); resolve(); } });
    });
  }
  function unsubscribe(retirePresence = true) {
    if (retirePresence && code && connected) {
      const oldCode = code, oldInstance = instanceId;
      sdk.runTransaction(groupRef(oldCode),raw => {
        if (!raw?.members?.[memberId] || raw.settings?.instanceId !== oldInstance) return;
        raw.members[memberId].online = false; return raw;
      },{applyLocally:false}).catch(() => {});
    }
    generation++;
    subscriptions.forEach(off => off()); subscriptions = [];
    disconnectRegistration?.cancel().catch(() => {});
    disconnectRegistration = null;
    code = ''; cached = null; authoritative = null; instanceId = '';
  }
  function subscribe(targetCode, initial) {
    unsubscribe(targetCode !== code);
    code = targetCode; instanceId = initial.instanceId;
    authoritative = clone(initial); rebuild();
    const myGeneration = generation;
    const sections = ['settings','members','phase','readyMembers','board','jokers','verdict','solved','finalAnswers'];
    const raw = encodeGroup(initial);
    const received = new Set();
    // All required paths have realtime listeners. Notifications are batched so
    // one atomic update does not cause nine DOM renders. Listeners never write.
    for (const section of sections) subscriptions.push(sdk.onValue(sdk.ref(db,`groups/${code}/${section}`),snapshot => {
      if (myGeneration !== generation) return;
      raw[section] = snapshot.val(); received.add(section);
      if (received.size !== sections.length) return;
      const incoming = decodeGroup(targetCode,raw);
      authoritative = incoming?.instanceId === instanceId ? incoming : null;
      notify();
    },error => { if (myGeneration === generation) reportError(error); }));
    presence(myGeneration);
    return clone(initial);
  }
  async function createGroup(size, board) {
    if (![3,4,5].includes(size)) throw failure('Bitte wähle 3, 4 oder 5 Personen.');
    await waitConnected();
    for (let attempt=0;attempt<40;attempt++) {
      const targetCode = randomCode();
      const stamp = Date.now();
      const initial = {groupCode:targetCode,groupSize:size,createdAt:stamp,instanceId:randomId(),members:[{id:memberId,role:'A',joinedAt:stamp,online:true}],phase:'waiting',board:clone(board),readyMembers:[],jokersRemaining:3,usedJokers:[],verdict:null,solved:false,finalAnswers:{}};
      // A transaction, not a read-then-set, reserves an unused four-character code.
      const result = await sdk.runTransaction(groupRef(targetCode),raw => raw == null ? encodeGroup(initial) : undefined,{applyLocally:false});
      if (result.committed) return subscribe(targetCode,decodeGroup(targetCode,result.snapshot.val()));
    }
    throw failure('Es konnte kein freier Gruppencode gefunden werden. Bitte versuche es erneut.');
  }
  async function joinGroup(targetCode) {
    await waitConnected();
    const snapshot = await sdk.get(groupRef(targetCode));
    if (!snapshot.exists()) throw failure('Gruppe nicht gefunden. Bitte prüfe euren Gruppencode.');
    const expectedInstance = snapshot.val().settings.instanceId;
    let reason = '';
    const stamp = Date.now();
    const result = await sdk.runTransaction(groupRef(targetCode),raw => {
      if (raw == null) return null; // A cold cache can cause an initial null callback.
      if (raw.settings?.instanceId !== expectedInstance) { reason = 'Diese Gruppe wurde zurückgesetzt.'; return; }
      raw.members ||= {};
      if (raw.members[memberId]) { raw.members[memberId].online = true; return raw; }
      if (raw.phase !== 'waiting') { reason = 'Diese Ermittlung läuft bereits. Ein Beitritt ist nur in der Teamphase möglich.'; return; }
      const taken = new Set(Object.values(raw.members).map(m => m.role));
      if (Object.keys(raw.members).length >= raw.settings.groupSize) { reason = 'Diese Ermittlungsgruppe ist bereits vollständig.'; return; }
      const role = roles.slice(0,raw.settings.groupSize).find(role => !taken.has(role));
      if (!role) { reason = 'Diese Ermittlungsgruppe ist bereits vollständig.'; return; }
      raw.members[memberId] = {role,joinedAt:stamp,online:true};
      return raw;
    },{applyLocally:false});
    const joined = decodeGroup(targetCode,result.snapshot.val());
    if (!result.committed || !joined?.members.some(m => m.id === memberId)) throw failure(reason || 'Gruppe nicht gefunden.');
    return subscribe(targetCode,joined);
  }
  async function resume(targetCode, expectedInstance) {
    await waitConnected();
    const snapshot = await sdk.get(groupRef(targetCode));
    const group = decodeGroup(targetCode,snapshot.val());
    if (!group || (expectedInstance && group.instanceId !== expectedInstance)) throw failure('Diese Ermittlung wurde bereits zurückgesetzt.');
    if (!group.members.some(m => m.id === memberId)) throw failure('Dieses Gerät gehört nicht mehr zu dieser Gruppe. Bitte erneut beitreten.');
    return subscribe(targetCode,group);
  }
  function mutate(change) {
    if (!cached) { reportError(failure('Diese Gruppe ist nicht mehr vorhanden.')); return null; }
    pending.push({change, generation, code, instanceId});
    const optimistic = rebuild();
    callbacks.onPending?.(pending.length);
    drain();
    return optimistic;
  }
  async function drain() {
    if (running || !connected || destroyed) return;
    running = true;
    try {
      while (pending.length && connected) {
        const entry = pending[0];
        if (entry.generation !== generation) { pending.shift(); continue; }
        try {
          const result = await sdk.runTransaction(groupRef(entry.code),raw => {
            if (raw == null) return null;
            if (raw.settings?.instanceId !== entry.instanceId || !raw.members?.[memberId]) return;
            const group = decodeGroup(entry.code,raw);
            entry.change(group);
            return encodeGroup(group);
          },{applyLocally:false});
          if (!result.committed || !result.snapshot.exists()) throw failure('Diese Ermittlung wurde zurückgesetzt oder dein Gerät gehört nicht mehr zur Gruppe.');
          // The listeners own authoritative state: a transaction acknowledgement
          // can arrive after a newer remote update and must never overwrite it.
        } catch (error) {
          if (entry.generation === generation) reportError(error);
        }
        pending.shift();
        callbacks.onPending?.(pending.length);
        if (entry.generation === generation) notify();
      }
    } finally { running = false; }
  }
  async function flush() {
    await waitConnected();
    while (pending.length || running) await new Promise(resolve => setTimeout(resolve,25));
  }
  async function leaveGroup() {
    await flush();
    const targetCode = code, expectedInstance = instanceId;
    let reason = '';
    const result = await sdk.runTransaction(groupRef(targetCode),raw => {
      if (raw == null) return null;
      if (raw.settings?.instanceId !== expectedInstance) return;
      if (raw.phase !== 'waiting') { reason = 'Eine laufende Ermittlung kann nur gemeinsam zurückgesetzt werden.'; return; }
      delete raw.members?.[memberId];
      // Never reassign the roles of remaining devices. A newcomer fills the gap.
      return Object.keys(raw.members || {}).length ? raw : null;
    },{applyLocally:false});
    if (!result.committed) throw failure(reason || 'Die Gruppe konnte nicht verlassen werden.');
    unsubscribe();
  }
  async function deleteGroup() {
    await flush();
    const targetCode = code, expectedInstance = instanceId;
    const result = await sdk.runTransaction(groupRef(targetCode),raw => {
      if (raw == null) return null;
      if (raw.settings?.instanceId !== expectedInstance || !raw.members?.[memberId]) return;
      return null;
    },{applyLocally:false});
    if (!result.committed) throw failure('Die Gruppe konnte nicht zurückgesetzt werden.');
    unsubscribe();
  }
  return {memberId, createGroup, joinGroup, resume, mutate, leaveGroup, deleteGroup, flush,
    readGroup:target => target === code ? rebuild() : null,
    isConnected:() => connected, pendingCount:() => pending.length,
    unsubscribe, destroy() { destroyed = true; unsubscribe(); stopConnection(); }
  };
}
