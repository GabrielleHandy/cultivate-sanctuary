// ─── STATE ARCHITECTURE ───────────────────────────────────────────
const state = {
  signal_strength: 18,
  night_mode: false,
  fog_enabled: true,
  time: 0, tree_power: 35, tree_empowered: false,
  avatar: {
    name: "Gabrielle",
    x: 248,
    y: 295,
    facing: "down",
    isMoving: false,
    walkTick: 0,
    idleTick: 0,
    targetX: null,
    targetY: null,
    outfit: "casual",
    accessories: {
      halo: false,
      visor: false,
      pin: true
    }
  },
  bountyBoard: {
    x: 215,
    y: 175,
    w: 36,
    h: 36
  },
  buildings: [
    {
      id: "safe_house",
      name: "🏡 THE SAFE HOUSE & ATELIER",
      short: "SAFE HOUSE",
      discipline: "Mindful Living & WearIt Curation",
      power: 20,
      x: 120, y: 120,
      rect: { x: 45, y: 38, w: 126, h: 94 },
      chimney: { x: 145, y: 55 },
      windows: [
        { x: 70, y: 110, w: 16, h: 14 },
        { x: 130, y: 115, w: 16, h: 14 }
      ],
      sign: { x: 118, y: 104, w: 76, color: "#f472b6" },
      desc: "Mindful rest, wardrobe curations & domestic reset rituals."
    },
    {
      id: "ai_academy",
      name: "🧠 THE NEURAL ACADEMY",
      short: "AI ACADEMY",
      discipline: "AI Systems Engineering",
      power: 25,
      x: 395, y: 115,
      rect: { x: 335, y: 25, w: 140, h: 125 },
      chimney: null,
      windows: [
        { x: 385, y: 105, w: 22, h: 16 }
      ],
      sign: { x: 380, y: 108, w: 76, color: "#38bdf8" },
      desc: "Python memory architectures, agentic pipelines & autonomous workflows."
    },
    {
      id: "tea_house",
      name: "🍵 THE CIPHER TEA HOUSE",
      short: "TEA HOUSE",
      discipline: "Mandarin Linguistics & Tea",
      power: 10,
      x: 105, y: 265,
      rect: { x: 10, y: 180, w: 135, h: 130 },
      chimney: { x: 40, y: 195 },
      windows: [
        { x: 40, y: 260, w: 15, h: 14 }
      ],
      sign: { x: 118, y: 228, w: 68, color: "#fb923c" },
      desc: "Daily Mandarin character practice & contemplative tea sessions."
    },
    {
      id: "memory_vault",
      name: "🏛️ THE BARANGAY MEMORY VAULT",
      short: "MEMORY VAULT",
      discipline: "3-Tier Memory Architecture",
      power: 25,
      x: 440, y: 265,
      rect: { x: 385, y: 180, w: 110, h: 140 },
      chimney: null,
      windows: [
        { x: 445, y: 245, w: 18, h: 16 }
      ],
      sign: { x: 380, y: 228, w: 84, color: "#a78bfa" },
      desc: "3-tier storage (working, episodic, long-term) bridging life telemetry."
    },
    {
      id: "kinetic_dojo",
      name: "🥋 THE KINETIC DOJO",
      short: "KINETIC DOJO",
      discipline: "Calisthenics & Movement",
      power: 10,
      x: 250, y: 435,
      rect: { x: 170, y: 375, w: 165, h: 110 },
      chimney: { x: 215, y: 405 },
      windows: [
        { x: 218, y: 440, w: 15, h: 13 }
      ],
      sign: { x: 248, y: 372, w: 78, color: "#4ade80" },
      desc: "Strength, posture conditioning & physical kinetic energy routines."
    }
  ]
};

const canvas = document.getElementById("villageCanvas");
const ctx = canvas.getContext("2d");
const pCanvas = document.getElementById("portraitCanvas");
const pCtx = pCanvas.getContext("2d");

const darkCanvas = document.createElement("canvas");
darkCanvas.width = 500;
darkCanvas.height = 494;
const darkCtx = darkCanvas.getContext("2d");

const restoreCanvas = document.createElement("canvas");
restoreCanvas.width = 500;
restoreCanvas.height = 494;
const rCtx = restoreCanvas.getContext("2d");

const blueprintCanvas = document.createElement("canvas");
blueprintCanvas.width = 500;
blueprintCanvas.height = 494;
const bpCtx = blueprintCanvas.getContext("2d");

const keys = {};
let activeBuilding = null;
let nearBountyBoard = false;

// ─── 1. ATMOSPHERIC CHIMNEY SMOKE PARTICLES ───────────────────────
const smokePuffs = [];
function updateAndDrawSmoke() {
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    if (b.chimney && b.power >= 30) {
      const spawnChance = b.power >= 100 ? 0.10 : 0.05;
      if (Math.random() < spawnChance) {
        smokePuffs.push({
          x: b.chimney.x + (Math.random() - 0.5) * 4,
          y: b.chimney.y,
          vx: 0.035 + (Math.random() - 0.5) * 0.045,
          vy: -0.105 - Math.random() * 0.08,
          r: 2.5 + Math.random() * 2.0,
          maxR: 9.0 + (b.power * 0.05),
          alpha: 0.55,
          decay: 0.00175
        });
      }
    }
  }

  ctx.save();
  for (let i = smokePuffs.length - 1; i >= 0; i--) {
    const p = smokePuffs[i];
    p.x += p.vx;
    p.y += p.vy;
    p.r = Math.min(p.maxR, p.r + 0.02);
    p.alpha -= p.decay;

    if (p.alpha <= 0 || p.y < 0) {
      smokePuffs.splice(i, 1);
      continue;
    }

    ctx.fillStyle = "rgba(235, 238, 245, " + p.alpha + ")";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ─── 2. PROCEDURAL DRIFTING FOG (NO SPORES) ───────────────────────
const fogClouds = [];
for (let i = 0; i < 14; i++) {
  fogClouds.push({
    x: Math.random() * 620 - 60,
    y: Math.random() * 494,
    r: 70 + Math.random() * 80,
    vx: 0.05 + Math.random() * 0.055,
    vy: (Math.random() - 0.5) * 0.015,
    phase: Math.random() * Math.PI * 2
  });
}

// ─── 3. FOOTSTEP DUST PUFFS ───────────────────────────────────────
const dustPuffs = [];
function spawnDust(x, y, footOffset) {
  if (dustPuffs.length > 20) dustPuffs.shift();
  dustPuffs.push({
    x: x + footOffset,
    y: y,
    r: 2.0 + Math.random() * 1.8,
    alpha: 0.5,
    vy: -0.04
  });
}

// Controls
window.addEventListener("keydown", function(e) {
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"].includes(e.key)) {
    e.preventDefault();
    keys[e.key.toLowerCase()] = true;
    state.avatar.targetX = null;
    state.avatar.targetY = null;
  }
  if (e.key === " ") {
    if (nearBountyBoard) {
      openBountyModal();
    } else if (activeBuilding && typeof openQuestCardForPlace === "function") {
      openQuestCardForPlace(activeBuilding.id);
    }
  }
});
window.addEventListener("keyup", function(e) {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("click", function(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  state.avatar.targetX = (e.clientX - rect.left) * scaleX;
  state.avatar.targetY = (e.clientY - rect.top) * scaleY;
});

function toggleFog() {
  state.fog_enabled = !state.fog_enabled;
  document.getElementById("fogToggle").textContent = state.fog_enabled ? "🌫️ Fog: ON" : "🌫️ Fog: OFF";
  document.getElementById("fogDensityTag").textContent = state.fog_enabled ? "Drifting" : "Cleared";
}

function toggleLighting() {
  state.night_mode = !state.night_mode;
  document.getElementById("lightingToggle").innerHTML = state.night_mode ? "🌙 Night: ON" : "☀️ Daylight: ON";
}

function setOutfit(o) {
  state.avatar.outfit = o;
  const labels = {
    casual: "CASUAL TEE",
    wearit: "TECHWEAR HOODIE",
    streetwear: "DENIM CHIC",
    athletic: "DOJO ATHLETIC",
    wireframe: "BLUEPRINT WIRE"
  };
  document.getElementById("portraitOutfitTag").textContent = labels[o];

  const outfitList = ["casual", "wearit", "streetwear", "athletic", "wireframe"];
  for (let i = 0; i < outfitList.length; i++) {
    const id = outfitList[i];
    const btn = document.getElementById("outfitBtn_" + id);
    if (id === o) {
      btn.className = "px-2 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-semibold shadow-[0_0_8px_#10b98130]";
    } else {
      btn.className = "px-2 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white transition";
    }
  }
  updateInspector();
}

function toggleAccessory(acc) {
  state.avatar.accessories[acc] = !state.avatar.accessories[acc];
  const val = state.avatar.accessories[acc];
  if (acc === "halo") {
    document.getElementById("accHaloBtn").textContent = val ? "💫 Neural Halo: ON" : "💫 Neural Halo: OFF";
    document.getElementById("accHaloBtn").className = val ? "px-2 py-0.5 rounded border border-violet-500/40 bg-violet-500/20 text-violet-300 font-semibold" : "px-2 py-0.5 rounded border border-white/10 text-slate-400 hover:text-white transition";
  } else if (acc === "visor") {
    document.getElementById("accVisorBtn").textContent = val ? "🕶️ Cyber Visor: ON" : "🕶️ Cyber Visor: OFF";
    document.getElementById("accVisorBtn").className = val ? "px-2 py-0.5 rounded border border-sky-500/40 bg-sky-500/20 text-sky-300 font-semibold" : "px-2 py-0.5 rounded border border-white/10 text-slate-400 hover:text-white transition";
  } else if (acc === "pin") {
    document.getElementById("accPinBtn").textContent = val ? "🌸 Sprout Pin: ON" : "🌸 Sprout Pin: OFF";
    document.getElementById("accPinBtn").className = val ? "px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-semibold" : "px-2 py-0.5 rounded border border-white/10 text-slate-400 hover:text-white transition";
  }
  updateInspector();
}

// ✨ 0. MULTIVERSE RADIO & CHAPTER 0 PLAYABLE ENGINE ✨
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playRadioStaticSound() {
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const bufferSize = Math.floor(actx.sampleRate * 0.16);
    const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (actx.sampleRate * 0.06));
    }
    const noise = actx.createBufferSource();
    noise.buffer = buffer;
    const filter = actx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1300;
    const gain = actx.createGain();
    gain.gain.value = 0.08;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(actx.destination);
    noise.start();
  } catch (e) {
    console.warn("Audio static muted:", e);
  }
}

function playChimeSound() {
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.04, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.3);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.31);
    });
  } catch (e) {
    console.warn("Chime muted:", e);
  }
}

// Canvas Particle Sparks & Continuous Sakura Petals
const canvasSparks = [];
const sakuraPetals = [];

function triggerSparks(x, y, count, color) {
  // Massive firework explosion lasting 6-8 seconds
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 0.5 + Math.random() * 1.6;
    canvasSparks.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 0.6,
      r: 1.8 + Math.random() * 2.2, // Smaller, refined sparks
      alpha: 1.0,
      color: color || '#fb923c', // Warm golden orange default
      decay: 0.0035 + Math.random() * 0.0035
    });
  }
  // Also spawn permanent fluttering sakura petals
  state.tree_empowered = true;
}

function spawnSakuraPetal() {
  if (sakuraPetals.length > 16) return; // Much sparser: max 16 petals at a time
  const treeX = 248 + (Math.random() - 0.5) * 50;
  const treeY = 205 + (Math.random() - 0.5) * 30;
  // Warm golden amber, apricot, and soft peach tones
  const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#f59e0b', '#fbbf24', '#ffedd5', '#ea580c'];
  sakuraPetals.push({
    x: treeX,
    y: treeY,
    vx: 0.05 + (Math.random() - 0.5) * 0.08, // Slow, peaceful horizontal drift
    vy: 0.07 + Math.random() * 0.08,        // Much slower downward floating speed
    swayPhase: Math.random() * Math.PI * 2,
    r: 0.9 + Math.random() * 1.0,           // Tiny delicate flakes
    alpha: 0.82,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 0,
    maxLife: 450 + Math.random() * 250
  });
}

// Multiverse Radio Frequencies
const radioFrequencies = {
  fm_130k: {
    id: "fm_130k",
    callsign: "FM 130K // AI ARCHITECT",
    persona: "Future Gabrielle • Staff AI Systems Engineer & Founder",
    advice: "Structured outputs, Pydantic guardrails, and real model evaluation."
  },
  fm_founder: {
    id: "fm_founder",
    callsign: "FM FOUNDER // WEARIT OS",
    persona: "Future Gabrielle • Founder & Creative Director",
    advice: "Aesthetic integrity, sustainable drops, and community connection."
  },
  fm_dojo: {
    id: "fm_dojo",
    callsign: "FM DOJO // KINETIC SENSEI",
    persona: "Future Gabrielle • Calisthenics Athlete & Movement Coach",
    advice: "Joint preparation, hollow body holds, and progressive overload."
  },
  fm_tea: {
    id: "fm_tea",
    callsign: "FM TEA // CIPHER LINGUIST",
    persona: "Future Gabrielle • Mandarin Conversationalist & Tea Master",
    advice: "Character radicals, tonal intuition, and relaxed tea conversations."
  }
};
let currentFrequency = "fm_130k";

function tuneFrequency(freqId) {
  if (!radioFrequencies[freqId]) return;
  currentFrequency = freqId;
  playRadioStaticSound();

  // Update button styling
  const btns = ["fm_130k", "fm_founder", "fm_dojo", "fm_tea"];
  btns.forEach(k => {
    const btn = document.getElementById("freqBtn_" + k);
    if (btn) {
      if (k === freqId) {
        btn.className = "px-2 py-1.5 rounded-lg border border-cyan-400/60 bg-cyan-500/25 text-cyan-200 font-bold text-center transition flex flex-col items-center justify-center";
      } else {
        btn.className = "px-2 py-1.5 rounded-lg border border-white/10 bg-black/40 text-slate-300 hover:text-white hover:border-violet-400/40 text-center transition flex flex-col items-center justify-center";
      }
    }
  });

  const freq = radioFrequencies[freqId];
  document.getElementById("commCallsignTag").textContent = freq.callsign;
  document.getElementById("commPersonaSubTag").textContent = freq.persona;

  const chat = document.getElementById("commChatStream");
  chat.innerHTML += '<div class="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/10 text-cyan-300/80 text-[10px]">' +
    '📻 <i>[RADIO DIAL TUNED TO ' + freq.callsign + ' • CARRIER ACQUIRED]</i>' +
  '</div>';
  chat.scrollTop = chat.scrollHeight;

  // Small spark around antenna plaza
  triggerSparks(248, 225, 12, '#22d3ee');
}

function playChapterChoice(choice) {
  playChimeSound();
  const choiceDeck = document.getElementById("chapterChoiceDeck");
  const rewardBadge = document.getElementById("chapterRewardBadge");
  const voiceText = document.getElementById("chapterVoiceText");
  const chat = document.getElementById("commChatStream");

  let userLine = "";
  let futureReply = "";
  let sparkColor = "#fb923c";
  let sparkX = 248, sparkY = 225;

  if (choice === 1) {
    userLine = "I'm looking at a dark village and I want to actually play, not just do chores.";
    futureReply = "HELL YES. Valid! We are officially killing the boring administrative chore vibe right now. The Sanctuary isn't a homework assignment—it's a living playground. I'm routing emergency battery power to the Tree of Vision. Look at your canvas!";
    sparkColor = "#fb923c";
    sparkX = 248; sparkY = 225; // Tree of vision
  } else if (choice === 2) {
    userLine = "Who gave you a sandwich while I'm doing all the heavy lifting in 2026?";
    futureReply = "Hey, 2027 AI engineering salaries pay for toasted rosemary sourdough and organic pesto! But real talk: every micro-habit you log today literally buys this sandwich. Let's get the Safe House chimney fired up!";
    sparkColor = "#fbbf24";
    sparkX = 145; sparkY = 55; // Safe house chimney
  } else {
    userLine = "Wait... how many versions of you are out there on this radio?";
    futureReply = "Infinite! Every time you adjust your vision board, you tune into the Gabrielle who made that specific future real. Right now you're locked to FM 130K. Rotate the dial at the top anytime to tune into Founder Gabby or Dojo Gabby. The radio answers to YOU.";
    sparkColor = "#38bdf8";
    sparkX = 248; sparkY = 248; // Plaza center
  }

  // Hide choices, show reward
  choiceDeck.classList.add("hidden");
  rewardBadge.classList.remove("hidden");

  voiceText.innerHTML = '<span class="text-cyan-300 font-bold">Future Gabrielle:</span> "' + futureReply + '"';

  // Append to full transcript stream
  chat.innerHTML += '<div class="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-200 text-right text-[11px]">' +
    '<span class="text-emerald-400 font-bold block mb-0.5">GABRIELLE // PRESENT (2026)</span>' +
    '"' + userLine + '"' +
  '</div>';

  chat.innerHTML += '<div class="p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-100 text-[11px]">' +
    '<span class="text-cyan-400 font-bold block mb-0.5">' + radioFrequencies[currentFrequency].callsign + '</span>' +
    '"' + futureReply + '"' +
  '</div>';
  chat.scrollTop = chat.scrollHeight;

  // Trigger visual particle sparks on canvas
  triggerSparks(sparkX, sparkY, 35, sparkColor);

  // Boost power & signal
  state.signal_strength = Math.min(100, state.signal_strength + 10); state.tree_power = Math.min(100, (state.tree_power || 35) + 15);
  document.getElementById("signalStrengthTag").textContent = state.signal_strength + "%";
}

function replayChapter0() {
  document.getElementById("chapterChoiceDeck").classList.remove("hidden");
  document.getElementById("chapterRewardBadge").classList.add("hidden");
  document.getElementById("chapterVoiceText").textContent =
    "...Good evening, Operator. You're tuned to Sanctuary FM, broadcasting from a hill that is currently pitch dark. Stand by for an incoming tachyonic transmission...";
  playRadioStaticSound();
}

// Modal Control: Comm-Link    // Modal Control: Comm-Link
function openCommLink() {
  document.getElementById("commLinkModal").classList.remove("hidden");
}
function closeCommLink() {
  document.getElementById("commLinkModal").classList.add("hidden");
}

function sendQuickPrompt(promptText) {
  document.getElementById("commInput").value = promptText;
  sendCommMessage();
}

function sendCommMessage() {
  const input = document.getElementById("commInput");
  const msg = input.value.trim();
  if (!msg) return;

  const chat = document.getElementById("commChatStream");

  // Append User message
  chat.innerHTML += '<div class="p-2.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 text-right">' +
    '<span class="text-emerald-400 font-bold block mb-1">GABRIELLE // PRESENT (2024-2026)</span>' +
    '"' + msg + '"' +
  '</div>';
  input.value = "";

  // Simulate Future Gabrielle AI response
  setTimeout(function() {
    let reply = "";
    if (msg.toLowerCase().includes("wearit")) {
      reply = "In 2027, WearIt is live! The oversized violet hoodie you see in your closet right now became our signature release. Keep building the habit engine—the community loves how grounded the tech feels.";
    } else if (msg.toLowerCase().includes("habit") || msg.toLowerCase().includes("power")) {
      reply = "Every time you log a coding sprint in the Neural Academy or mindful time at the Safe House, signal strength jumps. Today's power grid is standing at " + state.signal_strength + "%—the village reflects your daily consistency!";
    } else if (msg.toLowerCase().includes("energy") || msg.toLowerCase().includes("advice")) {
      reply = "Rule number one from 2027: consistency beats intensity every single time. When energy dips, trigger the Safe House guardrail, drink tea at the Cipher House, and do just 1 tiny habit to keep the pilot light on.";
    } else {
      reply = "Tachyonic packet received! You're laying the exact bedrock we needed for September 2027. Stay focused on today's discipline, walk the village paths, and know we made it!";
    }

    chat.innerHTML += '<div class="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-100">' +
      '<span class="text-cyan-400 font-bold block mb-1">SEPTEMBER 2027 // FUTURE_GABRIELLE.exe</span>' +
      '"' + reply + '"' +
    '</div>';
    chat.scrollTop = chat.scrollHeight;
  }, 500);

  chat.scrollTop = chat.scrollHeight;
}

// Modal Control: Bounty Board
function openBountyModal() {
  document.getElementById("bountyModal").classList.remove("hidden");
}
function closeBountyModal() {
  document.getElementById("bountyModal").classList.add("hidden");
}

function chargeBuilding(id, amount) {
  for (let i = 0; i < state.buildings.length; i++) {
    if (state.buildings[i].id === id) {
      state.buildings[i].power = Math.min(100, Math.max(0, state.buildings[i].power + amount));
      break;
    }
  }
  recalculateSignal();
  renderBuildingsList();
  updateInspector();
}

function chargeActiveBuilding() {
  if (activeBuilding) {
    chargeBuilding(activeBuilding.id, 25);
  } else {
    recalculateSignal();
  }
}

function triggerRestorativePause() {
  alert("🛡️ GUARDRAIL ACTIVE: September 2027 pacing rules suggest a restorative rest pause! Take a mindful breath.");
}

function recalculateSignal() {
  let sum = 0;
  for (let i = 0; i < state.buildings.length; i++) {
    sum += state.buildings[i].power;
  }
  state.signal_strength = Math.round(sum / state.buildings.length);
  document.getElementById("signalStrengthTag").textContent = state.signal_strength + "%";
}

function renderBuildingsList() {
  const el = document.getElementById("buildingsList");
  let html = "";
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    let statusBadge = "";
    if (b.power >= 100) {
      statusBadge = '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">BLUEPRINT (35%)</span>';
    } else if (b.power >= 30) {
      statusBadge = '<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px]">BLUEPRINT (' + b.power + '%)</span>';
    } else {
      statusBadge = '<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">DORMANT (' + b.power + '%)</span>';
    }

    html += '<div class="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-xs">' +
      '<div class="flex items-center gap-2">' +
        '<span class="font-semibold text-slate-200 text-xs">' + b.name + '</span>' +
        statusBadge +
      '</div>' +
      '<div class="flex items-center gap-1.5">' +
        '<button onclick="switchScene(\'' + b.id + '\')" class="px-2 py-0.5 rounded bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/50 text-[10.5px] font-bold transition cursor-pointer">🏠 Room</button>' +
        '<button onclick="chargeBuilding(\'' + b.id + '\', 25)" class="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] transition cursor-pointer">+25%</button>' +
        '<button onclick="chargeBuilding(\'' + b.id + '\', -25)" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] transition cursor-pointer">-25%</button>' +
      '</div>' +
    '</div>';
  }
  el.innerHTML = html;
}

function updateInspector() {
  const pre = document.getElementById("jsonInspector");
  const gridMatrix = [];
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    gridMatrix.push({
      id: b.id,
      power: b.power + "%",
      state: b.power >= 100 ? "RESTORED" : (b.power >= 30 ? "GLOW" : "DORMANT")
    });
  }

  const snapshot = {
    signal_strength: state.signal_strength,
    avatar: {
      name: state.avatar.name,
      pos: [Math.round(state.avatar.x / 5), Math.round(state.avatar.y / 5)],
      facing: state.avatar.facing,
      is_walking: state.avatar.isMoving,
      outfit: state.avatar.outfit,
      accessories: state.avatar.accessories
    },
    active_sector: activeBuilding ? {
      name: activeBuilding.short,
      discipline: activeBuilding.discipline,
      power: activeBuilding.power + "%",
      state: activeBuilding.power >= 100 ? "COLOR_RESTORED" : (activeBuilding.power >= 30 ? "BLUEPRINT_GLOW" : "BLACKOUT_DORMANT")
    } : (nearBountyBoard ? "Plaza Bounty Board" : "Tree of Vision Plaza"),
    grid_matrix: gridMatrix
  };
  pre.textContent = JSON.stringify(snapshot, null, 2);
}

// ─── 4. KINEMATIC UPDATE LOOP (NATURAL WALKING SPEED) ─────────────
function update() {
  state.time += 0.0175;
  const av = state.avatar;
  let dx = 0, dy = 0;
  const speed = 0.675;

  if (keys["arrowup"] || keys["w"]) dy -= speed;
  if (keys["arrowdown"] || keys["s"]) dy += speed;
  if (keys["arrowleft"] || keys["a"]) dx -= speed;
  if (keys["arrowright"] || keys["d"]) dx += speed;

  if (av.targetX !== null && av.targetY !== null) {
    const tx = av.targetX - av.x;
    const ty = av.targetY - av.y;
    const dist = Math.hypot(tx, ty);
    if (dist > 3) {
      dx = (tx / dist) * speed;
      dy = (ty / dist) * speed;
    } else {
      av.targetX = null;
      av.targetY = null;
    }
  }

  if (dx !== 0 || dy !== 0) {
    av.x = Math.max(25, Math.min(canvas.width - 25, av.x + dx));
    av.y = Math.max(45, Math.min(canvas.height - 30, av.y + dy));
    av.isMoving = true;
    av.walkTick += 0.07;

    if (Math.abs(dx) > Math.abs(dy)) {
      av.facing = dx > 0 ? "right" : "left";
    } else {
      av.facing = dy > 0 ? "down" : "up";
    }

    const frame4Beat = Math.floor(av.walkTick) % 4;
    if ((frame4Beat === 1 || frame4Beat === 3) && Math.abs(av.walkTick % 1) < 0.08) {
      const footOffset = frame4Beat === 1 ? -6 : 6;
      spawnDust(av.x, av.y + 2, footOffset);
    }
  } else {
    av.isMoving = false;
    av.idleTick += 0.02;
  }

  // Check proximity to Bounty Board
  const distToBounty = Math.hypot(av.x - state.bountyBoard.x, av.y - state.bountyBoard.y);
  nearBountyBoard = (distToBounty < 45);

  // Check proximity to buildings
  let found = null;
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    if (Math.hypot(av.x - b.x, av.y - b.y) < 78) {
      found = b;
      break;
    }
  }

  if (found !== activeBuilding || nearBountyBoard) {
    activeBuilding = found;
    const titleEl = document.getElementById("activeSectorTitle");
    const powerEl = document.getElementById("activeSectorPower");
    const descEl = document.getElementById("activeSectorDesc");
    const promptEl = document.getElementById("sectorPrompt");

    if (nearBountyBoard) {
      titleEl.textContent = "📋 THE BOUNTY BOARD";
      powerEl.textContent = "QUESTS ACTIVE";
      powerEl.className = "px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30";
      descEl.textContent = "Village bulletin board with parchment habit bounties. Click or press Space to inspect daily bounties!";
      promptEl.textContent = "📋 Bounty Board [Press Space]";
    } else if (activeBuilding) {
      titleEl.textContent = activeBuilding.name;
      const stateLabel = activeBuilding.power >= 100 ? "BLUEPRINT (35%)" : (activeBuilding.power >= 30 ? (activeBuilding.power + "% BLUEPRINT") : (activeBuilding.power + "% DORMANT"));
      powerEl.textContent = stateLabel;
      powerEl.className = activeBuilding.power >= 100 
        ? "px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
        : (activeBuilding.power >= 30 
            ? "px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30"
            : "px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700");
      descEl.textContent = activeBuilding.desc;
      promptEl.textContent = "📍 " + activeBuilding.short + " (" + activeBuilding.power + "%)";
    } else {
      titleEl.textContent = "🌸 TREE OF VISION PLAZA";
      const tp = state.tree_power || 35;
      if (tp >= 100) {
        powerEl.textContent = "100% RESTORED";
        powerEl.className = "px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      } else if (tp >= 30) {
        powerEl.textContent = "BLUEPRINT (" + tp + "%)";
        powerEl.className = "px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30";
      } else {
        powerEl.textContent = "DORMANT (" + tp + "%)";
        powerEl.className = "px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700";
      }
      descEl.textContent = "Central sanctuary square & antenna connecting all 5 disciplines. Ancient golden cherry canopy.";
      promptEl.textContent = "📍 Tree of Vision Plaza (" + tp + "%)";}
  }

  document.getElementById("legStateTag").textContent = av.isMoving ? "Walking (Natural)" : "Grounded";
}

// ─── 5. DRAW GABRIELLE WITH 3x3 SPRITE SHEET KINEMATICS ───────────
function drawSpriteCharacter(tCtx, cx, cy, isPortrait) {
  const av = state.avatar;
  const outfit = av.outfit;

  let sheetImg = imgs.casual;
  if (outfit === "wearit") sheetImg = imgs.wearit;
  else if (outfit === "streetwear") sheetImg = imgs.streetwear;
  else if (outfit === "athletic") sheetImg = imgs.athletic;
  else if (outfit === "wireframe") sheetImg = imgs.wireframe;

  if (!sheetImg.complete || !sheetImg.naturalWidth) return;

  const cellW = 120;
  const cellH = 160;

  let row = 0;
  let flipX = false;
  if (av.facing === "down") {
    row = 0;
  } else if (av.facing === "right") {
    row = 1;
  } else if (av.facing === "left") {
    row = 1;
    flipX = true;
  } else if (av.facing === "up") {
    row = 2;
  }

  let col = 0;
  if (av.isMoving) {
    const beat = Math.floor(av.walkTick) % 4;
    if (beat === 1) col = 1;
    else if (beat === 3) col = 2;
    else col = 0;
  } else {
    col = 0;
  }

  tCtx.save();
  tCtx.translate(cx, cy);

  if (!isPortrait) {
    // Ground Contact Shadow
    const shadowScale = av.isMoving ? (1 + Math.sin(av.walkTick * 3.5) * 0.12) : 1;
    tCtx.beginPath();
    tCtx.ellipse(0, 2, 13 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
    tCtx.fillStyle = "rgba(0, 0, 0, 0.45)";
    tCtx.fill();

    // Walk bobbing
    const bobY = av.isMoving ? -Math.abs(Math.sin(av.walkTick * 3.5)) * 2.2 : 0;
    tCtx.translate(0, bobY);

    if (flipX) {
      tCtx.scale(-1, 1);
    }

    // Render Character Sprite
    const renderW = 50;
    const renderH = 66;
    tCtx.drawImage(
      sheetImg,
      col * cellW, row * cellH, cellW, cellH,
      -renderW / 2, -renderH + 2, renderW, renderH
    );

    // Accessories
    if (av.accessories.halo) {
      tCtx.save();
      tCtx.strokeStyle = "rgba(167, 139, 250, 0.85)";
      tCtx.lineWidth = 2.0;
      tCtx.beginPath();
      tCtx.ellipse(0, -renderH + 6, 11, 4.5, 0, 0, Math.PI * 2);
      tCtx.stroke();
      tCtx.restore();
    }

    if (av.accessories.visor && av.facing !== "up") {
      tCtx.save();
      tCtx.fillStyle = "rgba(56, 189, 248, 0.55)";
      tCtx.beginPath();
      tCtx.roundRect(-10, -renderH + 24, 20, 6, 2);
      tCtx.fill();
      tCtx.restore();
    }

    if (av.accessories.pin) {
      tCtx.save();
      tCtx.fillStyle = "#34d399";
      tCtx.beginPath();
      tCtx.arc(7, -renderH + 16, 2.5, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.restore();
    }

  } else {
    // STATIC CRISP PORTRAIT (NO MOVING/BREATHING AS REQUESTED)
    const bustH = cellH * 0.60;
    tCtx.drawImage(
      sheetImg,
      0, 0, cellW, bustH,
      -50, -50, 100, 100
    );

    if (av.accessories.halo) {
      tCtx.strokeStyle = "rgba(167, 139, 250, 0.9)";
      tCtx.lineWidth = 2.5;
      tCtx.beginPath();
      tCtx.ellipse(0, -42, 18, 6.5, 0, 0, Math.PI * 2);
      tCtx.stroke();
    }
  }

  tCtx.restore();
}

// ─── 6. DRAW SIGNBOARDS (MAP LABELS) ──────────────────────────────
function drawSignboard(x, y, w, text, isPowered, accentColor) {
  const h = 18;
  ctx.save();
  ctx.fillStyle = isPowered ? "#f5ebd6" : "#1a1e2b";
  ctx.strokeStyle = isPowered ? "#4a3525" : accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 3.5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isPowered ? "#2b1d12" : "#e2e8f0";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 0.5);
  ctx.restore();
}

// ─── 7. MAIN DRAW ENGINE (3-STATE INDEPENDENT HOUSE COMPOSITING) ───
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update floating Enter Room button visibility
  const enterBtn = document.getElementById("enterBuildingFloatingBtn");
  if (enterBtn) {
    if ((state.activeScene === "overworld" || state.activeScene === "town3d") && activeBuilding) {
      enterBtn.textContent = "🚪 Step inside " + activeBuilding.short + " [E]";
      enterBtn.classList.remove("hidden");
    } else {
      enterBtn.classList.add("hidden");
    }
  }

  // LAYER 0: 3D WALKABLE TOWN MODE (WebGL canvas renders 3D; here we just refresh HUD Portrait & Floating Button)
  if (state.activeScene === "town3d") {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    const auraGrad = pCtx.createRadialGradient(60, 60, 10, 60, 60, 58);
    auraGrad.addColorStop(0, "rgba(52, 211, 153, 0.35)");
    auraGrad.addColorStop(1, "rgba(0,0,0,0)");
    pCtx.fillStyle = auraGrad;
    pCtx.beginPath();
    pCtx.arc(60, 60, 58, 0, Math.PI * 2);
    pCtx.fill();
    drawSpriteCharacter(pCtx, 60, 60, true);
    return;
  }

  // LAYER 2: ISOMETRIC CUTAWAY ROOM CUBE MODE
  if (state.activeScene !== "overworld") {
    drawIsometricCutawayRoom(ctx, state.activeScene);

    // Draw Story Sparks on top of Room
    for (let i = canvasSparks.length - 1; i >= 0; i--) {
      const s = canvasSparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= s.decay;
      if (s.alpha <= 0) {
        canvasSparks.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Static Clean Portrait in HUD
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    const auraGrad = pCtx.createRadialGradient(60, 60, 10, 60, 60, 58);
    auraGrad.addColorStop(0, "rgba(251, 191, 36, 0.35)");
    auraGrad.addColorStop(1, "rgba(0,0,0,0)");
    pCtx.fillStyle = auraGrad;
    pCtx.beginPath();
    pCtx.arc(60, 60, 58, 0, Math.PI * 2);
    pCtx.fill();
    drawSpriteCharacter(pCtx, 60, 60, true);
    return;
  }

  // 1. Always Draw Base Map (State 1: Dormant Blueprint Grid)
  if (imgs.map1.complete && imgs.map1.naturalWidth) {
    ctx.drawImage(imgs.map1, 0, 0, canvas.width, canvas.height);
  }

  // 2. Blueprint Glow Layer (State 2: Blueprint Matrix)
  // Wakes up districts at power >= 30, plus global ambient lift as signal strength grows
  if (imgs.map2.complete && imgs.map2.naturalWidth) {
    bpCtx.clearRect(0, 0, 500, 494);

    // Global ambient blueprint lift proportional to signal strength (never pitch dark!)
    const ambientBp = Math.min(0.70, (state.signal_strength / 100) * 0.70);
    if (ambientBp > 0) {
      bpCtx.fillStyle = "rgba(255, 255, 255, " + ambientBp + ")";
      bpCtx.fillRect(0, 0, 500, 494);
    }

    // Each unlocked district emits blueprint illumination
    for (let i = 0; i < state.buildings.length; i++) {
      const b = state.buildings[i];
      if (b.power >= 30) {
        // District wide radius covering gardens, porches and courtyards
        const g = bpCtx.createRadialGradient(b.x, b.y, 25, b.x, b.y, 150);
        g.addColorStop(0, "rgba(255, 255, 255, 1)");
        g.addColorStop(0.75, "rgba(255, 255, 255, 0.9)");
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        bpCtx.fillStyle = g;
        bpCtx.beginPath();
        bpCtx.arc(b.x, b.y, 150, 0, Math.PI * 2);
        bpCtx.fill();

        // Broad thoroughfare path connecting to Central Plaza
        bpCtx.save();
        bpCtx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        bpCtx.lineWidth = 55;
        bpCtx.lineCap = "round";
        bpCtx.beginPath();
        bpCtx.moveTo(b.x, b.y);
        bpCtx.lineTo(248, 248);
        bpCtx.stroke();
        bpCtx.restore();
      }
    }

    // Blueprint bridges & river segment
    const eastBp = Math.max(state.buildings[1].power, state.buildings[3].power);
    if (eastBp >= 30) {
      bpCtx.save();
      bpCtx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      bpCtx.lineWidth = 45;
      bpCtx.lineCap = "round";
      // North bridge
      bpCtx.beginPath();
      bpCtx.moveTo(270, 160);
      bpCtx.lineTo(365, 145);
      bpCtx.stroke();
      // South bridge
      bpCtx.beginPath();
      bpCtx.moveTo(270, 325);
      bpCtx.lineTo(375, 340);
      bpCtx.stroke();
      bpCtx.restore();
    }

    // Mask with Blueprint Artwork
    bpCtx.globalCompositeOperation = "source-in";
    bpCtx.drawImage(imgs.map2, 0, 0, 500, 494);
    bpCtx.globalCompositeOperation = "source-over";

    // Composite onto main canvas
    ctx.drawImage(blueprintCanvas, 0, 0);
  }

  // 3. Full Restored Color Layer (State 3: Vibrant Ghibli Master Artwork)
  // Shines through in the Plaza, all restored districts, connecting cobblestone avenues, and water
  if (imgs.map3.complete && imgs.map3.naturalWidth) {
    rCtx.clearRect(0, 0, 500, 494);

    // Center Plaza (Sacred Tree of Vision & Bounty Board) - Dynamic based on tree_power
    const tp = state.tree_power || 35;
    const treeAlpha = tp >= 100 ? 1.0 : (tp >= 30 ? (tp / 100) : 0.35);
    const plazaGrad = rCtx.createRadialGradient(248, 248, 30, 248, 248, 120);
    plazaGrad.addColorStop(0, "rgba(255, 255, 255, " + treeAlpha + ")");
    plazaGrad.addColorStop(0.85, "rgba(255, 255, 255, " + (treeAlpha * 0.95) + ")");
    plazaGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    rCtx.fillStyle = plazaGrad;
    rCtx.beginPath();
    rCtx.arc(248, 248, 120, 0, Math.PI * 2);
    rCtx.fill();

    // Each building restores its district based on power
    for (let i = 0; i < state.buildings.length; i++) {
      const b = state.buildings[i];
      let colorAlpha = 0;
      if (b.power >= 100) {
        colorAlpha = 1.0;
      } else if (b.power >= 30) {
        // Smooth blooming transition as power builds from 30% to 100%
        colorAlpha = (b.power - 30) / 70;
      }

      if (colorAlpha > 0) {
        // Broad circular district coverage (gardens, courtyard, porch, trees)
        const distGrad = rCtx.createRadialGradient(b.x, b.y, 25, b.x, b.y, 150);
        distGrad.addColorStop(0, "rgba(255, 255, 255, " + colorAlpha + ")");
        distGrad.addColorStop(0.80, "rgba(255, 255, 255, " + (colorAlpha * 0.95) + ")");
        distGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        rCtx.fillStyle = distGrad;
        rCtx.beginPath();
        rCtx.arc(b.x, b.y, 150, 0, Math.PI * 2);
        rCtx.fill();

        // Broad thoroughfare path connecting to Central Plaza
        rCtx.save();
        rCtx.strokeStyle = "rgba(255, 255, 255, " + (colorAlpha * 0.95) + ")";
        rCtx.lineWidth = 55;
        rCtx.lineCap = "round";
        rCtx.beginPath();
        rCtx.moveTo(b.x, b.y);
        rCtx.lineTo(248, 248);
        rCtx.stroke();
        rCtx.restore();
      }
    }

    // River and Bridges restored when Eastern districts power up
    const eastPower = Math.max(state.buildings[1].power, state.buildings[3].power);
    const riverAlpha = eastPower >= 100 ? 1.0 : (eastPower >= 30 ? (eastPower - 30) / 70 : 0);
    if (riverAlpha > 0) {
      rCtx.save();
      rCtx.strokeStyle = "rgba(255, 255, 255, " + (riverAlpha * 0.98) + ")";
      rCtx.lineWidth = 48;
      rCtx.lineCap = "round";
      // North bridge
      rCtx.beginPath();
      rCtx.moveTo(270, 160);
      rCtx.lineTo(365, 145);
      rCtx.stroke();
      // South bridge
      rCtx.beginPath();
      rCtx.moveTo(270, 325);
      rCtx.lineTo(375, 340);
      rCtx.stroke();
      rCtx.restore();

      // River water crystal sheen
      rCtx.save();
      rCtx.strokeStyle = "rgba(255, 255, 255, " + (riverAlpha * 0.85) + ")";
      rCtx.lineWidth = 60;
      rCtx.lineCap = "round";
      rCtx.beginPath();
      rCtx.moveTo(275, 0);
      rCtx.bezierCurveTo(260, 150, 390, 250, 360, 494);
      rCtx.stroke();
      rCtx.restore();
    }

    // Global Ambient Daylight Lift:
    // As signal strength grows beyond 35%, the entire village perimeter basks in natural daylight
    if (state.signal_strength > 35) {
      const globalDaylight = ((state.signal_strength - 35) / 65) * 0.85;
      rCtx.fillStyle = "rgba(255, 255, 255, " + globalDaylight + ")";
      rCtx.fillRect(0, 0, 500, 494);
    }

    // When 100% Signal Strength is achieved (all sectors restored), 100% full saturation everywhere!
    if (state.signal_strength >= 100) {
      rCtx.fillStyle = "#ffffff";
      rCtx.fillRect(0, 0, 500, 494);
    }

    // Mask with Ghibli Restored Artwork
    rCtx.globalCompositeOperation = "source-in";
    rCtx.drawImage(imgs.map3, 0, 0, 500, 494);
    rCtx.globalCompositeOperation = "source-over";

    // Composite onto main canvas
    ctx.drawImage(restoreCanvas, 0, 0);
  }

  // 4. Procedural Living Water Ripples
  const t = state.time;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) {
    const rx = 190 + (i * 28) + Math.sin(t * 2 + i) * 6;
    const ry = 330 + Math.cos(t * 1.5 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + 8, ry);
    ctx.stroke();
  }
  ctx.restore();

  // 5. Cozy Glowing Windows (Flickering Hearth & Warmth)
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    if (b.power >= 30 && b.windows) {
      const isRestored = b.power >= 100;
      const flicker = Math.sin(state.time * 4 + b.x) * 0.12 + 0.88;

      for (let w = 0; w < b.windows.length; w++) {
        const win = b.windows[w];
        ctx.save();
        const winGrad = ctx.createRadialGradient(
          win.x + win.w / 2, win.y + win.h / 2, 2,
          win.x + win.w / 2, win.y + win.h / 2, win.w * 0.85
        );

        if (isRestored) {
          winGrad.addColorStop(0, "rgba(254, 240, 138, " + (0.95 * flicker) + ")");
          winGrad.addColorStop(0.6, "rgba(245, 158, 11, " + (0.85 * flicker) + ")");
          winGrad.addColorStop(1, "rgba(217, 119, 6, 0.3)");
        } else {
          winGrad.addColorStop(0, "rgba(186, 230, 253, " + (0.8 * flicker) + ")");
          winGrad.addColorStop(1, "rgba(14, 165, 233, 0.2)");
        }

        ctx.fillStyle = winGrad;
        ctx.beginPath();
        ctx.roundRect(win.x, win.y, win.w, win.h, 2.5);
        ctx.fill();

        ctx.strokeStyle = isRestored ? "#78350f" : "#0369a1";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(win.x + win.w / 2, win.y);
        ctx.lineTo(win.x + win.w / 2, win.y + win.h);
        ctx.moveTo(win.x, win.y + win.h / 2);
        ctx.lineTo(win.x + win.w, win.y + win.h / 2);
        ctx.stroke();

        ctx.restore();
      }
    }
  }

  // 6. Draw Sector Signboards
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    drawSignboard(b.sign.x, b.sign.y, b.sign.w, b.short, b.power >= 30, b.sign.color);
  }
  const tp = state.tree_power || 35; drawSignboard(248, 290, 88, "TREE OF VISION", tp >= 30, tp >= 100 ? "#4ade80" : "#38bdf8");
  drawSignboard(state.bountyBoard.x, state.bountyBoard.y - 12, 64, "BOUNTIES", true, "#f59e0b");

  // 7. Chimney Smoke Billowing
  updateAndDrawSmoke();

  // 8. Spotlight Night Overlay (Warm Lanterns & Glowing Runes)
  if (state.night_mode) {
    darkCtx.clearRect(0, 0, 500, 494);
    darkCtx.globalCompositeOperation = "source-over";
    darkCtx.fillStyle = "rgba(7, 9, 20, 0.72)";
    darkCtx.fillRect(0, 0, 500, 494);

    darkCtx.globalCompositeOperation = "destination-out";

    // Avatar lantern aura
    const avGrad = darkCtx.createRadialGradient(state.avatar.x, state.avatar.y, 14, state.avatar.x, state.avatar.y, 88);
    avGrad.addColorStop(0, "rgba(0,0,0,1)");
    avGrad.addColorStop(1, "rgba(0,0,0,0)");
    darkCtx.fillStyle = avGrad;
    darkCtx.beginPath();
    darkCtx.arc(state.avatar.x, state.avatar.y, 88, 0, Math.PI * 2);
    darkCtx.fill();

    // Sacred Tree glowing lantern plaza
    const treeGrad = darkCtx.createRadialGradient(248, 225, 25, 248, 225, 125);
    treeGrad.addColorStop(0, "rgba(0,0,0,1)");
    treeGrad.addColorStop(0.8, "rgba(0,0,0,0.9)");
    treeGrad.addColorStop(1, "rgba(0,0,0,0)");
    darkCtx.fillStyle = treeGrad;
    darkCtx.beginPath();
    darkCtx.arc(248, 225, 125, 0, Math.PI * 2);
    darkCtx.fill();

    // Unlocked district lighting
    for (let i = 0; i < state.buildings.length; i++) {
      const b = state.buildings[i];
      if (b.power >= 30) {
        const radius = 65 + (b.power * 0.75);
        const g = darkCtx.createRadialGradient(b.x, b.y, 20, b.x, b.y, radius);
        g.addColorStop(0, b.power >= 100 ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.7)");
        g.addColorStop(0.75, b.power >= 100 ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.4)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        darkCtx.fillStyle = g;
        darkCtx.beginPath();
        darkCtx.arc(b.x, b.y, radius, 0, Math.PI * 2);
        darkCtx.fill();

        // Illuminated lantern path back to Plaza
        darkCtx.save();
        darkCtx.strokeStyle = "rgba(0,0,0," + (b.power >= 100 ? "0.85" : "0.5") + ")";
        darkCtx.lineWidth = 42;
        darkCtx.lineCap = "round";
        darkCtx.beginPath();
        darkCtx.moveTo(b.x, b.y);
        darkCtx.lineTo(248, 248);
        darkCtx.stroke();
        darkCtx.restore();
      }
    }

    // Bridge lanterns
    const eastPow = Math.max(state.buildings[1].power, state.buildings[3].power);
    if (eastPow >= 30) {
      darkCtx.save();
      darkCtx.strokeStyle = "rgba(0,0,0,0.8)";
      darkCtx.lineWidth = 36;
      darkCtx.lineCap = "round";
      darkCtx.beginPath();
      darkCtx.moveTo(270, 160);
      darkCtx.lineTo(365, 145);
      darkCtx.moveTo(270, 325);
      darkCtx.lineTo(375, 340);
      darkCtx.stroke();
      darkCtx.restore();
    }

    ctx.drawImage(darkCanvas, 0, 0);
  }

  // 🌸 Continuous Sakura Petals (Tree of Vision Empowered - Zen Pacing) 🌸
  if (state.tree_empowered) {
    if (Math.random() < 0.06) { // Spawns rarely for sparse, gentle falling
      spawnSakuraPetal();
    }
    for (let i = sakuraPetals.length - 1; i >= 0; i--) {
      const p = sakuraPetals[i];
      p.life++;
      // Slower, meditative sway
      p.x += p.vx + Math.sin(state.time * 1.1 + p.swayPhase) * 0.18;
      p.y += p.vy;
      if (p.life > p.maxLife) {
        p.alpha -= 0.01;
      }
      if (p.alpha <= 0 || p.y > canvas.height + 10) {
        sakuraPetals.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 1.25, p.r * 0.75, p.swayPhase + (p.life * 0.01), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ✨ Story Sparks & Tachyonic Bursts ✨
  for (let i = canvasSparks.length - 1; i >= 0; i--) {
    const s = canvasSparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.alpha -= s.decay;
    if (s.alpha <= 0) {
      canvasSparks.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 9. Footstep Dust Puffs
  for (let i = dustPuffs.length - 1; i >= 0; i--) {
    const d = dustPuffs[i];
    d.y += d.vy;
    d.r += 0.04;
    d.alpha -= 0.01;
    if (d.alpha <= 0) {
      dustPuffs.splice(i, 1);
      continue;
    }
    ctx.fillStyle = "rgba(215, 200, 180, " + d.alpha + ")";
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 10. Building Power Bars
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    const isNear = activeBuilding && activeBuilding.id === b.id;
    const barW = 54;
    const bx = b.sign.x - barW / 2;
    const by = b.sign.y + 12;

    ctx.fillStyle = "rgba(9, 10, 18, 0.85)";
    ctx.fillRect(bx - 1, by - 1, barW + 2, 6);
    ctx.fillStyle = b.sign.color;
    ctx.fillRect(bx, by, (barW * b.power) / 100, 4);

    if (isNear) {
      ctx.strokeStyle = b.sign.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 48, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 11. DRAW EXTERIOR TOWN STICKERS + GABRIELLE (Depth Sorted)
  const owList = sceneStickers.overworld || [];
  for (let i = 0; i < owList.length; i++) {
    const st = owList[i];
    drawPlacedSticker(ctx, st, false, state.hoveredStickerUid === st.uid);
  }
  if (typeof drawVillageNpcs === "function") drawVillageNpcs(ctx);
  drawSpriteCharacter(ctx, state.avatar.x, state.avatar.y, false);

  // 12. Atmospheric Moving Fog
  if (state.fog_enabled) {
    ctx.save();
    for (let i = 0; i < fogClouds.length; i++) {
      const f = fogClouds[i];
      f.x += f.vx;
      f.y += Math.sin(state.time * 0.4 + f.phase) * 0.075;
      if (f.x - f.r > canvas.width) {
        f.x = -f.r;
      }
      const g = ctx.createRadialGradient(f.x, f.y, 5, f.x, f.y, f.r);
      const alpha = state.night_mode ? 0.08 : 0.05;
      g.addColorStop(0, "rgba(215, 230, 255, " + alpha + ")");
      g.addColorStop(0.5, "rgba(180, 210, 255, " + (alpha * 0.6) + ")");
      g.addColorStop(1, "rgba(180, 210, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 13. Static Clean Portrait in HUD
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  const auraGrad = pCtx.createRadialGradient(60, 60, 10, 60, 60, 58);
  auraGrad.addColorStop(0, "rgba(244, 114, 182, 0.35)");
  auraGrad.addColorStop(1, "rgba(0,0,0,0)");
  pCtx.fillStyle = auraGrad;
  pCtx.beginPath();
  pCtx.arc(60, 60, 58, 0, Math.PI * 2);
  pCtx.fill();

  drawSpriteCharacter(pCtx, 60, 60, true);
}
