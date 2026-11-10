// ─── QUEST LAYER ──────────────────────────────────────────────────────
// Reads quests.json (the cast and their labs) and progress.json (written by
// tools/referee.py from real test results). Building power, the signal meter,
// the villagers on the map and every quest card come from those two files.
// Nothing in the player UI can add power by clicking.

let questData = null;       // quests.json
let questProgress = null;   // progress.json
const questNpcSpots = {};   // npcId -> { x, y } on the 2D village map
const QUEST_FIXED_SPOTS = { tree: { x: 302, y: 250 } };
const QUEST_SPOT_OFFSETS = { kinetic_dojo: { x: 64, y: -2 } };  // keep the Dojo villager clear of the bottom HUD
const QUEST_REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function questEsc(text) {
  return String(text).replace(/[&<>"']/g, function(ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}

function questNpc(npcId) {
  return questData ? questData.npcs.find(function(n) { return n.id === npcId; }) : null;
}

function questLabsFor(npcId) {
  return questData.labs.filter(function(lab) { return lab.npc === npcId; });
}

function questLabStatus(labId) {
  return (questProgress && questProgress.labs[labId]) || "planned";
}

function questScore(npcId) {
  return (questProgress && questProgress.npcs[npcId]) || { passed: 0, total: questLabsFor(npcId).length, power: 0 };
}

// "ready": a lab is available now. "done": every lab passed. "resting": nothing to do yet.
function questNpcMood(npcId) {
  const labs = questLabsFor(npcId);
  if (labs.some(function(lab) { return questLabStatus(lab.id) === "available"; })) return "ready";
  if (labs.length && labs.every(function(lab) { return questLabStatus(lab.id) === "passed"; })) return "done";
  return "resting";
}

// The lab to show first: the next available one, else the next locked one, else the next planned one.
function questCurrentLab(npcId) {
  const labs = questLabsFor(npcId);
  const order = ["available", "locked", "planned"];
  for (let i = 0; i < order.length; i++) {
    const found = labs.find(function(lab) { return questLabStatus(lab.id) === order[i]; });
    if (found) return found;
  }
  return null;
}

// ─── VILLAGERS ON THE 2D MAP ──────────────────────────────────────────
function layoutQuestNpcs() {
  questData.npcs.forEach(function(npc) {
    const building = state.buildings.find(function(b) { return b.id === npc.lives_at; });
    const offset = QUEST_SPOT_OFFSETS[npc.lives_at] || { x: 36, y: 22 };
    if (building) questNpcSpots[npc.id] = { x: building.x + offset.x, y: building.y + offset.y };
    else if (QUEST_FIXED_SPOTS[npc.lives_at]) questNpcSpots[npc.id] = QUEST_FIXED_SPOTS[npc.lives_at];
    // Pin is the bounty board and Future Gabrielle is the radio, so they have HUD buttons instead.
  });
}

function questNpcAt(mx, my) {
  if (!questData) return null;
  const ids = Object.keys(questNpcSpots);
  for (let i = 0; i < ids.length; i++) {
    const spot = questNpcSpots[ids[i]];
    if (Math.hypot(mx - spot.x, my - (spot.y - 6)) < 15) return questNpc(ids[i]);
  }
  return null;
}

function drawVillageNpcs(tCtx) {
  if (!questData) return;
  const moodColor = { ready: "#d97706", done: "#4d7c0f", resting: "#8a7a66" };
  Object.keys(questNpcSpots).forEach(function(npcId, index) {
    const npc = questNpc(npcId);
    const spot = questNpcSpots[npcId];
    const mood = questNpcMood(npcId);
    const bob = QUEST_REDUCED_MOTION ? 0 : Math.sin(state.time * 2 + index) * 1.2;

    tCtx.save();
    tCtx.fillStyle = "rgba(0, 0, 0, 0.28)";
    tCtx.beginPath();
    tCtx.ellipse(spot.x, spot.y + 5, 9, 3, 0, 0, Math.PI * 2);
    tCtx.fill();

    tCtx.fillStyle = "#f4ead7";
    tCtx.strokeStyle = moodColor[mood];
    tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.arc(spot.x, spot.y - 6 + bob, 10.5, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();

    tCtx.font = "13px serif";
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";
    tCtx.fillStyle = "#4d3b29";
    tCtx.fillText(npc.icon, spot.x, spot.y - 5.5 + bob);

    if (mood === "ready") {
      // A quest is waiting
      tCtx.fillStyle = "#d97706";
      tCtx.beginPath();
      tCtx.arc(spot.x + 10, spot.y - 17 + bob, 5.5, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.fillStyle = "#fff7e6";
      tCtx.font = "bold 9px monospace";
      tCtx.fillText("!", spot.x + 10, spot.y - 16.5 + bob);
    }
    tCtx.restore();
  });
}

// ─── QUEST CARD (talking to a villager) ───────────────────────────────
function questLabBlock(lab) {
  const status = questLabStatus(lab.id);
  let html = '<div class="q-lab">' +
    '<span class="q-badge ' + status + '">' + questEsc(lab.format) + " · " + status + "</span>" +
    "<h3>" + questEsc(lab.title) + "</h3>" +
    '<div class="q-chips">' + lab.skills.map(function(s) { return '<span class="q-chip">' + questEsc(s) + "</span>"; }).join("") + "</div>" +
    "<div><b>Unlocks:</b> " + questEsc(lab.unlocks) + "</div>";

  if (lab.path && status === "available") {
    const cmd = "python -m pytest " + lab.path + " -q";
    html += '<div style="margin-top:8px">Brief: <a href="' + questEsc(lab.path) + '/README.md" target="_blank" rel="noopener" style="text-decoration:underline">' +
      questEsc(lab.path) + "/README.md</a></div>" +
      '<div class="q-cmd"><code>' + questEsc(cmd) + '</code><button class="q-copy" data-copy="' + questEsc(cmd) + '">Copy</button></div>' +
      '<div class="q-cmd"><code>python tools/referee.py</code><button class="q-copy" data-copy="python tools/referee.py">Copy</button></div>' +
      '<div class="q-note" style="margin-top:6px">Write the code, pass the tests, run the referee, push. Then this house lights up.</div>';
  } else if (status === "locked") {
    const need = lab.prereqs.filter(function(id) { return questLabStatus(id) !== "passed"; });
    html += '<div class="q-note" style="margin-top:6px">Locked. Pass ' + questEsc(need.join(", ")) + " first.</div>";
  } else if (status === "planned") {
    html += '<div class="q-note" style="margin-top:6px">On the map, not scaffolded yet. It gets a brief and tests when you reach it.</div>';
  }
  return html + "</div>";
}

function openQuestCard(npcId) {
  const npc = questNpc(npcId);
  if (!npc) return false;
  const labs = questLabsFor(npcId);
  const score = questScore(npcId);
  const mood = questNpcMood(npcId);
  const current = questCurrentLab(npcId);
  const marks = { passed: "✅", available: "🔶", locked: "🔒", planned: "·" };
  const isBuilding = state.buildings.some(function(b) { return b.id === npc.lives_at; });

  let speech = npc.greeting;
  if (mood === "done") speech = "Every lab of mine is passed. I am as real as you made me. " + npc.catchphrase;
  else if (score.passed > 0 && mood === "ready") speech = "“" + npc.catchphrase + "” Good, you are back. There is more to build.";

  let html =
    '<button class="q-close" onclick="closeQuestCard()" aria-label="Close">✕</button>' +
    '<div class="q-eyebrow">' + questEsc(questData.places[npc.lives_at]) + "</div>" +
    '<h2 class="q-title">' + npc.icon + " " + questEsc(npc.name) + "</h2>" +
    '<div class="q-teaches">Teaches: ' + questEsc(npc.teaches) + "</div>" +
    '<div class="q-rule"></div>' +
    '<p class="q-speech">' + questEsc(speech) + "</p>" +
    '<div class="q-progress"><span>' + score.passed + " / " + score.total + ' labs</span><span class="q-bar"><i style="width:' + score.power + '%"></i></span><span>' + score.power + "%</span></div>" +
    '<div class="q-note" style="margin-bottom:10px"><b>The real build:</b> ' + questEsc(npc.real_build) + "</div>";

  if (current) html += questLabBlock(current);

  html += '<ul class="q-list">' + labs.map(function(lab) {
    const status = questLabStatus(lab.id);
    return '<li class="' + status + '"><span>' + marks[status] + '</span><span class="q-id">' + questEsc(lab.id) + "</span><span>" + questEsc(lab.title) + "</span></li>";
  }).join("") + "</ul>";

  html += '<div class="q-actions">';
  if (isBuilding) html += '<button class="q-btn" onclick="closeQuestCard(); switchScene(\'' + npc.lives_at + "')\">🚪 Step inside</button>";
  if (npc.lives_at === "radio") html += '<button class="q-btn" onclick="closeQuestCard(); openCommLink()">📡 Open the radio</button>';
  html += '<button class="q-btn ghost" onclick="closeQuestCard(); openBountyModal()">📋 Quest map</button>' +
    '<button class="q-btn ghost" onclick="closeQuestCard()">Back to wandering</button></div>';

  document.getElementById("questCardBody").innerHTML = html;
  document.getElementById("questCard").classList.remove("hidden");
  toggleWorldPanel(null);
  return true;
}

function openQuestCardForPlace(placeId) {
  if (!questData) return false;
  const npc = questData.npcs.find(function(n) { return n.lives_at === placeId; });
  return npc ? openQuestCard(npc.id) : false;
}

function closeQuestCard() {
  document.getElementById("questCard").classList.add("hidden");
}

// ─── PLAZA BOUNTY BOARD (the whole quest map) ─────────────────────────
function renderQuestBoard() {
  const board = document.getElementById("questBoard");
  if (!questData) {
    board.innerHTML = '<button class="q-close" onclick="closeBountyModal()" aria-label="Close">✕</button>' +
      '<h2 class="q-title">Plaza Bounty Board</h2><p class="q-note">The quest map could not be loaded. ' +
      "Open the village through a web server (GitHub Pages or <code>python -m http.server</code>), not by double-clicking the file.</p>";
    return;
  }
  const pin = questNpc("pin");
  const signal = questProgress ? questProgress.signal : 0;
  const passed = questProgress ? questProgress.passed : 0;
  const total = questProgress ? questProgress.total : questData.labs.length;

  let html =
    '<button class="q-close" onclick="closeBountyModal()" aria-label="Close">✕</button>' +
    '<div class="q-eyebrow">The Plaza</div>' +
    '<h2 class="q-title">📋 Bounty Board</h2>' +
    '<p class="q-speech">' + (pin ? pin.icon + " “" + questEsc(pin.greeting) + "”" : "") + "</p>" +
    '<div class="q-progress"><span>Signal</span><span class="q-bar"><i style="width:' + signal + '%"></i></span><span>' +
    passed + " / " + total + " labs · " + signal + "%</span></div>";

  const ready = questData.labs.filter(function(lab) { return questLabStatus(lab.id) === "available"; });
  html += '<div class="q-h">Available now</div>';
  html += ready.length
    ? '<ul class="q-list">' + ready.map(function(lab) {
        return '<li><span>🔶</span><span class="q-id">' + questEsc(lab.id) + "</span><span>" + questEsc(lab.title) +
          ' <span class="q-note">(' + questEsc(questNpc(lab.npc).name) + ")</span></span></li>";
      }).join("") + "</ul>"
    : '<p class="q-note">Nothing is scaffolded right now. Ask for the next lab.</p>';

  html += '<div class="q-h">Quest lines</div>';
  html += questData.npcs.slice().sort(function(a, b) { return a.order - b.order; }).map(function(npc) {
    const score = questScore(npc.id);
    return '<button class="q-row" onclick="closeBountyModal(); openQuestCard(\'' + npc.id + "')\">" +
      '<span class="q-icon">' + npc.icon + "</span>" +
      "<span><b>" + questEsc(npc.name) + "</b><small>" + questEsc(npc.teaches) + "</small></span>" +
      '<span class="q-count">' + score.passed + " / " + score.total + "</span></button>";
  }).join("");

  html += '<div class="q-h">Raw idea dropzone</div>';
  html += '<ul class="q-list">' + (questData.ideas || []).map(function(idea) {
    return "<li><span>📌</span><span>" + questEsc(idea) + "</span></li>";
  }).join("") + "</ul>" +
    '<p class="q-note">New idea mid-quest? Add a line to <code>ideas</code> in quests.json and keep going. Pin will file them for you once you have built him.</p>';

  board.innerHTML = html;
}

const _questOrigOpenBountyModal = openBountyModal;
openBountyModal = function() {
  renderQuestBoard();
  closeQuestCard();
  toggleWorldPanel(null);
  _questOrigOpenBountyModal();
};

// ─── SIGNAL AND BUILDING POWER COME FROM progress.json ────────────────
// Replaces the earlier version, which averaged whatever the power buttons had been clicked to.
function recalculateSignal() {
  if (questProgress) {
    state.signal_strength = questProgress.signal;
  } else {
    let sum = 0;
    for (let i = 0; i < state.buildings.length; i++) sum += state.buildings[i].power;
    state.signal_strength = Math.round(sum / state.buildings.length);
  }
  document.getElementById("signalStrengthTag").textContent = state.signal_strength + "%";
  const bar = document.getElementById("hudSignalBar");
  if (bar) bar.style.width = state.signal_strength + "%";
}

function applyQuestProgress() {
  state.buildings.forEach(function(b) {
    if (b.id in questProgress.places) b.power = questProgress.places[b.id];
  });
  state.tree_power = Math.max(1, questProgress.signal);  // the tree glows with the overall signal
  document.getElementById("hudLabCount").textContent = questProgress.passed + " / " + questProgress.total + " labs";
  recalculateSignal();
  renderBuildingsList();
  updateInspector();
  try { if (scene3d) refresh3DSignboardsAndLights(); } catch (e) { /* 3D view not ready */ }
}

// ─── WORLD HUD ────────────────────────────────────────────────────────
const WORLD_PANELS = ["worldMenu", "wardrobePanel", "studioDrawer"];

function toggleWorldPanel(panelId) {
  WORLD_PANELS.forEach(function(id) {
    const el = document.getElementById(id);
    if (id === panelId) el.classList.toggle("hidden");
    else el.classList.add("hidden");
  });
}

function toggleWorldView() {
  toggleWorldPanel(null);
  switchScene(state.activeScene === "town3d" ? "overworld" : "town3d");
}

function syncWorldHud() {
  const scene = state.activeScene;
  const inRoom = scene !== "overworld" && scene !== "town3d";
  document.getElementById("leaveRoomBtn").classList.toggle("hidden", scene === "overworld");
  document.getElementById("leaveRoomBtn").textContent = inRoom ? "← Leave the room" : "← Village map";
  document.getElementById("viewToggleBtn").textContent = scene === "town3d" ? "🗺️ 2D village map" : "🌍 3D town view";
}

const _questOrigSwitchScene = switchScene;
switchScene = function(sceneId) {
  _questOrigSwitchScene(sceneId);
  syncWorldHud();
};

document.addEventListener("keydown", function(e) {
  if (e.key !== "Escape") return;
  closeQuestCard();
  toggleWorldPanel(null);
});

document.addEventListener("click", function(e) {
  const btn = e.target.closest ? e.target.closest(".q-copy") : null;
  if (!btn || !navigator.clipboard) return;
  navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function() {
    btn.textContent = "Copied";
    setTimeout(function() { btn.textContent = "Copy"; }, 1400);
  });
});

// ─── BOOT ─────────────────────────────────────────────────────────────
(function bootQuestLayer() {
  if (new URLSearchParams(location.search).has("studio")) {
    document.getElementById("studioMenuBtn").classList.remove("hidden");
  }
  syncWorldHud();
  recalculateSignal();

  const load = function(file) {
    return fetch(file, { cache: "no-cache" }).then(function(r) {
      if (!r.ok) throw new Error(file + " " + r.status);
      return r.json();
    });
  };
  Promise.all([load("quests.json"), load("progress.json")]).then(function(results) {
    questData = results[0];
    questProgress = results[1];
    layoutQuestNpcs();
    applyQuestProgress();
  }).catch(function(err) {
    console.warn("[quests] Could not load quests.json / progress.json:", err);
    document.getElementById("hudLabCount").textContent = "quest map unavailable";
  });

  // First visit: play the Chapter 0 story scene as the introduction
  try {
    if (!localStorage.getItem("cultivate_sanctuary_intro_seen")) {
      localStorage.setItem("cultivate_sanctuary_intro_seen", "1");
      openCommLink();
    }
  } catch (e) { /* storage blocked: skip the intro */ }
})();
