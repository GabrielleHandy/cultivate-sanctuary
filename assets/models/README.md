# 3D models for the village

Drop `.glb` files in this folder and list them in `models.json`. Each entry replaces
one built-in landmark in the 3D town. Anything not listed (or that fails to load)
keeps its built-in procedural version.

## Slots

| Slot id | Landmark | Reference art |
| :--- | :--- | :--- |
| `tree_of_vision` | Tree of Vision (plaza centre) | glowing blossom tree |
| `safe_house` | Safe House & Atelier | timber cottage |
| `ai_academy` | Neural Academy | glass library |
| `tea_house` | Cipher Tea House | lantern tea house |
| `memory_vault` | Memory Vault | stone vault |
| `kinetic_dojo` | Kinetic Dojo | bamboo pavilion |

Reference sheets live in the repo root: `sanctuary_buildings_closeup_sheet.jpg`,
`sanctuary_modular_kit_sheet.jpg` and `sanctuary_courtyard_panorama.jpg`.

## Example `models.json`

```json
{
  "models": {
    "tree_of_vision": { "file": "tree_of_vision.glb" },
    "safe_house": { "file": "safe_house.glb", "rotationDeg": 180, "scale": 1.1 },
    "tea_house": { "file": "tea_house.glb", "offsetY": -0.1 }
  }
}
```

## Options per model

| Option | Default | What it does |
| :--- | :--- | :--- |
| `file` | required | File name inside this folder |
| `rotationDeg` | `0` | Turn the model around its vertical axis. Use this to face the door toward the plaza |
| `scale` | `1` | Multiplier on top of the automatic fit |
| `size` | auto | Exact size in world units (width for buildings, height for the tree), instead of the automatic fit |
| `offsetX`, `offsetY`, `offsetZ` | `0` | Nudge the model. `offsetY` raises or sinks it |

Models are fitted automatically: buildings are scaled to the footprint of the
built-in house they replace, and the tree is scaled to the built-in tree's height.
Each model is centred and set on the ground.

## Notes

- Models only load when the page is served over http (GitHub Pages, or
  `python -m http.server`). Opening `index.html` by double-click skips them.
- Keep each file small (a few MB). Every listed model is downloaded on page load.
