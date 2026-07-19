// ─── PRELOADER ────────────────────────────────────────────────────────────────
(function() {
  const bar    = document.getElementById('preloader-bar');
  const status = document.getElementById('preloader-status');
  const steps  = [
    [15,  'Carregando fontes'],
    [35,  'Preparando engine de áudio'],
    [60,  'Inicializando processadores'],
    [80,  'Configurando interface'],
    [100, 'Pronto'],
  ];
  let i = 0;
  function nextStep() {
    if (i >= steps.length) {
      document.getElementById('preloader').classList.add('hidden');
      return;
    }
    const [pct, msg] = steps[i++];
    bar.style.width = pct + '%';
    status.firstChild.textContent = msg;
    setTimeout(nextStep, i === steps.length ? 300 : 280 + Math.random() * 120);
  }
  // Start after fonts likely loaded
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { setTimeout(nextStep, 80); });
  } else {
    setTimeout(nextStep, 200);
  }
})();

function showLoadingOverlay(text, sub) {
  const ov = document.getElementById('loading-overlay');
  document.getElementById('loading-text').childNodes[0].textContent = text;
  document.getElementById('loading-sub').textContent = sub || '';
  ov.classList.add('show');
}
function hideLoadingOverlay() {
  document.getElementById('loading-overlay').classList.remove('show');
}

// ─── AUDIO ENGINE ─────────────────────────────────────────────────────────────
let audioCtx = null;
let sourceNode = null;
let audioBuffer = null;
let stretchedBuffer = null;   // pitch-corrected version of audioBuffer
let isPlaying = false;
let startTime = 0;
let pausedAt = 0;
let animFrame = null;
let playbackSpeed = 1.0;      // current speed (pitch-corrected)

// Nodes
let gainNode, bassEQ, midEQ, trebleEQ, convolverNode, analyserL, analyserR;
let stereoSplitter, stereoMerger, stereoGainL, stereoGainR;
let reverbGain, dryGain, headroomGain, limiterBypassGain;
// New nodes
let hpfNode, compressorNode, deesserNode, limiterNode;
let hpfBypass, compBypass, deessBypass;

// Processor enabled states
const procEnabled = { hpf: true, comp: true, deess: true, lim: true };

// Current settings
let settings = {
  bass: 0, mid: 0, treble: 0,
  reverb: 0, gain: 1.0, stereo: 0
};

// Presets definition
// As chaves aqui precisam bater exatamente com os atributos data-preset dos
// botões em index.html (podcast, youtube, instagram, audiobook, radio, curso).
// Valores calibrados pra combinar com a descrição de cada preset no card.
const PRESETS = {
  podcast:   { bass: 2,  mid: 1,  treble: 0,  reverb: 8,  gain: 1.15, stereo: 8,  lufs: '-16 LUFS', label: '🎙️ Podcast ativo' },
  youtube:   { bass: 0,  mid: 3,  treble: 4,  reverb: 5,  gain: 1.3,  stereo: 10, lufs: '-14 LUFS', label: '▶️ YouTube ativo' },
  instagram: { bass: -2, mid: 4,  treble: 5,  reverb: 3,  gain: 1.35, stereo: 15, lufs: '-14 LUFS', label: '📸 Instagram ativo' },
  audiobook: { bass: 0,  mid: 0,  treble: -1, reverb: 2,  gain: 1.0,  stereo: 0,  lufs: '-18 LUFS', label: '📖 Audiobook ativo' },
  radio:     { bass: 4,  mid: 3,  treble: 2,  reverb: 6,  gain: 1.4,  stereo: 5,  lufs: '-14 LUFS', label: '📻 Rádio ativo' },
  curso:     { bass: -3, mid: 5,  treble: 4,  reverb: 0,  gain: 1.1,  stereo: 0,  lufs: '-16 LUFS', label: '🎓 Curso Online ativo' },
};

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new AudioContext();
  } catch(e) {
    showStatus('❌ Web Audio API não suportada neste navegador');
    return;
  }
  buildGraph();
}

function buildGraph() {
  // ── HPF (High-Pass Filter) ───────────────────────────────────────────────────
  hpfNode = audioCtx.createBiquadFilter();
  hpfNode.type = 'highpass';
  hpfNode.frequency.value = 80;
  hpfNode.Q.value = 0.7;

  hpfBypass = audioCtx.createGain();
  hpfBypass.gain.value = 1;

  // ── 3-band EQ ───────────────────────────────────────────────────────────────
  bassEQ = audioCtx.createBiquadFilter();
  bassEQ.type = 'lowshelf';
  bassEQ.frequency.value = 80;

  midEQ = audioCtx.createBiquadFilter();
  midEQ.type = 'peaking';
  midEQ.frequency.value = 1000;
  midEQ.Q.value = 1.2;

  trebleEQ = audioCtx.createBiquadFilter();
  trebleEQ.type = 'highshelf';
  trebleEQ.frequency.value = 8000;

  // Gain
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 1.0;

  // ── Compressor ──────────────────────────────────────────────────────────────
  compressorNode = audioCtx.createDynamicsCompressor();
  compressorNode.threshold.value = -18;
  compressorNode.ratio.value = 3;
  compressorNode.attack.value = 0.003;
  compressorNode.release.value = 0.25;
  compressorNode.knee.value = 6;

  compBypass = audioCtx.createGain();
  compBypass.gain.value = 1;

  // ── De-esser ────────────────────────────────────────────────────────────────
  deesserNode = audioCtx.createBiquadFilter();
  deesserNode.type = 'peaking';
  deesserNode.frequency.value = 6500;
  deesserNode.gain.value = -4;
  deesserNode.Q.value = 3;

  deessBypass = audioCtx.createGain();
  deessBypass.gain.value = 1;

  // ── Reverb (convolver) ──────────────────────────────────────────────────────
  convolverNode = audioCtx.createConvolver();
  createImpulse(0.5);
  reverbGain = audioCtx.createGain();
  reverbGain.gain.value = 0;
  dryGain = audioCtx.createGain();
  dryGain.gain.value = 1;

  // ── Stereo widener (BEFORE limiter) ─────────────────────────────────────────
  stereoSplitter = audioCtx.createChannelSplitter(2);
  stereoMerger  = audioCtx.createChannelMerger(2);
  stereoGainL   = audioCtx.createGain();
  stereoGainR   = audioCtx.createGain();
  stereoGainL.gain.value = 1;
  stereoGainR.gain.value = 1;

  // ── Headroom gain (absorbs reverb mix sum before limiter) ────────────────────
  // -3 dBFS de margem de segurança para prevenir clipping no sumador dry+wet
  headroomGain = audioCtx.createGain();
  headroomGain.gain.value = 0.707; // ~-3 dBFS

  // ── Limiter ─────────────────────────────────────────────────────────────────
  limiterNode = audioCtx.createDynamicsCompressor();
  limiterNode.threshold.value = -3;  // -3 dBFS para headroom extra
  limiterNode.ratio.value = 20;
  limiterNode.attack.value = 0.001;
  limiterNode.release.value = 0.1;   // release mais lento evita pumping
  limiterNode.knee.value = 0;        // hard limiting

  // Bypass path paralelo (evita makeup gain residual do DynamicsCompressor)
  limiterBypassGain = audioCtx.createGain();
  limiterBypassGain.gain.value = 0;  // bypass desligado por padrão

  // ── Analysers ───────────────────────────────────────────────────────────────
  analyserL = audioCtx.createAnalyser();
  analyserL.fftSize = 2048;  // maior resolução temporal para medição de pico
  analyserR = audioCtx.createAnalyser();
  analyserR.fftSize = 2048;

  // ── Signal chain (corrigida) ─────────────────────────────────────────────────
  // source → HPF → EQ(bass→mid→treble) → gain → compressor → de-esser
  //       → dry/wet sum → headroomGain → stereo widener → limiter → analysers → destination
  //                                                     ↑ widener ANTES do limiter

  hpfNode.connect(bassEQ);
  bassEQ.connect(midEQ);
  midEQ.connect(trebleEQ);
  trebleEQ.connect(gainNode);

  gainNode.connect(compressorNode);
  compressorNode.connect(deesserNode);

  deesserNode.connect(dryGain);
  deesserNode.connect(convolverNode);
  convolverNode.connect(reverbGain);

  // dry + wet somam no headroomGain (com margem de -3dB)
  dryGain.connect(headroomGain);
  reverbGain.connect(headroomGain);

  // stereo widener ANTES do limiter
  headroomGain.connect(stereoSplitter);
  stereoSplitter.connect(stereoGainL, 0);
  stereoSplitter.connect(stereoGainR, 1);
  stereoGainL.connect(stereoMerger, 0, 0);
  stereoGainR.connect(stereoMerger, 0, 1);

  // limiter protege a saída final (path principal + path bypass paralelo)
  stereoMerger.connect(limiterNode);
  stereoMerger.connect(limiterBypassGain);

  limiterNode.connect(analyserL);
  limiterNode.connect(analyserR);
  limiterNode.connect(audioCtx.destination);

  limiterBypassGain.connect(analyserL);
  limiterBypassGain.connect(analyserR);
  limiterBypassGain.connect(audioCtx.destination);

  updateChainUI();
}

function createImpulse(decay) {
  const sr = audioCtx.sampleRate;
  const len = sr * 2.0;
  const buf = audioCtx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay * 10);
    }
  }
  convolverNode.buffer = buf;
}

function applySettingsToNodes() {
  if (!audioCtx) return;
  bassEQ.gain.setTargetAtTime(settings.bass, audioCtx.currentTime, 0.01);
  midEQ.gain.setTargetAtTime(settings.mid, audioCtx.currentTime, 0.01);
  trebleEQ.gain.setTargetAtTime(settings.treble, audioCtx.currentTime, 0.01);
  gainNode.gain.setTargetAtTime(settings.gain, audioCtx.currentTime, 0.01);

  const rev = settings.reverb / 100;
  reverbGain.gain.setTargetAtTime(rev * 0.8, audioCtx.currentTime, 0.02);
  dryGain.gain.setTargetAtTime(1 - rev * 0.3, audioCtx.currentTime, 0.02);

  const sw = settings.stereo / 100;
  stereoGainL.gain.setTargetAtTime(1 + sw * 0.5, audioCtx.currentTime, 0.02);
  stereoGainR.gain.setTargetAtTime(1 + sw * 0.5, audioCtx.currentTime, 0.02);

  // HPF on/off via frequency bypass trick
  hpfNode.frequency.setTargetAtTime(
    procEnabled.hpf ? 80 : 20, audioCtx.currentTime, 0.01
  );
  // Compressor on/off via ratio
  compressorNode.ratio.setTargetAtTime(
    procEnabled.comp ? 3 : 1, audioCtx.currentTime, 0.01
  );
  compressorNode.threshold.setTargetAtTime(
    procEnabled.comp ? -18 : 0, audioCtx.currentTime, 0.01
  );
  // De-esser on/off via gain
  deesserNode.gain.setTargetAtTime(
    procEnabled.deess ? -4 : 0, audioCtx.currentTime, 0.01
  );
  // Limiter on/off via true bypass path (evita makeup gain residual)
  if (procEnabled.lim) {
    limiterNode.threshold.setTargetAtTime(-3, audioCtx.currentTime, 0.01);
    limiterNode.ratio.setTargetAtTime(20, audioCtx.currentTime, 0.01);
    limiterBypassGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
  } else {
    limiterNode.threshold.setTargetAtTime(-100, audioCtx.currentTime, 0.01);
    limiterBypassGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.01);
  }

  updateChainUI();
  drawFreqResponse();
}

// ─── PROCESSOR TOGGLES ────────────────────────────────────────────────────────
function toggleProcessor(name) {
  procEnabled[name] = !procEnabled[name];
  const chip = document.getElementById('toggle-' + name);
  if (procEnabled[name]) chip.classList.add('on');
  else chip.classList.remove('on');
  if (audioCtx) applySettingsToNodes();
  checkDefaultModified();
  scheduleAutosave();
  showStatus(procEnabled[name]
    ? `✅ ${name.toUpperCase()} ativado`
    : `⚪ ${name.toUpperCase()} bypass`);
}

// ─── SIGNAL CHAIN UI ──────────────────────────────────────────────────────────
function updateChainUI() {
  const map = { hpf: 'cn-hpf', comp: 'cn-comp', deess: 'cn-deess', lim: 'cn-lim' };
  for (const [key, id] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (procEnabled[key]) el.classList.add('active-node');
    else el.classList.remove('active-node');
  }
}

// ─── FREQUENCY RESPONSE VISUALIZER ───────────────────────────────────────────
function drawFreqResponse() {
  const canvas = document.getElementById('freq-canvas');
  if (!canvas || !audioCtx) return;
  const W = canvas.offsetWidth * devicePixelRatio || 800;
  const H = 80;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const nFreqs = W;
  const freqs = new Float32Array(nFreqs);
  for (let i = 0; i < nFreqs; i++) {
    // Log scale 20Hz–20kHz
    freqs[i] = 20 * Math.pow(1000, i / (nFreqs - 1));
  }

  // Nodes to query
  const nodes = [];
  if (procEnabled.hpf) nodes.push(hpfNode);
  nodes.push(bassEQ, midEQ, trebleEQ);
  if (procEnabled.deess) nodes.push(deesserNode);

  const mag = new Float32Array(nFreqs).fill(1);
  const tmpMag = new Float32Array(nFreqs);
  const tmpPhase = new Float32Array(nFreqs);

  for (const node of nodes) {
    node.getFrequencyResponse(freqs, tmpMag, tmpPhase);
    for (let i = 0; i < nFreqs; i++) mag[i] *= tmpMag[i];
  }

  // Draw
  ctx.clearRect(0, 0, W, H);

  // Grid lines at 0dB and ±6dB
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  [0.5, 0.33, 0.67].forEach(y => {
    ctx.beginPath(); ctx.moveTo(0, y*H); ctx.lineTo(W, y*H); ctx.stroke();
  });

  // Curve
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, 'rgba(124,106,255,0.9)');
  grad.addColorStop(0.4, 'rgba(0,229,255,0.9)');
  grad.addColorStop(0.7, 'rgba(255,121,198,0.9)');
  grad.addColorStop(1, 'rgba(124,106,255,0.9)');

  ctx.beginPath();
  for (let i = 0; i < nFreqs; i++) {
    const db = 20 * Math.log10(Math.max(mag[i], 1e-6));
    const clampedDb = Math.max(-24, Math.min(24, db));
    const y = H / 2 - (clampedDb / 24) * (H / 2 - 4);
    if (i === 0) ctx.moveTo(0, y);
    else ctx.lineTo(i, y);
  }
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fill under curve
  ctx.lineTo(nFreqs, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
  fillGrad.addColorStop(0, 'rgba(124,106,255,0.12)');
  fillGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fillGrad;
  ctx.fill();
}

// ─── BANCO DE DADOS (IndexedDB) — Biblioteca de Projetos ─────────────────────
// Áudios longos ficam pesados demais para localStorage; o áudio original é
// gravado como Blob nativo dentro do IndexedDB (sem base64, sem inchar 33%).
const DB_NAME = 'VoiceLabDB';
const DB_VERSION = 1;
const STORE = 'projects';
let dbInstance = null;
let currentProjectId = null;   // id do projeto salvo, ou null se ainda não foi salvo
let currentFileBlob  = null;   // Blob do áudio original carregado
let currentFileMime  = 'audio/wav';
let currentFileName  = '';
let autosaveTimer    = null;
let nameModalMode     = null;  // 'save' | 'rename'
let nameModalTargetId = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };
    req.onsuccess = e => { dbInstance = e.target.result; resolve(dbInstance); };
    req.onerror   = e => reject(e.target.error);
  });
}
function dbPut(record) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(record);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  }));
}
function dbGet(id) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  }));
}
function dbGetAll() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = e => resolve(e.target.result || []);
    req.onerror   = e => reject(e.target.error);
  }));
}
function dbDelete(id) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  }));
}
function dbClear() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  }));
}

// Extrai uma "impressão digital" leve da onda (não depende da duração do áudio,
// então um projeto de 3h gera a mesma thumbnail leve que um de 3min)
function generatePeaks(buffer, numPoints = 240) {
  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / numPoints));
  const peaks = [];
  for (let i = 0; i < numPoints; i++) {
    let max = 0;
    const start = i * step;
    for (let j = 0; j < step; j++) {
      const v = Math.abs(data[start + j] || 0);
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  return peaks;
}

function drawMiniWaveform(canvas, peaks) {
  if (!canvas || !peaks || !peaks.length) return;
  const dpr = devicePixelRatio || 1;
  const W = (canvas.offsetWidth  || 64) * dpr;
  const H = (canvas.offsetHeight || 32) * dpr;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#7c6aff'); grad.addColorStop(1, '#00e5ff');
  ctx.fillStyle = grad;
  const bw = W / peaks.length;
  peaks.forEach((p, i) => {
    const h = Math.max(1, p * H * 0.9);
    ctx.fillRect(i * bw, (H - h) / 2, Math.max(1, bw - 1), h);
  });
}

function fmtSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
         d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ─── SALVAR / CARREGAR PROJETOS ───────────────────────────────────────────────
function saveProjectFlow() {
  if (!audioBuffer || !currentFileBlob) return;
  if (currentProjectId) {
    // Já é um projeto salvo: apenas atualiza ajustes, sem regravar o áudio (rápido, mesmo em arquivos longos)
    updateCurrentProjectMeta().then(() => showStatus('💾 Projeto atualizado'));
    return;
  }
  nameModalMode = 'save';
  document.getElementById('name-modal-title').textContent = 'Salvar projeto';
  document.getElementById('name-modal-input').value = (currentFileName || 'Projeto sem título').replace(/\.[^.]+$/, '');
  document.getElementById('name-modal-overlay').classList.add('show');
  setTimeout(() => document.getElementById('name-modal-input').focus(), 50);
}

async function updateCurrentProjectMeta() {
  const rec = await dbGet(currentProjectId);
  if (!rec) return;
  rec.settings     = { ...settings };
  rec.procEnabled  = { ...procEnabled };
  rec.speed        = playbackSpeed;
  rec.presetName   = currentPreset;
  rec.updatedAt    = Date.now();
  await dbPut(rec);
  refreshLibraryIfOpen();
}

function closeNameModal() {
  document.getElementById('name-modal-overlay').classList.remove('show');
  nameModalMode = null; nameModalTargetId = null;
}

async function confirmNameModal() {
  const name = document.getElementById('name-modal-input').value.trim() || 'Projeto sem título';
  if (nameModalMode === 'save') {
    await persistNewProject(name);
  } else if (nameModalMode === 'rename') {
    const rec = await dbGet(nameModalTargetId);
    if (rec) {
      rec.name = name; rec.updatedAt = Date.now();
      await dbPut(rec);
      if (currentProjectId === nameModalTargetId) updateProjectBadge(name);
      await refreshLibrary();
    }
  }
  closeNameModal();
}

async function persistNewProject(name) {
  showLoadingOverlay('Salvando no banco de dados', 'Gerando miniatura e gravando áudio...');
  await new Promise(r => setTimeout(r, 20));
  try {
    const peaks = generatePeaks(audioBuffer);
    const record = {
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      audioBlob: currentFileBlob,
      mimeType: currentFileMime,
      fileSize: currentFileBlob.size,
      duration: audioBuffer.duration,
      peaks,
      settings: { ...settings },
      procEnabled: { ...procEnabled },
      speed: playbackSpeed,
      presetName: currentPreset,
    };
    const id = await dbPut(record);
    currentProjectId = id;
    updateProjectBadge(name);
    await refreshLibrary();
    showStatus('✅ Projeto salvo no banco de dados');
  } catch (err) {
    console.error(err);
    showStatus('❌ Erro ao salvar projeto: ' + err.message);
  }
  hideLoadingOverlay();
}

function updateProjectBadge(name) {
  document.getElementById('project-name-text').textContent = name;
  document.getElementById('project-name-badge').classList.add('visible');
}

async function loadProjectById(id) {
  closeLibrary();
  const rec = await dbGet(id);
  if (!rec) return;
  showLoadingOverlay('Carregando projeto', rec.name);
  initAudio();
  if (!audioCtx) { hideLoadingOverlay(); return; }
  if (audioCtx.state === 'suspended') await audioCtx.resume();
  stopPlayback();

  try {
    const arrayBuf = await rec.audioBlob.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
  } catch (err) {
    hideLoadingOverlay();
    showStatus('❌ Não foi possível carregar o áudio deste projeto');
    console.error(err);
    return;
  }

  currentFileBlob = rec.audioBlob;
  currentFileMime = rec.mimeType;
  currentFileName = rec.name;
  currentProjectId = rec.id;

  // Restaura ajustes finos e processadores
  settings = { ...rec.settings };
  Object.assign(procEnabled, rec.procEnabled);
  ['hpf', 'comp', 'deess', 'lim'].forEach(k => {
    document.getElementById('toggle-' + k).classList.toggle('on', !!procEnabled[k]);
  });
  document.getElementById('ctrl-bass').value   = settings.bass;
  document.getElementById('ctrl-mid').value    = settings.mid;
  document.getElementById('ctrl-treble').value = settings.treble;
  document.getElementById('ctrl-reverb').value = settings.reverb;
  document.getElementById('ctrl-gain').value   = settings.gain * 100;
  document.getElementById('ctrl-stereo').value = settings.stereo;
  updateLabels();

  currentPreset = rec.presetName || null;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === currentPreset));
  if (currentPreset && PRESETS[currentPreset]) {
    document.getElementById('active-preset-display').style.display = 'block';
    document.getElementById('active-preset-label').textContent = PRESETS[currentPreset].label;
    document.getElementById('active-preset-loudness').textContent = PRESETS[currentPreset].lufs ? ('🎚️ ' + PRESETS[currentPreset].lufs) : '';
  } else {
    document.getElementById('active-preset-display').style.display = 'none';
    document.getElementById('active-preset-loudness').textContent = '';
  }
  checkPresetModified();
  checkDefaultModified();

  document.getElementById('loading-text').childNodes[0].textContent = 'Aplicando pitch correction';
  playbackSpeed = rec.speed || 1.0;
  stretchedBuffer = await buildStretchedBuffer(audioBuffer, playbackSpeed);
  document.getElementById('speed-badge').textContent = playbackSpeed.toFixed(2).replace(/\.?0+$/, '') + '×';
  document.getElementById('ctrl-speed').value = playbackSpeed;
  document.querySelectorAll('.speed-chip').forEach(c => c.classList.toggle('active', parseFloat(c.dataset.speed) === playbackSpeed));

  hideLoadingOverlay();

  uploadZone.classList.add('has-file');
  uploadZone.innerHTML = `
    <span class="upload-icon">✅</span>
    <p class="upload-text">${escapeHtml(rec.name)}</p>
    <p class="upload-sub">Duração: ${formatTime(audioBuffer.duration)} · ${fmtSize(rec.fileSize)}</p>
    <span style="color:var(--green);font-family:'JetBrains Mono',monospace;font-size:16px;background:rgba(0,230,118,.1);padding:4px 14px;border-radius:999px;margin-top:10px;display:inline-block">Clique para trocar o arquivo</span>
  `;
  document.getElementById('time-total').textContent = formatTime(audioBuffer.duration);
  document.getElementById('play-btn').disabled = false;
  document.getElementById('export-btn').disabled = false;
  document.getElementById('save-project-btn').disabled = false;
  document.getElementById('waveform-container').classList.add('visible');
  updateProjectBadge(rec.name);

  drawStaticWaveform();
  applySettingsToNodes();
  drawFreqResponse();
  showStatus('📂 Projeto "' + rec.name + '" carregado');
}

async function duplicateProject(id, ev) {
  ev.stopPropagation();
  const rec = await dbGet(id);
  if (!rec) return;
  const copy = { ...rec };
  delete copy.id;
  copy.name = rec.name + ' (cópia)';
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  await dbPut(copy);
  await refreshLibrary();
  showStatus('⧉ Projeto duplicado');
}

async function deleteProject(id, ev) {
  ev.stopPropagation();
  if (!confirm('Excluir este projeto do banco de dados? Essa ação não pode ser desfeita.')) return;
  await dbDelete(id);
  if (currentProjectId === id) {
    currentProjectId = null;
    document.getElementById('project-name-badge').classList.remove('visible');
  }
  await refreshLibrary();
  showStatus('🗑️ Projeto excluído');
}

function renameProjectPrompt(id, currentName, ev) {
  ev.stopPropagation();
  nameModalMode = 'rename';
  nameModalTargetId = id;
  document.getElementById('name-modal-title').textContent = 'Renomear projeto';
  document.getElementById('name-modal-input').value = currentName;
  document.getElementById('name-modal-overlay').classList.add('show');
  setTimeout(() => document.getElementById('name-modal-input').focus(), 50);
}

async function clearLibrary() {
  if (!confirm('Excluir TODOS os projetos salvos no banco de dados? Essa ação não pode ser desfeita.')) return;
  await dbClear();
  currentProjectId = null;
  document.getElementById('project-name-badge').classList.remove('visible');
  await refreshLibrary();
  showStatus('🗑️ Biblioteca limpa');
}

// ─── PAINEL DA BIBLIOTECA ─────────────────────────────────────────────────────
async function openLibrary() {
  document.getElementById('library-overlay').classList.add('show');
  await refreshLibrary();
}
function closeLibrary() {
  document.getElementById('library-overlay').classList.remove('show');
}
function refreshLibraryIfOpen() {
  if (document.getElementById('library-overlay').classList.contains('show')) refreshLibrary();
}

async function refreshLibrary() {
  let list = [];
  try { list = await dbGetAll(); } catch (e) { console.error(e); }
  list.sort((a, b) => b.updatedAt - a.updatedAt);

  const countBadge = document.getElementById('lib-count');
  countBadge.style.display = list.length ? 'inline-block' : 'none';
  countBadge.textContent = list.length;

  const container = document.getElementById('library-list');
  if (!list.length) {
    container.innerHTML = '<div class="library-empty">Nenhum projeto salvo ainda.<br>Carregue um áudio e clique em "Salvar na Bilioteca".</div>';
  } else {
    container.innerHTML = list.map(rec => `
      <div class="project-card" onclick="loadProjectById(${rec.id})">
        <canvas id="pc-canvas-${rec.id}"></canvas>
        <div class="pc-info">
          <div class="pc-name">${escapeHtml(rec.name)}</div>
          <div class="pc-meta">⏱ ${formatTime(rec.duration)} · ${fmtSize(rec.fileSize)} · ${fmtDate(rec.updatedAt)}</div>
        </div>
        <div class="pc-actions">
          <button class="pc-btn" onclick="renameProjectPrompt(${rec.id}, '${escapeHtml(rec.name).replace(/'/g, "\\'")}', event)" title="Renomear">✏️</button>
          <button class="pc-btn" onclick="duplicateProject(${rec.id}, event)" title="Duplicar">⧉</button>
          <button class="pc-btn danger" onclick="deleteProject(${rec.id}, event)" title="Excluir">🗑️</button>
        </div>
      </div>
    `).join('');
    list.forEach(rec => drawMiniWaveform(document.getElementById('pc-canvas-' + rec.id), rec.peaks));
  }

  updateResumeStrip(list.slice(0, 5));
  updateStorageBar();
}

function updateResumeStrip(recent) {
  const strip = document.getElementById('resume-strip');
  const label = document.getElementById('resume-label');
  if (!recent.length || audioBuffer) {
    strip.classList.remove('visible');
    label.style.display = 'none';
    return;
  }
  label.style.display = 'block';
  strip.classList.add('visible');
  strip.innerHTML = recent.map(rec => `
    <div class="resume-card" onclick="loadProjectById(${rec.id})">
      <canvas id="rc-canvas-${rec.id}"></canvas>
      <div class="rc-name">${escapeHtml(rec.name)}</div>
      <div class="rc-meta">⏱ ${formatTime(rec.duration)} · ${fmtSize(rec.fileSize)}</div>
    </div>
  `).join('');
  recent.forEach(rec => drawMiniWaveform(document.getElementById('rc-canvas-' + rec.id), rec.peaks));
}

async function updateStorageBar() {
  const usedEl  = document.getElementById('storage-used');
  const totalEl = document.getElementById('storage-total');
  const fillEl  = document.getElementById('storage-bar-fill');
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { usage, quota } = await navigator.storage.estimate();
      const pct = quota ? Math.min(100, (usage / quota) * 100) : 0;
      fillEl.style.width = pct.toFixed(1) + '%';
      fillEl.style.background = pct > 80
        ? 'linear-gradient(90deg, var(--amber), var(--red))'
        : 'linear-gradient(90deg, var(--accent), var(--accent2))';
      usedEl.textContent = fmtSize(usage) + ' usados';
      totalEl.textContent = fmtSize(quota) + ' disponíveis';
    } catch (e) {
      usedEl.textContent = '—'; totalEl.textContent = 'estimativa indisponível';
    }
  } else {
    usedEl.textContent = '—'; totalEl.textContent = 'não suportado neste navegador';
  }
}

// ─── AUTOSAVE silencioso (só ajustes, nunca regrava o áudio) ─────────────────
function scheduleAutosave() {
  if (!currentProjectId) return; // só autosalva projetos que já existem no banco
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => { updateCurrentProjectMeta(); }, 1200);
}

// ─── FILE LOAD ────────────────────────────────────────────────────────────────
const uploadZone = document.getElementById('upload-zone');
const fileInput  = document.getElementById('file-input');

if (uploadZone && fileInput) {
  uploadZone.onclick = () => fileInput.click();
  uploadZone.ondragover  = e => { e.preventDefault(); uploadZone.classList.add('drag-over'); };
  uploadZone.ondragleave = () => uploadZone.classList.remove('drag-over');
  uploadZone.ondrop = e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };
  fileInput.onchange = e => { if (e.target.files[0]) loadFile(e.target.files[0]); };
}

async function loadFile(file) {
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > 500) {
    showStatus('❌ Arquivo muito grande (máx. 500 MB)');
    return;
  }

  const subMsg = sizeMB > 50
    ? `${sizeMB.toFixed(0)} MB — isso pode levar alguns segundos`
    : `${sizeMB.toFixed(1)} MB`;
  showLoadingOverlay('Decodificando áudio', subMsg);

  initAudio();
  if (!audioCtx) { hideLoadingOverlay(); return; }
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  stopPlayback();
  let arrayBuf;
  try {
    arrayBuf = await file.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
  } catch(err) {
    hideLoadingOverlay();
    showStatus('❌ Não foi possível decodificar o arquivo de áudio');
    console.error('decodeAudioData error:', err);
    return;
  }

  // Generate pitch-corrected buffer for current speed
  document.getElementById('loading-text').childNodes[0].textContent = 'Aplicando pitch correction';
  document.getElementById('loading-sub').textContent = 'Algoritmo WSOLA em andamento...';
  stretchedBuffer = await buildStretchedBuffer(audioBuffer, playbackSpeed);

  hideLoadingOverlay();

  // Novo arquivo carregado manualmente = novo projeto (ainda não salvo no banco)
  currentFileBlob  = file;
  currentFileMime  = file.type || 'audio/wav';
  currentFileName  = file.name;
  currentProjectId = null;
  document.getElementById('project-name-badge').classList.remove('visible');

  uploadZone.classList.add('has-file');
  uploadZone.innerHTML = `
    <span class="upload-icon">✅</span>
    <p class="upload-text">${file.name}</p>
    <p class="upload-sub">Duração: ${formatTime(audioBuffer.duration)} · ${(file.size/1024/1024).toFixed(1)} MB</p>
    <span style="color:var(--green);font-family:'JetBrains Mono',monospace;font-size:16px;background:rgba(0,230,118,.1);padding:4px 14px;border-radius:999px;margin-top:10px;display:inline-block">Clique para trocar o arquivo</span>
  `;

  document.getElementById('time-total').textContent = formatTime(audioBuffer.duration);
  document.getElementById('play-btn').disabled = false;
  document.getElementById('export-btn').disabled = false;
  document.getElementById('save-project-btn').disabled = false;
  document.getElementById('waveform-container').classList.add('visible');

  updateResumeStrip([]); // esconde a faixa de retomada enquanto há áudio carregado
  drawStaticWaveform();
  drawFreqResponse();
  showStatus('✅ Arquivo carregado — pronto!');
}

// ─── WAVEFORM ─────────────────────────────────────────────────────────────────
function drawStaticWaveform() {
  const canvas = document.getElementById('waveform');
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth * devicePixelRatio || 800;
  const H = 80;
  canvas.width = W;
  canvas.height = H;

  const data = audioBuffer.getChannelData(0);
  const step = Math.floor(data.length / W);

  ctx.clearRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#7c6aff');
  grad.addColorStop(0.5, '#00e5ff');
  grad.addColorStop(1, '#7c6aff');
  ctx.fillStyle = grad;

  for (let x = 0; x < W; x++) {
    let max = 0;
    for (let j = 0; j < step; j++) {
      const v = Math.abs(data[x * step + j] || 0);
      if (v > max) max = v;
    }
    const h = max * H * 0.9;
    ctx.fillRect(x, (H - h) / 2, 1, h || 1);
  }
}

// ─── PLAYBACK ─────────────────────────────────────────────────────────────────
// pararSourceAtual() existe porque AudioBufferSourceNode.stop() dispara o evento
// onended de forma assíncrona — o handler não sabe distinguir "parei na mão"
// de "a faixa acabou sozinha". Sem desarmar onended antes do stop(), um seek
// rápido (ou pause+play) cria um source "fantasma" que reinicia a reprodução
// sozinho um instante depois, tocando por cima do source novo (áudio em camada).
function pararSourceAtual() {
  if (!sourceNode) return;
  sourceNode.onended = null;
  try { sourceNode.stop(); } catch (e) { /* já parado, ignora */ }
}

function togglePlay() {
  if (!audioBuffer) return;
  isPlaying ? pausePlayback() : startPlayback();
}

function startPlayback() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  sourceNode = audioCtx.createBufferSource();
  // Use pitch-corrected buffer; time is already stretched so playbackRate = 1
  sourceNode.buffer = stretchedBuffer || audioBuffer;
  sourceNode.playbackRate.value = 1.0;
  sourceNode.connect(hpfNode);
  applySettingsToNodes();
  // pausedAt is in original-time; convert to stretched-time for seek
  const stretchedStart = pausedAt * playbackSpeed;
  sourceNode.start(0, stretchedStart);
  startTime = audioCtx.currentTime - stretchedStart;
  isPlaying = true;

  const btn = document.getElementById('play-btn');
  btn.textContent = '⏸';
  btn.classList.add('playing');

  sourceNode.onended = () => {
    // Se chegou ao fim naturalmente (isPlaying ainda true = não foi stop manual),
    // repete a faixa automaticamente em vez de parar
    if (isPlaying) { pausedAt = 0; startPlayback(); }
  };

  drawVU();
}

function pausePlayback() {
  if (!isPlaying) return;
  // Convert stretched elapsed time back to original time
  const stretchedElapsed = audioCtx.currentTime - startTime;
  pausedAt = stretchedElapsed / playbackSpeed;
  pararSourceAtual();
  isPlaying = false;
  cancelAnimationFrame(animFrame);
  resetPlaybackUI();
}

function stopPlayback() {
  pararSourceAtual();
  isPlaying = false;
  pausedAt = 0;
  cancelAnimationFrame(animFrame);
  resetPlaybackUI();
}

function resetPlaybackUI() {
  const btn = document.getElementById('play-btn');
  btn.textContent = '▶';
  btn.classList.remove('playing');
}

function seekTo(e) {
  if (!audioBuffer) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  pausedAt = ratio * audioBuffer.duration;
  if (isPlaying) { pararSourceAtual(); isPlaying = false; startPlayback(); }
  updateProgressUI(ratio);
}

function updateProgressUI(ratio) {
  document.getElementById('progress-fill').style.width = (ratio * 100) + '%';
  document.getElementById('time-current').textContent = formatTime(pausedAt);
}

function drawVU() {
  // Arrays pré-alocados para evitar GC durante animação
  const tdL = new Uint8Array(analyserL.fftSize);
  const tdR = new Uint8Array(analyserR.fftSize);
  // Variáveis para peak hold visual
  let peakHoldL = 0, peakHoldR = 0;
  let peakHoldFramesL = 0, peakHoldFramesR = 0;
  const PEAK_HOLD_FRAMES = 30; // ~0.5s a 60fps
  let clipFlashL = 0, clipFlashR = 0;

  function tick() {
    if (!isPlaying) return;

    // Usar TimeDomain para pico REAL de amplitude (não energia por frequência)
    analyserL.getByteTimeDomainData(tdL);
    analyserR.getByteTimeDomainData(tdR);

    let maxL = 0, maxR = 0;
    for (let i = 0; i < tdL.length; i++) {
      const vL = Math.abs(tdL[i] - 128);
      const vR = Math.abs(tdR[i] - 128);
      if (vL > maxL) maxL = vL;
      if (vR > maxR) maxR = vR;
    }
    const peakL = maxL / 128;
    const peakR = maxR / 128;

    // Peak hold
    if (peakL >= peakHoldL) { peakHoldL = peakL; peakHoldFramesL = PEAK_HOLD_FRAMES; }
    else if (peakHoldFramesL > 0) peakHoldFramesL--;
    else peakHoldL = Math.max(0, peakHoldL - 0.02);

    if (peakR >= peakHoldR) { peakHoldR = peakR; peakHoldFramesR = PEAK_HOLD_FRAMES; }
    else if (peakHoldFramesR > 0) peakHoldFramesR--;
    else peakHoldR = Math.max(0, peakHoldR - 0.02);

    // Indicador de clipping (> 98% = clipping)
    const isClippingL = peakL > 0.98;
    const isClippingR = peakR > 0.98;
    if (isClippingL) clipFlashL = 10;
    if (isClippingR) clipFlashR = 10;

    const vuElemL = document.getElementById('vu-l');
    const vuElemR = document.getElementById('vu-r');

    vuElemL.style.width = Math.min(peakL * 100, 100) + '%';
    vuElemR.style.width = Math.min(peakR * 100, 100) + '%';

    // Indicador CLIP
    const clipElemL = document.getElementById('clip-l');
    const clipElemR = document.getElementById('clip-r');
    if (clipFlashL > 0) {
      clipElemL.classList.add('active');
      clipFlashL--;
    } else {
      clipElemL.classList.remove('active');
    }
    if (clipFlashR > 0) {
      clipElemR.classList.add('active');
      clipFlashR--;
    } else {
      clipElemR.classList.remove('active');
    }

    const stretchedElapsed = audioCtx.currentTime - startTime;
    const elapsed = stretchedElapsed / playbackSpeed;
    const ratio = Math.min(elapsed / audioBuffer.duration, 1);
    document.getElementById('progress-fill').style.width = (ratio*100) + '%';
    document.getElementById('time-current').textContent = formatTime(elapsed);

    animFrame = requestAnimationFrame(tick);
  }
  tick();
}

// ─── PRESETS ──────────────────────────────────────────────────────────────────
let currentPreset = null;

// Estado neutro de fábrica — usado pelo botão "Restaurar Padrão", que é
// independente de preset: aparece sempre que qualquer efeito (slider OU
// toggle de processador) sair do zero/neutro, com ou sem preset selecionado.
const DEFAULT_SETTINGS = { bass: 0, mid: 0, treble: 0, reverb: 0, gain: 1.0, stereo: 0 };
const DEFAULT_PROC     = { hpf: true, comp: true, deess: true, lim: true };

function applyPreset(name) {
  const p = PRESETS[name];

  // Toggle off
  if (currentPreset === name) {
    currentPreset = null;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('active-preset-display').style.display = 'none';
    document.getElementById('active-preset-loudness').textContent = '';
    resetSliders({ bass:0, mid:0, treble:0, reverb:0, gain:1.0, stereo:0 });
    checkPresetModified();
    checkDefaultModified();
    scheduleAutosave();
    showStatus('⚪ Preset removido');
    return;
  }

  currentPreset = name;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-preset="${name}"]`).classList.add('active');

  resetSliders(p);
  // Nota: resetSliders já atualiza `settings` internamente com os valores corretos do preset
  // Não duplicar a atribuição aqui para evitar inconsistência de escala

  document.getElementById('active-preset-display').style.display = 'block';
  document.getElementById('active-preset-label').textContent = p.label;
  document.getElementById('active-preset-loudness').textContent = p.lufs ? ('🎚️ ' + p.lufs) : '';

  applySettingsToNodes();
  checkPresetModified();
  checkDefaultModified();
  scheduleAutosave();
  showStatus(`✨ ${p.label}`);
}

// Verifica se os ajustes finos atuais divergem do preset ativo e alterna
// a exibição do selo "✏️ ajustado manualmente" e do botão "↺ restaurar preset"
function checkPresetModified() {
  const tag = document.getElementById('preset-modified-tag');
  const btn = document.getElementById('preset-restore-btn');
  if (!currentPreset || !PRESETS[currentPreset]) {
    tag.classList.remove('visible');
    btn.classList.remove('visible');
    return;
  }
  const p = PRESETS[currentPreset];
  const target = {
    bass:   p.bass   ?? 0,
    mid:    p.mid    ?? 0,
    treble: p.treble ?? 0,
    reverb: p.reverb ?? 0,
    gain:   p.gain   ?? 1.0,
    stereo: p.stereo ?? 0,
  };
  const EPS = 0.01;
  const modified = Object.keys(target).some(k => Math.abs((settings[k] ?? 0) - target[k]) > EPS);
  tag.classList.toggle('visible', modified);
  btn.classList.toggle('visible', modified);
}

// Diz se os controles estão exatamente no zero/neutro de fábrica — sliders
// zerados e os 4 processadores (HPF/COMP/DE-ESS/LIMITER) ligados, que é o
// estado inicial do app.
function isDefaultState() {
  const EPS = 0.01;
  const slidersOk = Object.keys(DEFAULT_SETTINGS)
    .every(k => Math.abs((settings[k] ?? 0) - DEFAULT_SETTINGS[k]) <= EPS);
  const procOk = Object.keys(DEFAULT_PROC)
    .every(k => !!procEnabled[k] === DEFAULT_PROC[k]);
  return slidersOk && procOk;
}

// Mostra/esconde o botão "↺ Restaurar Padrão" — some sozinho quando tudo
// volta a bater com o estado neutro de fábrica.
function checkDefaultModified() {
  const row = document.getElementById('reset-default-row');
  if (!row) return;
  row.classList.toggle('visible', !isDefaultState());
}

// Zera todos os efeitos e reativa os 4 processadores, removendo qualquer
// preset selecionado. Diferente de restorePresetValues(): esse aqui sempre
// volta ao neutro de fábrica, com ou sem preset ativo.
function restaurarPadrao() {
  currentPreset = null;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('active-preset-display').style.display = 'none';
  document.getElementById('active-preset-loudness').textContent = '';

  resetSliders(DEFAULT_SETTINGS);

  Object.assign(procEnabled, DEFAULT_PROC);
  ['hpf', 'comp', 'deess', 'lim'].forEach(k => {
    document.getElementById('toggle-' + k).classList.toggle('on', procEnabled[k]);
  });
  updateChainUI();

  applySettingsToNodes();
  checkPresetModified();
  checkDefaultModified();
  scheduleAutosave();
  showStatus('↺ Configurações restauradas ao padrão');
}

// Restaura os valores originais do preset ativo, sem remover a seleção do preset
function restorePresetValues() {
  if (!currentPreset || !PRESETS[currentPreset]) return;
  const p = PRESETS[currentPreset];
  resetSliders(p);
  applySettingsToNodes();
  checkPresetModified();
  checkDefaultModified();
  scheduleAutosave();
  showStatus('↺ Valores do preset restaurados');
}

function resetSliders(p) {
  document.getElementById('ctrl-bass').value    = p.bass   ?? 0;
  document.getElementById('ctrl-mid').value     = p.mid    ?? 0;
  document.getElementById('ctrl-treble').value  = p.treble ?? 0;
  document.getElementById('ctrl-reverb').value  = p.reverb ?? 0;
  document.getElementById('ctrl-gain').value    = Math.min((p.gain ?? 1.0) * 100, 200);  // max 200%
  document.getElementById('ctrl-stereo').value  = p.stereo ?? 0;
  updateLabels();
  settings = {
    bass:   p.bass   ?? 0,
    mid:    p.mid    ?? 0,
    treble: p.treble ?? 0,
    reverb: p.reverb ?? 0,
    gain:   p.gain   ?? 1.0,
    stereo: p.stereo ?? 0,
  };
}

function onCtrlChange() {
  settings.bass   = parseFloat(document.getElementById('ctrl-bass').value);
  settings.mid    = parseFloat(document.getElementById('ctrl-mid').value);
  settings.treble = parseFloat(document.getElementById('ctrl-treble').value);
  settings.reverb = parseFloat(document.getElementById('ctrl-reverb').value);
  settings.gain   = parseFloat(document.getElementById('ctrl-gain').value) / 100;
  settings.stereo = parseFloat(document.getElementById('ctrl-stereo').value);
  updateLabels();
  applySettingsToNodes();

  // Aviso de gain alto (risco de distorção mesmo com limiter)
  if (settings.gain > 1.5) {
    showStatus('⚠️ Volume alto — risco de distorção');
  }

  // Preset permanece selecionado/ativo enquanto o usuário faz ajuste fino manual
  checkPresetModified();
  checkDefaultModified();
  scheduleAutosave();
}

function updateLabels() {
  const b = parseFloat(document.getElementById('ctrl-bass').value);
  const m = parseFloat(document.getElementById('ctrl-mid').value);
  const t = parseFloat(document.getElementById('ctrl-treble').value);
  const r = parseFloat(document.getElementById('ctrl-reverb').value);
  const g = parseFloat(document.getElementById('ctrl-gain').value);
  const s = parseFloat(document.getElementById('ctrl-stereo').value);
  document.getElementById('val-bass').textContent   = (b >= 0 ? '+' : '') + b + ' dB';
  document.getElementById('val-mid').textContent    = (m >= 0 ? '+' : '') + m + ' dB';
  document.getElementById('val-treble').textContent = (t >= 0 ? '+' : '') + t + ' dB';
  document.getElementById('val-reverb').textContent = r + '%';
  document.getElementById('val-gain').textContent   = g + '%';
  document.getElementById('val-stereo').textContent = s + '%';
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
async function exportAudio() {
  if (!audioBuffer) return;
  document.getElementById('export-btn').disabled = true;

  // Use stretchedBuffer (já com pitch-correction) como fonte do offline render
  const srcBuf = stretchedBuffer || audioBuffer;

  showLoadingOverlay('Exportando áudio processado', `Velocidade ${playbackSpeed}× · Processamento offline...`);

  try {
    const offCtx = new OfflineAudioContext(
      srcBuf.numberOfChannels,
      srcBuf.length,
      srcBuf.sampleRate
    );

    const src = offCtx.createBufferSource();
    src.buffer = srcBuf;

    // HPF
    const oHPF = offCtx.createBiquadFilter();
    oHPF.type = 'highpass';
    oHPF.frequency.value = procEnabled.hpf ? 80 : 20;
    oHPF.Q.value = 0.7;

    // EQ
    const bEQ = offCtx.createBiquadFilter();
    bEQ.type = 'lowshelf'; bEQ.frequency.value = 80; bEQ.gain.value = settings.bass;

    const mEQ = offCtx.createBiquadFilter();
    mEQ.type = 'peaking'; mEQ.frequency.value = 1000; mEQ.Q.value = 1.2; mEQ.gain.value = settings.mid;

    const tEQ = offCtx.createBiquadFilter();
    tEQ.type = 'highshelf'; tEQ.frequency.value = 8000; tEQ.gain.value = settings.treble;

    const gN = offCtx.createGain();
    gN.gain.value = settings.gain;

    // Compressor
    const oComp = offCtx.createDynamicsCompressor();
    oComp.threshold.value = procEnabled.comp ? -18 : 0;
    oComp.ratio.value = procEnabled.comp ? 3 : 1;
    oComp.attack.value = 0.003;
    oComp.release.value = 0.25;
    oComp.knee.value = 6;

    // De-esser
    const oDess = offCtx.createBiquadFilter();
    oDess.type = 'peaking';
    oDess.frequency.value = 6500;
    oDess.gain.value = procEnabled.deess ? -4 : 0;
    oDess.Q.value = 3;

    // Reverb offline
    const conv = offCtx.createConvolver();
    const sr = offCtx.sampleRate;
    const impLen = sr * 2;
    const impBuf = offCtx.createBuffer(2, impLen, sr);
    for (let c = 0; c < 2; c++) {
      const d = impBuf.getChannelData(c);
      for (let i = 0; i < impLen; i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/impLen, 5);
    }
    conv.buffer = impBuf;

    const revG = offCtx.createGain();
    revG.gain.value = (settings.reverb/100) * 0.8;
    const dryG = offCtx.createGain();
    dryG.gain.value = 1 - (settings.reverb/100) * 0.3;

    // Headroom gain (idêntico à cadeia live)
    const oHeadroom = offCtx.createGain();
    oHeadroom.gain.value = 0.707; // ~-3 dBFS

    // Stereo widener ANTES do limiter (idêntico à cadeia live)
    const spl = offCtx.createChannelSplitter(2);
    const mrg = offCtx.createChannelMerger(2);
    const glL = offCtx.createGain();
    const glR = offCtx.createGain();
    const sw = settings.stereo / 100;
    glL.gain.value = 1 + sw * 0.5;
    glR.gain.value = 1 + sw * 0.5;

    // Limiter
    const oLim = offCtx.createDynamicsCompressor();
    const oLimBypass = offCtx.createGain();
    if (procEnabled.lim) {
      oLim.threshold.value = -3;
      oLim.ratio.value = 20;
      oLimBypass.gain.value = 0;
    } else {
      oLim.threshold.value = -100;
      oLimBypass.gain.value = 1;
    }
    oLim.attack.value = 0.001;
    oLim.release.value = 0.1;
    oLim.knee.value = 0;

    src.connect(oHPF);
    oHPF.connect(bEQ); bEQ.connect(mEQ); mEQ.connect(tEQ); tEQ.connect(gN);
    gN.connect(oComp); oComp.connect(oDess);
    oDess.connect(dryG); oDess.connect(conv); conv.connect(revG);
    dryG.connect(oHeadroom); revG.connect(oHeadroom);
    oHeadroom.connect(spl);
    spl.connect(glL, 0); spl.connect(glR, 1);
    glL.connect(mrg, 0, 0); glR.connect(mrg, 0, 1);
    mrg.connect(oLim); mrg.connect(oLimBypass);
    oLim.connect(offCtx.destination);
    oLimBypass.connect(offCtx.destination);

    src.start(0);
    const rendered = await offCtx.startRendering();
    const wavBlob = encodeWAV(rendered);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voicelab-processado.wav';
    a.click();
    URL.revokeObjectURL(url);
    hideLoadingOverlay();
    showStatus('✅ Áudio exportado com sucesso!');
  } catch(err) {
    hideLoadingOverlay();
    showStatus('❌ Erro na exportação: ' + err.message);
    console.error(err);
  }

  document.getElementById('export-btn').disabled = false;
}

function encodeWAV(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const numSamples = buffer.length;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const ab = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(ab);

  function writeStr(o, s) { for (let i=0;i<s.length;i++) view.setUint8(o+i, s.charCodeAt(i)); }
  writeStr(0,'RIFF'); view.setUint32(4, 36+dataSize, true); writeStr(8,'WAVE');
  writeStr(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true);
  view.setUint16(22,numChannels,true); view.setUint32(24,sampleRate,true);
  view.setUint32(28,byteRate,true); view.setUint16(32,blockAlign,true);
  view.setUint16(34,bitsPerSample,true); writeStr(36,'data'); view.setUint32(40,dataSize,true);

  let offset = 44;
  for (let i=0;i<numSamples;i++) {
    for (let c=0;c<numChannels;c++) {
      const sample = Math.max(-1,Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(offset, sample < 0 ? sample*0x8000 : sample*0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

// ─── WSOLA TIME-STRETCH (pitch-preserving) ────────────────────────────────────
// Waveform Similarity Overlap-Add: altera a duração sem alterar o pitch.
// Parâmetros balanceados para voz (análogos ao que Camtasia/CapCut usam).
async function buildStretchedBuffer(srcBuf, speed) {
  if (Math.abs(speed - 1.0) < 0.01) return srcBuf; // sem processamento

  const sr       = srcBuf.sampleRate;
  const nCh      = srcBuf.numberOfChannels;
  const frameMs  = 25;          // janela de análise (ms) — boa para voz
  const stepMs   = 10;          // hop de síntese
  const searchMs = 12;          // janela de busca por similaridade
  const frameLen  = Math.round(sr * frameMs  / 1000);
  const stepSyn   = Math.round(sr * stepMs   / 1000);
  const searchWin = Math.round(sr * searchMs / 1000);
  const stepAna   = Math.round(stepSyn * speed);     // hop de análise = velocidade × hop síntese

  const srcLen   = srcBuf.length;
  const outLen   = Math.round(srcLen / speed);

  // Trabalhar por canal
  const outChannels = [];
  for (let c = 0; c < nCh; c++) {
    const src = srcBuf.getChannelData(c);
    const out = new Float32Array(outLen);
    const win = hannWindow(frameLen);
    const overlap = new Float32Array(frameLen);

    let anaPos  = 0;  // posição no buffer de entrada
    let synPos  = 0;  // posição no buffer de saída

    while (synPos + frameLen < outLen) {
      // Encontrar posição na entrada mais similar ao final da sobreposição anterior
      const best = findBestMatch(src, overlap, anaPos, searchWin, frameLen, srcLen);

      // Somar frame janelado na saída (OLA)
      for (let i = 0; i < frameLen; i++) {
        const s = synPos + i;
        if (s >= outLen) break;
        out[s] += (src[best + i] || 0) * win[i];
      }

      anaPos = best + stepAna;
      synPos += stepSyn;

      // Salvar última metade como overlap para próxima iteração
      const overlapStart = best + stepSyn;
      for (let i = 0; i < frameLen; i++) {
        overlap[i] = (src[overlapStart + i] || 0) * win[i];
      }
    }

    // Normalizar (OLA causa soma > 1 em zonas de sobreposição)
    const norm = normalizationFactor(win, stepSyn);
    for (let i = 0; i < outLen; i++) out[i] /= norm;

    outChannels.push(out);
  }

  // Montar AudioBuffer de saída
  const offCtx = new OfflineAudioContext(nCh, outLen, sr);
  const outBuf = offCtx.createBuffer(nCh, outLen, sr);
  for (let c = 0; c < nCh; c++) outBuf.copyToChannel(outChannels[c], c);
  return outBuf;
}

function hannWindow(len) {
  const w = new Float32Array(len);
  for (let i = 0; i < len; i++) w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (len - 1)));
  return w;
}

// Busca por correlação cruzada: acha posição em src mais parecida com overlap
function findBestMatch(src, overlap, center, searchWin, frameLen, srcLen) {
  let bestPos = center;
  let bestCorr = -Infinity;
  const start = Math.max(0, center - searchWin);
  const end   = Math.min(srcLen - frameLen, center + searchWin);
  for (let p = start; p <= end; p++) {
    let corr = 0;
    for (let i = 0; i < frameLen; i++) corr += (src[p + i] || 0) * overlap[i];
    if (corr > bestCorr) { bestCorr = corr; bestPos = p; }
  }
  return bestPos;
}

function normalizationFactor(win, hopSize) {
  let sum = 0;
  for (let i = 0; i < win.length; i += hopSize) sum += win[i] * win[i];
  return Math.max(sum, 0.001);
}

// ─── SPEED CONTROL ────────────────────────────────────────────────────────────
// DESATIVADA TEMPORARIAMENTE — WSOLA/pitch-correction é pesado demais para muitos
// PCs e celulares. Painel HTML correspondente também está comentado (busque
// "VELOCIDADE DE FALA — DESATIVADA" no HTML). playbackSpeed permanece fixo em 1.0,
// então buildStretchedBuffer() já retorna o buffer original sem processamento.
// Reativar descomentando aqui + o painel HTML quando houver detecção de
// performance do device ou processamento em Web Worker.
/*
async function setSpeed(speed) {
  playbackSpeed = speed;

  // Update badge
  document.getElementById('speed-badge').textContent = speed.toFixed(2).replace(/\.?0+$/, '') + '×';

  // Update slider
  document.getElementById('ctrl-speed').value = speed;

  // Update chips
  document.querySelectorAll('.speed-chip').forEach(c => {
    c.classList.toggle('active', parseFloat(c.dataset.speed) === speed);
  });

  if (!audioBuffer) return;

  const wasPlaying = isPlaying;
  const savedPos   = wasPlaying
    ? (audioCtx.currentTime - startTime) / playbackSpeed   // original-time
    : pausedAt;

  if (wasPlaying) { pararSourceAtual(); isPlaying = false; cancelAnimationFrame(animFrame); }

  showLoadingOverlay('Aplicando velocidade ' + speed + '×', 'Pitch correction WSOLA em andamento...');
  await new Promise(r => setTimeout(r, 30)); // yield para UI atualizar
  stretchedBuffer = await buildStretchedBuffer(audioBuffer, playbackSpeed);
  hideLoadingOverlay();

  pausedAt = savedPos;

  if (wasPlaying) {
    startPlayback();
  }

  const label = speed === 1.0 ? '⚡ Velocidade normal' : `⚡ ${speed}× sem alteração de pitch`;
  scheduleAutosave();
  showStatus(label);
}

function onSpeedSlider() {
  const raw = parseFloat(document.getElementById('ctrl-speed').value);
  // Snap to preset values quando próximo
  const presets = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
  const snap = presets.find(p => Math.abs(p - raw) < 0.04) ?? raw;
  setSpeed(Math.round(snap * 100) / 100);
}
*/

// ─── UTILS ────────────────────────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s/60);
  const sec = Math.floor(s%60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

let statusTimeout;
function showStatus(msg) {
  const el = document.getElementById('status-bar');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── COPIAR CHAVE PIX (rodapé) ─────────────────────────────────────────────────
async function copiarChavePix() {
  const chave = document.getElementById('pix-key').textContent.trim();
  const btn   = document.getElementById('pix-copy-btn');
  const original = btn.innerHTML;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(chave);
    } else {
      // Fallback pra contextos sem Clipboard API (http, navegadores antigos)
      const temp = document.createElement('textarea');
      temp.value = chave;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.focus();
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    btn.innerHTML = '<span class="btn-ico" aria-hidden="true">✅</span> Copiado!';
  } catch (e) {
    btn.innerHTML = '<span class="btn-ico" aria-hidden="true">⚠️</span> Não copiou, copia manual';
  }

  setTimeout(() => { btn.innerHTML = original; }, 2500);
}

// ─── INICIALIZAÇÃO DA BIBLIOTECA ──────────────────────────────────────────────
// Popula a faixa "continuar de onde parou" e a barra de armazenamento assim
// que a página carrega, sem esperar nenhuma ação do usuário. Só faz sentido
// quando o app está de fato na página (usuário liberado) — na tela de login
// nenhum desses elementos existe.
if (document.getElementById('lib-count')) {
  refreshLibrary();
}
