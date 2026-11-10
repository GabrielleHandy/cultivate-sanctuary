// =========================================================================
// 🎨 PLAN 2: ISOMETRIC CUTAWAY ROOM CUBES & STICKER SCENE ENGINE
// =========================================================================
// Palette & Linework Constants (Matching Reference Treehouse Aesthetic)
const INK = "#4A2E1B"; // Warm Espresso-Brown Ink (Never harsh #000000)
const DIE_CUT_CREAM = "#FFFBEB";

state.activeScene = "overworld"; // the 2D village map is home. Also: "town3d" or a room id
state.hoveredStickerUid = null;  // room furniture under the pointer

// Room Cutaway Themes (2:1 Orthographic Isometric Room Boxes on Ancient Tree Branches)
const ROOM_THEMES = {
  safe_house: {
    title: "🏡 SAFE HOUSE & ATELIER LOFT",
    subtitle: "Crown Branch Cutaway • Mindful Living & WearIt Wardrobe",
    wallLeft: "#f3e5ab",
    wallRight: "#e6d296",
    wainscot: "#9c6644",
    floorBase: "#c68b59",
    floorPlank: "#a46c3d",
    beamColor: "#6f4518",
    roofColor: "#c86d51",
    windowSide: "left",
    ambientGlow: "rgba(251, 191, 36, 0.18)"
  },
  ai_academy: {
    title: "🧠 THE NEURAL ACADEMY CONSERVATORY",
    subtitle: "Northeast Branch Cutaway • AI Systems & Pydantic Schemas",
    wallLeft: "#d8c3a5",
    wallRight: "#c4ad8d",
    wainscot: "#5c4033",
    floorBase: "#9c6f44",
    floorPlank: "#7f5539",
    beamColor: "#4a2e1b",
    roofColor: "#789262",
    windowSide: "right",
    ambientGlow: "rgba(56, 189, 248, 0.14)"
  },
  tea_house: {
    title: "🍵 CIPHER TEA HOUSE BALCONY",
    subtitle: "Sunlit Greenhouse Deck • Mandarin Phonetics & Oolong",
    wallLeft: "#e9edc9",
    wallRight: "#ccd5ae",
    wainscot: "#8a5a36",
    floorBase: "#d4a373",
    floorPlank: "#b5835a",
    beamColor: "#5c3a21",
    roofColor: "#bc6c25",
    windowSide: "left",
    ambientGlow: "rgba(251, 146, 60, 0.18)"
  },
  memory_vault: {
    title: "🏛️ BARANGAY MEMORY VAULT",
    subtitle: "Heartwood Library Nook • 3-Tier Memory & Multiverse Radio",
    wallLeft: "#e0c097",
    wallRight: "#c8a276",
    wainscot: "#5c3317",
    floorBase: "#a66c46",
    floorPlank: "#845030",
    beamColor: "#4a2c18",
    roofColor: "#9e4733",
    windowSide: "right",
    ambientGlow: "rgba(167, 139, 250, 0.16)"
  },
  kinetic_dojo: {
    title: "🥋 THE KINETIC DOJO SUN-DECK",
    subtitle: "Root Canopy Platform • Calisthenics & Movement Longevity",
    wallLeft: "#dce2bd",
    wallRight: "#c5ce9b",
    wainscot: "#7f5539",
    floorBase: "#deb887",
    floorPlank: "#be9564",
    beamColor: "#58391c",
    roofColor: "#52796f",
    windowSide: "left",
    ambientGlow: "rgba(52, 211, 153, 0.16)"
  }
};

// Master Isometric Sticker Catalog (28 Built-In High-Craft Stickers + Custom User Stickers)
const STICKER_CATALOG = [
  // Safe House
  { id: "cozy_bed", name: "Canopy Reading Bed", cat: "safe_house", layer: 1, w: 76, h: 64, action: "nap", hint: "🛏️ Click: Take Restorative Nap" },
  { id: "wearit_mirror", name: "WearIt Arched Mirror", cat: "safe_house", layer: 1, w: 48, h: 72, action: "cycle_outfit", hint: "👗 Click: Cycle WearIt Outfit" },
  { id: "daisy_rug", name: "Woven Daisy Rug", cat: "safe_house", layer: 0, w: 92, h: 52, action: null },
  { id: "nightstand_lamp", name: "Oak Nightstand & Lamp", cat: "safe_house", layer: 1, w: 42, h: 54, action: "toggle_lamp", hint: "💡 Click: Warm Lantern Glow" },
  { id: "wardrobe_rack", name: "Atelier Garment Rack", cat: "safe_house", layer: 1, w: 62, h: 68, action: "cycle_outfit", hint: "🧥 Click: Switch Garment" },

  // Neural Academy
  { id: "cyber_desk", name: "Dual-Holo Study Desk", cat: "ai_academy", layer: 1, w: 78, h: 64, action: "code_sprint", hint: "💻 Click: Log AI Study Sprint (+5%)" },
  { id: "owl_perch", name: "Prof. Pydantic Perch", cat: "ai_academy", layer: 1, w: 46, h: 66, action: "prof_pydantic", hint: "🦉 Click: Talk to Prof. Pydantic" },
  { id: "tall_bookshelf", name: "Apothecary Bookshelf", cat: "ai_academy", layer: 1, w: 66, h: 78, action: null },
  { id: "server_bonsai", name: "Cyber-Bonsai Planter", cat: "ai_academy", layer: 1, w: 48, h: 56, action: null },
  { id: "blueprint_scroll", name: "Schema Wall Scroll", cat: "ai_academy", layer: 2, w: 54, h: 48, action: null },

  // Cipher Tea House
  { id: "tea_table", name: "Chabudai Tea Table", cat: "tea_house", layer: 1, w: 74, h: 52, action: "mandarin_tea", hint: "🍵 Click: Brew Tea & Practice Mandarin" },
  { id: "paper_lantern", name: "Amber Paper Lantern", cat: "tea_house", layer: 2, w: 40, h: 58, action: null },
  { id: "bamboo_screen", name: "Shoji Folding Screen", cat: "tea_house", layer: 1, w: 68, h: 74, action: null },
  { id: "herb_rack", name: "Botanical Tea Shelf", cat: "tea_house", layer: 1, w: 60, h: 68, action: null },
  { id: "tatami_cushion", name: "Woven Zafu Cushion", cat: "tea_house", layer: 0, w: 44, h: 32, action: null },

  // Memory Vault
  { id: "radio_table", name: "Multiverse Radio Desk", cat: "memory_vault", layer: 1, w: 64, h: 62, action: "open_radio", hint: "📻 Click: Tune Sept 2027 Radio" },
  { id: "stone_hearth", name: "Crackling Stone Hearth", cat: "memory_vault", layer: 1, w: 72, h: 78, action: "stoke_fire", hint: "🔥 Click: Stoke Hearth Fire" },
  { id: "velvet_armchair", name: "Mustard Velvet Chair", cat: "memory_vault", layer: 1, w: 54, h: 56, action: null },
  { id: "memory_jars", name: "3-Tier Memory Cabinet", cat: "memory_vault", layer: 1, w: 62, h: 74, action: null },
  { id: "persian_rug", name: "Terracotta Guild Rug", cat: "memory_vault", layer: 0, w: 98, h: 56, action: null },

  // Kinetic Dojo
  { id: "wooden_rings", name: "Timber Calisthenics Rig", cat: "kinetic_dojo", layer: 1, w: 72, h: 82, action: "dojo_set", hint: "🤸 Click: Log Calisthenics Set (+5%)" },
  { id: "bamboo_mat", name: "Woven Movement Mat", cat: "kinetic_dojo", layer: 0, w: 84, h: 48, action: "dojo_set", hint: "🧘 Click: Mobility Stretch (+5%)" },
  { id: "stone_lantern", name: "Mossy Tōrō Lantern", cat: "kinetic_dojo", layer: 1, w: 44, h: 62, action: null },
  { id: "water_basin", name: "Bamboo Water Basin", cat: "kinetic_dojo", layer: 1, w: 50, h: 52, action: null },

  // Clutter, Plants & Town Exterior
  { id: "pothos_vine", name: "Trailing Pothos Vine", cat: "clutter", layer: 2, w: 46, h: 58, action: null },
  { id: "book_stack", name: "Stacked Books & Mug", cat: "clutter", layer: 1, w: 42, h: 42, action: null },
  { id: "arched_window", name: "Sunbeam Arched Window", cat: "clutter", layer: 2, w: 56, h: 66, action: null },
  { id: "sleepy_cat", name: "Curled Ginger Cat", cat: "clutter", layer: 1, w: 44, h: 36, action: "pet_cat", hint: "🐱 Click: Pet Ginger Cat" },
  { id: "cherry_tree", name: "Sakura Barrel Planter", cat: "clutter", layer: 1, w: 68, h: 78, action: null },
  { id: "town_bench", name: "Cozy Timber Bench", cat: "clutter", layer: 1, w: 60, h: 46, action: null }
];

// Default Lived-In Room Sticker Layouts (Used on first boot or reset)
function getDefaultSceneStickers() {
  return {
    overworld: [],  // the painted village map needs no extra props
    safe_house: [
      { uid: "sh_1", type: "daisy_rug", x: 248, y: 318, flip: false, zBias: -20 },
      { uid: "sh_2", type: "arched_window", x: 158, y: 185, flip: false, zBias: -15 },
      { uid: "sh_3", type: "cozy_bed", x: 185, y: 268, flip: false, zBias: 0 },
      { uid: "sh_4", type: "nightstand_lamp", x: 248, y: 238, flip: false, zBias: 0 },
      { uid: "sh_5", type: "wearit_mirror", x: 325, y: 262, flip: true, zBias: 0 },
      { uid: "sh_6", type: "wardrobe_rack", x: 365, y: 298, flip: true, zBias: 0 },
      { uid: "sh_7", type: "sleepy_cat", x: 245, y: 325, flip: false, zBias: 5 },
      { uid: "sh_8", type: "pothos_vine", x: 120, y: 225, flip: false, zBias: 10 },
      { uid: "sh_9", type: "book_stack", x: 162, y: 332, flip: false, zBias: 5 }
    ],
    ai_academy: [
      { uid: "ai_1", type: "persian_rug", x: 252, y: 322, flip: false, zBias: -20 },
      { uid: "ai_2", type: "arched_window", x: 335, y: 185, flip: true, zBias: -15 },
      { uid: "ai_3", type: "blueprint_scroll", x: 175, y: 192, flip: false, zBias: -15 },
      { uid: "ai_4", type: "tall_bookshelf", x: 155, y: 272, flip: false, zBias: 0 },
      { uid: "ai_5", type: "cyber_desk", x: 265, y: 268, flip: true, zBias: 0 },
      { uid: "ai_6", type: "owl_perch", x: 345, y: 295, flip: true, zBias: 5 },
      { uid: "ai_7", type: "server_bonsai", x: 175, y: 335, flip: false, zBias: 5 },
      { uid: "ai_8", type: "book_stack", x: 308, y: 338, flip: false, zBias: 5 }
    ],
    tea_house: [
      { uid: "th_1", type: "bamboo_screen", x: 175, y: 258, flip: false, zBias: -5 },
      { uid: "th_2", type: "herb_rack", x: 325, y: 260, flip: true, zBias: 0 },
      { uid: "th_3", type: "paper_lantern", x: 250, y: 162, flip: false, zBias: 15 },
      { uid: "th_4", type: "tatami_cushion", x: 205, y: 318, flip: false, zBias: -10 },
      { uid: "th_5", type: "tatami_cushion", x: 295, y: 318, flip: true, zBias: -10 },
      { uid: "th_6", type: "tea_table", x: 250, y: 308, flip: false, zBias: 2 },
      { uid: "th_7", type: "pothos_vine", x: 378, y: 235, flip: true, zBias: 10 },
      { uid: "th_8", type: "cherry_tree", x: 138, y: 312, flip: false, zBias: 8 }
    ],
    memory_vault: [
      { uid: "mv_1", type: "persian_rug", x: 250, y: 324, flip: false, zBias: -20 },
      { uid: "mv_2", type: "stone_hearth", x: 175, y: 258, flip: false, zBias: 0 },
      { uid: "mv_3", type: "memory_jars", x: 325, y: 258, flip: true, zBias: 0 },
      { uid: "mv_4", type: "radio_table", x: 255, y: 252, flip: false, zBias: -2 },
      { uid: "mv_5", type: "velvet_armchair", x: 202, y: 322, flip: false, zBias: 4 },
      { uid: "mv_6", type: "sleepy_cat", x: 255, y: 334, flip: true, zBias: 5 },
      { uid: "mv_7", type: "book_stack", x: 325, y: 328, flip: false, zBias: 5 }
    ],
    kinetic_dojo: [
      { uid: "kd_1", type: "bamboo_mat", x: 250, y: 320, flip: false, zBias: -20 },
      { uid: "kd_2", type: "wooden_rings", x: 205, y: 258, flip: false, zBias: 0 },
      { uid: "kd_3", type: "water_basin", x: 335, y: 278, flip: true, zBias: 0 },
      { uid: "kd_4", type: "stone_lantern", x: 145, y: 305, flip: false, zBias: 5 },
      { uid: "kd_5", type: "cherry_tree", x: 362, y: 318, flip: true, zBias: 8 },
      { uid: "kd_6", type: "tatami_cushion", x: 255, y: 356, flip: false, zBias: 4 }
    ]
  };
}

let sceneStickers = getDefaultSceneStickers();

const customImageCache = {};

function getStickerDef(id) {
  for (let i = 0; i < STICKER_CATALOG.length; i++) {
    if (STICKER_CATALOG[i].id === id) return STICKER_CATALOG[i];
  }
  return STICKER_CATALOG[0];
}

// ─── TACTILE STICKER AUDIO SYNTHESIZER ────────────────────────────────
function playStickerSound(type) {
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    if (type === "peel") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.09);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "stick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch (e) {}
}

// ─── ISOMETRIC GEOMETRY PRIMITIVES (2:1 ORTHOGRAPHIC WITH ESPRESSO INK) ──
function drawIsoPrism(tCtx, x, y, wLeft, wRight, h, topCol, leftCol, rightCol) {
  const lx = -wLeft;
  const ly = wLeft * 0.5;
  const rx = wRight;
  const ry = wRight * 0.5;

  tCtx.lineJoin = "round";
  tCtx.lineCap = "round";
  tCtx.strokeStyle = INK;
  tCtx.lineWidth = 1.8;

  // Left Face
  tCtx.fillStyle = leftCol;
  tCtx.beginPath();
  tCtx.moveTo(x + lx, y - ly - h);
  tCtx.lineTo(x, y - h);
  tCtx.lineTo(x, y);
  tCtx.lineTo(x + lx, y - ly);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Right Face
  tCtx.fillStyle = rightCol;
  tCtx.beginPath();
  tCtx.moveTo(x, y - h);
  tCtx.lineTo(x + rx, y - ry - h);
  tCtx.lineTo(x + rx, y - ry);
  tCtx.lineTo(x, y);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Top Face
  tCtx.fillStyle = topCol;
  tCtx.beginPath();
  tCtx.moveTo(x, y - h);
  tCtx.lineTo(x + lx, y - ly - h);
  tCtx.lineTo(x + lx + rx, y - ly - ry - h);
  tCtx.lineTo(x + rx, y - ry - h);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();
}

function drawIsoTile(tCtx, x, y, wLeft, wRight, fillCol, strokeCol) {
  const lx = -wLeft;
  const ly = wLeft * 0.5;
  const rx = wRight;
  const ry = wRight * 0.5;
  tCtx.fillStyle = fillCol;
  tCtx.strokeStyle = strokeCol || INK;
  tCtx.lineWidth = 1.6;
  tCtx.beginPath();
  tCtx.moveTo(x, y);
  tCtx.lineTo(x + lx, y - ly);
  tCtx.lineTo(x + lx + rx, y - ly - ry);
  tCtx.lineTo(x + rx, y - ry);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();
}

// ─── HIGH-CRAFT 2:1 ISOMETRIC STICKER ART RENDERER ────────────────────
function drawIsoStickerArt(tCtx, def, time) {
  const id = def.id;
  tCtx.lineJoin = "round";
  tCtx.lineCap = "round";
  tCtx.strokeStyle = INK;

  // Custom Image Sticker
  if (def.isCustom && def.imageDataUrl) {
    let img = customImageCache[def.id];
    if (!img) {
      img = new Image();
      img.src = def.imageDataUrl;
      customImageCache[def.id] = img;
    }
    if (img.complete && img.naturalWidth) {
      tCtx.drawImage(img, -32, -58, 64, 64);
    }
    return;
  }

  // Custom Procedural Synthesized Sticker
  if (def.isCustom && def.synth) {
    const s = def.synth;
    const c1 = s.c1 || "#d97706";
    const c2 = s.c2 || "#fde68a";
    if (s.shape === "crate_prop") {
      drawIsoPrism(tCtx, 0, 0, 22, 22, 22, c2, c1, "#92400e");
    } else if (s.shape === "potted_plant") {
      drawIsoPrism(tCtx, 0, 0, 14, 14, 16, "#b45309", "#9a3412", "#7c2d12");
      tCtx.fillStyle = c1;
      for (let a = 0; a < 5; a++) {
        tCtx.beginPath();
        tCtx.arc(Math.cos(a * 1.3) * 10, -24 + Math.sin(a * 1.3) * 6, 9, 0, Math.PI * 2);
        tCtx.fill();
        tCtx.stroke();
      }
    } else if (s.shape === "glowing_lantern") {
      const g = tCtx.createRadialGradient(0, -24, 3, 0, -24, 28);
      g.addColorStop(0, c2);
      g.addColorStop(1, "rgba(251, 191, 36, 0)");
      tCtx.fillStyle = g;
      tCtx.beginPath();
      tCtx.arc(0, -24, 28, 0, Math.PI * 2);
      tCtx.fill();
      drawIsoPrism(tCtx, 0, -4, 13, 13, 26, c1, c2, c1);
    } else if (s.shape === "cozy_cushion") {
      drawIsoPrism(tCtx, 0, 0, 22, 22, 9, c1, c2, c1);
    } else if (s.shape === "wall_frame") {
      drawIsoPrism(tCtx, 0, -10, 24, 4, 34, c1, c2, "#78350f");
    } else {
      drawIsoPrism(tCtx, 0, 0, 20, 18, 14, "#e2e8f0", c1, "#475569");
    }
    if (s.icon) {
      tCtx.font = "18px sans-serif";
      tCtx.textAlign = "center";
      tCtx.textBaseline = "middle";
      tCtx.fillText(s.icon, 0, -28);
    }
    return;
  }

  switch (id) {
    case "daisy_rug": {
      drawIsoTile(tCtx, 0, 4, 42, 42, "#fef3c7", INK);
      drawIsoTile(tCtx, 0, 1, 35, 35, "#f59e0b", INK);
      // Daisy center
      tCtx.fillStyle = "#fffbeb";
      for (let a = 0; a < 6; a++) {
        tCtx.beginPath();
        tCtx.ellipse(Math.cos(a * Math.PI / 3) * 8, -32 + Math.sin(a * Math.PI / 3) * 4, 5, 3, 0, 0, Math.PI * 2);
        tCtx.fill();
        tCtx.stroke();
      }
      tCtx.fillStyle = "#d97706";
      tCtx.beginPath();
      tCtx.ellipse(0, -32, 4, 2.5, 0, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      break;
    }
    case "persian_rug": {
      drawIsoTile(tCtx, 0, 4, 46, 46, "#9a3412", INK);
      drawIsoTile(tCtx, 0, 1, 38, 38, "#ea580c", INK);
      drawIsoTile(tCtx, 0, -7, 22, 22, "#fde68a", INK);
      break;
    }
    case "bamboo_mat": {
      drawIsoTile(tCtx, 0, 4, 38, 34, "#d9ed92", INK);
      drawIsoTile(tCtx, 0, 1, 33, 29, "#b5e48c", INK);
      break;
    }
    case "tatami_cushion": {
      drawIsoPrism(tCtx, 0, 0, 18, 18, 8, "#a3b18a", "#588157", "#3a5a40");
      tCtx.fillStyle = "#fde68a";
      tCtx.beginPath();
      tCtx.arc(0, -17, 3.5, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      break;
    }
    case "cozy_bed": {
      // Oak Bed Frame
      drawIsoPrism(tCtx, 0, 0, 34, 24, 12, "#d4a373", "#9c6644", "#7f5539");
      // Headboard (back-left)
      drawIsoPrism(tCtx, -20, -10, 4, 24, 28, "#b07d4f", "#7f5539", "#9c6644");
      // Mattress & Warm Terracotta Quilt
      drawIsoPrism(tCtx, 2, -6, 28, 22, 10, "#e07a5f", "#bc4749", "#9b2226");
      // Cream Folded Sheet & Pillows
      drawIsoPrism(tCtx, -12, -13, 10, 20, 11, "#fefae0", "#faedcd", "#d4a373");
      drawIsoPrism(tCtx, -14, -22, 7, 9, 5, "#ffffff", "#f1faee", "#e2cfc4");
      // Open Book on Bed
      drawIsoPrism(tCtx, 6, -17, 7, 6, 2, "#fffbeb", "#fde68a", "#d97706");
      break;
    }
    case "wearit_mirror": {
      // Wooden Stand Base
      drawIsoPrism(tCtx, 0, 0, 16, 10, 5, "#b07d4f", "#7f5539", "#5c3a21");
      // Tall Mirror Frame
      drawIsoPrism(tCtx, 0, -4, 14, 4, 52, "#d97706", "#b45309", "#78350f");
      // Reflective Glass Surface
      drawIsoPrism(tCtx, -1, -7, 11, 2, 46, "#bae6fd", "#7dd3fc", "#38bdf8");
      // Fairy light dots
      tCtx.fillStyle = "#fef08a";
      for (let i = 0; i < 4; i++) {
        tCtx.beginPath();
        tCtx.arc(-8 + i * 4, -52 + i * 2, 2.2, 0, Math.PI * 2);
        tCtx.fill();
      }
      break;
    }
    case "nightstand_lamp": {
      drawIsoPrism(tCtx, 0, 0, 15, 15, 20, "#d4a373", "#9c6644", "#7f5539");
      // Warm radial glow
      const g = tCtx.createRadialGradient(0, -38, 2, 0, -38, 26);
      g.addColorStop(0, "rgba(254, 240, 138, 0.85)");
      g.addColorStop(1, "rgba(251, 191, 36, 0)");
      tCtx.fillStyle = g;
      tCtx.beginPath();
      tCtx.arc(0, -38, 26, 0, Math.PI * 2);
      tCtx.fill();
      // Lamp Base & Pleated Shade
      drawIsoPrism(tCtx, 0, -20, 5, 5, 8, "#78350f", "#4a2e1b", "#4a2e1b");
      drawIsoPrism(tCtx, 0, -26, 11, 11, 12, "#fef08a", "#f59e0b", "#d97706");
      break;
    }
    case "wardrobe_rack": {
      drawIsoPrism(tCtx, 0, 0, 26, 12, 4, "#9c6644", "#7f5539", "#5c3a21");
      // Vertical rails
      drawIsoPrism(tCtx, -20, -2, 2, 2, 46, "#78350f", "#5c3a21", "#4a2e1b");
      drawIsoPrism(tCtx, 4, -14, 2, 2, 46, "#78350f", "#5c3a21", "#4a2e1b");
      drawIsoPrism(tCtx, 0, -46, 24, 3, 3, "#d97706", "#b45309", "#78350f");
      // Hanging hoodies (WearIt Violet & Sage)
      drawIsoPrism(tCtx, -10, -18, 7, 5, 22, "#c084fc", "#a855f7", "#7e22ce");
      drawIsoPrism(tCtx, -2, -22, 7, 5, 22, "#6ee7b7", "#10b981", "#047857");
      break;
    }
    case "cyber_desk": {
      // Warm Oak Table Legs & Desktop
      drawIsoPrism(tCtx, -24, 0, 4, 18, 20, "#9c6644", "#7f5539", "#5c3a21");
      drawIsoPrism(tCtx, 4, -14, 4, 18, 20, "#9c6644", "#7f5539", "#5c3a21");
      drawIsoPrism(tCtx, 0, -18, 32, 20, 5, "#ddb892", "#b08968", "#7f5539");
      // Dual Glowing Holo Monitors
      drawIsoPrism(tCtx, -10, -24, 12, 3, 18, "#38bdf8", "#0284c7", "#0369a1");
      drawIsoPrism(tCtx, 4, -31, 12, 3, 18, "#fbbf24", "#d97706", "#92400e");
      // Mechanical Keyboard & Matcha Mug
      drawIsoPrism(tCtx, -2, -23, 10, 6, 2, "#f8fafc", "#cbd5e1", "#64748b");
      drawIsoPrism(tCtx, 12, -26, 4, 4, 6, "#86efac", "#22c55e", "#15803d");
      break;
    }
    case "owl_perch": {
      // Wooden Perch Post
      drawIsoPrism(tCtx, 0, 0, 12, 12, 4, "#9c6644", "#7f5539", "#5c3a21");
      drawIsoPrism(tCtx, 0, -4, 3, 3, 30, "#7f5539", "#5c3a21", "#4a2e1b");
      drawIsoPrism(tCtx, 0, -32, 14, 4, 4, "#b08968", "#7f5539", "#5c3a21");
      // Professor Pydantic Owl
      tCtx.fillStyle = "#9a6b47";
      tCtx.beginPath();
      tCtx.ellipse(0, -45, 11, 13, 0, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      // Cream Belly
      tCtx.fillStyle = "#fef3c7";
      tCtx.beginPath();
      tCtx.ellipse(0, -42, 7, 8, 0, 0, Math.PI * 2);
      tCtx.fill();
      // Big Round Glasses
      tCtx.fillStyle = "#ffffff";
      tCtx.beginPath();
      tCtx.arc(-4, -49, 4.2, 0, Math.PI * 2);
      tCtx.arc(4, -49, 4.2, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      tCtx.fillStyle = INK;
      tCtx.beginPath();
      tCtx.arc(-4, -49, 1.5, 0, Math.PI * 2);
      tCtx.arc(4, -49, 1.5, 0, Math.PI * 2);
      tCtx.fill();
      // Beak
      tCtx.fillStyle = "#f59e0b";
      tCtx.beginPath();
      tCtx.moveTo(-2, -46);
      tCtx.lineTo(2, -46);
      tCtx.lineTo(0, -43);
      tCtx.closePath();
      tCtx.fill();
      break;
    }
    case "tall_bookshelf": {
      drawIsoPrism(tCtx, 0, 0, 26, 12, 56, "#b07d4f", "#8a5a36", "#5c3a21");
      // Colorful Book Rows
      const cols = ["#ef4444", "#f59e0b", "#10b981", "#38bdf8", "#a855f7"];
      for (let r = 0; r < 3; r++) {
        for (let b = 0; b < 4; b++) {
          drawIsoPrism(
            tCtx,
            -4 - b * 5,
            -12 - r * 16 - b * 2.5,
            4,
            8,
            10,
            cols[(r + b) % cols.length],
            cols[(r + b + 1) % cols.length],
            "#4a2e1b"
          );
        }
      }
      break;
    }
    case "server_bonsai": {
      drawIsoPrism(tCtx, 0, 0, 16, 16, 12, "#2dd4bf", "#0d9488", "#115e59");
      // Twisted Trunk
      tCtx.strokeStyle = "#5c3a21";
      tCtx.lineWidth = 5;
      tCtx.beginPath();
      tCtx.moveTo(0, -16);
      tCtx.quadraticCurveTo(-8, -28, 2, -38);
      tCtx.stroke();
      tCtx.strokeStyle = INK;
      tCtx.lineWidth = 1.8;
      // Foliage Clouds
      const leafCols = ["#4d7c0f", "#65a30d", "#84cc16"];
      for (let i = 0; i < 3; i++) {
        tCtx.fillStyle = leafCols[i];
        tCtx.beginPath();
        tCtx.ellipse(-6 + i * 7, -38 - (i % 2) * 5, 13, 8, 0, 0, Math.PI * 2);
        tCtx.fill();
        tCtx.stroke();
      }
      break;
    }
    case "blueprint_scroll": {
      drawIsoPrism(tCtx, 0, -14, 24, 3, 30, "#0284c7", "#0369a1", "#1e3a8a");
      // Wooden dowel rods
      drawIsoPrism(tCtx, 0, -43, 26, 4, 3, "#d97706", "#92400e", "#78350f");
      drawIsoPrism(tCtx, 0, -12, 26, 4, 3, "#d97706", "#92400e", "#78350f");
      break;
    }
    case "tea_table": {
      drawIsoPrism(tCtx, 0, 0, 28, 22, 12, "#d4a373", "#9c6644", "#7f5539");
      // Bamboo Tray
      drawIsoPrism(tCtx, 0, -12, 16, 12, 3, "#fef3c7", "#d97706", "#b45309");
      // Cast-Iron Teapot
      tCtx.fillStyle = "#334155";
      tCtx.beginPath();
      tCtx.arc(-2, -26, 7, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      // Animated Steam Wisps
      const st = (time || 0) * 3;
      tCtx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      tCtx.lineWidth = 1.5;
      tCtx.beginPath();
      tCtx.moveTo(-2, -35);
      tCtx.quadraticCurveTo(-6 + Math.sin(st) * 3, -43, -1, -50);
      tCtx.stroke();
      tCtx.strokeStyle = INK;
      break;
    }
    case "paper_lantern": {
      const g = tCtx.createRadialGradient(0, -32, 4, 0, -32, 34);
      g.addColorStop(0, "rgba(254, 240, 138, 0.95)");
      g.addColorStop(0.5, "rgba(251, 146, 60, 0.45)");
      g.addColorStop(1, "rgba(251, 146, 60, 0)");
      tCtx.fillStyle = g;
      tCtx.beginPath();
      tCtx.arc(0, -32, 34, 0, Math.PI * 2);
      tCtx.fill();

      tCtx.fillStyle = "#fde68a";
      tCtx.beginPath();
      tCtx.ellipse(0, -32, 13, 17, 0, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      // Top & bottom caps
      tCtx.fillStyle = "#78350f";
      tCtx.fillRect(-6, -50, 12, 3);
      tCtx.fillRect(-6, -16, 12, 3);
      break;
    }
    case "bamboo_screen": {
      drawIsoPrism(tCtx, -14, 0, 12, 3, 52, "#fef3c7", "#faedcd", "#9c6644");
      drawIsoPrism(tCtx, 0, -6, 12, 3, 52, "#fefae0", "#e9edc9", "#7f5539");
      drawIsoPrism(tCtx, 14, -12, 12, 3, 52, "#fef3c7", "#faedcd", "#9c6644");
      break;
    }
    case "herb_rack": {
      drawIsoPrism(tCtx, 0, 0, 24, 12, 46, "#9c6644", "#7f5539", "#5c3a21");
      drawIsoPrism(tCtx, -6, -24, 7, 7, 9, "#c2410c", "#9a3412", "#7c2d12");
      drawIsoPrism(tCtx, 4, -29, 7, 7, 9, "#65a30d", "#4d7c0f", "#365314");
      drawIsoPrism(tCtx, -2, -46, 8, 8, 9, "#f59e0b", "#d97706", "#92400e");
      break;
    }
    case "radio_table": {
      // Vintage Table
      drawIsoPrism(tCtx, 0, 0, 22, 18, 22, "#b07d4f", "#7f5539", "#5c3a21");
      // Multiverse Radio Box
      drawIsoPrism(tCtx, 0, -22, 16, 11, 16, "#9a3412", "#7c2d12", "#431407");
      // Glowing Cyan/Amber Dial
      drawIsoPrism(tCtx, -3, -27, 9, 2, 7, "#fde047", "#38bdf8", "#0284c7");
      // Antenna
      tCtx.strokeStyle = "#f59e0b";
      tCtx.lineWidth = 2;
      tCtx.beginPath();
      tCtx.moveTo(4, -38);
      tCtx.lineTo(10, -56);
      tCtx.stroke();
      tCtx.fillStyle = "#22d3ee";
      tCtx.beginPath();
      tCtx.arc(10, -56, 3, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.strokeStyle = INK;
      break;
    }
    case "stone_hearth": {
      drawIsoPrism(tCtx, 0, 0, 28, 18, 48, "#a8a29e", "#78716c", "#57534e");
      // Timber Mantel
      drawIsoPrism(tCtx, 0, -32, 30, 20, 5, "#9c6644", "#7f5539", "#4a2e1b");
      // Animated Hearth Flame Glow
      const fl = Math.sin((time || 0) * 7) * 2;
      tCtx.fillStyle = "#f97316";
      tCtx.beginPath();
      tCtx.arc(4, -14, 9 + fl * 0.4, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      tCtx.fillStyle = "#fef08a";
      tCtx.beginPath();
      tCtx.arc(4, -12, 5, 0, Math.PI * 2);
      tCtx.fill();
      break;
    }
    case "velvet_armchair": {
      drawIsoPrism(tCtx, 0, 0, 20, 20, 14, "#f59e0b", "#d97706", "#b45309");
      drawIsoPrism(tCtx, -8, -12, 6, 20, 22, "#fbbf24", "#d97706", "#92400e");
      drawIsoPrism(tCtx, -2, -10, 16, 5, 16, "#f59e0b", "#b45309", "#78350f");
      break;
    }
    case "memory_jars": {
      drawIsoPrism(tCtx, 0, 0, 24, 12, 50, "#7f5539", "#5c3a21", "#4a2e1b");
      const jarCols = ["#fde047", "#38bdf8", "#c084fc", "#4ade80"];
      for (let j = 0; j < 4; j++) {
        drawIsoPrism(tCtx, -10 + j * 5, -24 - (j % 2) * 14, 5, 5, 9, "#ffffff", jarCols[j], jarCols[j]);
      }
      break;
    }
    case "wooden_rings": {
      // Timber A-Frame Rig
      drawIsoPrism(tCtx, -20, 0, 4, 14, 58, "#b07d4f", "#7f5539", "#5c3a21");
      drawIsoPrism(tCtx, 10, -15, 4, 14, 58, "#b07d4f", "#7f5539", "#5c3a21");
      drawIsoPrism(tCtx, -4, -56, 24, 6, 4, "#d4a373", "#9c6644", "#5c3a21");
      // Straps & Wooden Gymnastic Rings
      tCtx.strokeStyle = INK;
      tCtx.lineWidth = 2;
      tCtx.beginPath();
      tCtx.moveTo(-10, -56);
      tCtx.lineTo(-10, -34);
      tCtx.moveTo(2, -62);
      tCtx.lineTo(2, -40);
      tCtx.stroke();
      tCtx.strokeStyle = "#d97706";
      tCtx.lineWidth = 3;
      tCtx.beginPath();
      tCtx.arc(-10, -30, 5, 0, Math.PI * 2);
      tCtx.arc(2, -36, 5, 0, Math.PI * 2);
      tCtx.stroke();
      tCtx.strokeStyle = INK;
      break;
    }
    case "stone_lantern": {
      drawIsoPrism(tCtx, 0, 0, 12, 12, 6, "#a8a29e", "#78716c", "#57534e");
      drawIsoPrism(tCtx, 0, -6, 6, 6, 18, "#d6d3d1", "#a8a29e", "#78716c");
      drawIsoPrism(tCtx, 0, -24, 11, 11, 10, "#fef08a", "#f59e0b", "#d97706");
      drawIsoPrism(tCtx, 0, -34, 16, 16, 6, "#65a30d", "#78716c", "#57534e");
      break;
    }
    case "water_basin": {
      drawIsoPrism(tCtx, 0, 0, 18, 18, 14, "#78716c", "#57534e", "#44403c");
      drawIsoTile(tCtx, 0, -13, 14, 14, "#38bdf8", INK);
      drawIsoPrism(tCtx, -8, -14, 4, 4, 22, "#84cc16", "#65a30d", "#365314");
      break;
    }
    case "pothos_vine": {
      drawIsoPrism(tCtx, 0, -18, 12, 12, 14, "#ea580c", "#c2410c", "#9a3412");
      // Cascading Vines
      const vCols = ["#365314", "#4d7c0f", "#65a30d", "#84cc16"];
      for (let v = 0; v < 7; v++) {
        tCtx.fillStyle = vCols[v % vCols.length];
        tCtx.beginPath();
        tCtx.ellipse(-8 + (v % 3) * 7, -26 + v * 5, 7, 5, 0.3, 0, Math.PI * 2);
        tCtx.fill();
        tCtx.stroke();
      }
      break;
    }
    case "book_stack": {
      drawIsoPrism(tCtx, 0, 0, 14, 12, 5, "#dc2626", "#991b1b", "#fef3c7");
      drawIsoPrism(tCtx, 0, -5, 13, 11, 5, "#0284c7", "#075985", "#fef3c7");
      drawIsoPrism(tCtx, 0, -10, 12, 10, 5, "#16a34a", "#166534", "#fef3c7");
      drawIsoPrism(tCtx, 0, -15, 5, 5, 7, "#fde68a", "#f59e0b", "#b45309");
      break;
    }
    case "arched_window": {
      drawIsoPrism(tCtx, 0, -8, 24, 4, 44, "#9c6644", "#7f5539", "#5c3a21");
      drawIsoPrism(tCtx, 0, -11, 20, 2, 38, "#fef08a", "#fde047", "#f59e0b");
      break;
    }
    case "sleepy_cat": {
      // Plush Burgundy Cushion
      drawIsoPrism(tCtx, 0, 0, 16, 16, 6, "#e11d48", "#be123c", "#881337");
      // Curled Ginger Cat
      tCtx.fillStyle = "#fb923c";
      tCtx.beginPath();
      tCtx.ellipse(0, -12, 10, 7, 0, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      tCtx.beginPath();
      tCtx.arc(-5, -15, 5.5, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
      break;
    }
    case "cherry_tree": {
      drawIsoPrism(tCtx, 0, 0, 16, 16, 16, "#9c6644", "#7f5539", "#5c3a21");
      drawIsoPrism(tCtx, 0, -16, 4, 4, 24, "#5c3a21", "#4a2e1b", "#4a2e1b");
      const sCols = ["#f472b6", "#fb7185", "#fda4af", "#fef08a"];
      for (let c = 0; c < 5; c++) {
        tCtx.fillStyle = sCols[c % sCols.length];
        tCtx.beginPath();
        tCtx.arc(Math.cos(c * 1.2) * 12, -44 + Math.sin(c * 1.2) * 7, 12, 0, Math.PI * 2);
        tCtx.fill();
        tCtx.stroke();
      }
      break;
    }
    case "town_bench": {
      drawIsoPrism(tCtx, 0, 0, 24, 12, 10, "#d4a373", "#9c6644", "#5c3a21");
      drawIsoPrism(tCtx, -6, -10, 24, 3, 14, "#b07d4f", "#7f5539", "#4a2e1b");
      break;
    }
  }
}

// Renders a Placed Sticker with Ground Shadow, Die-Cut Peel Outline, and Hover Badge
function drawPlacedSticker(tCtx, item, isSelected, isHovered) {
  const def = getStickerDef(item.type);
  tCtx.save();
  tCtx.translate(item.x, item.y);

  // Ground Contact Shadow (Except for rugs)
  if (def.layer > 0) {
    tCtx.fillStyle = "rgba(74, 46, 27, 0.28)";
    tCtx.beginPath();
    tCtx.ellipse(0, 3, def.w * 0.36, def.h * 0.16, 0, 0, Math.PI * 2);
    tCtx.fill();
  }

  if (item.flip) {
    tCtx.scale(-1, 1);
  }

  // Soft glow on the furniture under the pointer
  if (isHovered) {
    tCtx.save();
    tCtx.shadowColor = "#fde047";
    tCtx.shadowBlur = 6;
    drawIsoStickerArt(tCtx, def, state.time);
    tCtx.restore();
  }

  drawIsoStickerArt(tCtx, def, state.time);
  tCtx.restore();

  if (isHovered && def.hint) {
    // Play Mode Interactive Tooltip Pill
    tCtx.save();
    tCtx.font = "bold 10px monospace";
    const tw = tCtx.measureText(def.hint).width + 16;
    const tx = Math.max(tw / 2 + 6, Math.min(canvas.width - tw / 2 - 6, item.x));
    const ty = Math.max(24, item.y - def.h - 8);
    tCtx.fillStyle = "rgba(255, 251, 235, 0.96)";
    tCtx.strokeStyle = INK;
    tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.roundRect(tx - tw / 2, ty - 11, tw, 22, 6);
    tCtx.fill();
    tCtx.stroke();
    tCtx.fillStyle = INK;
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";
    tCtx.fillText(def.hint, tx, ty);
    tCtx.restore();
  }
}

// ─── LAYER 2: ISOMETRIC CUTAWAY TREEHOUSE ROOM CUBE RENDERER ──────────
function drawIsometricCutawayRoom(tCtx, roomId) {
  const theme = ROOM_THEMES[roomId] || ROOM_THEMES.safe_house;
  const buildingObj = state.buildings.find(b => b.id === roomId) || state.buildings[0];
  const W = canvas.width;
  const H = canvas.height;

  // 1. Golden-Hour Amber & Honey Sky Backdrop (Matching Reference Image)
  const skyGrad = tCtx.createLinearGradient(0, 0, 0, H);
  if (state.night_mode) {
    skyGrad.addColorStop(0, "#0f172a");
    skyGrad.addColorStop(0.55, "#1e1b4b");
    skyGrad.addColorStop(1, "#31102f");
  } else {
    skyGrad.addColorStop(0, "#d97706");
    skyGrad.addColorStop(0.45, "#f59e0b");
    skyGrad.addColorStop(1, "#fde68a");
  }
  tCtx.fillStyle = skyGrad;
  tCtx.fillRect(0, 0, W, H);

  // Soft Stylized Golden Cloud Billows
  tCtx.save();
  tCtx.fillStyle = state.night_mode ? "rgba(56, 189, 248, 0.08)" : "rgba(254, 243, 199, 0.28)";
  tCtx.strokeStyle = state.night_mode ? "rgba(148, 163, 184, 0.15)" : "rgba(180, 83, 9, 0.25)";
  tCtx.lineWidth = 2;
  const cloudPositions = [
    [75, 95, 52], [130, 85, 44], [420, 105, 58], [365, 90, 42],
    [65, 390, 56], [435, 385, 62]
  ];
  for (let i = 0; i < cloudPositions.length; i++) {
    const cp = cloudPositions[i];
    const drift = Math.sin(state.time * 0.4 + i) * 5;
    tCtx.beginPath();
    tCtx.arc(cp[0] + drift, cp[1], cp[2], 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();
  }
  tCtx.restore();

  // 2. Ancient Tree Trunk & Lush Canopy Cradling the Cutaway Platform
  tCtx.save();
  tCtx.strokeStyle = INK;
  tCtx.lineWidth = 2.5;
  // Massive Tree Trunk below the platform
  tCtx.fillStyle = "#6f4518";
  tCtx.beginPath();
  tCtx.moveTo(195, 370);
  tCtx.quadraticCurveTo(205, 435, 160, 494);
  tCtx.lineTo(345, 494);
  tCtx.quadraticCurveTo(295, 435, 305, 370);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Background Tree Canopy Clusters (Olive, Moss & Sunlit Lime)
  const canopyBlobs = [
    [105, 145, 62, "#365314"], [165, 92, 68, "#4d7c0f"], [250, 62, 74, "#65a30d"],
    [335, 92, 68, "#4d7c0f"], [395, 145, 62, "#365314"],
    [52, 245, 54, "#4d7c0f"], [448, 245, 54, "#4d7c0f"],
    [145, 468, 52, "#365314"], [355, 468, 52, "#365314"], [250, 482, 64, "#4d7c0f"]
  ];
  for (let i = 0; i < canopyBlobs.length; i++) {
    const b = canopyBlobs[i];
    tCtx.fillStyle = b[3];
    tCtx.beginPath();
    tCtx.arc(b[0], b[1], b[2], 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();
  }
  tCtx.restore();

  // 3. True 2:1 Orthographic Isometric Cutaway Room Box
  // Back-Center Vertex: (250, 215)
  // Left-Corner: (70, 305), Right-Corner: (430, 305), Front-Corner: (250, 395)
  const cx = 250, cy = 215;
  const span = 180; // dx = 180, dy = 90 (2:1 isometric)
  const wallH = 132;

  tCtx.save();
  tCtx.lineJoin = "round";
  tCtx.strokeStyle = INK;
  tCtx.lineWidth = 2.4;

  // Left-Back Wall
  tCtx.fillStyle = theme.wallLeft;
  tCtx.beginPath();
  tCtx.moveTo(cx, cy - wallH);
  tCtx.lineTo(cx - span, cy + span * 0.5 - wallH);
  tCtx.lineTo(cx - span, cy + span * 0.5);
  tCtx.lineTo(cx, cy);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Right-Back Wall
  tCtx.fillStyle = theme.wallRight;
  tCtx.beginPath();
  tCtx.moveTo(cx, cy - wallH);
  tCtx.lineTo(cx + span, cy + span * 0.5 - wallH);
  tCtx.lineTo(cx + span, cy + span * 0.5);
  tCtx.lineTo(cx, cy);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Timber Wainscoting Trim on Both Walls
  const trimH = 26;
  tCtx.fillStyle = theme.wainscot;
  tCtx.beginPath();
  tCtx.moveTo(cx, cy - trimH);
  tCtx.lineTo(cx - span, cy + span * 0.5 - trimH);
  tCtx.lineTo(cx - span, cy + span * 0.5);
  tCtx.lineTo(cx, cy);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  tCtx.beginPath();
  tCtx.moveTo(cx, cy - trimH);
  tCtx.lineTo(cx + span, cy + span * 0.5 - trimH);
  tCtx.lineTo(cx + span, cy + span * 0.5);
  tCtx.lineTo(cx, cy);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Isometric Oak Floor Diamond
  tCtx.fillStyle = theme.floorBase;
  tCtx.beginPath();
  tCtx.moveTo(cx, cy);
  tCtx.lineTo(cx - span, cy + span * 0.5);
  tCtx.lineTo(cx, cy + span);
  tCtx.lineTo(cx + span, cy + span * 0.5);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Parquet Floorboard Lines & Optional Isometric Sticker Snap Grid
  tCtx.strokeStyle = "rgba(74, 46, 27, 0.22)";
  tCtx.lineWidth = 1.0;
  const steps = 6;
  for (let i = 1; i < steps; i++) {
    const f = i / steps;
    // Parallel to left wall
    tCtx.beginPath();
    tCtx.moveTo(cx + span * f, cy + span * 0.5 * f);
    tCtx.lineTo(cx - span * (1 - f), cy + span * 0.5 * (1 + f));
    tCtx.stroke();
    // Parallel to right wall
    tCtx.beginPath();
    tCtx.moveTo(cx - span * f, cy + span * 0.5 * f);
    tCtx.lineTo(cx + span * (1 - f), cy + span * 0.5 * (1 + f));
    tCtx.stroke();
  }

  // Thick Timber Cutaway Platform Ledges (Front-Left and Front-Right)
  const ledgeD = 16;
  tCtx.strokeStyle = INK;
  tCtx.lineWidth = 2.2;
  tCtx.fillStyle = theme.beamColor;
  // Front-Left Ledge
  tCtx.beginPath();
  tCtx.moveTo(cx - span, cy + span * 0.5);
  tCtx.lineTo(cx, cy + span);
  tCtx.lineTo(cx, cy + span + ledgeD);
  tCtx.lineTo(cx - span, cy + span * 0.5 + ledgeD);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Front-Right Ledge
  tCtx.fillStyle = "#4a2e1b";
  tCtx.beginPath();
  tCtx.moveTo(cx, cy + span);
  tCtx.lineTo(cx + span, cy + span * 0.5);
  tCtx.lineTo(cx + span, cy + span * 0.5 + ledgeD);
  tCtx.lineTo(cx, cy + span + ledgeD);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Rustic Treehouse Wooden Ladder Climbing Up Front-Right Ledge (Like Reference Image!)
  tCtx.strokeStyle = INK;
  tCtx.lineWidth = 3;
  const lx1 = 315, ly1 = 365;
  tCtx.beginPath();
  tCtx.moveTo(lx1, ly1);
  tCtx.lineTo(lx1 - 24, ly1 + 105);
  tCtx.moveTo(lx1 + 18, ly1 - 9);
  tCtx.lineTo(lx1 - 6, ly1 + 96);
  tCtx.stroke();
  for (let r = 1; r <= 5; r++) {
    const rf = r / 6;
    tCtx.beginPath();
    tCtx.moveTo(lx1 - 24 * rf, ly1 + 105 * rf);
    tCtx.lineTo(lx1 + 18 - 24 * rf, ly1 - 9 + 105 * rf);
    tCtx.stroke();
  }

  // Roof Overhang Eaves at Top-Back Corner
  tCtx.fillStyle = theme.roofColor;
  tCtx.lineWidth = 2.2;
  tCtx.beginPath();
  tCtx.moveTo(cx, cy - wallH - 18);
  tCtx.lineTo(cx - 95, cy - wallH + 30);
  tCtx.lineTo(cx, cy - wallH + 6);
  tCtx.lineTo(cx + 95, cy - wallH + 30);
  tCtx.closePath();
  tCtx.fill();
  tCtx.stroke();

  // Trailing Green Ivy Vines Draping Over Platform Ledges
  const vinePts = [[115, 330], [130, 338], [185, 365], [355, 345], [370, 336]];
  for (let v = 0; v < vinePts.length; v++) {
    const vp = vinePts[v];
    for (let l = 0; l < 4; l++) {
      tCtx.fillStyle = l % 2 === 0 ? "#65a30d" : "#84cc16";
      tCtx.beginPath();
      tCtx.arc(vp[0] + Math.sin(l) * 3, vp[1] + l * 6, 4.5, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();
    }
  }
  tCtx.restore();

  // 4. Depth-Sorted Stickers & Chibi Gabrielle (Painter's Algorithm)
  const list = sceneStickers[roomId] || [];
  const renderables = [];

  for (let i = 0; i < list.length; i++) {
    const st = list[i];
    const def = getStickerDef(st.type);
    const sortY = (def.layer === 0 ? 0 : st.y) + (st.zBias || 0);
    renderables.push({ kind: "sticker", item: st, sortY: sortY });
  }

  // Chibi Gabrielle inside the room
  renderables.push({
    kind: "avatar",
    sortY: state.avatar.y
  });

  renderables.sort((a, b) => a.sortY - b.sortY);

  for (let i = 0; i < renderables.length; i++) {
    const r = renderables[i];
    if (r.kind === "sticker") {
      const isHov = state.hoveredStickerUid === r.item.uid;
      drawPlacedSticker(tCtx, r.item, false, isHov);
    } else {
      drawSpriteCharacter(tCtx, state.avatar.x, state.avatar.y, false);
    }
  }

  // 5. Golden-Hour Diagonal Sunbeams (God-Rays) & Floating Dust Motes
  if (!state.night_mode) {
    tCtx.save();
    const beamGrad = tCtx.createLinearGradient(140, 120, 310, 370);
    beamGrad.addColorStop(0, "rgba(254, 249, 195, 0.24)");
    beamGrad.addColorStop(0.6, "rgba(253, 224, 71, 0.10)");
    beamGrad.addColorStop(1, "rgba(253, 224, 71, 0)");
    tCtx.fillStyle = beamGrad;
    tCtx.beginPath();
    tCtx.moveTo(130, 145);
    tCtx.lineTo(225, 105);
    tCtx.lineTo(375, 345);
    tCtx.lineTo(245, 385);
    tCtx.closePath();
    tCtx.fill();

    // Warm twinkling dust motes
    tCtx.fillStyle = "rgba(254, 240, 138, 0.75)";
    for (let m = 0; m < 10; m++) {
      const mx = 165 + ((m * 37) % 180) + Math.sin(state.time * 0.8 + m) * 8;
      const my = 180 + ((m * 29) % 175) + Math.cos(state.time * 0.6 + m) * 6;
      tCtx.beginPath();
      tCtx.arc(mx, my, 1.6, 0, Math.PI * 2);
      tCtx.fill();
    }
    tCtx.restore();
  }

  // 6. Top Room Header Banner inside Canvas
  tCtx.save();
  tCtx.fillStyle = "rgba(26, 18, 11, 0.88)";
  tCtx.strokeStyle = "#f59e0b";
  tCtx.lineWidth = 1.5;
  tCtx.beginPath();
  tCtx.roundRect(125, 10, 250, 34, 8);
  tCtx.fill();
  tCtx.stroke();
  tCtx.fillStyle = "#fef3c7";
  tCtx.font = "bold 10.5px monospace";
  tCtx.textAlign = "center";
  tCtx.fillText(theme.title + " (" + buildingObj.power + "%)", 250, 23);
  tCtx.fillStyle = "#fbbf24";
  tCtx.font = "9px monospace";
  tCtx.fillText(theme.subtitle, 250, 36);
  tCtx.restore();
}

// ─── SCENE SWITCHING (OVERWORLD PLAZA <-> 5 CUTAWAY ROOM CUBES) ───────
function switchScene(sceneId) {
  state.activeScene = sceneId;
  hideRoomToast();

  // Toggle visibility between 3D WebGL Canvas and 2D Isometric/Map Canvas
  const c3d = document.getElementById("town3dCanvas");
  const c2d = document.getElementById("villageCanvas");
  const hint = document.getElementById("canvasControlHint");
  const sbHud = document.getElementById("storybook3dHud");
  if (sceneId === "town3d") {
    if (c3d) c3d.classList.remove("hidden");
    if (sbHud) sbHud.classList.remove("hidden");
    if (c2d) c2d.classList.add("hidden");
    if (hint) hint.textContent = "🎮 WASD/Click Walk • Drag Orbit 360° • Scroll Zoom • [E] Enter Room";
  } else {
    if (c3d) c3d.classList.add("hidden");
    if (sbHud) sbHud.classList.add("hidden");
    closeStorybookCard();
    if (c2d) c2d.classList.remove("hidden");
    if (hint) {
      hint.textContent = sceneId === "overworld"
        ? "🎮 Walk: WASD or click • Talk: click a villager • [E] step inside"
        : "🎮 Click furniture to interact • Press [E] to return to the village";
    }
  }

  // Update Top Scene Navigation Pill Styles
  const tabs = ["town3d", "overworld", "safe_house", "ai_academy", "tea_house", "memory_vault", "kinetic_dojo"];
  for (let i = 0; i < tabs.length; i++) {
    const t = tabs[i];
    const btn = document.getElementById("sceneTab_" + t);
    if (!btn) continue;
    if (t === sceneId) {
      btn.className = "px-2.5 py-1 rounded-lg bg-amber-500/25 text-amber-200 border border-amber-400/60 font-bold transition cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.25)]";
    } else {
      btn.className = "px-2.5 py-1 rounded-lg bg-black/40 hover:bg-amber-950/40 text-slate-300 hover:text-amber-200 border border-white/10 transition cursor-pointer flex items-center gap-1";
    }
  }

  // Position Gabrielle on the Isometric Room Floor when entering a room
  if (sceneId !== "overworld" && sceneId !== "town3d") {
    state.avatar.x = 250;
    state.avatar.y = 335;
    state.avatar.targetX = null;
    state.avatar.targetY = null;
    state.avatar.facing = "down";
  }

  playStickerSound("peel");
  updateInspector();
}

function enterActiveBuildingRoom() {
  if (activeBuilding) {
    switchScene(activeBuilding.id);
  }
}

// ─── INTERACTIVE ROOM FURNITURE ACTIONS (PLAY MODE) ───────────────────
const MANDARIN_CARDS = [
  { hanzi: "慢慢来", pinyin: "Màn màn lái", eng: "Take it slow • One step at a time." },
  { hanzi: "静心", pinyin: "Jìng xīn", eng: "Quiet the mind • Sip warm Oolong tea." },
  { hanzi: "加油", pinyin: "Jiā yóu", eng: "Add oil! • Keep building momentum." },
  { hanzi: "知行合一", pinyin: "Zhī xíng hé yī", eng: "Unity of knowledge and real action." }
];
let mandarinIdx = 0;

function showRoomToast(icon, title, text, btnLabel, btnCallback) {
  const toast = document.getElementById("roomActionToast");
  document.getElementById("roomToastIcon").textContent = icon;
  document.getElementById("roomToastTitle").textContent = title;
  document.getElementById("roomToastText").textContent = text;
  const btn = document.getElementById("roomToastActionBtn");
  if (btnLabel && btnCallback) {
    btn.textContent = btnLabel;
    btn.onclick = btnCallback;
    btn.classList.remove("hidden");
  } else {
    btn.classList.add("hidden");
  }
  toast.classList.remove("hidden");
}

function hideRoomToast() {
  const toast = document.getElementById("roomActionToast");
  if (toast) toast.classList.add("hidden");
}

function triggerStickerAction(item, def) {
  playChimeSound();
  spawnCanvasSparkBurst(item.x, item.y - 20, "#fde047");

  if (def.action === "open_radio") {
    openCommLink();
  } else if (def.action === "cycle_outfit") {
    const order = ["casual", "wearit", "streetwear", "athletic", "wireframe"];
    const next = order[(order.indexOf(state.avatar.outfit) + 1) % order.length];
    setOutfit(next);
    showRoomToast("👗", "WearIt Atelier Mirror", "Switched outfit to " + next.toUpperCase() + "! Authentic style locked.", null, null);
  } else if (def.action === "code_sprint") {
    chargeBuilding("ai_academy", 5);
    showRoomToast("💻", "Neural Academy Holo-Desk", "+5% Earned Power! Logged an AI engineering micro-sprint.", "Open Radio 📡", openCommLink);
  } else if (def.action === "prof_pydantic") {
    showRoomToast("🦉", "Professor Pydantic", "\"Expected: str. Received: pure cozy vibes! Remember: BaseModel attributes use dot notation!\"", null, null);
  } else if (def.action === "mandarin_tea") {
    const card = MANDARIN_CARDS[mandarinIdx % MANDARIN_CARDS.length];
    mandarinIdx++;
    chargeBuilding("tea_house", 5);
    showRoomToast(
      "🍵",
      "Cipher Tea House • " + card.hanzi + " (" + card.pinyin + ")",
      card.eng + " (+5% Tea House Power)",
      "🔊 Speak",
      function() {
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(card.hanzi);
          u.lang = "zh-CN";
          u.rate = 0.85;
          window.speechSynthesis.speak(u);
        }
      }
    );
  } else if (def.action === "dojo_set") {
    setOutfit("athletic");
    chargeBuilding("kinetic_dojo", 5);
    showRoomToast("🤸", "Kinetic Dojo Deck", "Switched to Dojo Athletic gear & logged a calisthenics movement set! (+5% Power)", null, null);
  } else if (def.action === "nap") {
    chargeBuilding("safe_house", 5);
    showRoomToast("🛏️", "Restorative Safe House Pause", "Anti-Guilt Rule active: Rest fuels the return. (+5% Safe House Power)", null, null);
  } else if (def.action === "pet_cat") {
    showRoomToast("🐱", "Ginger Sanctuary Cat", "Purrrrrr... *curls up warmly on the isometric cushion*", null, null);
  } else if (def.action === "stoke_fire") {
    showRoomToast("🔥", "Barangay Memory Hearth", "The golden-hour embers crackle warmly, illuminating your 3-Tier Memory jars.", null, null);
  }
}

function spawnCanvasSparkBurst(x, y, color) {
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    const spd = 0.6 + Math.random() * 1.6;
    canvasSparks.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 0.4,
      r: 1.8 + Math.random() * 2.2,
      color: color || "#fbbf24",
      alpha: 1.0,
      decay: 0.025
    });
  }
}

// ─── CANVAS POINTER HIT-TEST FOR ROOM FURNITURE, VILLAGERS & BUILDINGS ───
function findTopStickerAt(mx, my) {
  const list = sceneStickers[state.activeScene] || [];
  for (let i = list.length - 1; i >= 0; i--) {
    const st = list[i];
    const def = getStickerDef(st.type);
    const halfW = def.w * 0.48;
    const h = def.h * 0.85;
    if (mx >= st.x - halfW && mx <= st.x + halfW && my >= st.y - h && my <= st.y + 10) {
      return st;
    }
  }
  return null;
}

canvas.addEventListener("mousedown", function(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);

  // Interactive room furniture
  const hit = findTopStickerAt(mx, my);
  if (hit) {
    const def = getStickerDef(hit.type);
    if (def.action) {
      triggerStickerAction(hit, def);
      return;
    }
  }

  if (state.activeScene === "overworld") {
    // Talk to a villager, or to whoever lives in the building that was clicked
    if (typeof questNpcAt === "function") {
      const npc = questNpcAt(mx, my);
      if (npc) {
        openQuestCard(npc.id);
        return;
      }
    }
    for (let i = 0; i < state.buildings.length; i++) {
      const b = state.buildings[i];
      if (Math.hypot(mx - b.x, my - b.y) < 36) {
        if (typeof openQuestCardForPlace === "function" && openQuestCardForPlace(b.id)) return;
        switchScene(b.id);
        return;
      }
    }
  }
});

canvas.addEventListener("mousemove", function(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);

  const hit = findTopStickerAt(mx, my);
  state.hoveredStickerUid = hit ? hit.uid : null;
  const overNpc = state.activeScene === "overworld" && typeof questNpcAt === "function" && questNpcAt(mx, my);
  canvas.style.cursor = (hit || overNpc) ? "pointer" : "crosshair";
});

window.addEventListener("keydown", function(e) {
  if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
  if (e.key === "e" || e.key === "E") {
    if ((state.activeScene === "overworld" || state.activeScene === "town3d") && activeBuilding) {
      switchScene(activeBuilding.id);
    } else if (state.activeScene !== "overworld" && state.activeScene !== "town3d") {
      switchScene("overworld");
    }
  }
});
