const DEMO_MODE = false;
'use strict';

// Images are bundled in assets. The demo works offline; Firebase mode uses the CDN adapter.
const PREFIX = DEMO_MODE ? 'mona-lisa:v1:' : 'mona-lisa:firebase:v1:';
const ROLES = ['A', 'B', 'C', 'D', 'E'];
const PHASES = ['start', 'group', 'waiting', 'newspaper', 'individual', 'discussion', 'board', 'verdict', 'questions', 'final', 'notebook', 'report'];
const DISTRIBUTION = {
  3: { A: 'ATOM1 ATOM2 ATOM3 ATOM4 ATOM5 LABOR1 MASSE1', B: 'MASSE2 MASSE3 MASSE4 LABOR2 IDENT1 IDENT2 PSE1 PSE2', C: 'PSE3 PSE4 PSE5 PSE6 KUNST1 KUNST2 KUNST3 KUNST4 KUNST5 KUNST6' },
  4: { A: 'ATOM1 ATOM2 ATOM3 ATOM4 ATOM5 LABOR1', B: 'MASSE1 MASSE2 MASSE3 MASSE4 LABOR2 IDENT1 IDENT2', C: 'PSE1 PSE2 PSE3 PSE4 PSE5 PSE6', D: 'KUNST1 KUNST2 KUNST3 KUNST4 KUNST5 KUNST6' },
  5: { A: 'ATOM1 ATOM2 ATOM3 ATOM4 ATOM5', B: 'LABOR1 LABOR2 MASSE1 MASSE2 MASSE3 MASSE4', C: 'IDENT1 IDENT2 PSE1 PSE2 PSE3', D: 'PSE4 PSE5 PSE6 PSE7 PSE8', E: 'KUNST1 KUNST2 KUNST3 KUNST4 KUNST5 KUNST6' }
};
const CARD_ROWS = [
  ['ATOM1','atom','Der Aufbau eines Atoms','Atome bestehen aus einem Atomkern und einer Atomhülle.'],
  ['ATOM2','atom','Im Atomkern','Im Atomkern befinden sich Protonen und Neutronen.'],
  ['ATOM3','atom','Die Atomhülle','Elektronen befinden sich in der Atomhülle.'],
  ['ATOM4','atom','Elektrische Ladung','Protonen sind positiv geladen.\nNeutronen sind ungeladen.'],
  ['ATOM5','atom','Neutrales Atom','Bei einem neutralen Atom ist die Anzahl der Protonen genauso groß wie die Anzahl der Elektronen.'],
  ['LABOR1','labor','LABORBERICHT 17-B','Analyse des unbekannten Elements\n\nErmittelter Wert:\n\nMASSENZAHL: 48','lab'],
  ['LABOR2','labor','RÖNTGENANALYSE','Beim untersuchten Element wurden\n\n26 NEUTRONEN\n\nfestgestellt.','lab'],
  ['MASSE1','masse','Massenzahl','Die Massenzahl beschreibt die Anzahl der Teilchen im Atomkern.'],
  ['MASSE2','masse','Zwei Teilchenarten','Zwei verschiedene Teilchenarten tragen zur Massenzahl eines Atoms bei.'],
  ['MASSE3','masse','Rekonstruktion','Kennt man die Massenzahl und die Anzahl einer der beiden Teilchenarten im Kern, lässt sich die Anzahl der anderen bestimmen.'],
  ['MASSE4','masse','Interne Notiz','48 ist wichtig.\n\nAber 48 ist NICHT die Zahl, nach der wir im Periodensystem suchen müssen.','note'],
  ['IDENT1','ident','Fingerabdruck eines Elements','Die Anzahl einer bestimmten Teilchenart im Atomkern legt eindeutig fest, um welches chemische Element es sich handelt.'],
  ['IDENT2','ident','Elementarten','Alle Atome derselben Elementsorte besitzen im Atomkern die gleiche Anzahl einer bestimmten Teilchenart.'],
  ['PSE1','pse','Ordnung im Periodensystem','Die Elemente sind im Periodensystem nach steigender Ordnungszahl angeordnet.'],
  ['PSE2','pse','Ordnungszahl','Jede Elementsorte besitzt eine charakteristische Ordnungszahl.'],
  ['PSE3','pse','Verbindung zum Atomkern','Die Ordnungszahl hängt direkt mit einer Teilchenart im Atomkern zusammen.'],
  ['PSE4','pse','Nebengruppen','Die Nebengruppenelemente befinden sich im mittleren Bereich des Periodensystems.'],
  ['PSE5','pse','Pigmentanalyse','Das unbekannte Element im weißen Pigment wurde als Nebengruppenelement identifiziert.'],
  ['PSE6','pse','Auszug aus dem Periodensystem','Ein Ausschnitt aus dem mittleren Bereich des Periodensystems.','pse'],
  ['PSE7','pse','Zeilen im Periodensystem','Die waagerechten Zeilen des Periodensystems heißen Perioden.'],
  ['PSE8','pse','Spalten im Periodensystem','Die senkrechten Spalten des Periodensystems heißen Gruppen.'],
  ['KUNST1','kunst','Leonardo da Vinci','Leonardo da Vinci lebte von 1452 bis 1519.'],
  ['KUNST2','kunst','Die Mona Lisa','Die Mona Lisa entstand zu Beginn des 16. Jahrhunderts.'],
  ['KUNST3','kunst','Bleiweiß','Bleiweiß wurde bereits seit der Antike als weißes Farbpigment verwendet.'],
  ['KUNST4','kunst','Zinkweiß','Zinkweiß wurde deutlich später als Bleiweiß als Künstlerpigment verwendet.'],
  ['KUNST5','kunst','Titanweiß','Ein weiteres weißes Künstlerpigment enthält Verbindungen des Elements Titan.'],
  ['KUNST6','kunst','Archivfund','Dieses titanbasierte Weißpigment wurde erst im 20. Jahrhundert als Künstlerfarbe verbreitet eingesetzt.'],
  ['SPUR1','kunst','Bildträger','Die Mona Lisa wurde auf Pappelholz gemalt.'],
  ['SPUR2','kunst','Herkunft','Leonardo da Vinci wurde in Italien geboren.'],
  ['SPUR3','archiv','Stadtplan Paris','Paris liegt an der Seine.'],
  ['SPUR4','atom','Elektronen','Elektronen sind negativ geladen.'],
  ['SPUR5','pse','Eisen','Eisen besitzt die Ordnungszahl 26.'],
  ['SPUR6','pse','Zink','Zink besitzt die Ordnungszahl 30.'],
  ['SPUR7','kunst','Ein früherer Diebstahl','Die Mona Lisa wurde 1911 bereits einmal aus dem Louvre gestohlen.'],
  ['SPUR8','kunst','Zusammensetzung von Farben','Farben können aus verschiedenen Pigmenten bestehen.']
];
const CARDS = CARD_ROWS.map(([id, category, title, text, type = 'evidence']) => {
  const card = { id, category, title, text, type, importance: id.startsWith('SPUR') ? 'context' : 'evidence' };
  for (const size of [3, 4, 5]) {
    card['role' + size] = id.startsWith('SPUR') ? ROLES[(Number(id.slice(4)) - 1) % size] :
      Object.keys(DISTRIBUTION[size]).find(role => DISTRIBUTION[size][role].split(' ').includes(id)) || null;
  }
  return card;
});
// Bundle related information only when all supported group sizes assign it to
// the same person. Original objects stay available for restoring older sessions.
const CARD_BUNDLES = [
  ['ATOM1', 'Atomkern und Atomhülle', ['ATOM2','ATOM3']],
  ['ATOM4', 'Ladung und neutrales Atom', ['ATOM5']],
  ['MASSE2', 'Massenzahl rekonstruieren', ['MASSE3']],
  ['IDENT1', 'Fingerabdruck eines Elements', ['IDENT2']],
  ['PSE1', 'Ordnung und Ordnungszahl', ['PSE2']],
  ['PSE4', 'Nebengruppen und Pigmentanalyse', ['PSE5']],
  ['PSE7', 'Perioden und Gruppen', ['PSE8']]
];
for (const [id,title,others] of CARD_BUNDLES) {
  const head = CARDS.find(c => c.id === id);
  const parts = [head,...others.map(other => CARDS.find(c => c.id === other))];
  if (![3,4,5].every(size => parts.every(c => c['role'+size] === head['role'+size]))) throw new Error('Inconsistent card bundle');
  head.title = title;
  head.text = parts.map(c => c.text).join('\n\n');
  head.sourceIds = parts.map(c => c.id);
  parts.slice(1).forEach(c => { c.mergedInto = id; });
}
function canonicalCardId(id) { return CARDS.find(c => c.id === id)?.mergedInto || id; }
const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));
const CATEGORY_NAMES = { atom: 'ATOMAUFBAU', labor: 'LABORANALYSE', masse: 'KERNANALYSE', ident: 'ELEMENTIDENTITÄT', pse: 'PERIODENSYSTEM', kunst: 'KUNSTARCHIV', archiv: 'ARCHIV' };
const ELEMENTS = [[21,'Sc','Scandium'],[22,'Ti','Titan'],[23,'V','Vanadium'],[24,'Cr','Chrom'],[25,'Mn','Mangan'],[26,'Fe','Eisen'],[27,'Co','Cobalt'],[28,'Ni','Nickel'],[29,'Cu','Kupfer'],[30,'Zn','Zink']];
const LABELS = ['besteht aus','enthält','entspricht','ergibt','gehört zu','hängt zusammen mit','wurde verwendet','führt zu','beweist','deshalb'];
const JOKERS = ['Welche beiden Teilchenarten befinden sich im Atomkern?', 'Ihr kennt die Massenzahl und die Anzahl der Neutronen.\nWelche Teilchenzahl könnt ihr daraus bestimmen?', 'Wenn ihr die Protonenzahl kennt, untersucht ihren Zusammenhang mit der Ordnungszahl.'];
const QUESTIONS = [
  'Welche beiden Teilchenarten bestimmen gemeinsam die Massenzahl?',
  'Das untersuchte Atom besitzt die Massenzahl 48 und 26 Neutronen. Wie viele Protonen besitzt es?',
  'Welche Ordnungszahl ergibt sich und welches Element findet ihr damit im Periodensystem?',
  'Wie heißt das weiße Pigment, das euer gefundenes Element enthält?',
  'Warum spricht dieses Pigment gegen die Echtheit des Gemäldes?'
];
const DEFINITIONS = {
  mass: { question: 0, title: 'Massenzahl', prompt: 'Die Massenzahl gibt an, …', help: 'Erkläre, was gezählt wird. Eine Zahl allein reicht hier nicht.' },
  proton: { question: 1, title: 'Protonen', prompt: 'Protonen sind … Sie befinden sich …', help: 'Beschreibe ihre Ladung und ihren Ort im Atom.' },
  neutron: { question: 1, title: 'Neutronen', prompt: 'Neutronen sind … Sie befinden sich …', help: 'Beschreibe ihre Ladung und ihren Ort im Atom.' },
  ordinal: { question: 2, title: 'Ordnungszahl', prompt: 'Die Ordnungszahl gibt an, … Deshalb erkennt man daran …', help: 'Erkläre den Zusammenhang mit dem Atombau und der Identität des Elements.' },
};
function definitionKeys(size, role) { return Object.keys(DEFINITIONS).filter(key => QUESTION_ROLES[size][role].includes(DEFINITIONS[key].question)); }
function definitionFields(q, role) {
  const fields = Object.entries(DEFINITIONS).filter(([,d]) => d.question === q);
  if (!fields.length) return '';
  return `<fieldset class="definition-fields"><legend>Zuerst erklären: die Fachbegriffe</legend>${fields.map(([key,d]) => `<div><label for="definition-${key}">${d.title} – was bedeutet das?</label><p id="definition-help-${key}" class="help-text">${d.help}</p><textarea id="definition-${key}" name="definition-${key}" data-definition="${key}" aria-describedby="definition-help-${key}" required maxlength="1500" placeholder="${d.prompt}">${escapeHTML(gameState.definitionDrafts?.[role]?.[key] || '')}</textarea></div>`).join('')}</fieldset><p class="eyebrow application-label">Jetzt anwenden: der Fall</p>`;
}
const QUESTION_ROLES = { 3: { A: [0,1], B: [2], C: [3,4] }, 4: { A: [0], B: [1], C: [2], D: [3,4] }, 5: { A: [0], B: [1], C: [2], D: [3], E: [4] } };
const FINAL_STEPS = [ ['LABORANALYSE','Massenzahl: 48'], ['KERNANALYSE','Neutronen: 26'], ['REKONSTRUKTION','48 − 26 = 22'], ['ATOMKERN','22 Protonen'], ['PERIODENSYSTEM','Ordnungszahl 22'], ['ELEMENTIDENTITÄT','Ti · TITAN'], ['PIGMENT','Titan → Titanweiß'], ['ARCHIVFUND','Titanweiß: verbreitete Verwendung als Künstlerpigment erst im 20. Jahrhundert'], ['ZEITLICHER VERGLEICH','Mona Lisa: Anfang des 16. Jahrhunderts'] ];
const FINAL_TEXT = 'Die chemische Analyse hat den entscheidenden Beweis geliefert.\n\nAus der Massenzahl 48 und den 26 Neutronen ergibt sich eine Protonenzahl von 22.\n\nDiese Protonenzahl führt zur Ordnungszahl 22.\n\nIm Periodensystem findet sich dort das Element Titan.\n\nTitan ist Bestandteil von Titanweiß.\n\nTitanweiß wurde erst viele Jahrhunderte nach Leonardo da Vincis Zeit verbreitet als Künstlerpigment verwendet.\n\nDas sichergestellte Gemälde kann daher nicht das Original sein.';
function blankState() {
  return { groupCode: '', groupSize: 4, role: null, members: [], phase: 'start', cards: [], importantCards: [], notes: '', board: { positions: {}, discardedCards: [], connections: [], order: [] }, readyMembers: [], jokersRemaining: 3, usedJokers: [], verdict: null, finalAnswers: {}, solved: false, finalStep: 0, answerDrafts: {}, definitionDrafts: {}, notebookAnswers: {}, questionRole: null };
}
const gameState = blankState();
const app = document.getElementById('app');
const modal = document.getElementById('modal');
let memoryStorage = {};
let storageWarning = false;
let clientId;
try { clientId = sessionStorage.getItem(PREFIX + 'client') || uniqueId(); sessionStorage.setItem(PREFIX + 'client', clientId); } catch (_) { clientId = uniqueId(); }
let connectFrom = null;
let activeInk = null;
let writingMode = 'text';
let activeDrag = null;
let remotePending = false;
let boardScroll = { left: 0, top: 0 };
let toastTimer;
let previouslyFocused;
let resumeCandidate = null;
function uniqueId() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,10); }
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function readStorage(key) { try { return JSON.parse(localStorage.getItem(PREFIX + key) || 'null'); } catch (_) { return memoryStorage[key] || null; } }
function writeStorage(key, value) { memoryStorage[key] = JSON.parse(JSON.stringify(value)); try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (_) { if (!storageWarning) { storageWarning = true; toast('Speichern ist in diesem Browser gesperrt. Bitte lasse diesen Tab geöffnet.'); } } }
function removeStorage(key) { delete memoryStorage[key]; try { localStorage.removeItem(PREFIX + key); } catch (_) {} }
function saveGameState() { const snapshot = { version: 1, clientId, state: gameState }; writeStorage('session:' + clientId, snapshot); if (gameState.groupCode) writeStorage('latest', snapshot); }
function loadGameState() { const saved = readStorage('session:' + clientId) || readStorage('latest'); if (!saved || saved.version !== 1 || !saved.state?.groupCode || !PHASES.includes(saved.state.phase)) return null; return saved; }
function toast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4200); }
function action(label, id, classes = '', attrs = '') { return `<button type="button" class="${classes}" data-action="${id}" aria-label="${escapeHTML(label.replace(/<[^>]*>/g, ''))}" ${attrs}>${label}</button>`; }
function page(title, content, eyebrow = 'AKTE 017 · SONDERERMITTLUNG', narrow = true) { return `<section class="page ${narrow ? 'narrow' : ''}"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${content}</section>`; }
function openDialog(title, content, buttons = '', locked = false) {
  previouslyFocused = document.activeElement;
  if (modal.open) modal.close();
  document.getElementById('modal-content').innerHTML = `<h2 id="modal-title">${title}</h2>${content}<div class="actions">${buttons || action('SCHLIESSEN','close-modal','secondary')}</div>`;
  modal.dataset.locked = String(locked);
  modal.showModal();
}
function closeDialog() { modal.dataset.locked = 'false'; modal.close(); if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true }); }
modal.addEventListener('cancel', event => { if (modal.dataset.locked === 'true') event.preventDefault(); });
function assignRoles(members) { return members.map((member, i) => ({ ...member, role: ROLES[i] })); }
function groupKey(code = gameState.groupCode) { return 'group:' + code; }

// ======================
// FIREBASE START
// ======================
// ==========================
// FIREBASE
// ==========================
// Personal notes, marks and unfinished answers stay in local storage.
let firebaseAdapter = null;
let firebaseInit = null;
let cloudBusy = false;
function connectionStatus(message = '') {
  const el = document.getElementById('connection-status');
  if (el) { el.textContent = message; el.hidden = !message; }
}
async function initializeFirebase() {
  if (firebaseAdapter) return firebaseAdapter;
  if (!firebaseInit) firebaseInit = import('./firebase-sync.js').then(async module => {
    const adapter = await module.createFirebaseAdapter({
      onGroup(shared) {
        if (!gameState.groupCode || (shared && shared.groupCode !== gameState.groupCode)) return;
        if (activeDrag || activeInk || modal.open || document.activeElement?.matches?.('textarea,input,select')) { remotePending = true; return; }
        handleRemoteGroup();
      },
      onConnection(online,message) {
        connectionStatus(online ? '' : message + ' Änderungen werden bei Rückkehr der Verbindung übertragen. Bitte diesen Tab geöffnet lassen.');
        if (online && message) toast(message);
      },
      onError(message) { connectionStatus(message); toast(message); }
    });
    firebaseAdapter = adapter;
    clientId = adapter.memberId;
    writeStorage('member-id',clientId);
    return adapter;
  }).catch(error => { firebaseInit = null; throw error; });
  return firebaseInit;
}
async function cloudAction(task) {
  if (cloudBusy) return;
  cloudBusy = true;
  try { return await task(await initializeFirebase()); }
  catch (error) {
    const module = await import('./firebase-sync.js').catch(() => null);
    const message = module ? module.firebaseErrorMessage(error) : 'Die Verbindung zur Ermittlungszentrale wurde unterbrochen.';
    connectionStatus(message); toast(message);
  } finally { cloudBusy = false; }
}
function enterCloudGroup(shared, restored) {
  Object.assign(gameState,blankState(),restored || {},{groupCode:shared.groupCode,groupSize:shared.groupSize,instanceId:shared.instanceId});
  syncGroupState(shared);
  setPhase(restored?.phase || (shared.phase === 'waiting' ? 'waiting' : 'newspaper'));
  handleRemoteGroup();
}
function resumeCloudGroup() {
  if (!resumeCandidate) return;
  const candidate = resumeCandidate;
  return cloudAction(async adapter => {
    const shared = await adapter.resume(candidate.state.groupCode,candidate.state.instanceId);
    closeDialog(); resumeCandidate = null;
    enterCloudGroup(shared,candidate.state);
  });
}
function readGroup(code = gameState.groupCode) {
  if (DEMO_MODE) return readStorage(groupKey(code));
  return firebaseAdapter?.readGroup(code) || null;
}
function writeGroup(group) {
  if (DEMO_MODE) { writeStorage(groupKey(group.groupCode), group); return; }
  throw new Error('Gemeinsame Änderungen werden im Firebase-Modus als Transaktion gespeichert.');
}
function mutateGroup(change) {
  if (!DEMO_MODE) { const shared = firebaseAdapter?.mutate(change); if (shared) syncGroupState(shared); return shared || null; }
  const shared = readGroup();
  if (!shared) { toast('Diese Gruppe ist nicht mehr vorhanden.'); return null; }
  change(shared);
  shared.updatedAt = Date.now();
  writeGroup(shared);
  syncGroupState(shared);
  return shared;
}
function createGroup(size = gameState.groupSize) {
  if (![3,4,5].includes(size)) return;
  if (!DEMO_MODE) return cloudAction(async adapter => enterCloudGroup(await adapter.createGroup(size,{...blankState().board,layoutVersion:2,cardBundleVersion:1,order:shuffle(CARDS.filter(c => !c.mergedInto && c['role'+size]).map(c => c.id))})));
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(''); } while (readGroup(code));
  Object.assign(gameState, blankState(), { groupSize: size, groupCode: code, role: 'A' });
  const shared = { groupCode: code, groupSize: size, members: assignRoles([{ id: clientId, simulated: false }]), phase: 'waiting', board: gameState.board, readyMembers: [], jokersRemaining: 3, usedJokers: [], verdict: null, finalAnswers: {}, solved: false };
  writeGroup(shared); syncGroupState(shared); setPhase('waiting');
}
function joinGroup(code) {
  code = code.trim().toUpperCase();
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(code)) return 'Bitte gib einen gültigen Gruppencode mit vier Zeichen ein.';
  if (!DEMO_MODE) return cloudAction(async adapter => enterCloudGroup(await adapter.joinGroup(code)));
  const shared = readGroup(code);
  if (!shared) return 'Gruppe nicht gefunden. Im Demo-Modus funktioniert der Code nur in Tabs desselben Browsers.';
  if (shared.phase !== 'waiting') return 'Diese Ermittlung läuft bereits. Ein Beitritt ist nur in der Teamphase möglich.';
  const existing = shared.members.find(m => m.id === clientId);
  if (!existing && shared.members.length >= shared.groupSize) return 'Diese Gruppe ist bereits vollständig.';
  if (!existing) shared.members = assignRoles([...shared.members, { id: clientId, simulated: false }]);
  writeGroup(shared);
  Object.assign(gameState, blankState(), { groupCode: code, groupSize: shared.groupSize });
  syncGroupState(shared); setPhase('waiting');
  return null;
}
function leaveGroup() {
  if (!DEMO_MODE) return cloudAction(async adapter => { await adapter.leaveGroup(); clearLocalMembership(); });
  const shared = readGroup();
  if (shared?.phase !== 'waiting') { toast('Eine laufende Ermittlung kann nur gemeinsam zurückgesetzt werden.'); return; }
  if (shared) {
    shared.members = assignRoles(shared.members.filter(m => m.id !== clientId));
    if (shared.members.length) writeGroup(shared); else removeStorage(groupKey());
  }
  clearLocalMembership();
}
function clearLocalMembership() {
  removeStorage('session:' + clientId);
  const latest = readStorage('latest'); if (latest?.clientId === clientId) removeStorage('latest');
  Object.assign(gameState, blankState()); setPhase('group');
}
function syncGroupState(shared = readGroup()) {
  if (!shared) return;
  for (const key of ['groupSize','members','board','readyMembers','jokersRemaining','usedJokers','verdict','finalAnswers','solved']) gameState[key] = shared[key];
  if (shared.instanceId) gameState.instanceId = shared.instanceId;
  gameState.role = shared.members.find(m => m.id === clientId)?.role || gameState.role;
  gameState.importantCards = [...new Set(gameState.importantCards.map(canonicalCardId))];
  gameState.cards = CARDS.filter(c => !c.mergedInto && c['role' + gameState.groupSize] === gameState.role).map(c => c.id);
  saveGameState();
}
function syncBoardState(change) { return mutateGroup(shared => change(shared.board)); }
function saveBoardState(id, position) {
  syncBoardState(board => {
    board.positions[id] = position;
    board.discardedCards = Object.keys(board.positions).filter(key => board.positions[key].zone === 'discard');
  });
}
function loadBoardState() { const shared = readGroup(); if (shared) gameState.board = shared.board; return gameState.board; }
function listenForGroupChanges() {
  if (!DEMO_MODE) return; // Firebase subscriptions are attached when joining/resuming.
  window.addEventListener('storage', event => {
    if (!gameState.groupCode || event.key !== PREFIX + groupKey()) return;
    if (activeDrag || activeInk || modal.open || document.activeElement?.matches?.('[data-team-notes]')) { remotePending = true; return; }
    handleRemoteGroup();
  });
}
// ======================
// FIREBASE END
// ======================
function handleRemoteGroup() {
  remotePending = false;
  const shared = readGroup();
  if (!shared) {
    openDialog('Ermittlung zurückgesetzt', '<p>Die Daten dieser Gruppe wurden auf einem anderen Gerät oder in einem anderen Tab gelöscht.</p>', action('ZUR STARTSEITE','reset-local'), true); return;
  }
  syncGroupState(shared);
  if (shared.solved && !['final','notebook','report'].includes(gameState.phase)) setPhase('final');
  else if (!DEMO_MODE && gameState.phase === 'waiting' && shared.phase !== 'waiting') setPhase('newspaper');
  else if (['verdict','questions'].includes(shared.phase) && ['board','verdict','questions'].includes(gameState.phase) && shared.phase !== gameState.phase) setPhase(shared.phase);
  else if (shared.phase === 'board' && ['discussion','questions','verdict'].includes(gameState.phase)) setPhase('board');
  else if (['waiting','discussion','board'].includes(gameState.phase)) render();
  else if (gameState.phase === 'questions') {
    const status = document.getElementById('answer-status');
    if (status) status.textContent = `${Object.keys(gameState.finalAnswers).length} von ${gameState.groupSize} Rollen haben ihre Begründung eingereicht.`;
  }
}
function simulateGroup() {
  mutateGroup(shared => {
    if (shared.phase !== 'waiting') return;
    while (shared.members.length < shared.groupSize) shared.members.push({ id: 'demo-' + uniqueId(), simulated: true });
    shared.members = assignRoles(shared.members);
  });
  render();
}
function activeCards() { return CARDS.filter(c => !c.mergedInto && c['role' + gameState.groupSize]); }
function shuffle(values) { const a = [...values]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function migrateBoardLayout(board) {
  if (board.layoutVersion === 2) return;
  for (const p of Object.values(board.positions)) {
    if (p.zone !== 'board') continue;
    if (p.y >= 55 && p.y < 660 && p.x >= 975 && p.x < 2775) {
      p.x -= 950; p.y += 655;
    } else if (p.y >= 710 && p.y < 1315 && p.x >= 25 && p.x < 925) {
      p.x += 925; p.y -= 655;
    } else if (p.y >= 710 && p.y < 1315 && p.x >= 975 && p.x < 1875) {
      p.x += 900; p.y -= 655;
    }
  }
  board.layoutVersion = 2;
}
function migrateCardBundles(board) {
  if (board.cardBundleVersion === 1) return;
  for (const [id,,others] of CARD_BUNDLES) {
    const positions = [id,...others].map(key => board.positions[key]).filter(Boolean);
    const kept = positions.find(p => p.zone === 'board') || board.positions[id] || positions[0];
    if (kept) board.positions[id] = { ...kept };
    others.forEach(key => { delete board.positions[key]; });
  }
  board.order = [...new Set((board.order || []).map(canonicalCardId))];
  const seen = new Set();
  board.connections = board.connections.map(c => ({ ...c, from: canonicalCardId(c.from), to: canonicalCardId(c.to) })).filter(c => {
    const key = JSON.stringify([c.from,c.to,c.label]);
    if (c.from === c.to || seen.has(key)) return false;
    seen.add(key); return true;
  });
  board.discardedCards = Object.keys(board.positions).filter(id => board.positions[id].zone === 'discard');
  board.cardBundleVersion = 1;
}
function ensureBoard() {
  if (gameState.board.order?.length && gameState.board.layoutVersion === 2 && gameState.board.cardBundleVersion === 1) return;
  syncBoardState(board => {
    migrateBoardLayout(board);
    migrateCardBundles(board);
    if (!board.order?.length) board.order = shuffle(activeCards().map(c => c.id));
  });
}

function setPhase(phase) {
  if (!PHASES.includes(phase)) return;
  if (['final','notebook','report'].includes(phase) && !gameState.solved) return;
  if (phase === 'report' && !notebookComplete()) phase = 'notebook';
  connectFrom = null;
  gameState.phase = phase; saveGameState(); render();
  app.focus({ preventScroll: true }); window.scrollTo(0,0);
}
function render() {
  const phase = gameState.phase;
  document.body.dataset.phase = phase;
  document.getElementById('team-tag').textContent = gameState.groupCode ? `TEAM ${gameState.groupCode} · ${gameState.role}` : '';
  document.getElementById('team-tag').hidden = !gameState.groupCode;
  document.querySelector('.demo-badge').hidden = !DEMO_MODE;
  const progress = document.getElementById('progress');
  progress.hidden = ['start','group','waiting'].includes(phase);
  const step = ['newspaper','individual','discussion'].includes(phase) ? 1 : phase === 'board' ? 2 : ['verdict','questions'].includes(phase) ? 3 : 4;
  progress.innerHTML = ['DIE FALLAKTE','ERMITTLUNGSWAND','BEWEISFÜHRUNG','FALLABSCHLUSS'].map((s,i) => `<span class="${step === i+1 ? 'active' : ''}" ${step === i+1 ? 'aria-current="step"' : ''}><b>0${i+1}</b> ${s}</span>`).join('');
  const views = { start: renderStart, group: renderGroup, waiting: renderWaiting, newspaper: renderNewspaper, individual: renderIndividual, discussion: renderDiscussion, board: renderBoard, verdict: renderVerdict, questions: renderQuestions, final: renderFinal, notebook: renderNotebook, report: renderReport };
  app.innerHTML = views[phase]();
  if (phase === 'board') {
    const viewport = document.querySelector('.canvas-viewport');
    viewport.scrollLeft = boardScroll.left; viewport.scrollTop = boardScroll.top;
    viewport.addEventListener('scroll', () => { boardScroll = { left: viewport.scrollLeft, top: viewport.scrollTop }; }, { passive: true });
    requestAnimationFrame(updateConnectionLines);
  }
}
function renderStart() {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">EIN GEMÄLDE. VIELE SPUREN. EINE WAHRHEIT.</p><h1>DIE GESTOHLENE<br><em>MONA LISA</em></h1><p class="subtitle">Ein chemisches Mystery</p><p class="title-author">von Dr- Anne-Katrin Bachmann</p><div class="hero-story"><p><strong>Paris. 08:42 Uhr.</strong><br>Die Mona Lisa ist verschwunden.</p><p>Wenige Stunden später wird ein Gemälde sichergestellt.<br>Doch ist es wirklich das Original?</p></div><div class="mission"><p class="eyebrow">EUER AUFTRAG</p><p>Findet die Wahrheit heraus.</p></div>${action('ERMITTLUNG STARTEN <span aria-hidden="true">→</span>','start')}</div><div class="office-scene" aria-hidden="true"><div class="office-placard"><span class="eyebrow">BUREAU D’ENQUÊTE · PARIS</span><span>Die Wahrheit liegt<br>in den Details.</span><small>AKTE 017 / KUNSTDIEBSTAHL</small></div></div></section>`;
}
function renderGroup() {
  return page('ERMITTLUNGSTEAM<br>BILDEN', `<p class="lede muted">Ein Fall. Verschiedene Perspektiven. Nur gemeinsam ergibt sich das ganze Bild.</p><div class="split"><section class="panel"><p class="eyebrow">01 / TEAM GRÜNDEN</p><h3>NEUE GRUPPE ERSTELLEN</h3><p>Wie viele Ermittler arbeiten in eurer Gruppe?</p><div class="size-options">${[3,4,5].map(n => action(n + ' PERSONEN','size','secondary small',`data-size="${n}" aria-pressed="${gameState.groupSize === n}"`)).join('')}</div>${action('GRUPPE ERSTELLEN','create')}</section><section class="panel"><p class="eyebrow">02 / TEAM VERSTÄRKEN</p><h3>GRUPPE BEITRETEN</h3><form id="join-form"><label for="join-code">GRUPPENCODE</label><input id="join-code" name="code" placeholder="z. B. M7KP" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" required aria-describedby="join-error"><div class="actions"><button type="submit" aria-label="Gruppe beitreten">BEITRETEN</button></div><p id="join-error" class="error-text" role="alert"></p></form></section></div><p class="notice">${DEMO_MODE ? 'Demo-Modus: Gruppen funktionieren lokal in Tabs desselben Browsers. Für einen Test allein kannst du fehlende Mitglieder simulieren.' : 'Gemeinsam auf mehreren Geräten: Erstellt eine Gruppe und teilt den Gruppencode. Jedes Gerät erhält eine eigene Rolle. Persönliche Notizen bleiben auf eurem Gerät.'}</p>`, 'GEMEINSAM ERMITTELN · 3–5 PERSONEN', false);
}
function renderWaiting() {
  return page('EUER ERMITTLUNGSTEAM', `<div class="code-box"><p class="eyebrow">EUER GRUPPENCODE</p><div class="group-code">${gameState.groupCode}</div><p>Gebt diesen Code an eure Mitermittler weiter.</p></div><ul class="members">${ROLES.slice(0,gameState.groupSize).map(role => { const m = gameState.members.find(m => m.role === role); return `<li><span class="avatar">${role}</span><span>Ermittler ${role}${role === gameState.role ? ' · Du' : ''}</span><small>${m ? m.simulated ? 'Verbunden · simuliert' : (!DEMO_MODE && !m.online ? 'Verbindung unterbrochen' : 'Verbunden') : 'Wartet auf Beitritt'}</small></li>`; }).join('')}</ul><p aria-live="polite">${gameState.members.length === gameState.groupSize ? 'Das Ermittlungsteam ist vollständig.' : `${gameState.members.length} von ${gameState.groupSize} Ermittlern sind verbunden.`}</p><div class="actions">${action('FALLAKTE ÖFFNEN','open-case','',gameState.members.length < gameState.groupSize ? 'disabled' : '')}${DEMO_MODE && gameState.members.length < gameState.groupSize ? action('Gruppe simulieren','simulate','secondary small') : ''}${action('Gruppe verlassen','leave','secondary small')}</div><p class="help-text">Deine Rolle wird nach der Reihenfolge des Beitritts vergeben. Jeder erhält eigene Hinweise.</p>`);
}
function renderNewspaper() {
  return `<div class="newspaper-desk"><div class="press-file-label"><span>PRESSEARCHIV · BELEG 01</span><span>DER FALL BEGINNT HIER</span></div>
  <article class="newspaper" aria-labelledby="news-headline">
    <header class="news-masthead">
      <div class="news-edition"><span>ÉDITION SPÉCIALE</span><span>LA CULTURE · LES SCIENCES · LA VÉRITÉ</span></div>
      <h1>LE JOURNAL <span>DE PARIS</span></h1>
      <p class="news-motto">Les faits. Les indices. La vérité.</p>
      <div class="news-meta"><span>PARIS · SONDERAUSGABE</span><span>KUNST & WISSENSCHAFT</span><span>№ 017 · SEITE 1</span></div>
    </header>
    <div class="news-kicker"><span>KRIMINALFALL IM LOUVRE</span><span>UNSERE TITELGESCHICHTE</span></div>
    <h2 id="news-headline"><span>Mona Lisa gestohlen</span><small>Polizei stellt verdächtiges Gemälde sicher</small></h2>
    <div class="news-byline"><span>VON DER REDAKTION KULTUR & WISSENSCHAFT</span><span>BERICHT AUS PARIS</span></div>
    <div class="news-story-layout">
      <figure class="news-photo">
        <div class="news-photo-print"><img src="assets/mona-lisa.jpg" width="2403" height="3591" alt="Leonardo da Vincis Mona Lisa: eine sitzende Frau mit gefalteten Händen vor einer Landschaft." decoding="async"></div>
        <figcaption><strong>Das verschwundene Meisterwerk.</strong> Die Mona Lisa von Leonardo da Vinci. Archivabbildung des Originals; die Echtheit des sichergestellten Gemäldes ist noch ungeklärt.<span class="news-photo-credit">Bild: Leonardo da Vinci · <a href="https://commons.wikimedia.org/wiki/File:Leonardo_da_Vinci_-_Mona_Lisa.jpg" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · gemeinfrei</span></figcaption>
      </figure>
      <div class="news-story">
        <p class="news-lead">Am vergangenen Wochenende wurde die weltberühmte Mona Lisa aus dem Louvre in Paris gestohlen.</p>
        <div class="news-columns">
          <p>Das Gemälde entstand zu Beginn des 16. Jahrhunderts und wurde von Leonardo da Vinci geschaffen.</p>
          <p>Nur kurze Zeit später konnte die Pariser Polizei ein Gemälde sicherstellen, das dem verschwundenen Original täuschend ähnlich sieht.</p>
          <p>Doch erste Zweifel an seiner Echtheit sind aufgetaucht.</p>
          <h3>Die Spur führt ins Labor</h3>
          <p>Um das Gemälde auf seine Echtheit zu überprüfen, untersuchen Wissenschaftlerinnen und Wissenschaftler die verwendeten Farbpigmente.</p>
          <p>Besonders interessant ist dabei ein weißes Pigment.</p>
          <p>Die chemische Analyse zeigt, dass darin ein bestimmtes Nebengruppenelement enthalten ist.</p>
          <p>Die Identität dieses Elements wurde bislang nicht veröffentlicht.</p>
          <h3>Ein Element als Beweis?</h3>
          <p>Die Ermittler sind überzeugt:<br>Mithilfe des Periodensystems könnte sich herausfinden lassen, welches Element gefunden wurde.</p>
          <p>Sollte das Pigment zu Leonardo da Vincis Lebzeiten noch nicht verwendet worden sein, hätte die Polizei einen entscheidenden Beweis:</p>
          <p>Das sichergestellte Gemälde wäre eine Fälschung.</p>
        </div>
      </div>
    </div>
    <div class="news-bottomline"><span>LE JOURNAL DE PARIS · SONDERAUSGABE</span><span>FIKTIVER UNTERRICHTSFALL</span></div>
    <section class="news-question"><div><p class="eyebrow">EURE LEITFRAGE</p><p>Ist das sichergestellte Gemälde die echte Mona Lisa oder eine Fälschung?</p><p class="news-task">Beweist eure Entscheidung mit chemischen Argumenten.</p></div>${action('ERMITTLUNG BEGINNEN →','investigate')}</section>
  </article></div>`;
}

function pseHTML() { return `<div class="pse" aria-label="Periodensystem, Ordnungszahlen 21 bis 30">${ELEMENTS.map(([n,s,name]) => `<div class="element" aria-label="${n}, ${name}, ${s}"><small>${n}</small><strong>${s}</strong><span>${name}</span></div>`).join('')}</div>`; }
function cardContent(card, preview = false) {
  // Document styling identifies the source, never the relevance of a clue.
  const number = String(CARDS.indexOf(card) + 1).padStart(2,'0');
  const marked = gameState.importantCards.includes(card.id);
  const source = { atom: 'FACHNOTIZ', labor: 'LABORPROTOKOLL', masse: 'ARBEITSVERMERK', ident: 'FACHNOTIZ', pse: 'NACHSCHLAGEWERK', kunst: 'ARCHIVAUSZUG', archiv: 'ARCHIVAUSZUG' }[card.category];
  const icon = card.type === 'lab'
    ? '<path d="M8 3h8M10 3v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M8 15h8"/>'
    : '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/>';
  let content = escapeHTML(card.text);
  if (card.type === 'lab') content = content.replace(/MASSENZAHL: 48|26 NEUTRONEN/g, value => `<strong class="lab-reading">${value}</strong>`);
  return `<div class="card-inner"><div class="card-meta"><span class="card-source"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg><span>${source}</span></span><span class="evidence-index">${number}</span></div><div class="card-department">${CATEGORY_NAMES[card.category]}${marked ? ' <span class="star" aria-label="Von dir markiert">★</span>' : ''}</div><h3>${card.title}</h3><p class="card-text ${preview ? 'preview' : ''}">${content}</p>${card.type === 'pse' && !preview ? pseHTML() : ''}<div class="document-footer" aria-hidden="true"><span>AKTE 017 / BELEG ${number}</span><span class="document-rule"></span></div></div>`;
}

function renderIndividual() {
  return `<section class="page"><div class="role-header"><div class="role-seal" aria-hidden="true">${gameState.role}</div><div><p class="eyebrow">DEINE PERSÖNLICHE AKTE</p><h1>ERMITTLER ${gameState.role}</h1></div></div><p class="lede">Du besitzt Informationen, die deine Mitermittler nicht haben.</p><p class="muted">Lies deine Hinweise genau. Überlege, welche Informationen wichtig sein könnten.<br>Deine Gruppe braucht dein Wissen.</p><details class="personal-card-guide" open><summary>SO SCHÄTZT DU DEINE HINWEISE EIN</summary><p>Prüfe jede Karte mit diesen drei Fragen:</p><ol><li><b>Was erfahre ich?</b> Enthält die Karte ein Untersuchungsergebnis, erklärt sie einen Fachbegriff oder erzählt sie etwas über das Gemälde und seine Farben?</li><li><b>Wobei kann mir das helfen?</b> Hilft die Information, die Untersuchung zu verstehen oder die Echtheit des Gemäldes zu beurteilen? Dann markiere sie vorläufig als wichtig.</li><li><b>Fehlt mir noch ein Zusammenhang?</b> Vielleicht besitzt eine andere Person die passende Information. Schreibe deine Frage in deine Notizen und sprich sie im Team an.</li></ol><div class="personal-guide-note"><b>Wichtig oder unwichtig?</b> Eine interessante Information ist nicht automatisch ein Beweis. Wenn du noch keinen Bezug zur Leitfrage erkennst, lass die Karte zunächst unmarkiert. Das bedeutet nicht, dass sie falsch oder sicher unwichtig ist.</div><p class="personal-guide-footer">Deine Markierung ist eine erste Einschätzung. Du kannst sie jederzeit ändern. Entscheidet erst gemeinsam, welche Hinweise ihr für eure Ermittlung braucht.</p></details><div class="card-grid">${gameState.cards.map(id => { const c = CARD_BY_ID[id]; return `<article class="evidence ${c.type} source-${c.category}"><button class="card-open" data-action="open-card" data-id="${id}" aria-label="Hinweis öffnen: ${c.title}">${cardContent(c,true)}</button><div class="card-bottom">${action(gameState.importantCards.includes(id) ? '★ Als wichtig markiert' : '☆ Als wichtig markieren','mark','',`data-id="${id}" aria-pressed="${gameState.importantCards.includes(id)}"`)}</div></article>`; }).join('')}</div><section class="note-section"><label for="personal-notes">MEINE NOTIZEN</label><textarea id="personal-notes" placeholder="Welche Zusammenhänge vermutest du? Welche Fragen nimmst du mit ins Team?">${escapeHTML(gameState.notes)}</textarea><p class="help-text">Automatisch auf diesem Gerät gespeichert. Markierungen sind deine Einschätzung.</p></section><div class="actions">${action('ZUM ERMITTLUNGSGESPRÄCH','discussion')}${action('Zeitungsartikel lesen','article','secondary')}</div></section>`;
}
function renderDiscussion() {
  const ready = gameState.readyMembers.includes(gameState.role);
  return page('ERMITTLUNGSGESPRÄCH', `<p class="lede">Jetzt braucht ihr einander.</p><p class="muted">Jeder von euch besitzt andere Informationen. Erklärt euren Mitermittlern eure Erkenntnisse. Zeigt nicht einfach euren gesamten Bildschirm.</p><div class="discussion-prompts"><p>Welche Informationen gehören zusammen?</p><p>Welche Informationen sind wichtig?</p><p>Welche Fragen sind noch offen?</p></div><p>Versucht gemeinsam, diese Fragen zu klären. Wenn ihr bereit seid, öffnet ihr eure gemeinsame Ermittlungswand.</p><p id="ready-status" class="muted" aria-live="polite">${gameState.readyMembers.length} von ${gameState.groupSize} Ermittlern sind bereit.</p><div class="actions">${gameState.readyMembers.length === gameState.groupSize ? action('ERMITTLUNGSWAND ÖFFNEN','ready') : action(ready ? 'DU BIST BEREIT' : 'ICH BIN BEREIT','ready','',ready ? 'disabled' : '')}${action('Meine Hinweise','back-individual','secondary')}</div>${gameState.members.some(m => m.simulated) ? '<p class="help-text">Simulierte Mitglieder bestätigen im Demo-Modus automatisch. Echte Mitglieder bestätigen selbst.</p>' : ''}`);
}
function boardCard(id) { const c = CARD_BY_ID[id]; const p = gameState.board.positions[id]; return `<article class="evidence board-card ${c.type} source-${c.category}${connectFrom === id ? ' selected' : ''}" tabindex="0" role="button" data-card-id="${id}" aria-label="${escapeHTML(c.title)}: antippen für Aktionen oder ziehen" ${p?.zone === 'board' ? `style="left:${p.x}px;top:${p.y}px;z-index:${p.z || 2}"` : ''}>${cardContent(c)}</article>`; }
// Optional spatial scaffolding: no cards are sorted or assessed automatically.
const BOARD_AREAS = [
  { title: 'Labor & Beobachtungen', question: 'Was wurde am Gemälde untersucht? Welche Angaben liegen euch vor?', x: 25, y: 55, width: 900 },
  { title: 'Kunst & Zeit', question: 'Was erfahrt ihr über das Gemälde und die verwendeten Farben?', x: 950, y: 55, width: 900 },
  { title: 'Vermutungen & offene Fragen', question: 'Welche Zusammenhänge vermutet ihr? Was müsst ihr noch klären?', x: 1875, y: 55, width: 900, kind: 'notes' },
  { title: 'Atombau & Periodensystem', question: 'Welche Fachinformationen helfen, die Angaben aus dem Labor zu verstehen?', x: 25, y: 710, width: 2750 }
];

function boardStructure() {
  return `<div class="board-structure">${BOARD_AREAS.map((area,i) => `<section class="structure-area ${area.kind === 'notes' ? 'thought-area' : ''}" style="left:${area.x}px;top:${area.y}px;width:${area.width || 900}px" aria-label="${area.title}"><header><span class="structure-number">0${i+1}</span><div><h2>${area.title}</h2><p>${area.question}</p></div></header>${area.kind === 'notes' ? sharedThoughtField() : ''}</section>`).join('')}</div>`;
}
function proofSentenceStarters() {
  return `<ol class="proof-starters"><li>Im Labor wurde festgestellt, dass …</li><li>Mit unserem Wissen über den Atombau können wir daraus ableiten, dass …</li><li>Im Periodensystem finden wir damit …, weil …</li><li>Zum weißen Pigment und seiner Verwendung wissen wir …</li><li>Verglichen mit der Entstehungszeit der Mona Lisa bedeutet das … Deshalb lautet unser Urteil …</li></ol>`;
}
function proofSupport() {
  return `<section class="proof-assignment" aria-label="Euer Arbeitsauftrag"><p class="eyebrow">EUER ERGEBNIS: EINE BEWEISKETTE</p><p>Zeigt Schritt für Schritt, wie ihr <b>von den Laborangaben zu eurem Urteil</b> gelangt. Nutzt dafür die Belege und Verbindungen auf eurer Ermittlungswand. Erklärt bei jedem Übergang: <b>Warum folgt das daraus?</b></p><p class="proof-deliverable">Formuliert jetzt eure gemeinsame Begründung. Anschließend beantwortet jede Person die Abschlussfragen zu ihrem Teil der Beweiskette.</p></section><details class="structure-help" open><summary>SO ERKLÄRT IHR EURE BEWEISKETTE</summary><div class="structure-steps"><p><b>1. Laborangaben sammeln</b>Welche Informationen liefert die Untersuchung? Nennt die passenden Belege.</p><p><b>2. Chemisch erklären</b>Welche Fachkarten helfen euch, die Angaben zu deuten? Was könnt ihr daraus ableiten?</p><p><b>3. Das Element bestimmen</b>Wie helfen euch eure Überlegungen beim Suchen im Periodensystem? Begründet die Zuordnung.</p><p><b>4. Pigment und Zeit vergleichen</b>Was verbindet das Element mit dem weißen Pigment? Passt dessen Verwendung zur Entstehungszeit des Gemäldes?</p><p><b>5. Ein Urteil begründen</b>Welche Entscheidung folgt aus euren Belegen? Lest eure Pfeile als Sätze mit „weil“, „daraus folgt“ oder „deshalb“.</p></div><details class="sentence-help"><summary>Satzanfänge für eure schriftliche Beweiskette</summary>${proofSentenceStarters()}</details><p class="structure-note"><b>Prüft eure Begründung:</b> Habt ihr für jeden Schritt einen Beleg? Ist jeder Pfeil erklärt? Führt eure Kette nachvollziehbar zum Urteil? Diese Hilfe verbraucht keinen Joker.</p></details>`;
}

function renderBoard() {
  ensureBoard();
  const order = gameState.board.order;
  const inZone = zone => order.filter(id => (gameState.board.positions[id]?.zone || 'pool') === zone);
  const pool = inZone('pool'), placed = inZone('board'), discarded = inZone('discard');
  return `<section class="board-page"><div class="board-toolbar"><div><p class="eyebrow">TEAM ${gameState.groupCode} · GEMEINSAM DENKEN</p><h1>GEMEINSAME ERMITTLUNGSWAND</h1><p>Ordnet eure Beweise. Findet Zusammenhänge. Rekonstruiert den Fall.</p></div><div class="board-controls">${action('<span class="starter-help-icon" aria-hidden="true">?</span> STARTHILFE','starter-help','starter-help-button')}${action('MEINE NOTIZEN','board-notes','secondary small')}${action('JOKER: ' + gameState.jokersRemaining,'joker','secondary small','aria-describedby="joker-help"')}${action('FALL LÖSEN','solve','small')}</div></div><div id="board-status" class="board-status" role="status">${connectFrom ? 'Verbindung: Tippe jetzt die zweite Karte auf der Wand an. ' + action('Abbrechen','cancel-connect','secondary small') : 'Beginnt mit wenigen Karten. Ihr müsst nicht alle Hinweise verwenden. Braucht ihr einen ersten Schritt? Öffnet die Starthilfe.'}</div><div class="board-layout"><section class="tray" data-zone="pool"><div class="tray-header">KARTENPOOL <span>${pool.length}</span></div><div class="tray-list">${pool.map(boardCard).join('') || '<p class="board-empty">Alle Hinweise sind einsortiert.</p>'}</div></section><section class="workspace" aria-label="Ermittlungsfläche"><nav class="area-navigation" aria-label="Zu einem Bereich der Ermittlungswand springen">${BOARD_AREAS.map((area,i) => action(`${i+1}. ${area.title}`,'board-area','secondary small',`data-area="${i}"`)).join('')}</nav><div class="canvas-viewport"><div class="canvas" id="board-canvas" data-zone="board">${boardStructure()}<svg id="connections-svg" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c7ac75"/></marker></defs><g id="connection-lines"></g></svg>${placed.map(boardCard).join('')}</div></div></section><section class="tray" data-zone="discard"><div class="tray-header">NICHT ENTSCHEIDEND /<br>FALSCHE SPUR <span>${discarded.length}</span></div><div class="tray-list">${discarded.map(boardCard).join('') || '<p class="board-empty">Hier legt ihr Hinweise ab, die euch nicht weiterhelfen. Ihr könnt sie jederzeit zurückholen.</p>'}</div></section></div><p class="board-guide">Die Wand lässt sich auf freier Fläche mit dem Finger verschieben. Alternative zum Ziehen: Karte antippen → „Auf die Wand“ oder „Verschieben“. Mit Tab und Enter sind alle Karten bedienbar. Eure Änderungen werden automatisch gespeichert.</p><span id="joker-help" hidden>Drei gemeinsame Hinweise, die ihr der Reihe nach verwenden könnt.</span><details class="connections-list"><summary>VERBINDUNGEN VERWALTEN · ${gameState.board.connections.length}</summary>${gameState.board.connections.map(c => `<div class="connection-row"><span>${escapeHTML(CARD_BY_ID[c.from].title)} <b>→ ${escapeHTML(c.label)} →</b> ${escapeHTML(CARD_BY_ID[c.to].title)}</span>${action('Löschen','delete-connection','secondary small',`data-id="${c.id}"`)}</div>`).join('') || '<p class="help-text">Zum Verbinden: Eine Karte auf der Wand antippen und „Verbinden“ wählen, danach die zweite Karte antippen.</p>'}</details></section>`;
}
function renderVerdict() {
  return page('WIE LAUTET EUER URTEIL?', `<p class="lede muted">Trefft eine gemeinsame Entscheidung. Anschließend begründet jede Person einen Teil eurer Beweiskette.</p><div class="verdict-options">${action('<span aria-hidden="true">01</span>DAS GEMÄLDE IST ECHT','verdict','',`data-verdict="real" aria-pressed="${gameState.verdict === 'real'}"`)}${action('<span aria-hidden="true">02</span>DAS GEMÄLDE IST EINE FÄLSCHUNG','verdict','',`data-verdict="fake" aria-pressed="${gameState.verdict === 'fake'}"`)}</div><div class="actions">${action('URTEIL BEGRÜNDEN','to-questions','',gameState.verdict ? '' : 'disabled')}${action('Zur Ermittlungswand','back-board','secondary')}</div>`);
}
function nextQuestionRole() {
  if (!roleProofComplete(gameState,gameState.role)) return gameState.role;
  const host = gameState.members.find(m => !m.simulated)?.id;
  if (DEMO_MODE && host === clientId) return gameState.members.find(m => m.simulated && !roleProofComplete(gameState,m.role))?.role || null;
  return null;
}
function renderQuestions() {
  const role = nextQuestionRole(); gameState.questionRole = role;
  const status = `<p id="answer-status" class="notice" aria-live="polite">${Object.keys(gameState.finalAnswers).length} von ${gameState.groupSize} Rollen haben ihre Begründung eingereicht.</p>`;
  if (!role) return page('BEGRÜNDUNG EINGEREICHT', `<p class="lede">Dein Beitrag ist gespeichert. Die übrigen Ermittler begründen jetzt ihren Teil.</p>${status}<div class="actions">${action('Status aktualisieren','refresh-answers')}${action('Zur Ermittlungswand','back-board','secondary')}</div>`);
  const simulated = role !== gameState.role;
  return page(`BEWEISFÜHRUNG · ${role}`, `<p class="lede">${simulated ? 'Demo-Übergabe: Jetzt ist Ermittler ' + role + ' an der Reihe.' : 'Ermittler ' + role + ', begründe deinen Teil des Falls.'}</p><p class="muted">${simulated ? 'Die fehlende Person wurde simuliert. Beantwortet ihre Fragen hier gemeinsam; Antworten werden nicht automatisch vorgegeben.' : 'Erkläre zuerst die Fachbegriffe in eigenen Worten. Wende dein Wissen danach auf den Fall an. Du kannst eure Ermittlungswand jederzeit noch einmal ansehen.'}</p>${status}${proofSupport()}<form id="answers-form" data-role="${role}">${QUESTION_ROLES[gameState.groupSize][role].map(q => `<div class="question-block"><p class="eyebrow">FRAGE ${q+1}</p>${definitionFields(q,role)}<label for="answer-${q}">${QUESTIONS[q]}</label>${q === 3 ? '<p class="help-text">Pigmente geben einer Farbe ihren Farbton. Schaut auf eure Kunstkarten: Der Name des passenden weißen Pigments genügt.</p>' : ''}<textarea id="answer-${q}" data-question="${q}" name="q${q}" required maxlength="2000" placeholder="${q === 3 ? 'Name des weißen Pigments …' : 'Eure chemische Begründung …'}">${escapeHTML(gameState.answerDrafts[role]?.[q] || '')}</textarea></div>`).join('')}<p id="answer-error" class="error-text" role="alert"></p><div class="actions"><button type="submit" aria-label="Begründung einreichen">BEGRÜNDUNG EINREICHEN</button>${action('Zur Ermittlungswand','back-board','secondary')}</div></form>`, 'EURE ENTSCHEIDUNG BRAUCHT BEWEISE');
}
const NOTEBOOK_PROMPTS = [
  ['Aufbau des Atoms', 'Welche Bereiche und Teilchen hat ein Atom?'],
  ['Ladung der Teilchen', 'Welche Ladung haben die drei Teilchenarten?'],
  ['Neutrales Atom', 'Was gilt hier für die Anzahl der Protonen und Elektronen?'],
  ['Massenzahl', 'Was gibt sie an? Was wird gezählt?'],
  ['Ordnungszahl', 'Was gibt sie an? Wie erkennt ihr damit ein Element?'],
  ['Teilchenzahlen berechnen', 'Wie berechnet ihr eine fehlende Teilchenzahl? Ergänzt ein eigenes Beispiel.'],
  ['Ordnung im Periodensystem', 'Nach welcher Größe sind die Elemente geordnet?'],
  ['Perioden und Gruppen', 'Wie heißen Zeilen und Spalten? Wo stehen die Nebengruppenelemente?']
];
function notebookComplete() { return NOTEBOOK_PROMPTS.every((_,i) => Boolean(gameState.notebookAnswers?.[i]?.trim())); }
function renderNotebook() {
  return page('DEIN HEFTEINTRAG', `<p class="lede">Ermittler ${gameState.role}, formuliere in jedem Kasten deinen eigenen Merksatz.</p><p class="muted">Die Leitfragen helfen dir beim Nachdenken. Deine Texte werden automatisch gespeichert und in deinen Bericht übernommen.</p><form id="notebook-form"><div class="notebook-input-grid">${NOTEBOOK_PROMPTS.map(([title,question],i) => `<section class="notebook-input-box"><label for="notebook-${i}">${title}</label><p id="notebook-help-${i}">${question}</p><textarea id="notebook-${i}" name="notebook-${i}" data-notebook="${i}" aria-describedby="notebook-help-${i}" required maxlength="2000">${escapeHTML(gameState.notebookAnswers?.[i] || '')}</textarea></section>`).join('')}</div><p class="notice">Vergleicht eure Formulierungen miteinander. Übertragt eure eigenen Merksätze anschließend unter der Überschrift „Atombau und Periodensystem“ in eure Hefte.</p><p id="notebook-error" class="error-text" role="alert"></p><div class="actions"><button type="submit" aria-label="Eigene Texte speichern und Bericht öffnen">SPEICHERN & BERICHT ÖFFNEN</button></div></form>`, 'FALL GELÖST - WISSEN FESTHALTEN', false);
}
function renderNotebookSummary() {
  if (!gameState.solved || gameState.finalStep < FINAL_STEPS.length) return '';
  return `<section class="notebook-summary"><p class="eyebrow">ERMITTLER ${gameState.role} - EIGENE FORMULIERUNGEN</p><h2>Dein Hefteintrag</h2>${NOTEBOOK_PROMPTS.map(([title],i) => `<div class="report-answer"><h3>${title}</h3><p class="answer">${escapeHTML(gameState.notebookAnswers?.[i] || '')}</p></div>`).join('')}</section>`;
}

function renderFinal() {
  const step = Math.min(gameState.finalStep, FINAL_STEPS.length);
  if (step < FINAL_STEPS.length) return `<section class="page final-page"><p class="eyebrow">AKTE 017 · DIE BEWEISE SIND EINDEUTIG</p><h1>FALL GELÖST</h1><p class="muted">Eure Beweiskette. Schritt für Schritt.</p><div class="step-dots">${FINAL_STEPS.map((_,i) => `<span class="${i <= step ? 'seen' : ''}"></span>`).join('')}</div><div class="final-step" aria-live="polite"><p class="eyebrow">${String(step+1).padStart(2,'0')} / ${FINAL_STEPS[step][0]}</p><strong>${FINAL_STEPS[step][1]}</strong></div><div class="actions" style="justify-content:center">${action(step === FINAL_STEPS.length - 1 ? 'DAS ERGEBNIS' : 'NÄCHSTER BEWEISSCHRITT →','final-next')}</div></section>`;
  return `<section class="page final-page"><p class="eyebrow">ERMITTLUNG ABGESCHLOSSEN</p><h1>FALL GELÖST</h1><div class="stamp">FÄLSCHUNG</div><div class="final-summary">${FINAL_TEXT.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div><div class="actions">${action('EIGENEN HEFTEINTRAG VERFASSEN','report')}${action('NEUEN FALL STARTEN','restart','secondary')}</div></section>`;
}
function renderReport() {
  return `<section class="page narrow"><article class="report"><p class="eyebrow">ABTEILUNG KUNST & WISSENSCHAFT · AKTE 017</p><h1>ERMITTLUNGSBERICHT</h1><p>Die gestohlene Mona Lisa · Ein chemisches Mystery</p><dl><dt>Gruppencode</dt><dd>${gameState.groupCode}</dd><dt>Gruppengröße</dt><dd>${gameState.groupSize} Personen</dd><dt>Verwendete Joker</dt><dd>${gameState.usedJokers.length} von 3</dd><dt>Urteil</dt><dd>Das Gemälde ist eine Fälschung.</dd></dl><h3>Die Beweiskette</h3><ol class="proof-list">${FINAL_STEPS.map(s => `<li>${s[1]}</li>`).join('')}<li>Das sichergestellte Gemälde kann daher nicht das Original sein.</li></ol><h3>Eure Begründungen</h3>${ROLES.slice(0,gameState.groupSize).map(role => `<div class="report-answer"><h3>Ermittler ${role}</h3>${definitionKeys(gameState.groupSize,role).map(key => `<p><b>${DEFINITIONS[key].title}</b></p><p class="answer">${escapeHTML(gameState.finalAnswers[role]?.definitions?.[key] || '–')}</p>`).join('')}${QUESTION_ROLES[gameState.groupSize][role].map(q => `<p><b>${QUESTIONS[q]}</b></p><p class="answer">${escapeHTML(gameState.finalAnswers[role]?.answers[q])}</p>`).join('')}</div>`).join('')}${gameState.usedJokers.length ? `<h3>Verwendete Hinweise</h3>${gameState.usedJokers.map(i => `<p>${i+1}. ${JOKERS[i]}</p>`).join('')}` : ''}<h3>Eure Concept-Map-Verbindungen</h3>${gameState.board.connections.length ? `<ul>${gameState.board.connections.map(c => `<li>${escapeHTML(CARD_BY_ID[c.from].title)} → ${escapeHTML(c.label)} → ${escapeHTML(CARD_BY_ID[c.to].title)}</li>`).join('')}</ul>` : '<p>Keine Verbindungen gespeichert.</p>'}${renderNotebookSummary()}</article><div class="actions no-print">${action('Ermittlungsbericht drucken','print')}${action('Eigene Texte bearbeiten','edit-notebook','secondary')}${action('NEUEN FALL STARTEN','restart','secondary')}</div></section>`;
}

function openCard(id) {
  const card = CARD_BY_ID[id];
  if (!card || (gameState.phase === 'individual' && !gameState.cards.includes(id))) return;
  const onBoard = gameState.phase === 'board';
  const zone = gameState.board.positions[id]?.zone || 'pool';
  if (onBoard && connectFrom) {
    if (zone !== 'board') { toast('Lege die zweite Karte zuerst auf die Wand.'); return; }
    if (connectFrom === id) { toast('Wähle eine andere Karte als Ziel.'); return; }
    openConnectionDialog(connectFrom, id); return;
  }
  let buttons = action(gameState.importantCards.includes(id) ? '★ Markierung entfernen' : '☆ Als wichtig markieren','mark','secondary',`data-id="${id}"`);
  if (onBoard) {
    if (zone !== 'board') buttons += action('AUF DIE WAND','move-card','',`data-id="${id}" data-zone="board"`);
    else buttons += action('VERBINDEN','connect','',`data-id="${id}"`) + action('Verschieben','nudge-menu','secondary',`data-id="${id}"`);
    if (zone !== 'discard') buttons += action('Nicht entscheidend / falsche Spur','move-card','secondary',`data-id="${id}" data-zone="discard"`);
    if (zone !== 'pool') buttons += action('Zurück in den Kartenpool','move-card','secondary',`data-id="${id}" data-zone="pool"`);
  }
  buttons += action('SCHLIESSEN','close-modal','secondary');
  openDialog(card.title, `<article class="evidence ${card.type} source-${card.category}">${cardContent(card)}</article>`, buttons);
}
function nextZ() { return Math.max(2, ...Object.values(gameState.board.positions).map(p => p.z || 2)) + 1; }
function moveCard(id, zone, position) {
  if (!CARD_BY_ID[id] || !['pool','board','discard'].includes(zone)) return;
  let p = { zone };
  if (zone === 'board') {
    const offset = Object.values(gameState.board.positions).filter(p => p.zone === 'board').length % 5;
    p = { zone, x: Math.min((document.getElementById('board-canvas')?.offsetWidth || 2800) - 220, boardScroll.left + 30 + offset * 26), y: Math.min(920, boardScroll.top + 265 + offset * 28), z: nextZ(), ...position };
  }
  syncBoardState(board => {
    board.positions[id] = p;
    board.discardedCards = Object.keys(board.positions).filter(key => board.positions[key].zone === 'discard');
    // Connections only belong to cards on the wall. Removal is explicit in the UI.
    if (zone !== 'board') board.connections = board.connections.filter(c => c.from !== id && c.to !== id);
  });
  if (connectFrom === id && zone !== 'board') connectFrom = null;
  render();
}
function requestMoveCard(id, zone, position) {
  const related = gameState.board.connections.filter(c => c.from === id || c.to === id);
  if (zone !== 'board' && related.length) {
    openDialog('Karte umsortieren?', `<p>Die ${related.length} Verbindung(en) dieser Karte werden dabei entfernt. Die Karte bleibt im Fall erhalten.</p>`, action('ABBRECHEN','close-modal','secondary') + action('KARTE UMSORTIEREN','confirm-move','',`data-id="${id}" data-zone="${zone}"`));
    return;
  }
  closeDialog(); moveCard(id, zone, position);
}
function openNudgeMenu(id) {
  openDialog('Karte verschieben', `<p>${CARD_BY_ID[id].title}</p><p class="muted">Bewege die Karte schrittweise auf der Wand. Verbindungslinien wandern mit.</p>`, ['up','left','right','down'].map((dir,i) => action(['↑ Nach oben','← Nach links','Nach rechts →','↓ Nach unten'][i],'nudge','secondary',`data-id="${id}" data-direction="${dir}"`)).join('') + action('FERTIG','close-modal'));
}
function openConnectionDialog(from, to) {
  openDialog('Was verbindet diese Beweise?', `<p>${escapeHTML(CARD_BY_ID[from].title)} <span aria-hidden="true">→</span> ${escapeHTML(CARD_BY_ID[to].title)}</p><form id="connection-form" data-from="${from}" data-to="${to}"><label for="connection-label">BESCHRIFTUNG</label><select id="connection-label" name="label">${LABELS.map(l => `<option>${l}</option>`).join('')}<option value="custom">EIGENE BESCHRIFTUNG</option></select><div id="custom-label-wrap" hidden style="margin-top:15px"><label for="custom-label">EIGENE BESCHRIFTUNG</label><input id="custom-label" name="custom" maxlength="70" placeholder="Beschreibt den Zusammenhang"></div><div class="actions"><button type="submit" aria-label="Verbindung speichern">VERBINDUNG SPEICHERN</button>${action('ABBRECHEN','cancel-connect','secondary')}</div></form>`, '<span></span>');
}
function updateConnectionLines() {
  const layer = document.getElementById('connection-lines');
  if (!layer) return;
  const fragments = [];
  for (const connection of gameState.board.connections) {
    const source = document.querySelector(`#board-canvas [data-card-id="${connection.from}"]`);
    const target = document.querySelector(`#board-canvas [data-card-id="${connection.to}"]`);
    if (!source || !target) continue;
    const a = { x: source.offsetLeft + source.offsetWidth / 2, y: source.offsetTop + source.offsetHeight / 2 };
    const b = { x: target.offsetLeft + target.offsetWidth / 2, y: target.offsetTop + target.offsetHeight / 2 };
    const dx = b.x - a.x, dy = b.y - a.y;
    if (!dx && !dy) continue;
    const f = Math.min((source.offsetWidth/2 + 5) / Math.max(Math.abs(dx),.01), (source.offsetHeight/2 + 5) / Math.max(Math.abs(dy),.01));
    const t = Math.min((target.offsetWidth/2 + 7) / Math.max(Math.abs(dx),.01), (target.offsetHeight/2 + 7) / Math.max(Math.abs(dy),.01));
    const x1 = a.x + dx * f, y1 = a.y + dy * f, x2 = b.x - dx * t, y2 = b.y - dy * t;
    fragments.push(`<path class="connection-path" d="M ${x1} ${y1} L ${x2} ${y2}" marker-end="url(#arrow)"/><text class="connection-label" x="${(x1+x2)/2}" y="${(y1+y2)/2-9}" text-anchor="middle">${escapeHTML(connection.label)}</text>`);
  }
  layer.innerHTML = fragments.join('');
}
let suppressClickUntil = 0;
let finalAdvanceAt = 0;
app.addEventListener('pointerdown', event => {
  const card = event.target.closest('[data-card-id]');
  if (!card || gameState.phase !== 'board' || event.button !== 0 || !event.isPrimary || activeDrag || connectFrom) return;
  const rect = card.getBoundingClientRect();
  activeDrag = { id: card.dataset.cardId, element: card, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, originalStyle: card.getAttribute('style'), moving: false, ghost: null };
  card.setPointerCapture(event.pointerId);
});
app.addEventListener('pointermove', event => {
  const d = activeDrag;
  if (!d || d.pointerId !== event.pointerId) return;
  if (!d.moving && Math.hypot(event.clientX - d.startX, event.clientY - d.startY) < 8) return;
  event.preventDefault();
  if (!d.moving) {
    d.moving = true; d.ghost = d.element.cloneNode(true); d.ghost.removeAttribute('tabindex'); d.ghost.removeAttribute('data-card-id'); d.ghost.setAttribute('aria-hidden','true'); d.ghost.classList.add('drag-ghost'); d.ghost.style.width = d.element.offsetWidth + 'px'; document.body.appendChild(d.ghost); d.element.classList.add('drag-origin');
    if (gameState.board.positions[d.id]?.zone === 'board') d.element.style.zIndex = nextZ();
  }
  d.ghost.style.left = (event.clientX - d.offsetX) + 'px'; d.ghost.style.top = (event.clientY - d.offsetY) + 'px';
  document.querySelectorAll('.drop-active').forEach(el => el.classList.remove('drop-active'));
  const zoneEl = document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-zone]');
  zoneEl?.classList.add('drop-active');
  if (zoneEl?.dataset.zone === 'board') {
    const viewport = document.querySelector('.canvas-viewport'); const r = viewport.getBoundingClientRect();
    if (event.clientX > r.right-30) viewport.scrollLeft += 12;
    if (event.clientX < r.left+30) viewport.scrollLeft -= 12;
    if (event.clientY > r.bottom-30) viewport.scrollTop += 12;
    if (event.clientY < r.top+30) viewport.scrollTop -= 12;
    if (gameState.board.positions[d.id]?.zone === 'board') {
      const p = dragPosition(d,event);
      d.element.style.left = p.x + 'px'; d.element.style.top = p.y + 'px';
      updateConnectionLines();
    }
  }
}, { passive:false });
function dragPosition(d, event) {
  const canvas = document.getElementById('board-canvas'); const rect = canvas.getBoundingClientRect();
  return { x: Math.max(0, Math.min(canvas.offsetWidth-210, event.clientX-rect.left-d.offsetX)), y: Math.max(45,Math.min(canvas.offsetHeight-d.element.offsetHeight-15,event.clientY-rect.top-d.offsetY)), z: nextZ() };
}
function finishDrag(event, cancelled = false) {
  const d = activeDrag;
  if (!d || event.pointerId !== d.pointerId) return;
  const zone = !cancelled && d.moving ? document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-zone]')?.dataset.zone : null;
  const position = zone === 'board' ? dragPosition(d,event) : undefined;
  if (d.element.hasPointerCapture(event.pointerId)) d.element.releasePointerCapture(event.pointerId);
  d.ghost?.remove(); d.element.classList.remove('drag-origin');
  if (d.originalStyle === null) d.element.removeAttribute('style'); else d.element.setAttribute('style',d.originalStyle);
  document.querySelectorAll('.drop-active').forEach(el => el.classList.remove('drop-active'));
  activeDrag = null;
  if (d.moving) { suppressClickUntil = Date.now() + 400; if (zone) requestMoveCard(d.id,zone,position); else updateConnectionLines(); }
  if (remotePending && !modal.open) handleRemoteGroup();
}
app.addEventListener('pointerup', event => finishDrag(event));
app.addEventListener('pointercancel', event => finishDrag(event,true));
window.addEventListener('resize', updateConnectionLines);
app.addEventListener('keydown', event => {
  const card = event.target.closest('[data-card-id]');
  if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openCard(card.dataset.cardId); }
  if (event.key === 'Escape' && connectFrom) { connectFrom = null; render(); }
});
function normalizeAnswer(text) {
  return String(text).toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[−–]/g,'-').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+\-= ]/g,' ').replace(/\s+/g,' ').trim();
}
function editDistance(a,b) {
  const row = Array.from({ length: b.length+1 }, (_,i) => i);
  for (let i=1;i<=a.length;i++) { let previous = row[0]; row[0]=i; for (let j=1;j<=b.length;j++) { const old=row[j]; row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1] === b[j-1] ? 0 : 1)); previous=old; } }
  return row[b.length];
}
function hasTerm(text, words) { const tokens = normalizeAnswer(text).split(' '); return words.some(word => tokens.some(token => token === word || (word.length >= 5 && Math.abs(token.length-word.length) <= 1 && editDistance(token,word) <= 1))); }
function validateAnswer(q, raw) {
  const text = normalizeAnswer(raw);
  if (!text || /\b(keine?|keinen|keiner|nicht)\b/.test(text) && q < 4) return false;
  const titan = hasTerm(text,['titan','ti']);
  if (q === 0) return hasTerm(text,['proton','protonen']) && hasTerm(text,['neutron','neutronen']) && !hasTerm(text,['elektronen']);
  if (q === 1) {
    if (/\b(oder|vielleicht|eventuell)\b/.test(text)) return false;
    const numbers = text.match(/\b\d+\b/g) || [];
    if (numbers.some(n => !['22','48','26'].includes(n))) return false;
    if (/\b(26|48) protonen\b/.test(text) || /\b22 neutronen\b/.test(text)) return false;
    const equations = [...text.matchAll(/(\d+)\s*([+-])\s*(\d+)\s*=\s*(\d+)/g)];
    if (equations.some(m => (m[2] === '+' ? Number(m[1])+Number(m[3]) : Number(m[1])-Number(m[3])) !== Number(m[4]))) return false;
    return /\b22\b/.test(text) || /\bzweiundzwanzig\b/.test(text);
  }
  if (q === 2) return !/\b(eisen|zink|scandium|vanadium|chrom|mangan|cobalt|nickel|kupfer|oder|26|30|48)\b/.test(text) && (/\b22\b/.test(text) || /\bzweiundzwanzig\b/.test(text)) && titan;
  if (q === 3) {
    const namesPigment = hasTerm(text.replace(/\btitan\s+weis(s)?\b/g,'titanweiss'),['titanweiss','titanweis']);
    const describesConnection = titan && hasTerm(text,['pigment','weisspigment']) && /\b(enthaelt|enthalten|bestandteil|verbindung|verbindungen|basiert)\b/.test(text);
    return (namesPigment || describesConnection) && !/\b(bleiweiss|zinkweiss|oder)\b/.test(text);
  }
  if (q === 4) {
    const pigment = hasTerm(text,['titanweiss','titanweis','pigment','pigmente','farbpigment','weisspigment','farbe']);
    const modern = /\b(20|zwanzigsten|zwanzigste|1900|1900er|1900ern|19\d\d)\b/.test(text);
    const historic = /\b(16|sechzehnten|sechzehnte|1500|1500er|15\d\d)\b/.test(text);
    const oldArtist = /\b(leonardos?|vincis?|mona lisa)\b/.test(text);
    const timeRelation = /\b(spaeter|nach|nachher|erst|jahrhunderte|juenger)\b/.test(text);
    // Accept short age comparisons too; students need not repeat exact dates.
    const tooRecent = /\bzu (neu|neue|neues|neuen|modern|moderne|modernes|jung|junge|junges)\b/.test(text)
      || /\b(juenger|neuer|moderner) als\b/.test(text);
    const laterUse = /\b(erst|viel|deutlich|wesentlich) spaeter\b/.test(text)
      || /\b(damals|damalig|frueher|zu seiner zeit|zu lebzeiten)\b.*\b(noch nicht|nicht vorhanden)\b/.test(text)
      || /\b(noch nicht|nicht vorhanden)\b.*\b(damals|frueher|zu seiner zeit|zu lebzeiten)\b/.test(text);
    const deniesAge = /\b(nicht|keineswegs|nicht besonders|gar nicht) (zu (neu|modern|jung)|(?:juenger|neuer|moderner) als)\b/.test(text)
      || /\b(nicht|keineswegs) (erst |viel |deutlich )?spaeter\b/.test(text);
    const pigmentEra = text.match(/\b(?:titanweiss|titanweis|pigment)\b(.{0,70}?)\b(16|20|sechzehnten|zwanzigsten)\b/);
    const artworkEra = text.match(/\bmona lisa\b(.{0,70}?)\b(16|20|sechzehnten|zwanzigsten)\b/);
    const wrongPigmentDate = pigmentEra && /^(16|sechzehnten)$/.test(pigmentEra[2]) && !/\b(nicht|kein|noch|nach|spaeter)\b/.test(pigmentEra[1]);
    const wrongArtworkDate = artworkEra && /^(20|zwanzigsten)$/.test(artworkEra[2]) && !/\b(nicht|vor|aelter|frueher)\b/.test(artworkEra[1]);
    const reversed = wrongPigmentDate || wrongArtworkDate || /\b(schon|bereits) zu (leonardos?|da vincis?)\b/.test(text) || /\b(vor leonardo|vor da vinci|ist echt)\b/.test(text);
    return pigment && !reversed && !deniesAge && (tooRecent || laterUse || (modern && historic) || (modern && oldArtist && timeRelation) || (oldArtist && /\b(jahrhunderte nach|lange nach|viel spaeter|nach leonardos?|nach da vinci|nach .*lebzeit|nach .*tod)\b/.test(text)));
  }
  return false;
}
function validateDefinition(key, raw) {
  const text = normalizeAnswer(raw || '');
  const proton = hasTerm(text,['proton','protonen','protonenzahl']);
  const neutron = hasTerm(text,['neutron','neutronen']);
  const count = /\b(anzahl|zahl|summe|insgesamt|zusammen|zaehlt|viele|addiert)\b/.test(text);
  const nucleus = hasTerm(text,['atomkern','atomkerns','kern','kerns']);
  if (key === 'mass') {
    // A brief paraphrase is sufficient; do not require a particular sentence stem.
    const bothParticles = proton && neutron;
    const coreParticles = hasTerm(text,['kernteilchen','nukleonen']) || (nucleus && hasTerm(text,['teilchen']));
    const contradictory = /\b(elektronen|differenz|minus|gewicht|nur protonen|nur neutronen)\b/.test(text)
      || /\b(nicht|keine) (die |der |alle |die gesamte )?(summe|anzahl|protonen|neutronen|kernteilchen|nukleonen)\b/.test(text);
    return !contradictory && (bothParticles || (coreParticles && count));
  }
  if (key === 'proton') return nucleus && hasTerm(text,['positiv','positive','positiven']) && !/\b(negativ|ungeladen|nicht positiv)\b/.test(text);
  if (key === 'neutron') return nucleus && (/\b(ungeladen|ungeladene|ungeladenen|neutral|neutrale|neutralen)\b/.test(text) || /\b(keine|nicht) (elektrische )?(ladung|geladen)\b/.test(text));
  if (key === 'ordinal') return proton && (count || /protonenzahl/.test(text)) && /\b(element|elements|elementsorte|elementart)\b/.test(text) && !/\b(neutronenzahl|elektronenzahl)\b/.test(text);
  if (key === 'pigment') return /\b(farbstoff|farbmittel|farbgebend|farbgebender|faerbt|faerben)\b/.test(text) || (/\b(farbe|farbton)\b/.test(text) && /\b(gibt|geben|verleiht|verleihen|sorgt|bestimmt)\b/.test(text));
  return false;
}
function roleProofComplete(shared, role) {
  const entry = shared.finalAnswers[role];
  return Boolean(entry && QUESTION_ROLES[shared.groupSize][role].every(q => validateAnswer(q,entry.answers[q])) && definitionKeys(shared.groupSize,role).every(key => validateDefinition(key,entry.definitions?.[key])));
}
function isGroupSolved(shared) {
  return shared.verdict === 'fake' && ROLES.slice(0,shared.groupSize).every(role => roleProofComplete(shared,role));
}
function submitAnswers(form) {
  const role = form.dataset.role;
  if (role !== nextQuestionRole()) return;
  const answers = Object.fromEntries(QUESTION_ROLES[gameState.groupSize][role].map(q => [q,form.elements['q'+q].value.trim()]));
  const definitions = Object.fromEntries(definitionKeys(gameState.groupSize,role).map(key => [key,form.elements['definition-'+key]?.value.trim() || '']));
  gameState.definitionDrafts ||= {};
  gameState.definitionDrafts[role] = definitions;
  gameState.answerDrafts[role] = answers; saveGameState();
  const missingDefinition = definitionKeys(gameState.groupSize,role).find(key => !validateDefinition(key,definitions[key]));
  if (missingDefinition) {
    document.getElementById('answer-error').textContent = 'Erklärt den Begriff „' + DEFINITIONS[missingDefinition].title + '“ noch genauer. Nutzt die Hinweise auf eurer Ermittlungswand und beschreibt den Zusammenhang in eigenen Worten.';
    document.getElementById('definition-'+missingDefinition).focus(); return;
  }
  const failed = QUESTION_ROLES[gameState.groupSize][role].filter(q => !validateAnswer(q,answers[q]));
  if (failed.length) {
    document.getElementById('answer-error').textContent = 'Dieser Teil eurer Beweiskette ist noch nicht überzeugend. Überprüft eure Ermittlungswand. Formuliert den Zusammenhang bei Frage ' + failed.map(q => q+1).join(' und ') + ' genauer.';
    document.getElementById('answer-'+failed[0]).focus(); return;
  }
  const shared = mutateGroup(group => { group.finalAnswers[role] = { answers, definitions }; if (isGroupSolved(group)) { group.solved = true; group.phase = 'final'; } });
  if (shared?.solved) { setPhase('final'); return; }
  render();
  if (shared && Object.keys(shared.finalAnswers).length === gameState.groupSize && shared.verdict !== 'fake') {
    openDialog('Prüft eure Schlussfolgerung', '<p>Dieser Teil eurer Beweiskette ist noch nicht überzeugend. Überprüft eure Ermittlungswand und gleicht euer Urteil mit euren Begründungen ab.</p>', action('ZUR ERMITTLUNGSWAND','back-board'));
  }
}
function refreshAnswers() {
  const shared = mutateGroup(group => { if (isGroupSolved(group)) { group.solved = true; group.phase = 'final'; } });
  if (shared?.solved) setPhase('final'); else { render(); toast('Noch nicht alle Begründungen und das gemeinsame Urteil ergeben eine überzeugende Beweiskette.'); }
}
function showJokers() {
  syncGroupState();
  const history = gameState.usedJokers.length ? `<div class="stack">${gameState.usedJokers.map(i => `<div class="notice"><b>JOKER ${i+1}</b><p style="white-space:pre-line;margin:8px 0 0">${JOKERS[i]}</p></div>`).join('')}</div>` : '';
  openDialog('JOKER: ' + gameState.jokersRemaining, `${history}${gameState.jokersRemaining ? '<p style="margin-top:20px">Wirklich einen Joker verwenden?</p><p class="muted">Dieser Joker kann danach nicht erneut verwendet werden. Bereits geöffnete Hinweise könnt ihr jederzeit nachlesen.</p>' : '<p>Ihr habt alle drei Joker verwendet. Eure Hinweise bleiben hier zum Nachlesen erhalten.</p>'}`, action('SCHLIESSEN','close-modal','secondary') + (gameState.jokersRemaining ? action('JOKER VERWENDEN','use-joker','',`data-index="${gameState.usedJokers.length}"`) : ''));
}
function resetInvestigation() {
  if (!DEMO_MODE) return cloudAction(async adapter => {
    if (!gameState.groupCode && resumeCandidate) await adapter.resume(resumeCandidate.state.groupCode,resumeCandidate.state.instanceId);
    await adapter.deleteGroup(); resetLocalInvestigation();
  });
  resetLocalInvestigation();
}
function resetLocalInvestigation() {
  const code = gameState.groupCode || resumeCandidate?.state.groupCode;
  if (code) {
    // Remove only this investigation, never unrelated LocalStorage keys or groups.
    const keys = Object.keys(memoryStorage);
    try { for (let i=0;i<localStorage.length;i++) { const key=localStorage.key(i); if (key?.startsWith(PREFIX)) keys.push(key.slice(PREFIX.length)); } } catch (_) {}
    [...new Set(keys)].forEach(key => { const value = readStorage(key); if (key === groupKey(code) || value?.state?.groupCode === code) removeStorage(key); });
  }
  resumeCandidate = null; Object.assign(gameState,blankState()); boardScroll = { left:0,top:0 }; closeDialog(); setPhase('start');
}
function goBackToBoard() {
  closeDialog();
  mutateGroup(shared => { if (!shared.solved) shared.phase = 'board'; });
  setPhase('board');
}
document.addEventListener('click', event => {
  const card = event.target.closest('[data-card-id]');
  if (card && Date.now() >= suppressClickUntil) { openCard(card.dataset.cardId); return; }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action: name, id, zone } = button.dataset;
  switch (name) {
    case 'start': if (gameState.phase === 'start') setPhase('group'); break;
    case 'size': gameState.groupSize = Number(button.dataset.size); saveGameState(); render(); break;
    case 'create': if (gameState.phase === 'group') createGroup(); break;
    case 'simulate': if (gameState.phase === 'waiting' && DEMO_MODE) simulateGroup(); break;
    case 'leave': leaveGroup(); break;
    case 'open-case': if (gameState.phase === 'waiting') { syncGroupState(); if (gameState.members.length === gameState.groupSize) { mutateGroup(shared => { if (shared.phase === 'waiting') shared.phase = 'newspaper'; }); setPhase('newspaper'); } } break;
    case 'investigate': if (gameState.phase === 'newspaper') setPhase('individual'); break;
    case 'open-card': openCard(id); break;
    case 'mark': {
      const index = gameState.importantCards.indexOf(id);
      if (index < 0) gameState.importantCards.push(id); else gameState.importantCards.splice(index,1);
      saveGameState(); const wasOpen = modal.open; render(); if (wasOpen) openCard(id); break;
    }
    case 'article': setPhase('newspaper'); break;
    case 'discussion': if (gameState.phase === 'individual') { if (!DEMO_MODE) mutateGroup(shared => { if (['waiting','newspaper'].includes(shared.phase)) shared.phase = 'discussion'; }); setPhase('discussion'); } break;
    case 'back-individual': setPhase('individual'); break;
    case 'ready': {
      if (gameState.phase !== 'discussion') break;
      const readyRole = gameState.role;
      const shared = mutateGroup(group => {
        const ready = new Set(group.readyMembers); ready.add(readyRole);
        if (DEMO_MODE) group.members.filter(m => m.simulated).forEach(m => ready.add(m.role));
        group.readyMembers = [...ready];
        if (ready.size === group.groupSize) group.phase = 'board';
      });
      if (shared?.readyMembers.length === gameState.groupSize) setPhase('board'); else render(); break;
    }
    case 'close-modal': closeDialog(); break;
    case 'move-card': requestMoveCard(id,zone); break;
    case 'confirm-move': closeDialog(); moveCard(id,zone); break;
    case 'nudge-menu': openNudgeMenu(id); break;
    case 'nudge': {
      const p = gameState.board.positions[id]; if (!p || p.zone !== 'board') break;
      const dir = button.dataset.direction;
      const cardEl = document.querySelector(`[data-card-id="${id}"]`);
      const maxY = 1350 - (cardEl?.offsetHeight || 400) - 15;
      moveCard(id,'board',{ x:Math.max(0,Math.min((document.getElementById('board-canvas')?.offsetWidth || 2800) - 210,p.x+(dir === 'right' ? 80 : dir === 'left' ? -80 : 0))), y:Math.max(45,Math.min(maxY,p.y+(dir === 'down' ? 80 : dir === 'up' ? -80 : 0))) }); break;
    }
    case 'connect': closeDialog(); connectFrom = id; render(); break;
    case 'cancel-connect': closeDialog(); connectFrom = null; render(); break;
    case 'delete-connection': syncBoardState(board => { board.connections = board.connections.filter(c => c.id !== id); }); render(); break;
    case 'board-area': {
      const area = BOARD_AREAS[Number(button.dataset.area)];
      const viewport = document.querySelector('.canvas-viewport');
      if (area && viewport && gameState.phase === 'board') {
        viewport.scrollLeft = area.x - 15;
        viewport.scrollTop = area.y - 15;
        boardScroll = { left: viewport.scrollLeft, top: viewport.scrollTop };
      }
      break;
    }
    case 'thought-editor': writingMode = 'pen'; openThoughtEditor(); break;
    case 'thought-mode': writingMode = button.dataset.mode; openThoughtEditor(); break;
    case 'ink-undo': {
      const strokeId = ensureThoughts().strokes.filter(s => s.author === clientId).at(-1)?.id;
      syncBoardState(board => { const notes = ensureThoughts(board); notes.strokes = notes.strokes.filter(s => s.id !== strokeId); });
      refreshThoughtViews(); break;
    }
    case 'ink-clear':
      openDialog('Handschrift löschen?', '<p>Wirklich die gesamte Handschrift in diesem gemeinsamen Feld löschen? Der getippte Text bleibt erhalten.</p>', action('ABBRECHEN','thought-editor','secondary') + action('HANDSCHRIFT LÖSCHEN','ink-clear-confirm','danger')); break;
    case 'ink-clear-confirm': syncBoardState(board => { ensureThoughts(board).strokes = []; }); openThoughtEditor(); break;
    case 'starter-help': showStarterHelp(); break;
    case 'starter-topic': showStarterHelp(Number(button.dataset.topic)); break;
    case 'board-notes': openDialog('MEINE NOTIZEN', `<textarea id="personal-notes" aria-label="Meine privaten Notizen">${escapeHTML(gameState.notes)}</textarea><p class="help-text">Privat auf diesem Gerät gespeichert.</p>`); break;
    case 'joker': showJokers(); break;
    case 'use-joker': {
      const requested = Number(button.dataset.index);
      mutateGroup(shared => { if (shared.jokersRemaining > 0 && shared.usedJokers.length === requested) { shared.usedJokers.push(requested); shared.jokersRemaining = 3-shared.usedJokers.length; } });
      render(); showJokers(); break;
    }
    case 'solve': if (gameState.phase === 'board') openDialog('Seid ihr sicher?', '<p>Ein gutes Ermittlungsteam hat nicht nur einen Verdacht.</p><p>Es kann seine Schlussfolgerung mit Beweisen erklären.</p>', action('NOCH WEITER ERMITTELN','close-modal','secondary') + action('FALL LÖSEN','confirm-solve')); break;
    case 'confirm-solve': closeDialog(); if (gameState.phase === 'board') { mutateGroup(shared => { shared.phase = 'verdict'; }); setPhase('verdict'); } break;
    case 'verdict': if (gameState.phase === 'verdict') { const verdict = button.dataset.verdict; mutateGroup(shared => { shared.verdict = verdict; }); render(); } break;
    case 'to-questions': if (gameState.phase === 'verdict' && gameState.verdict) { mutateGroup(shared => { shared.phase = 'questions'; if (isGroupSolved(shared)) { shared.solved = true; shared.phase = 'final'; } }); setPhase(gameState.solved ? 'final' : 'questions'); } break;
    case 'back-board': goBackToBoard(); break;
    case 'refresh-answers': refreshAnswers(); break;
    case 'final-next': if (gameState.solved && gameState.phase === 'final' && Date.now() - finalAdvanceAt > 400) { finalAdvanceAt = Date.now(); gameState.finalStep = Math.min(FINAL_STEPS.length,gameState.finalStep+1); saveGameState(); render(); } break;
    case 'report': if (gameState.solved && gameState.finalStep >= FINAL_STEPS.length) setPhase('notebook'); break;
    case 'edit-notebook': setPhase('notebook'); break;
    case 'print': window.print(); break;
    case 'restart': openDialog('Neuen Fall starten?', '<p>Wirklich alle Daten dieser Ermittlung löschen?</p><p class="muted">Dies setzt auch die gemeinsame Gruppe auf den anderen Geräten zurück.</p>', action('ABBRECHEN','close-modal','secondary') + action('DATEN LÖSCHEN & NEU STARTEN','confirm-reset','danger')); break;
    case 'confirm-reset': resetInvestigation(); break;
    case 'reset-local': removeStorage('session:'+clientId); Object.assign(gameState,blankState()); closeDialog(); setPhase('start'); break;
    case 'resume': {
      if (!resumeCandidate) break;
      if (!DEMO_MODE) { resumeCloudGroup(); break; }
      clientId = resumeCandidate.clientId;
      try { sessionStorage.setItem(PREFIX+'client',clientId); } catch (_) {}
      Object.assign(gameState,blankState(),resumeCandidate.state);
      closeDialog(); const shared = readGroup();
      if (!shared) { resetInvestigation(); toast('Diese Ermittlung wurde bereits zurückgesetzt.'); break; }
      syncGroupState(shared);
      if (shared.solved && !['final','notebook','report'].includes(gameState.phase)) gameState.phase = 'final';
      else if (['board','verdict','questions'].includes(gameState.phase) && ['board','verdict','questions'].includes(shared.phase)) gameState.phase = shared.phase;
      setPhase(gameState.phase); resumeCandidate = null; break;
    }
    case 'new-session': {
      // Start separately, retaining existing teams so another tab can join them.
      if (DEMO_MODE) clientId = uniqueId(); else firebaseAdapter?.unsubscribe(); try { sessionStorage.setItem(PREFIX+'client',clientId); } catch (_) {}
      resumeCandidate = null; Object.assign(gameState,blankState()); closeDialog(); setPhase('start'); break;
    }
  }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'notebook-form') {
    event.preventDefault();
    if (gameState.phase !== 'notebook' || !gameState.solved) return;
    gameState.notebookAnswers = Object.fromEntries(NOTEBOOK_PROMPTS.map((_,i) => [i,event.target.elements['notebook-'+i].value.trim()]));
    saveGameState();
    if (!notebookComplete()) {
      document.getElementById('notebook-error').textContent = 'Formuliere bitte in jedem Kasten deinen eigenen Merksatz.';
      const missing = NOTEBOOK_PROMPTS.findIndex((_,i) => !gameState.notebookAnswers[i]);
      document.getElementById('notebook-'+missing).focus(); return;
    }
    setPhase('report');
  }
  if (event.target.id === 'join-form') { event.preventDefault(); const error = joinGroup(event.target.elements.code.value); if (typeof error === 'string') document.getElementById('join-error').textContent = error; }
  if (event.target.id === 'connection-form') {
    event.preventDefault(); const form = event.target;
    const label = (form.elements.label.value === 'custom' ? form.elements.custom.value : form.elements.label.value).trim().slice(0,70);
    if (!label) { form.elements.custom.focus(); return; }
    const from = form.dataset.from, to = form.dataset.to, connectionId = uniqueId();
    const shared = syncBoardState(board => {
      if (board.positions[from]?.zone !== 'board' || board.positions[to]?.zone !== 'board') return;
      if (!board.connections.some(c => c.from === from && c.to === to && c.label === label)) board.connections.push({ id:connectionId,from,to,label });
    });
    closeDialog(); connectFrom = null; render();
    if (shared) toast('Verbindung gespeichert.');
  }
  if (event.target.id === 'answers-form') { event.preventDefault(); submitAnswers(event.target); }
});
document.addEventListener('input', event => {
  if (event.target.hasAttribute?.('data-notebook')) {
    gameState.notebookAnswers ||= {};
    gameState.notebookAnswers[event.target.dataset.notebook] = event.target.value;
    saveGameState();
  }
  if (event.target.hasAttribute?.('data-team-notes')) {
    const value = event.target.value;
    syncBoardState(board => { ensureThoughts(board).text = value; });
    document.querySelectorAll('[data-team-notes]').forEach(field => { if (field !== event.target) field.value = value; });
  }
  if (event.target.id === 'personal-notes') { gameState.notes = event.target.value; saveGameState(); }
  if (event.target.matches('[data-definition]')) {
    const role = event.target.closest('form').dataset.role;
    gameState.definitionDrafts ||= {};
    gameState.definitionDrafts[role] ||= {};
    gameState.definitionDrafts[role][event.target.dataset.definition] = event.target.value; saveGameState();
  }
  if (event.target.matches('[data-question]')) {
    const role = event.target.closest('form').dataset.role;
    gameState.answerDrafts[role] ||= {};
    gameState.answerDrafts[role][event.target.dataset.question] = event.target.value; saveGameState();
  }
});
document.addEventListener('change', event => {
  if (event.target.id === 'connection-label') {
    const custom = event.target.value === 'custom'; document.getElementById('custom-label-wrap').hidden = !custom; document.getElementById('custom-label').required = custom;
    if (custom) document.getElementById('custom-label').focus();
  }
});
modal.addEventListener('close', () => { if (remotePending && !modal.open) handleRemoteGroup(); else if (!modal.open && gameState.phase === 'board') refreshThoughtViews(); });
function ensureThoughts(board = gameState.board) {
  board.thoughts ||= { text: '', strokes: [] };
  return board.thoughts;
}
function inkMarkup(strokes) {
  return strokes.map(stroke => `<polyline points="${stroke.points.map(p => `${p[0]},${p[1]}`).join(' ')}" fill="none" stroke="#493b29" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
}
function sharedThoughtField() {
  const notes = gameState.board.thoughts || { text: '', strokes: [] };
  return `<div class="shared-thought-field"><label for="team-thoughts">EURE VERMUTUNGEN & FRAGEN</label><textarea id="team-thoughts" data-team-notes maxlength="10000" placeholder="Hier könnt ihr eure Gedanken, Vermutungen und offenen Fragen festhalten.">${escapeHTML(notes.text)}</textarea>${action('Mit Stift schreiben / groß öffnen','thought-editor','small')}<svg class="ink-preview" viewBox="0 0 1000 500" aria-label="Vorschau eurer handschriftlichen Notizen">${inkMarkup(notes.strokes)}</svg><small>Gemeinsames Feld · automatisch gespeichert</small></div>`;
}
function openThoughtEditor() {
  const notes = gameState.board.thoughts || { text: '', strokes: [] };
  openDialog('Vermutungen & offene Fragen', `<div class="thought-editor"><p class="thought-proof-task">Hier ist Platz für eure Gedanken, Vermutungen und offenen Fragen.</p><div class="thought-tabs">${action('TASTATUR','thought-mode','secondary',`data-mode="text" aria-pressed="${writingMode === 'text'}"`)}${action('STIFT / FINGER','thought-mode','secondary',`data-mode="pen" aria-pressed="${writingMode === 'pen'}"`)}</div><div ${writingMode !== 'text' ? 'hidden' : ''}><label for="team-thoughts-large">Eure gemeinsamen Gedanken</label><textarea id="team-thoughts-large" data-team-notes maxlength="10000" placeholder="Hier könnt ihr eure Gedanken, Vermutungen und offenen Fragen festhalten.">${escapeHTML(notes.text)}</textarea></div><div ${writingMode !== 'pen' ? 'hidden' : ''}><p class="help-text">Schreibt mit Apple Pencil, einem anderen Stift oder dem Finger direkt auf das Papier.</p><svg id="thought-drawing" viewBox="0 0 1000 500" preserveAspectRatio="none" role="img" aria-label="Schreibfläche für handschriftliche Vermutungen und Fragen"><g id="saved-ink">${inkMarkup(notes.strokes)}</g><g id="live-ink"></g></svg><div class="thought-tools">${action('Eigenen letzten Strich zurücknehmen','ink-undo','secondary small')}${action('Handschrift löschen','ink-clear','secondary small')}</div></div><p class="help-text">Text und Handschrift bleiben beim Umschalten erhalten. Automatisch mit eurer Ermittlungswand gespeichert.</p></div>`);
}
function refreshThoughtViews() {
  const notes = gameState.board.thoughts || { text: '', strokes: [] };
  document.querySelectorAll('.ink-preview, #saved-ink').forEach(el => { el.innerHTML = inkMarkup(notes.strokes); });
  document.querySelectorAll('[data-team-notes]').forEach(el => { if (document.activeElement !== el) el.value = notes.text; });
}
function inkPoint(event, surface) {
  const rect = surface.getBoundingClientRect();
  return [Math.round(Math.max(0,Math.min(1000,(event.clientX-rect.left)/rect.width*1000))), Math.round(Math.max(0,Math.min(500,(event.clientY-rect.top)/rect.height*500)))];
}
document.addEventListener('pointerdown', event => {
  const surface = event.target.closest?.('#thought-drawing');
  if (!surface || activeInk || !event.isPrimary || event.button !== 0) return;
  event.preventDefault();
  surface.setPointerCapture(event.pointerId);
  activeInk = { surface, pointerId: event.pointerId, stroke: { id: uniqueId(), author: clientId, points: [inkPoint(event,surface)] } };
});
document.addEventListener('pointermove', event => {
  if (!activeInk || event.pointerId !== activeInk.pointerId) return;
  event.preventDefault();
  for (const sample of event.getCoalescedEvents?.() || [event]) activeInk.stroke.points.push(inkPoint(sample,activeInk.surface));
  document.getElementById('live-ink').innerHTML = inkMarkup([activeInk.stroke]);
}, { passive: false });
function finishInk(event) {
  if (!activeInk || event.pointerId !== activeInk.pointerId) return;
  const { surface, stroke } = activeInk;
  activeInk = null;
  if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
  // Save completed ink even if the OS interrupts the pointer (e.g. palm contact).
  if (stroke.points.length === 1) stroke.points.push([stroke.points[0][0]+.1,stroke.points[0][1]]);
  syncBoardState(board => { const notes = ensureThoughts(board); if (!notes.strokes.some(s => s.id === stroke.id)) notes.strokes.push(stroke); });
  const live = document.getElementById('live-ink'); if (live) live.innerHTML = '';
  refreshThoughtViews();
}
document.addEventListener('pointerup', finishInk);
document.addEventListener('pointercancel', finishInk);
document.addEventListener('focusout', event => {
  if ((event.target.hasAttribute?.('data-team-notes') || (!DEMO_MODE && event.target.matches?.('textarea,input,select'))) && remotePending && !modal.open) setTimeout(() => { if (remotePending && !modal.open) handleRemoteGroup(); },0);
});
function showStarterHelp(topic = 0) {
  const tips = [
    ['Wo fangen wir an?', 'Legt zuerst nur die beiden Laborberichte auf die Wand. Jede Person erklärt, was auf ihrer Karte steht. Lasst die anderen Hinweise zunächst im Kartenpool.', 'Sucht dann gemeinsam eine Fachkarte, die einen Begriff aus den Laborberichten erklärt. So entsteht euer erster kleiner Zusammenhang.'],
    ['Was bedeuten die Laborangaben?', 'Klärt zuerst die Wörter: Was beschreibt die Massenzahl? Wo befinden sich Neutronen? Nutzt dazu die Karten zum Atomaufbau und zur Massenzahl.', 'Achtet darauf, welche Teilchen im Kern sitzen. Lest die Karten „Atomkern und Atomhülle“, „Massenzahl“ und „Massenzahl rekonstruieren“ zusammen. Ihr müsst noch kein Element nennen.'],
    ['Wie verbinden wir Karten?', 'Nehmt zwei Karten, die eurer Meinung nach zusammengehören. Tippt eine Karte an, wählt „Verbinden“ und tippt dann die zweite Karte an.', 'Lest eure Verbindung als Satz vor: „Diese Information hilft uns, jene zu verstehen, weil …“. Könnt ihr das noch nicht erklären, lasst die Verbindung zunächst offen und besprecht sie.']
  ];
  const tip = tips[topic] || tips[0];
  openDialog('Ein kleiner Schritt hilft weiter', `<p class="muted">Ihr braucht nicht sofort die ganze Lösung. Wählt die Hilfe, die ihr gerade braucht.</p><div class="starter-topics">${tips.map((t,i) => action(t[0],'starter-topic','secondary small',`data-topic="${i}" aria-pressed="${i === topic}"`)).join('')}</div><section class="starter-tip"><h3>${tip[0]}</h3><p>${tip[1]}</p><p>${tip[2]}</p></section><p class="help-text">Diese Starthilfe verbraucht keinen Joker. Für weitere chemische Denkanstöße könnt ihr eure gemeinsamen Joker nutzen.</p>`);
}
function showHelp() {
  openDialog('Eure Ermittlung', '<p><b>1. Eigene Akte lesen.</b> Jede Rolle erhält andere Hinweise. Markierungen und Notizen bleiben persönlich.</p><p><b>2. Miteinander sprechen.</b> Erklärt, was ihr herausgefunden habt. Niemand hat anfangs alle Informationen.</p><p><b>3. Beweise verknüpfen.</b> Zieht Karten auf die Wand oder verwendet das Kartenmenü. Wählt „Verbinden“ und tippt eine zweite Karte an. Die Pfeilrichtung folgt eurer Auswahl.</p><p><b>4. Gemeinsam begründen.</b> Gebt euer Urteil ab und erklärt die chemischen Zusammenhänge.</p><p class="notice">' + (DEMO_MODE ? 'Demo: Speicherung auf diesem Gerät, gemeinsame Gruppen in Tabs desselben Browsers. Simulierte Rollen werden bei der Beweisführung nacheinander bearbeitet.' : 'Die gemeinsame Ermittlungswand wird über Firebase synchronisiert. Persönliche Notizen, Markierungen und Merksatzentwürfe bleiben lokal auf diesem Gerät.') + '</p>');
}
document.getElementById('help-button').addEventListener('click',showHelp);
document.getElementById('brand').addEventListener('click',event => { event.preventDefault(); showHelp(); });
window.addEventListener('pagehide', saveGameState);
listenForGroupChanges();
render();
function offerResume() {
resumeCandidate = loadGameState();
if (resumeCandidate) openDialog('Eine laufende Ermittlung wurde gefunden.', `<p>Team <b>${escapeHTML(resumeCandidate.state.groupCode)}</b> · ${resumeCandidate.state.groupSize} Personen · Ermittler ${escapeHTML(resumeCandidate.state.role)}</p><p class="muted">Setze deine Akte fort oder beginne eine separate Sitzung. Vorhandene Teams bleiben dabei erhalten, damit weitere Tabs beitreten können.</p>`, action('ERMITTLUNG FORTSETZEN','resume') + action('NEU BEGINNEN','new-session','secondary'), true);

}
if (DEMO_MODE) offerResume(); else cloudAction(async () => offerResume());
window.addEventListener('beforeunload', event => {
  if (!DEMO_MODE && firebaseAdapter?.pendingCount()) { event.preventDefault(); event.returnValue = ''; }
});
