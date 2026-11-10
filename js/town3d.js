// =========================================================================
// 🌍 THREE.JS 3D STORYBOOK LANTERN VILLAGE + OPENART .SPZ / .GLB ENGINE
// =========================================================================
const town3dCanvas = document.getElementById("town3dCanvas");
let scene3d, camera3d, renderer3d;
let builtInTownGroup, customWorldGroup, portalsGroup, clouds3dGroup, petals3dGroup;
let walkableMeshes = [];
let portalRings3d = [];
let fireflies3d = [];
let canopyClusters3d = [];
let buildingPointLights = {};
let signSprites3d = {};
let hemiLight3d, dirLight3d, plazaLight3d, petalLight3d;
let thirdPerson3D = true;
let visitedPlaces3D = [];
let currentCardBuildingId = null;

// 3D Avatar & Orbit Camera State
const av3d = {
  x: 0,
  y: 0,
  z: 18.0,
  vy: 0,
  isGrounded: true,
  targetX: null,
  targetZ: null,
  mesh: null,
  shadowMesh: null,
  storybookDoll: null,
  spriteCanvas: null,
  spriteCtx: null,
  spriteTex: null
};

const camOrbit = {
  yaw: 0.0,
  pitch: 0.28,
  dist: 9.5,
  isDragging: false,
  dragMoved: false,
  downX: 0,
  downY: 0,
  lastX: 0,
  lastY: 0
};

// Storybook Lantern Village Landmarks mapped 1-to-1 with the 5 Cultivate // Sanctuary Sectors
const BUILDINGS_3D_LAYOUT = {
  safe_house: {
    id: "safe_house",
    landmarkId: "atelier",
    storybookName: "The Little Atelier",
    storybookKind: "MAKER’S COTTAGE • SAFE HOUSE",
    storybookDesc: "A brush is still wet by the window. Someone here paints the village exactly as it looks at dusk.",
    x: -13.0, z: -10.0,
    portalX: -9.6, portalZ: -7.4,
    color: 0x34d399
  },
  ai_academy: {
    id: "ai_academy",
    landmarkId: "conservatory",
    storybookName: "Glassroot Library",
    storybookKind: "CONSERVATORY LIBRARY • NEURAL ACADEMY",
    storybookDesc: "Fern fronds press against the glass, and old stories and AI schemas sleep between the seed jars.",
    x: 0.0, z: -19.0,
    portalX: 0.0, portalZ: -14.2,
    color: 0x38bdf8
  },
  tea_house: {
    id: "tea_house",
    landmarkId: "teahouse",
    storybookName: "Stillwater Tea House",
    storybookKind: "TEA HOUSE • CIPHER PAVILION",
    storybookDesc: "A kettle murmurs behind the paper screens. The last cup of warm Oolong is always waiting for a friend.",
    x: 14.0, z: -10.0,
    portalX: 10.4, portalZ: -7.4,
    color: 0xfbbf24
  },
  memory_vault: {
    id: "memory_vault",
    landmarkId: "archive",
    storybookName: "The Mossbound Archive",
    storybookKind: "STONE ARCHIVE • MEMORY VAULT",
    storybookDesc: "Names, weather, and small forgotten promises are kept safe beneath this green old roof.",
    x: 19.0, z: 8.0,
    portalX: 14.4, portalZ: 6.1,
    color: 0xa78bfa
  },
  kinetic_dojo: {
    id: "kinetic_dojo",
    landmarkId: "pavilion",
    storybookName: "Bamboo Practice Hall",
    storybookKind: "TRAINING PAVILION • KINETIC DOJO",
    storybookDesc: "The bamboo bows in the breeze. Here, even practice begins with taking a quiet breath.",
    x: -17.0, z: 9.0,
    portalX: -12.8, portalZ: 6.8,
    color: 0xfb7185
  }
};
const BOUNTY_3D_POS = { x: -4.8, z: 5.5 };

// Storybook Geometry Helpers (from Storybook-Village-Plaza / Lantern Village)
function sbMat(color, roughness, extra) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color: color,
    roughness: roughness !== undefined ? roughness : 0.88
  }, extra || {}));
}

function sbBox(parent, name, pos, size, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sbCylinder(parent, pos, rTop, rBottom, height, mat, radial) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, height, radial || 8), mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sbRoof(parent, x, y, z, width, depth, height, mat) {
  const v = new Float32Array([
    -width / 2, 0, -depth / 2,  0, height, -depth / 2,  width / 2, 0, -depth / 2,
     width / 2, 0, -depth / 2,  0, height, -depth / 2,  0, height,  depth / 2,
     width / 2, 0, -depth / 2,  0, height,  depth / 2,  width / 2, 0,  depth / 2,
    -width / 2, 0, -depth / 2,  width / 2, 0, -depth / 2, 0, height, -depth / 2,
    -width / 2, 0,  depth / 2,  0, height,  depth / 2,  width / 2, 0,  depth / 2,
    -width / 2, 0, -depth / 2,  0, height, -depth / 2, -width / 2, 0,  depth / 2,
    -width / 2, 0,  depth / 2,  0, height, -depth / 2,  0, height,  depth / 2
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(v, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sbWindow(parent, x, y, z, width, height, frameMat, glowMat, crossbars) {
  sbBox(parent, "window light", [x, y, z], [width, height, 0.13], glowMat);
  sbBox(parent, "window frame L", [x - width / 2 - 0.06, y, z - 0.04], [0.12, height + 0.2, 0.2], frameMat);
  sbBox(parent, "window frame R", [x + width / 2 + 0.06, y, z - 0.04], [0.12, height + 0.2, 0.2], frameMat);
  sbBox(parent, "window sill", [x, y - height / 2 - 0.06, z - 0.07], [width + 0.28, 0.13, 0.28], frameMat);
  sbBox(parent, "window header", [x, y + height / 2 + 0.06, z - 0.05], [width + 0.22, 0.12, 0.2], frameMat);
  if (crossbars !== false) {
    sbBox(parent, "window mullion V", [x, y, z - 0.09], [0.07, height, 0.08], frameMat);
    sbBox(parent, "window mullion H", [x, y, z - 0.09], [width, 0.07, 0.08], frameMat);
  }
}

// ─── GLB MODEL OVERRIDES (assets/models/models.json) ──────────────────
// Each entry in models.json swaps one procedural landmark for a hand-made .glb.
// The procedural version stays in place as the fallback if a model is missing or fails.
const MODELS_3D_DIR = "assets/models/";
const modelSlots3d = {};    // slotId -> { group, body: [procedural meshes], fit: "footprint" | "height" }
const loadedModels3d = {};  // slotId -> THREE.Group holding the loaded model

function registerModelSlot3D(slotId, group, bodyChildren, fit) {
  modelSlots3d[slotId] = { group: group, body: bodyChildren, fit: fit };
}

// Bounding box of the procedural meshes in the slot group's own (unrotated) space
function modelSlotBounds3D(slot) {
  const g = slot.group;
  const savedPos = g.position.clone();
  const savedRot = g.rotation.clone();
  g.position.set(0, 0, 0);
  g.rotation.set(0, 0, 0);
  g.updateMatrixWorld(true);
  const box = new THREE.Box3();
  slot.body.forEach(function(child) { box.expandByObject(child); });
  g.position.copy(savedPos);
  g.rotation.copy(savedRot);
  g.updateMatrixWorld(true);
  return box;
}

function applyModelOverride3D(slotId, opts) {
  const slot = modelSlots3d[slotId];
  if (!slot) { console.warn("[models] Unknown slot in models.json: " + slotId); return; }
  if (!opts || !opts.file || !THREE.GLTFLoader) return;

  new THREE.GLTFLoader().load(MODELS_3D_DIR + opts.file, function(gltf) {
    const model = gltf.scene;
    const target = modelSlotBounds3D(slot);
    const tSize = target.getSize(new THREE.Vector3());
    const tCenter = target.getCenter(new THREE.Vector3());

    const mBox = new THREE.Box3().setFromObject(model);
    const mSize = mBox.getSize(new THREE.Vector3());
    const mCenter = mBox.getCenter(new THREE.Vector3());

    // Auto-fit: houses match the procedural footprint, the tree matches its height
    const byHeight = slot.fit === "height";
    const modelDim = (byHeight ? mSize.y : Math.max(mSize.x, mSize.z)) || 1;
    const targetDim = opts.size > 0 ? opts.size : (byHeight ? tSize.y : Math.max(tSize.x, tSize.z));
    const fitScale = (targetDim / modelDim) * (opts.scale > 0 ? opts.scale : 1);

    // Re-centre the model so it sits on the ground at the holder's origin
    model.position.set(-mCenter.x, -mBox.min.y, -mCenter.z);
    const holder = new THREE.Group();
    holder.name = "glb model: " + slotId;
    holder.add(model);
    holder.scale.setScalar(fitScale);
    holder.rotation.y = ((opts.rotationDeg || 0) * Math.PI) / 180;
    holder.position.set(tCenter.x + (opts.offsetX || 0), opts.offsetY || 0, tCenter.z + (opts.offsetZ || 0));

    const linearOutput = renderer3d && renderer3d.outputEncoding !== THREE.sRGBEncoding;
    model.traverse(function(child) {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      // The village renders without sRGB output, so keep model textures in the same space
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(function(m) {
        if (!m || !linearOutput) return;
        if (m.map) { m.map.encoding = THREE.LinearEncoding; m.map.needsUpdate = true; }
        if (m.emissiveMap) { m.emissiveMap.encoding = THREE.LinearEncoding; m.emissiveMap.needsUpdate = true; }
        m.needsUpdate = true;
      });
    });

    slot.body.forEach(function(child) { child.visible = false; });
    if (loadedModels3d[slotId]) slot.group.remove(loadedModels3d[slotId]);
    slot.group.add(holder);
    loadedModels3d[slotId] = holder;
  }, undefined, function() {
    console.warn("[models] Could not load " + MODELS_3D_DIR + opts.file + " for " + slotId + ". Keeping the built-in version.");
  });
}

function loadModelOverrides3D() {
  if (location.protocol === "file:") return;  // browsers block model loading from file://
  fetch(MODELS_3D_DIR + "models.json", { cache: "no-cache" })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(cfg) {
      if (!cfg || !cfg.models) return;
      Object.keys(cfg.models).forEach(function(slotId) {
        applyModelOverride3D(slotId, cfg.models[slotId]);
      });
    })
    .catch(function(err) { console.warn("[models] models.json could not be read:", err); });
}

function createStorybookHouse3D(parentGroup, cfg, bObj) {
  const g = new THREE.Group();
  g.position.set(cfg.x, 0, cfg.z);
  g.rotation.y = Math.atan2(cfg.x, cfg.z);
  parentGroup.add(g);

  const kind = cfg.landmarkId;
  const stone = sbMat("#aa9371");
  const plaster = sbMat(kind === "archive" ? "#667052" : "#d6b98a");
  const wood = sbMat("#70442f");
  const darkWood = sbMat("#4e3729");
  const roofMat = sbMat(kind === "archive" ? "#63724e" : (kind === "pavilion" ? "#85684c" : "#815044"));
  const amber = sbMat("#ffd580", 0.35, { emissive: "#bc6427", emissiveIntensity: 0.65 });

  const width = kind === "archive" ? 7.8 : 7.0;
  const depth = kind === "archive" ? 5.8 : 5.2;
  const base = sbBox(g, "stone footing", [0, 0.35, 0], [width + 0.5, 0.58, depth + 0.4], stone);

  if (kind === "conservatory") {
    // Glassroot Library / The Neural Academy
    sbBox(g, "library stone plinth", [0, 1.35, 0], [7.1, 1.8, 5.4], plaster);
    sbBox(g, "dark book wall", [0, 1.65, -2.76], [6.55, 1.05, 0.12], darkWood);
    const shelfXs = [-2.4, -0.8, 0.8, 2.4];
    const bookColors = ["#b66e4d", "#75835c", "#d4b271", "#826b86"];
    for (let sx = 0; sx < shelfXs.length; sx++) {
      const x = shelfXs[sx];
      sbBox(g, "book shelf", [x, 1.64, -2.85], [0.09, 0.95, 0.08], wood);
      for (let i = 0; i < 4; i++) {
        sbBox(g, "book", [x + (i - 1.5) * 0.29, 1.6, -2.91], [0.2, 0.52 + ((i % 2) * 0.12), 0.12], sbMat(bookColors[i]));
      }
    }
    const postXs = [-3, -1.5, 0, 1.5, 3];
    for (let px = 0; px < postXs.length; px++) {
      sbCylinder(g, [postXs[px], 2.1, 0], 0.09, 0.11, 3.2, wood, 6);
    }
    sbBox(g, "glass roof inset", [0, 3.12, 0], [6.7, 0.1, 4.9], sbMat("#a8b69a", 0.18, { transparent: true, opacity: 0.64, metalness: 0.08 }));
    const ribXs = [-3.4, -1.7, 0, 1.7, 3.4];
    for (let rx = 0; rx < ribXs.length; rx++) {
      const beam = sbBox(g, "glass roof rib", [ribXs[rx], 3.2, 0], [0.12, 0.13, 5.25], wood);
      beam.rotation.x = -0.16;
    }
    const crossZs = [-2.2, -1.1, 0, 1.1, 2.2];
    for (let cz = 0; cz < crossZs.length; cz++) {
      sbBox(g, "glass roof crosspiece", [0, 3.12, crossZs[cz]], [7, 0.12, 0.1], wood);
    }
    sbBox(g, "greenhouse sign", [0, 2.65, -2.86], [2.2, 0.4, 0.13], darkWood);
    sbWindow(g, -2.1, 1.35, -2.75, 0.62, 0.9, wood, amber, false);
    sbWindow(g,  2.1, 1.35, -2.75, 0.62, 0.9, wood, amber, false);
  } else if (kind === "teahouse") {
    // Stillwater Tea House / Cipher Tea House
    sbBox(g, "tea house walls", [0, 1.48, 0], [7, 2, 5.1], plaster);
    sbBox(g, "screen door", [0, 1.35, -2.61], [1.5, 1.7, 0.15], sbMat("#d5c19c"));
    for (let i = 0; i < 7; i++) {
      sbBox(g, "paper screen slat", [-0.62 + i * 0.2, 1.35, -2.71], [0.045, 1.55, 0.06], wood);
    }
    const vXs = [-2.55, 2.55];
    for (let vx = 0; vx < vXs.length; vx++) {
      sbBox(g, "tea veranda post", [vXs[vx], 1.45, -2.8], [0.2, 2.5, 0.2], wood);
      sbCylinder(g, [vXs[vx], 2.95, -2.9], 0.18, 0.22, 0.18, sbMat("#bd7954"), 8);
    }
    sbRoof(g, 0, 2.48, 0, 8.4, 6.5, 1.45, roofMat);
    const roofTrim = sbBox(g, "sweeping roof eave", [0, 2.52, -3.15], [8.5, 0.2, 0.22], darkWood);
    roofTrim.rotation.z = -0.04;
    const lXs = [-2.2, 2.2];
    for (let lx = 0; lx < lXs.length; lx++) {
      const x = lXs[lx];
      sbBox(g, "lantern cap", [x, 2.75, -3.02], [0.72, 0.12, 0.72], darkWood);
      const lamp = sbBox(g, "paper lantern", [x, 2.28, -3.02], [0.52, 0.72, 0.52], sbMat("#f5c66d", 0.35, { emissive: "#d47d2e", emissiveIntensity: 0.9 }));
      lamp.castShadow = false;
      sbBox(g, "lantern base", [x, 1.88, -3.02], [0.58, 0.12, 0.58], darkWood);
      sbCylinder(g, [x, 1.78, -3.02], 0.018, 0.018, 0.22, sbMat("#6c4a34"), 5);
    }
  } else if (kind === "archive") {
    // The Mossbound Archive / Barangay Memory Vault
    sbBox(g, "vault block", [0, 1.65, 0], [8.2, 2.6, 6.2], plaster);
    sbBox(g, "archive inset", [0, 1.35, -3.13], [2.45, 2, 0.15], darkWood);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.2, 7, 12, Math.PI), stone);
    arch.position.set(0, 2.3, -3.15);
    arch.rotation.z = Math.PI;
    arch.castShadow = true;
    g.add(arch);
    const pilXs = [-3.1, -2.4, 2.4, 3.1];
    for (let px = 0; px < pilXs.length; px++) {
      const x = pilXs[px];
      sbBox(g, "old stone", [x, 1.55, -3.17], [0.62, 2.7, 0.38], sbMat("#778064"));
      sbBox(g, "ivy leaf", [x * 0.9, 2.65, -3.4], [0.54, 0.32, 0.12], sbMat("#687849"));
    }
    sbBox(g, "vault door", [0, 1.3, -3.24], [1.7, 1.85, 0.17], sbMat("#514536"));
    const handle = sbCylinder(g, [0.58, 1.28, -3.36], 0.1, 0.1, 0.08, sbMat("#c79d55"), 10);
    handle.rotation.x = Math.PI / 2;
    sbRoof(g, 0, 2.95, 0, 8.8, 6.6, 0.9, roofMat);
    for (let i = 0; i < 9; i++) {
      const patch = new THREE.Mesh(new THREE.SphereGeometry(0.34 + (i % 3) * 0.06, 7, 5), sbMat("#79845b"));
      patch.position.set(-3.1 + (i * 0.79), 3.12 + (i % 2) * 0.08, -1.8 + ((i * 7) % 4));
      patch.scale.set(1.2, 0.3, 0.8);
      patch.castShadow = true;
      g.add(patch);
    }
  } else if (kind === "pavilion") {
    // Bamboo Practice Hall / The Kinetic Dojo
    sbBox(g, "hall stone deck", [0, 0.75, 0], [7.7, 0.32, 5.8], stone);
    const colXs = [-3.1, -1.55, 0, 1.55, 3.1];
    const colZs = [-2.1, 2.1];
    for (let cx = 0; cx < colXs.length; cx++) {
      for (let cz = 0; cz < colZs.length; cz++) {
        sbCylinder(g, [colXs[cx], 1.9, colZs[cz]], 0.12, 0.15, 2.3, sbMat("#9a6840"), 7);
        const joint = sbCylinder(g, [colXs[cx], 2.98, colZs[cz]], 0.17, 0.18, 0.14, sbMat("#d1ad68"), 7);
        joint.rotation.z = Math.PI / 2;
      }
    }
    sbRoof(g, 0, 3.02, 0, 8.4, 6.5, 1.05, roofMat);
    for (let i = 0; i < 6; i++) {
      const bx = -2.2 + i * 0.88;
      const bamboo = sbCylinder(g, [bx, 1.6, 0], 0.035, 0.05, 2.1, sbMat("#8d9b59"), 6);
      bamboo.rotation.x = (i - 2.5) * 0.02;
      const nodeYs = [0.95, 1.65, 2.35];
      for (let ny = 0; ny < nodeYs.length; ny++) {
        const node = sbCylinder(g, [bx, nodeYs[ny], 0], 0.065, 0.065, 0.12, sbMat("#c5ad6d"), 6);
        node.rotation.z = Math.PI / 2;
      }
    }
    const pLanternXs = [-2.2, 2.2];
    for (let lx = 0; lx < pLanternXs.length; lx++) {
      const lantern = sbBox(g, "practice hall lantern", [pLanternXs[lx], 2.15, -2.2], [0.35, 0.48, 0.35], sbMat("#f4c978", 0.42, { emissive: "#bc6427", emissiveIntensity: 0.65 }));
      lantern.castShadow = false;
    }
  } else {
    // The Little Atelier / Safe House & Atelier
    sbBox(g, "atelier walls", [0, 1.45, 0], [7, 2.2, 5.3], plaster);
    sbBox(g, "atelier door", [0, 1.17, -2.69], [1.2, 1.8, 0.16], wood);
    sbBox(g, "door inset", [0, 1.45, -2.79], [0.88, 0.93, 0.05], sbMat("#896044"));
    sbWindow(g, -2.15, 1.58, -2.69, 1.0, 1.1, wood, amber, true);
    sbWindow(g,  2.15, 1.58, -2.69, 1.0, 1.1, wood, amber, true);
    sbRoof(g, 0, 2.55, 0, 8.1, 6.2, 1.7, roofMat);
    const fXs = [-3.5, 3.5];
    for (let fx = 0; fx < fXs.length; fx++) {
      const beam = sbBox(g, "atelier roof fascia", [fXs[fx], 2.6, -1.1], [0.18, 0.2, 5.6], darkWood);
      beam.rotation.x = -0.14;
    }
    const chimney = sbBox(g, "chimney", [2.3, 3.25, 0.4], [0.8, 1.35, 0.8], stone);
    chimney.rotation.y = 0.1;
  }

  if (kind !== "conservatory" && kind !== "pavilion") {
    sbBox(g, "location sign", [0, 3.36, -3.08], [2.5, 0.43, 0.14], darkWood);
  }

  // Everything built so far is the house body, which a .glb model may replace
  registerModelSlot3D(cfg.id, g, g.children.slice(), "footprint");

  // 5 Stone Threshold Stepping Tiles joining the house to the central cobblestone plaza
  const pathMat = sbMat("#ad9674");
  for (let i = 0; i < 5; i++) {
    const stoneTile = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 1.18), pathMat);
    stoneTile.position.set(0, 0.09, -4.4 - i * 1.48);
    stoneTile.rotation.y = (i % 2 ? 0.04 : -0.04);
    stoneTile.receiveShadow = true;
    g.add(stoneTile);
  }
}

function createSignTexture3D(titleText, subText, powerPct, accentHex, isRestored) {
  const c = document.createElement("canvas");
  c.width = 280;
  c.height = 82;
  const cx = c.getContext("2d");

  cx.fillStyle = isRestored ? "rgba(244, 234, 215, 0.96)" : "rgba(42, 34, 25, 0.90)";
  cx.strokeStyle = accentHex;
  cx.lineWidth = 3.5;
  cx.beginPath();
  cx.roundRect(6, 6, 268, 70, 10);
  cx.fill();
  cx.stroke();

  cx.fillStyle = isRestored ? "#4c3929" : "#fff1d8";
  cx.font = "bold 15px Georgia, serif";
  cx.textAlign = "center";
  cx.fillText(titleText, 140, 27);

  cx.fillStyle = isRestored ? "#8c765d" : "#f1cd91";
  cx.font = "11px monospace";
  cx.fillText(subText + " • " + powerPct + "%", 140, 45);

  cx.fillStyle = "rgba(0,0,0,0.45)";
  cx.fillRect(40, 54, 200, 8);
  cx.fillStyle = accentHex;
  cx.fillRect(40, 54, Math.max(8, (200 * powerPct) / 100), 8);

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function refresh3DSignboardsAndLights() {
  if (!scene3d) return;
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    const cfg = BUILDINGS_3D_LAYOUT[b.id];
    if (!cfg) continue;
    const sp = signSprites3d[b.id];
    if (sp) {
      if (sp.material.map) sp.material.map.dispose();
      sp.material.map = createSignTexture3D(cfg.storybookName, b.short, b.power, b.sign.color, b.power >= 100);
      sp.material.needsUpdate = true;
    }
    const pt = buildingPointLights[b.id];
    if (pt) {
      pt.intensity = b.power >= 30 ? (0.7 + (b.power / 100) * 1.4) : 0.35;
    }
  }
}

function initTown3D() {
  if (!town3dCanvas || typeof THREE === "undefined") return;

  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color("#d3a778");
  scene3d.fog = new THREE.FogExp2("#d3a778", 0.0084);

  camera3d = new THREE.PerspectiveCamera(60, town3dCanvas.width / town3dCanvas.height, 0.1, 160);

  renderer3d = new THREE.WebGLRenderer({ canvas: town3dCanvas, antialias: true, powerPreference: "high-performance" });
  renderer3d.setSize(town3dCanvas.width, town3dCanvas.height);
  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer3d.shadowMap.enabled = true;
  renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer3d.toneMapping = THREE.ACESFilmicToneMapping;
  renderer3d.toneMappingExposure = 1.12;

  // Storybook Lantern Village Sunset Lighting
  hemiLight3d = new THREE.HemisphereLight("#ffedcf", "#626b4c", 1.85);
  scene3d.add(hemiLight3d);

  dirLight3d = new THREE.DirectionalLight("#ffd39a", 2.8);
  dirLight3d.position.set(-16, 25, 13);
  dirLight3d.castShadow = true;
  dirLight3d.shadow.mapSize.set(1536, 1536);
  dirLight3d.shadow.camera.left = -34;
  dirLight3d.shadow.camera.right = 34;
  dirLight3d.shadow.camera.top = 34;
  dirLight3d.shadow.camera.bottom = -34;
  dirLight3d.shadow.bias = -0.00022;
  scene3d.add(dirLight3d);

  plazaLight3d = new THREE.PointLight("#ffc16f", 1.35, 18, 1.8);
  plazaLight3d.position.set(0, 7.7, 0);
  scene3d.add(plazaLight3d);

  petalLight3d = new THREE.PointLight("#ed9f9a", 0.7, 11, 2);
  petalLight3d.position.set(-1.8, 8.5, 0.5);
  scene3d.add(petalLight3d);

  builtInTownGroup = new THREE.Group();
  customWorldGroup = new THREE.Group();
  portalsGroup = new THREE.Group();
  clouds3dGroup = new THREE.Group();
  petals3dGroup = new THREE.Group();

  scene3d.add(builtInTownGroup);
  scene3d.add(customWorldGroup);
  scene3d.add(portalsGroup);
  scene3d.add(clouds3dGroup);
  scene3d.add(petals3dGroup);

  buildProcedural3DSanctuary();
  loadModelOverrides3D();
  build3DChibiGabrielle();
  setup3DEventListeners();
}

function buildProcedural3DSanctuary() {
  // 1. Storybook Meadow Ground & Sandstone Plaza Base
  const ground = new THREE.Mesh(new THREE.CircleGeometry(35, 72), sbMat("#8c906d"));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.18;
  ground.receiveShadow = true;
  builtInTownGroup.add(ground);
  walkableMeshes.push(ground);

  const plaza = new THREE.Mesh(new THREE.CircleGeometry(25, 80), sbMat("#c2a982"));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = -0.07;
  plaza.receiveShadow = true;
  builtInTownGroup.add(plaza);
  walkableMeshes.push(plaza);

  // 2. 13 Concentric Rings of Irregular Cobblestones (from Storybook-Village-Plaza)
  const seamMat = sbMat("#a98d68");
  const cobbleMats = [sbMat("#c9b18d"), sbMat("#c4aa83"), sbMat("#cfb995"), sbMat("#bfa580")];
  for (let ring = 1; ring <= 13; ring++) {
    const r = ring * 1.75;
    const count = Math.max(10, Math.round(r * 2.8));
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2 + (ring % 2) * 0.11;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const tileMat = (i % 8 === 0) ? seamMat : cobbleMats[(ring + i) % 4];
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(0.88 + (i % 3) * 0.15, 0.1, 0.62 + ((i + ring) % 2) * 0.22),
        tileMat
      );
      tile.position.set(x, 0.02, z);
      tile.rotation.y = theta + ((i * 17) % 11) * 0.025;
      tile.receiveShadow = true;
      builtInTownGroup.add(tile);
    }
  }

  // 3. The Ancient Sacred Tree of Vision: 9 Branches + 50 Blossom & Gold Icosahedron Clusters + Golden Torus Halo
  const trunkMat = sbMat("#755137");
  const treeGroup = new THREE.Group();
  builtInTownGroup.add(treeGroup);
  const trunk = sbCylinder(treeGroup, [0, 3.3, 0], 0.62, 0.92, 6.5, trunkMat, 9);
  trunk.rotation.z = -0.08;
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const branch = sbCylinder(
      treeGroup,
      [Math.cos(angle) * 1.75, 5.8 + (i % 3) * 0.4, Math.sin(angle) * 1.4],
      0.13, 0.39, 4.4, trunkMat, 7
    );
    branch.rotation.z = Math.cos(angle) * 0.7;
    branch.rotation.x = Math.sin(angle) * 0.48;
  }

  const blossomColors = ["#edbd72", "#f1cb7e", "#e9a88d", "#f1c5a5", "#df9d8c", "#f0d28d"];
  const blossomMats = blossomColors.map((c, idx) =>
    sbMat(c, 0.78, { emissive: c, emissiveIntensity: (idx < 2 || idx === 5) ? 0.42 : 0.30 })
  );
  for (let i = 0; i < 50; i++) {
    const angle = i * 2.399;
    const radius = 2.6 + (i % 7) * 0.38;
    const y = 7.35 + ((i * 13) % 8) * 0.36 - Math.abs(radius - 3.7) * 0.12;
    const canopy = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15 + (i % 4) * 0.13, 1),
      blossomMats[i % blossomMats.length]
    );
    canopy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.8);
    canopy.scale.set(1.18, 0.77, 0.96);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    canopy.userData.sway = Math.random() * Math.PI * 2;
    treeGroup.add(canopy);
    canopyClusters3d.push(canopy);
  }

  const treeHalo = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.055, 8, 56),
    sbMat("#e8c47a", 0.36, { emissive: "#d5904c", emissiveIntensity: 0.45 })
  );
  treeHalo.rotation.x = Math.PI / 2;
  treeHalo.position.y = 8.1;
  treeGroup.add(treeHalo);
  registerModelSlot3D("tree_of_vision", treeGroup, treeGroup.children.slice(), "height");

  const gardenRing = new THREE.Mesh(new THREE.TorusGeometry(4.35, 0.14, 8, 80), sbMat("#85906a"));
  gardenRing.rotation.x = Math.PI / 2;
  gardenRing.position.y = 0.13;
  gardenRing.receiveShadow = true;
  builtInTownGroup.add(gardenRing);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), blossomMats[i % blossomMats.length]);
    petal.position.set(Math.cos(a) * 4.15, 0.16, Math.sin(a) * 4.15);
    petal.scale.set(1.4, 0.35, 0.8);
    builtInTownGroup.add(petal);
  }

  // 4. 24 Perimeter Olive & Blossom Trees Bounding the Village Commons
  const edgeFoliage = ["#737e57", "#81875c", "#96905f"].map(c => sbMat(c));
  const edgeTrunkMat = sbMat("#75563d");
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = 29.5 + (i % 3) * 1.2;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    sbCylinder(builtInTownGroup, [x, 1.2, z], 0.23, 0.36, 2.4, edgeTrunkMat, 7);
    for (let j = 0; j < 3; j++) {
      const crown = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.4 + (j % 2) * 0.28, 1),
        edgeFoliage[(i + j) % edgeFoliage.length]
      );
      crown.position.set(x + (j - 1) * 0.68, 2.5 + (j % 2) * 0.55, z + ((i + j) % 2) * 0.5);
      crown.scale.set(1.15, 0.85, 1.05);
      crown.castShadow = true;
      builtInTownGroup.add(crown);
    }
  }

  // 5. 3D Plaza Bounty Board
  const bbGroup = new THREE.Group();
  bbGroup.position.set(BOUNTY_3D_POS.x, 0, BOUNTY_3D_POS.z);
  bbGroup.rotation.y = 0.45;
  const postMat = sbMat("#684a34");
  sbCylinder(bbGroup, [-0.8, 1.1, 0], 0.11, 0.13, 2.2, postMat, 8);
  sbCylinder(bbGroup, [ 0.8, 1.1, 0], 0.11, 0.13, 2.2, postMat, 8);
  sbBox(bbGroup, "bounty board", [0, 1.45, 0], [1.8, 1.1, 0.16], sbMat("#f4ead7"));
  const bbRoof = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.55, 4), sbMat("#815044"));
  bbRoof.position.set(0, 2.25, 0);
  bbRoof.rotation.y = Math.PI / 4;
  bbGroup.add(bbRoof);
  builtInTownGroup.add(bbGroup);

  // 6. Build All 5 Storybook Houses + 10 Warm Path Streetlamps + Interactive Entry Portals
  const lampMat = sbMat("#ffda94", 0.3, { emissive: "#e39948", emissiveIntensity: 1.05 });
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    const cfg = BUILDINGS_3D_LAYOUT[b.id];
    if (!cfg) continue;

    createStorybookHouse3D(builtInTownGroup, cfg, b);

    // Twin Warm Streetlamps flanking each building's cobblestone path
    const angle = Math.atan2(cfg.x, cfg.z);
    const sides = [-1, 1];
    for (let s = 0; s < sides.length; s++) {
      const side = sides[s];
      const lx = cfg.x + Math.sin(angle + side * 0.45) * 5.2;
      const lz = cfg.z + Math.cos(angle + side * 0.45) * 5.2;
      sbCylinder(builtInTownGroup, [lx, 1.15, lz], 0.09, 0.13, 2.3, postMat, 7);
      sbBox(builtInTownGroup, "lantern housing", [lx, 2.32, lz], [0.42, 0.52, 0.42], lampMat);
      const roofCap = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.23, 4), postMat);
      roofCap.position.set(lx, 2.7, lz);
      roofCap.rotation.y = Math.PI / 4;
      builtInTownGroup.add(roofCap);
      const lLight = new THREE.PointLight("#ffbc69", 0.5, 7);
      lLight.position.set(lx, 2.2, lz);
      builtInTownGroup.add(lLight);
    }

    // Sector Warm Lantern PointLight
    const pLight = new THREE.PointLight(cfg.color, b.power >= 30 ? 1.1 : 0.4, 12);
    pLight.position.set(cfg.portalX, 2.6, cfg.portalZ);
    scene3d.add(pLight);
    buildingPointLights[b.id] = pLight;

    // Interactive 3D Entry Portal Ring on the Cobblestone Threshold
    const pRingGeo = new THREE.RingGeometry(1.15, 1.5, 28);
    const pRingMat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const pRing = new THREE.Mesh(pRingGeo, pRingMat);
    pRing.rotation.x = -Math.PI / 2;
    pRing.position.set(cfg.portalX, 0.16, cfg.portalZ);
    pRing.userData = { buildingId: b.id };
    portalsGroup.add(pRing);
    portalRings3d.push(pRing);

    // Floating 3D Storybook Signboard Sprite above Portal
    const signTex = createSignTexture3D(cfg.storybookName, b.short, b.power, b.sign.color, b.power >= 100);
    const signMat = new THREE.SpriteMaterial({ map: signTex, transparent: true });
    const signSprite = new THREE.Sprite(signMat);
    signSprite.position.set(cfg.portalX, 4.1, cfg.portalZ);
    signSprite.scale.set(4.8, 1.4, 1);
    portalsGroup.add(signSprite);
    signSprites3d[b.id] = signSprite;
  }

  // 7. 24 Drifting Golden Fireflies in the Sunset Air
  const fireflyMat = new THREE.MeshBasicMaterial({ color: "#ffe8a2" });
  for (let i = 0; i < 24; i++) {
    const fly = new THREE.Mesh(new THREE.SphereGeometry(0.06 + (i % 3) * 0.015, 6, 6), fireflyMat);
    fly.position.set(
      Math.sin(i * 6.7) * (6 + (i % 8)),
      1.1 + (i % 6) * 0.62,
      Math.cos(i * 4.3) * (5 + (i % 9))
    );
    fly.userData.sway = i * 3.1;
    builtInTownGroup.add(fly);
    fireflies3d.push(fly);
  }

  // 8. Falling 3D Sakura Petals
  const petalGeo = new THREE.PlaneGeometry(0.22, 0.14);
  const petalMat = new THREE.MeshBasicMaterial({ color: 0xf9a8d4, side: THREE.DoubleSide });
  for (let p = 0; p < 36; p++) {
    const pm = new THREE.Mesh(petalGeo, petalMat);
    pm.position.set(
      (Math.random() - 0.5) * 28,
      1 + Math.random() * 11,
      (Math.random() - 0.5) * 28
    );
    pm.userData = {
      vy: 0.02 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2
    };
    petals3dGroup.add(pm);
  }
}

// ─── 3D CHIBI GABRIELLE HD-2D BILLBOARD CHARACTER RIG ─────────────────
function build3DChibiGabrielle() {
  av3d.spriteCanvas = document.createElement("canvas");
  av3d.spriteCanvas.width = 128;
  av3d.spriteCanvas.height = 160;
  av3d.spriteCtx = av3d.spriteCanvas.getContext("2d");

  av3d.spriteTex = new THREE.CanvasTexture(av3d.spriteCanvas);
  av3d.spriteTex.minFilter = THREE.LinearFilter;

  const charGeo = new THREE.PlaneGeometry(2.5, 3.1);
  const charMat = new THREE.MeshBasicMaterial({
    map: av3d.spriteTex,
    transparent: true,
    alphaTest: 0.08,
    side: THREE.DoubleSide
  });
  av3d.mesh = new THREE.Mesh(charGeo, charMat);
  av3d.mesh.position.set(av3d.x, 1.55, av3d.z);
  scene3d.add(av3d.mesh);

  // Soft 3D Ground Contact Shadow Disc
  const shGeo = new THREE.CircleGeometry(0.75, 20);
  const shMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38 });
  av3d.shadowMesh = new THREE.Mesh(shGeo, shMat);
  av3d.shadowMesh.rotation.x = -Math.PI / 2;
  av3d.shadowMesh.position.set(av3d.x, 0.12, av3d.z);
  scene3d.add(av3d.shadowMesh);
}

function update3DChibiGabrielleTexture() {
  if (!av3d.spriteCtx) return;
  const sCtx = av3d.spriteCtx;
  sCtx.clearRect(0, 0, 128, 160);
  sCtx.save();
  sCtx.translate(64, 142);
  sCtx.scale(2.05, 2.05);
  drawSpriteCharacter(sCtx, 0, 0, false);
  sCtx.restore();
  av3d.spriteTex.needsUpdate = true;
}

function toggle3DCameraPerspective() {
  thirdPerson3D = !thirdPerson3D;
  const btn = document.getElementById("cameraModeToggleBtn");
  if (btn) {
    btn.textContent = thirdPerson3D ? "🚶‍♀️ View: Third Person" : "👁️ View: First Person";
  }
  if (av3d.mesh) av3d.mesh.visible = thirdPerson3D;
  if (av3d.shadowMesh) av3d.shadowMesh.visible = thirdPerson3D;
}

function resetAvatarToPlaza() {
  av3d.x = 0;
  av3d.z = 18.0;
  av3d.y = 0.05;
  av3d.targetX = null;
  av3d.targetZ = null;
  camOrbit.yaw = 0;
  camOrbit.pitch = thirdPerson3D ? 0.28 : 0.0;
}

function openStorybookCard(bId) {
  const cfg = BUILDINGS_3D_LAYOUT[bId];
  if (!cfg) return;
  currentCardBuildingId = bId;
  if (!visitedPlaces3D.includes(bId)) {
    visitedPlaces3D.push(bId);
    const countEl = document.getElementById("placesFoundCount");
    if (countEl) countEl.textContent = String(visitedPlaces3D.length);
  }
  document.getElementById("sbCardEyebrow").textContent = cfg.storybookKind;
  document.getElementById("sbCardTitle").textContent = cfg.storybookName;
  document.getElementById("sbCardDesc").textContent = cfg.storybookDesc;
  document.getElementById("storybookCardModal").classList.remove("hidden");
  playChimeSound();
}

function closeStorybookCard() {
  document.getElementById("storybookCardModal").classList.add("hidden");
}

function enterRoomFromStorybookCard() {
  const targetId = currentCardBuildingId || (activeBuilding && activeBuilding.id);
  closeStorybookCard();
  if (targetId) {
    switchScene(targetId);
  }
}

// ─── 3D CAMERA ORBIT, CLICK-TO-WALK & DRAG-AND-DROP LISTENERS ─────────
const raycaster3d = new THREE.Raycaster();
const mouse3d = new THREE.Vector2();

function setup3DEventListeners() {
  if (!town3dCanvas) return;

  town3dCanvas.addEventListener("mousedown", function(e) {
    camOrbit.isDragging = true;
    camOrbit.dragMoved = false;
    camOrbit.downX = e.clientX;
    camOrbit.downY = e.clientY;
    camOrbit.lastX = e.clientX;
    camOrbit.lastY = e.clientY;
  });

  window.addEventListener("mousemove", function(e) {
    if (!camOrbit.isDragging) return;
    const dx = e.clientX - camOrbit.lastX;
    const dy = e.clientY - camOrbit.lastY;
    if (Math.hypot(e.clientX - camOrbit.downX, e.clientY - camOrbit.downY) > 5) {
      camOrbit.dragMoved = true;
    }
    camOrbit.yaw -= dx * 0.0065;
    if (thirdPerson3D) {
      camOrbit.pitch = Math.max(0.12, Math.min(1.15, camOrbit.pitch + dy * 0.0055));
    } else {
      camOrbit.pitch = Math.max(-0.55, Math.min(0.45, camOrbit.pitch - dy * 0.0045));
    }
    camOrbit.lastX = e.clientX;
    camOrbit.lastY = e.clientY;
  });

  window.addEventListener("mouseup", function(e) {
    if (!camOrbit.isDragging) return;
    const wasClick = !camOrbit.dragMoved && e.target === town3dCanvas;
    camOrbit.isDragging = false;

    if (wasClick && state.activeScene === "town3d") {
      const rect = town3dCanvas.getBoundingClientRect();
      mouse3d.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse3d.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster3d.setFromCamera(mouse3d, camera3d);

      // First check if clicked directly on a 3D Portal Ring
      const portalHits = raycaster3d.intersectObjects(portalRings3d, true);
      if (portalHits.length > 0) {
        const bId = portalHits[0].object.userData.buildingId;
        if (bId) {
          openStorybookCard(bId);
          return;
        }
      }

      // Otherwise raycast against walkable 3D terrain (including imported OpenArt .glb mesh!)
      const hits = raycaster3d.intersectObjects(walkableMeshes, true);
      if (hits.length > 0) {
        const pt = hits[0].point;
        av3d.targetX = pt.x;
        av3d.targetZ = pt.z;
      }
    }
  });

  town3dCanvas.addEventListener("wheel", function(e) {
    e.preventDefault();
    camOrbit.dist = Math.max(4.5, Math.min(36, camOrbit.dist + e.deltaY * 0.015));
  }, { passive: false });

  // Spacebar Jump in 3D Town
  window.addEventListener("keydown", function(e) {
    if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (e.code === "Space" && state.activeScene === "town3d" && !nearBountyBoard) {
      if (av3d.isGrounded) {
        av3d.vy = 0.22;
        av3d.isGrounded = false;
      }
    }
  });

  // Drag and Drop .spz / .glb / .ply files directly onto the canvas container
  const container = town3dCanvas.parentElement;
  const dropOverlay = document.getElementById("drop3dOverlay");
  if (container) {
    container.addEventListener("dragover", function(e) {
      e.preventDefault();
      if (dropOverlay) dropOverlay.classList.remove("hidden");
    });
    container.addEventListener("dragleave", function(e) {
      e.preventDefault();
      if (dropOverlay) dropOverlay.classList.add("hidden");
    });
    container.addEventListener("drop", function(e) {
      e.preventDefault();
      if (dropOverlay) dropOverlay.classList.add("hidden");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        loadOpenArtFileObject(e.dataTransfer.files[0]);
      }
    });
  }
}

// ─── 3D KINEMATIC UPDATE & RENDER LOOP ────────────────────────────────
const downRaycaster3d = new THREE.Raycaster();
const downDir3d = new THREE.Vector3(0, -1, 0);

function updateAndRenderTown3D() {
  if (!scene3d || !renderer3d) return;

  // Sync Sunset Golden-Hour vs Starlight Night Lighting & Fog
  const targetBg = state.night_mode ? 0x0d1322 : 0xd3a778;
  scene3d.background.setHex(targetBg);
  if (state.fog_enabled) {
    scene3d.fog.color.setHex(targetBg);
    scene3d.fog.density = state.night_mode ? 0.014 : 0.0084;
  } else {
    scene3d.fog.density = 0.0;
  }
  hemiLight3d.intensity = state.night_mode ? 0.35 : 1.85;
  dirLight3d.intensity = state.night_mode ? 0.35 : 2.8;
  plazaLight3d.intensity = state.night_mode ? 2.2 : 1.35;

  // Camera-Relative WASD Movement in 3D
  const av = state.avatar;
  let moveForward = 0;
  let moveRight = 0;
  if (keys["w"] || keys["arrowup"]) moveForward += 1;
  if (keys["s"] || keys["arrowdown"]) moveForward -= 1;
  if (keys["d"] || keys["arrowright"]) moveRight += 1;
  if (keys["a"] || keys["arrowleft"]) moveRight -= 1;

  const speed3d = 0.135;
  let vx = 0, vz = 0;

  if (moveForward !== 0 || moveRight !== 0) {
    av3d.targetX = null;
    av3d.targetZ = null;
    const forwardX = -Math.sin(camOrbit.yaw);
    const forwardZ = -Math.cos(camOrbit.yaw);
    const rightX = Math.cos(camOrbit.yaw);
    const rightZ = -Math.sin(camOrbit.yaw);

    vx = (forwardX * moveForward + rightX * moveRight);
    vz = (forwardZ * moveForward + rightZ * moveRight);
    const len = Math.hypot(vx, vz) || 1;
    vx = (vx / len) * speed3d;
    vz = (vz / len) * speed3d;

    if (Math.abs(moveRight) > Math.abs(moveForward)) {
      av.facing = moveRight > 0 ? "right" : "left";
    } else {
      av.facing = moveForward > 0 ? "up" : "down";
    }
  } else if (av3d.targetX !== null && av3d.targetZ !== null) {
    const dx = av3d.targetX - av3d.x;
    const dz = av3d.targetZ - av3d.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.25) {
      vx = (dx / dist) * speed3d;
      vz = (dz / dist) * speed3d;
      if (Math.abs(dx) > Math.abs(dz)) {
        av.facing = dx > 0 ? "right" : "left";
      } else {
        av.facing = dz > 0 ? "down" : "up";
      }
    } else {
      av3d.targetX = null;
      av3d.targetZ = null;
    }
  }

  if (vx !== 0 || vz !== 0) {
    av3d.x += vx;
    av3d.z += vz;
    const rad = Math.hypot(av3d.x, av3d.z);
    if (rad > 25.5) {
      av3d.x *= 25.5 / rad;
      av3d.z *= 25.5 / rad;
    }
    av.isMoving = true;
    av.walkTick += 0.09;
  } else {
    av.isMoving = false;
    av.idleTick += 0.02;
  }

  // Sync 2D coordinates so HUD telemetry stays synchronized
  av.x = Math.round(250 + av3d.x * 8.0);
  av.y = Math.round(248 + av3d.z * 8.0);

  // Raycast Downward onto Walkable 3D Terrain / Imported OpenArt .GLB Mesh
  let groundY = 0.04;
  if (walkableMeshes.length > 0) {
    downRaycaster3d.set(new THREE.Vector3(av3d.x, 35, av3d.z), downDir3d);
    const hits = downRaycaster3d.intersectObjects(walkableMeshes, true);
    if (hits.length > 0) {
      groundY = hits[0].point.y;
    }
  }

  // Vertical Jump & Gravity Physics
  if (!av3d.isGrounded || av3d.y > groundY) {
    av3d.y += av3d.vy;
    av3d.vy -= 0.012;
    if (av3d.y <= groundY) {
      av3d.y = groundY;
      av3d.vy = 0;
      av3d.isGrounded = true;
    }
  } else {
    av3d.y = groundY;
  }

  // Update 3D Chibi Gabrielle Billboard Position & Orientation
  if (av3d.mesh) {
    av3d.mesh.visible = thirdPerson3D;
    update3DChibiGabrielleTexture();
    av3d.mesh.position.set(av3d.x, av3d.y + 1.45, av3d.z);
    av3d.mesh.rotation.y = camOrbit.yaw;
  }
  if (av3d.shadowMesh) {
    av3d.shadowMesh.visible = thirdPerson3D;
    av3d.shadowMesh.position.set(av3d.x, groundY + 0.06, av3d.z);
  }

  // Check 3D Proximity to Storybook Houses / Portals & Bounty Board
  nearBountyBoard = Math.hypot(av3d.x - BOUNTY_3D_POS.x, av3d.z - BOUNTY_3D_POS.z) < 2.8;
  let foundB = null;
  let bestDist = 999;
  for (let i = 0; i < state.buildings.length; i++) {
    const b = state.buildings[i];
    const cfg = BUILDINGS_3D_LAYOUT[b.id];
    if (!cfg) continue;
    const dPortal = Math.hypot(av3d.x - cfg.portalX, av3d.z - cfg.portalZ);
    const dHouse = Math.hypot(av3d.x - cfg.x, av3d.z - cfg.z);
    const dMin = Math.min(dPortal, dHouse - 2.2);
    if (dMin < 4.5 && dMin < bestDist) {
      bestDist = dMin;
      foundB = b;
    }
  }
  if (foundB !== activeBuilding || nearBountyBoard) {
    activeBuilding = foundB;
    const titleEl = document.getElementById("activeSectorTitle");
    const powerEl = document.getElementById("activeSectorPower");
    const descEl = document.getElementById("activeSectorDesc");
    const promptEl = document.getElementById("sectorPrompt");
    if (nearBountyBoard) {
      titleEl.textContent = "📋 THE BOUNTY BOARD (PLAZA)";
      powerEl.textContent = "QUESTS ACTIVE";
      powerEl.className = "px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30";
      descEl.textContent = "3D Village bulletin board with parchment habit bounties. Click or press Space to inspect!";
      promptEl.textContent = "📋 Bounty Board [Press Space]";
    } else if (activeBuilding) {
      const cfg = BUILDINGS_3D_LAYOUT[activeBuilding.id];
      titleEl.textContent = cfg ? (cfg.storybookName + " • " + activeBuilding.short) : activeBuilding.name;
      powerEl.textContent = activeBuilding.power >= 100 ? "100% RESTORED" : (activeBuilding.power >= 30 ? (activeBuilding.power + "% BLUEPRINT") : (activeBuilding.power + "% DORMANT"));
      descEl.textContent = cfg ? cfg.storybookDesc : activeBuilding.desc;
      promptEl.textContent = "✨ Step inside " + (cfg ? cfg.storybookName : activeBuilding.short) + " [E]";
      if (!visitedPlaces3D.includes(activeBuilding.id)) {
        visitedPlaces3D.push(activeBuilding.id);
        const countEl = document.getElementById("placesFoundCount");
        if (countEl) countEl.textContent = String(visitedPlaces3D.length);
      }
    } else {
      const tp = state.tree_power || 35;
      titleEl.textContent = "🏮 LANTERN VILLAGE COMMONS";
      powerEl.textContent = "STORYBOOK 3D (" + tp + "%)";
      descEl.textContent = "Somewhere, unhurried. Follow the lanterns across the 13-ring cobblestone plaza to discover all 5 sanctuaries.";
      promptEl.textContent = "🌳 Tree of Vision Commons";
    }
    updateInspector();
  }
  document.getElementById("legStateTag").textContent = av.isMoving ? "Wandering" : (av3d.isGrounded ? "Unhurried" : "Jumping!");

  // Animate Portal Rings, Fireflies, and Falling 3D Sakura Petals
  for (let i = 0; i < portalRings3d.length; i++) {
    const r = portalRings3d[i];
    const isCurrent = activeBuilding && r.userData.buildingId === activeBuilding.id;
    const pulse = isCurrent ? (1.18 + Math.sin(state.time * 5) * 0.12) : (1.0 + Math.sin(state.time * 2 + i) * 0.04);
    r.scale.set(pulse, pulse, 1);
  }

  for (let i = 0; i < fireflies3d.length; i++) {
    const fly = fireflies3d[i];
    fly.position.y += Math.sin(state.time * 1.3 + fly.userData.sway) * 0.0022;
  }

  for (let i = 0; i < petals3dGroup.children.length; i++) {
    const pm = petals3dGroup.children[i];
    pm.position.y -= pm.userData.vy;
    pm.position.x += Math.sin(state.time + pm.userData.phase) * 0.015;
    pm.rotation.x += 0.02;
    pm.rotation.y += 0.03;
    if (pm.position.y < 0.1) {
      pm.position.y = 11.5;
    }
  }

  // First-Person vs Third-Person Camera Positioning (from Storybook-Village-Plaza)
  if (thirdPerson3D) {
    const camX = av3d.x + Math.sin(camOrbit.yaw) * Math.cos(camOrbit.pitch) * camOrbit.dist;
    const camY = av3d.y + Math.sin(camOrbit.pitch) * camOrbit.dist + 1.4;
    const camZ = av3d.z + Math.cos(camOrbit.yaw) * Math.cos(camOrbit.pitch) * camOrbit.dist;
    camera3d.position.set(camX, camY, camZ);
    camera3d.lookAt(av3d.x, av3d.y + 1.35, av3d.z);
  } else {
    camera3d.position.set(av3d.x, av3d.y + 1.72, av3d.z);
    camera3d.rotation.order = "YXZ";
    camera3d.rotation.set(camOrbit.pitch, camOrbit.yaw, 0);
  }

  renderer3d.render(scene3d, camera3d);
}

// ─── MODAL 4: OPENART 3D WORLD IMPORTER & PRESET PROMPTS ──────────────
const OPENART_PRESETS = {
  plaza: "Cozy sunlit Ghibli village courtyard at golden hour, warm cobblestone central plaza with an ancient glowing cherry blossom tree in the center, surrounded by warm timber cottages with terracotta roofs, wooden bridges over a crystal stream, lush stylized greenery, warm amber sunlight, walkable ground plane.",
  safe_house: "Cozy 3D Ghibli treehouse loft studio and fashion atelier at golden hour, warm oak timber floors, arched window streaming honey sunlight, canopy reading bed with terracotta quilt, wooden garment rack and full-length mirror, potted trailing pothos vines, warm lived-in sanctuary.",
  academy: "Sunlit octagonal botanical conservatory and AI study library at golden hour, warm wood and brass architecture, glowing holographic monitors on a handcrafted oak desk, floor-to-ceiling apothecary bookshelves, cyber-bonsai planter, warm cozy scholar sanctuary.",
  tea_house: "Serene open-air Japanese timber tea house pavilion at golden hour, glowing amber paper lanterns, low wooden chabudai table with steaming oolong teapot and woven tatami cushions, bamboo shoji screens, cherry blossom branches overhanging a tranquil pond."
};

function openOpenArtModal() {
  document.getElementById("openArtModal").classList.remove("hidden");
}

function closeOpenArtModal() {
  document.getElementById("openArtModal").classList.add("hidden");
}

function setOpenArtPreset(key) {
  const box = document.getElementById("openArtPromptBox");
  if (box && OPENART_PRESETS[key]) {
    box.value = OPENART_PRESETS[key];
  }
}

function copyOpenArtPrompt() {
  const box = document.getElementById("openArtPromptBox");
  if (!box) return;
  navigator.clipboard.writeText(box.value);
  const btn = document.getElementById("copyOpenArtPromptBtn");
  btn.textContent = "✓ Copied!";
  setTimeout(() => { btn.textContent = "📋 Copy 3D World Prompt"; }, 1800);
}

function handleOpenArtWorldUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  loadOpenArtFileObject(file);
}

function loadOpenArtFileObject(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const url = URL.createObjectURL(file);
  const badge = document.getElementById("openArtStatusBadge");
  if (badge) badge.textContent = "Loading " + file.name + "...";

  while (customWorldGroup.children.length > 0) {
    customWorldGroup.remove(customWorldGroup.children[0]);
  }

  if (ext === "glb" || ext === "gltf") {
    const loader = new THREE.GLTFLoader();
    loader.load(url, function(gltf) {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const normScale = 38 / maxDim;
      model.scale.setScalar(normScale);
      model.position.set(-center.x * normScale, -box.min.y * normScale, -center.z * normScale);

      model.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          walkableMeshes.push(child);
        }
      });

      model.userData.baseScale = normScale;
      customWorldGroup.add(model);

      const hideCheck = document.getElementById("hideBuiltInMeshCheck");
      if (hideCheck) hideCheck.checked = true;
      updateOpenArtTransform();

      if (badge) badge.textContent = "✓ Loaded: " + file.name;
      switchScene("town3d");
      closeOpenArtModal();
      showRoomToast("🌐", "OpenArt 3D World Loaded!", "Walking inside " + file.name + "! Use WASD/Click to explore & drag to orbit.", null, null);
    });
  } else if (ext === "spz") {
    const reader = new FileReader();
    reader.onload = function(ev) {
      parseAndRenderSPZArrayBuffer(ev.target.result, file.name);
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === "ply") {
    const loader = new THREE.PLYLoader();
    loader.load(url, function(geometry) {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const normScale = 38 / maxDim;

      const mat = new THREE.PointsMaterial({
        size: 0.14,
        vertexColors: geometry.hasAttribute("color")
      });
      if (!geometry.hasAttribute("color")) {
        mat.color = new THREE.Color(0xfde68a);
      }

      const points = new THREE.Points(geometry, mat);
      points.scale.setScalar(normScale);
      points.position.set(-center.x * normScale, -box.min.y * normScale, -center.z * normScale);
      points.userData.baseScale = normScale;
      customWorldGroup.add(points);

      const hideCheck = document.getElementById("hideBuiltInMeshCheck");
      if (hideCheck) hideCheck.checked = true;
      updateOpenArtTransform();

      if (badge) badge.textContent = "✓ Loaded PLY: " + file.name;
      switchScene("town3d");
      closeOpenArtModal();
      showRoomToast("🌐", "OpenArt 3D Point Cloud Loaded!", "Exploring " + file.name + " in 3D!", null, null);
    });
  }
}

function updateOpenArtTransform() {
  const scaleSlider = document.getElementById("openArtScaleSlider");
  const ySlider = document.getElementById("openArtYOffsetSlider");
  const hideBuiltIn = document.getElementById("hideBuiltInMeshCheck");
  const showPortals = document.getElementById("show3dPortalsCheck");

  const mult = scaleSlider ? parseFloat(scaleSlider.value) : 1.0;
  const yOff = ySlider ? parseFloat(ySlider.value) : 0.0;

  const sVal = document.getElementById("openArtScaleVal");
  if (sVal) sVal.textContent = mult.toFixed(1) + "x";
  const yVal = document.getElementById("openArtYOffsetVal");
  if (yVal) yVal.textContent = yOff.toFixed(1);

  for (let i = 0; i < customWorldGroup.children.length; i++) {
    const obj = customWorldGroup.children[i];
    const base = obj.userData.baseScale || 1;
    obj.scale.setScalar(base * mult);
    obj.position.y = yOff;
  }

  if (builtInTownGroup && hideBuiltIn) {
    builtInTownGroup.visible = !hideBuiltIn.checked;
  }
  if (portalsGroup && showPortals) {
    portalsGroup.visible = showPortals.checked;
  }
}

function resetToBuiltIn3DTown() {
  while (customWorldGroup.children.length > 0) {
    customWorldGroup.remove(customWorldGroup.children[0]);
  }
  const hideCheck = document.getElementById("hideBuiltInMeshCheck");
  if (hideCheck) hideCheck.checked = false;
  if (builtInTownGroup) builtInTownGroup.visible = true;
  const badge = document.getElementById("openArtStatusBadge");
  if (badge) badge.textContent = "Storybook 3D Village Active";
  resetAvatarToPlaza();
}

// ─── NATIVE .SPZ GAUSSIAN SPLAT DECOMPRESSOR & 3D MODULAR KIT SLICER ───
// Native .SPZ (Niantic / World Labs Gzipped Gaussian Splat v2) Parser & 3D Renderer
async function parseAndRenderSPZArrayBuffer(arrayBuffer, labelName) {
  const badge = document.getElementById("openArtStatusBadge");
  try {
    if (badge) badge.textContent = "Decompressing " + labelName + "...";
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(arrayBuffer));
    writer.close();
    const decompressedBuf = await new Response(ds.readable).arrayBuffer();
    const bytes = new Uint8Array(decompressedBuf);
    const view = new DataView(decompressedBuf);

    const magic = view.getUint32(0, true);
    if (magic !== 0x5053474e) {
      throw new Error("Invalid SPZ magic header");
    }
    const version = view.getUint32(4, true);
    const numPoints = view.getUint32(8, true);
    const shDeg = bytes[12];
    const fracBits = bytes[13];
    const scaleDiv = Math.pow(2, fracBits);

    const posOffset = 16;
    const alphaOffset = 16 + numPoints * 9;
    const colorOffset = alphaOffset + numPoints;

    // Subsample if > 400,000 points so WebGL maintains 60 FPS
    const stride = numPoints > 450000 ? Math.ceil(numPoints / 350000) : 1;
    const estCount = Math.ceil(numPoints / stride);
    const positions = new Float32Array(estCount * 3);
    const colors = new Float32Array(estCount * 3);

    const C0 = 0.28209479177387814;
    const worldScale = 4.2; // Maps SPZ meters to Sanctuary 3D Town units
    let outIdx = 0;

    for (let i = 0; i < numPoints; i += stride) {
      const alpha = bytes[alphaOffset + i];
      if (alpha < 40) continue;

      const p = posOffset + i * 9;
      let xr = bytes[p] | (bytes[p + 1] << 8) | (bytes[p + 2] << 16);
      if (xr & 0x800000) xr -= 0x1000000;
      let yr = bytes[p + 3] | (bytes[p + 4] << 8) | (bytes[p + 5] << 16);
      if (yr & 0x800000) yr -= 0x1000000;
      let zr = bytes[p + 6] | (bytes[p + 7] << 8) | (bytes[p + 8] << 16);
      if (zr & 0x800000) zr -= 0x1000000;

      const rawX = xr / scaleDiv;
      const rawY = yr / scaleDiv;
      const rawZ = zr / scaleDiv;

      // Filter extreme distant sky outliers so the courtyard is crisp
      if (Math.abs(rawX) > 28 || rawY < -24 || rawY > 1.3 || rawZ < -18 || rawZ > 26) continue;

      // Convert RDF (+Y down, +Z forward) to Three.js (+Y up, centered on Tree of Vision)
      positions[outIdx * 3]     = rawX * worldScale;
      positions[outIdx * 3 + 1] = (0.72 - rawY) * worldScale;
      positions[outIdx * 3 + 2] = (2.6 - rawZ) * worldScale;

      const c = colorOffset + i * 3;
      colors[outIdx * 3]     = Math.min(1, Math.max(0, 0.5 + C0 * ((bytes[c] / 255.0 - 0.5) / 0.15)));
      colors[outIdx * 3 + 1] = Math.min(1, Math.max(0, 0.5 + C0 * ((bytes[c + 1] / 255.0 - 0.5) / 0.15)));
      colors[outIdx * 3 + 2] = Math.min(1, Math.max(0, 0.5 + C0 * ((bytes[c + 2] / 255.0 - 0.5) / 0.15)));
      outIdx++;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.subarray(0, outIdx * 3), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors.subarray(0, outIdx * 3), 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });

    while (customWorldGroup.children.length > 0) {
      customWorldGroup.remove(customWorldGroup.children[0]);
    }

    const cloud = new THREE.Points(geo, mat);
    cloud.userData.baseScale = 1.0;
    customWorldGroup.add(cloud);

    const hideCheck = document.getElementById("hideBuiltInMeshCheck");
    if (hideCheck) hideCheck.checked = true;
    updateOpenArtTransform();

    if (badge) badge.textContent = "✓ SPZ Active (" + outIdx.toLocaleString() + " splats)";
    switchScene("town3d");
    closeOpenArtModal();
    showRoomToast("🌐", "OpenArt .SPZ 3D World Loaded!", "Rendered " + outIdx.toLocaleString() + " Gaussian splats from " + labelName + "! Walk around & explore.", null, null);
  } catch (err) {
    console.error("SPZ Load Error:", err);
    if (badge) badge.textContent = "⚠️ SPZ Load Error";
  }
}

async function loadBundledOpenArtSpz() {
  const badge = document.getElementById("openArtStatusBadge");
  if (badge) badge.textContent = "Fetching Courtyard .SPZ...";
  try {
    const resp = await fetch("openart_sanctuary_courtyard.spz");
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const buf = await resp.arrayBuffer();
    await parseAndRenderSPZArrayBuffer(buf, "openart_sanctuary_courtyard.spz");
  } catch (e) {
    console.warn("Could not fetch bundled SPZ:", e);
    if (badge) badge.textContent = "Select .spz file below";
  }
}
