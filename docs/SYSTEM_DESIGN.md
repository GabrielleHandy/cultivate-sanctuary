# System design

## Purpose

Cultivate // Sanctuary is a learning game. Each house in the village hosts one AI-engineering
project that Gabrielle builds herself. The system exists to make that progress **visible, honest
and public**: a house lights up only when the tests for a lab she wrote pass.

Two goals, in priority order:

1. A game she actually plays, where the play is building AI features.
2. A portfolio an AI-engineering employer can read in two minutes.

## Where it started (review, November 2026)

| Problem | Effect |
| :--- | :--- |
| Progress came from "+25% Power" buttons | The village measured clicks, not skills |
| Two disconnected worlds (browser state vs Python API state) | The live site could not reflect any real work |
| Three copies of the truth (JS `state.buildings`, `world_state.py`, `bounty_board.md`) with different ids and numbers | Constant drift |
| No model call anywhere; all AI was scripted | The project taught game building, not AI engineering |
| One 5,500-line HTML file, duplicated | Hard to change, easy to break |
| Bugs in the lab code (500 on a repeated check-in, memory lost on restart, unbounded input) | Not usable as a base for later labs |

## Architecture

```
 labs/<place>/<nn>_<slug>/        tools/referee.py             index.html + js/ (GitHub Pages)
 ┌──────────────────────┐  pytest  ┌──────────────────┐  writes  ┌──────────────────────────┐
 │ README.md   brief    ├─────────►│ pass / available │─────────►│ fetches quests.json and  │
 │ starter.py  her code │          │ locked / planned │ progress │ progress.json; sets      │
 │ test_lab.py referee  │          └────────┬─────────┘  .json   │ building power, signal,  │
 └──────────────────────┘                   │                    │ villagers, quest cards   │
            ▲                    GitHub Action: --check          └──────────────────────────┘
            └── quests.json: cast, quest lines, labs, prerequisites
```

### Components

- **`quests.json`**: the single source of truth for the cast (eight NPCs), their quest lines, each
  lab's format, skills, prerequisites and what it unlocks.
- **`labs/`**: one folder per lab. Tests are written first and are the definition of done.
- **`tools/referee.py`**: runs each lab's tests in a subprocess and derives a status per lab:
  `passed`, `available` (prerequisites met), `locked`, or `planned` (no folder yet). Writes
  `progress.json` with per-NPC, per-place and overall scores.
- **GitHub Action**: runs `referee.py --check`. The build fails if `progress.json` claims
  anything the tests don't support.
- **The village (`index.html`, `css/`, `js/`)**: a static site. `js/quests.js` loads the two JSON
  files and drives building power, the signal meter, the villagers on the map and the quest cards.

### Scoring

- Place power = labs passed ÷ labs in the quest line of the NPC who lives there.
- Signal = labs passed ÷ all labs.
- Planned labs count in the denominator, so the numbers stay honest as the map grows.

## Decisions and trade-offs

| Decision | Why | Cost |
| :--- | :--- | :--- |
| Progress is a committed file checked by CI, not a database | No server, works on GitHub Pages, public and auditable, fits the "ship it publicly" motivation | Must run the referee before pushing |
| CI verifies instead of writing `progress.json` | No bot commits to pull, no write permissions | One extra local command |
| Static site, no backend yet | Nothing to host or secure until a lab needs it | Features that need a live model run locally first |
| The hosted backend is a lab track | Deploying an API is a skill to learn, not groundwork to hand over | Arrives later |
| Model-calling labs take any client with `complete(prompt)` and are tested with scripted replies | CI needs no API key, costs nothing, tests are deterministic | A thin real-model adapter is separate, manual work |
| Existing lab code stays in the repo root | The modules import each other and `api.py` runs from there | `labs/` folders for Labs 00 to 05 hold briefs and tests only |
| 2D village map is the home screen; 3D town is optional | The 2D map already worked and loads fast | The 3D view renders at a fixed 500×494 and is scaled up |
| Stickers and decorate mode removed | Decoration was displacing the actual purpose | Room furniture remains as fixed decor |

## Curriculum order

Schemas (Professor Pydantic) → memory and retrieval (Archivist Bobbin) → prompting and evals
(Auntie Lǎo Chá) → personas that need both (Future Gabrielle) → agents (Pin) → automation (Mochi)
→ integrations (Sensei Pushup) → pipelines and voice (Tree DJ).

The bugs found in the November 2026 review were turned into six **Debug-it** labs instead of
being fixed for her.

## Interface

- The village fills the screen. A thin parchment HUD sits on top: signal meter, quest map, radio,
  wardrobe, one menu.
- Clicking a villager (or their building) opens their quest card: current lab, status, commands
  to run, and the whole quest line.
- The plaza bounty board is the full quest map plus the raw idea list.
- Creator and debug tools (scene tabs, OpenArt loader, power preview, state inspector) are in a
  Studio drawer, shown only with `?studio=1`. Nothing there is saved.

## Known gaps and risks

- No JavaScript tests. The quest layer is small, but untested.
- `quests.json` has no schema validation beyond the referee's reference checks. A Pydantic model
  for it would be a good small lab.
- Operator memory (`memory.md`) is in the public repo. Moving it to private storage is an open decision.
- NPCs do not yet run real features in their cards; each quest line's later labs add that.
- The 3D town has no NPCs and no power states on `.glb` models.

## Roadmap

1. Clear the Debug-it labs (06 to 08 in each line).
2. Lab 09s: first model call with a schema; the long-term memory shelf.
3. Embeddings and retrieval evals (Bobbin), then the tutor prompt and its evals (Auntie Lǎo Chá).
4. The backend track: deploy the API, then let the village call it.
