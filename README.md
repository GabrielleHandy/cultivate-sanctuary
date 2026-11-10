# Cultivate // Sanctuary 🌿

> **A village where every house is an AI-engineering project I built.**
> Passing a lab lights the house and puts a working AI feature inside it.

**▶ Play it:** https://gabriellehandy.github.io/cultivate-sanctuary/

![The Sanctuary courtyard](sanctuary_courtyard_panorama.jpg)

I am a frontend engineer moving into AI systems engineering. Instead of a list of tutorials, I built
a small world. Eight villagers each teach one AI-engineering concept, and each one **is** the thing I
build: they start as scripted characters and become real as I pass their labs.

Nothing in the village can be powered up by clicking. Progress comes from tests.

## How it works

1. **Walk up to a villager.** They hand you their next lab: a brief, the skills it trains, and what it unlocks.
2. **Write the code.** Every lab has a `README.md` brief and a `test_lab.py` the referee runs.
3. **Ring the bell.** `python tools/referee.py` runs every lab and rewrites `progress.json`.
4. **Push.** The live village reads `progress.json`, so the house lights up on the public site.

CI runs the referee in check mode on every push, so the village can never claim a lab the tests don't back.

## The cast

| Villager | Lives at | Teaches | The real build |
| :--- | :--- | :--- | :--- |
| 🦉 Professor Pydantic | Neural Academy | Structured outputs, validation, schemas | Guardrails that reject bad LLM output, in character |
| 🐈 Archivist Bobbin | Memory Vault | Embeddings, RAG, memory retrieval | A 3-tier memory engine that recalls past entries |
| 🍵 Auntie Lǎo Chá | Cipher Tea House | Prompt engineering, evals, TTS | A Mandarin tutor bot whose answers I evaluate |
| 📡 Future Gabrielle | Comm-link radio | Personas, personalization, long context | A future self driven by my vision board and memory |
| 📌 Pin | Plaza bounty board | Tool use, agents, task queues | An agent that files, ranks and nudges my ideas |
| 🐇 Mochi | Safe House & Atelier | Scheduling, automation | Reminders and a focus timer |
| 🐸 Sensei Pushup | Kinetic Dojo | APIs, webhooks, time-series data | Wearable / Strava sync |
| 🎙️ Tree DJ | Tree of Vision | Voice, TTS, streaming | A daily AI news broadcast |

The full quest map lives in [`quests.json`](quests.json). Current score: see [`progress.json`](progress.json).

## The anti-guilt rule

No streaks, no decay, nothing resets. A house you lit stays lit. The game only ever celebrates coming back.

## Run it locally

```bash
git clone https://github.com/GabrielleHandy/cultivate-sanctuary.git
cd cultivate-sanctuary
pip install "pydantic>=2.7" fastapi uvicorn pytest
```

Play the village (it needs a web server, not a double-click):

```bash
python -m http.server 8000
```

Work a lab:

```bash
python -m pytest labs/ai_academy/06_debug_request_limits -q
```

Update the scoreboard:

```bash
python tools/referee.py
```

Run the API from Lab 05:

```bash
python api.py
```

## Repo map

| Path | What it is |
| :--- | :--- |
| `index.html`, `css/`, `js/` | The village (2D map home screen, rooms, optional 3D town) |
| `quests.json` | The cast, their quest lines and every lab |
| `progress.json` | Written by the referee from real test results |
| `labs/` | One folder per lab: brief, tests, and starter code. See [`labs/README.md`](labs/README.md) |
| `tools/referee.py` | Runs the labs and scores the village |
| `world_state.py`, `memory_engine.py`, `sanctuary_engine.py`, `lab04_npc_registry.py`, `lab05_api_gateway.py`, `api.py` | Code written in Labs 00 to 05 |
| `docs/SYSTEM_DESIGN.md` | Architecture, decisions and trade-offs |
| `bounty_board.md` | Idea vault |
| `assets/models/` | Optional `.glb` models for the 3D town |
