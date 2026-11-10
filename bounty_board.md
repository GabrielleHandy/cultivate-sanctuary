# 📋 CULTIVATE // SANCTUARY — THE BOUNTY BOARD (IDEA VAULT)

> **PURPOSE:** Whenever a new feature, integration, or wild idea strikes, pin it here as an **Unlockable Bounty**. This keeps your ADHD creativity flowing 100% without derailing the active mission into a rabbit hole.

---

## 🛠️ WHERE THE WORK LIVES NOW (updated 2026-11-09)

- **The quest map is `quests.json`.** Eight villagers, one quest line each. Run `python tools/referee.py` for the scoreboard.
- **The bugs from the code review are now Debug-it labs** you solve yourself: `pyd-06`, `pyd-07`, `pyd-08` (Professor Pydantic) and `bob-06`, `bob-07`, `bob-08` (Archivist Bobbin).
- **Graduated memories being dropped** is now a Code-it lab: `bob-09`, the long-term shelf.
- This file stays as the idea vault. Each bounty below notes which quest line it belongs to.

Loose ends that are not labs yet:
- [ ] `current_session` never advances, so the 5-session decay in the old README cannot work.
- [ ] Fresh-start defaults in `world_state.py` are the old inflated numbers, and its `bounties` list has 4 of the 6 bounties.
- [ ] Running `python lab05_api_gateway.py` logs a real +20 habit into the committed `sanctuary_save.json` every time.
- [ ] `api.py` and `world_state.py` still use the old sector ids (`neural_academy`, `cipher_teahouse`); the village and `quests.json` use `ai_academy`, `tea_house`.
- [ ] The comm-link chat puts typed text straight into `innerHTML` (`js/village.js`); use `textContent`.

---

## 🔓 TIER 1 BOUNTIES (Unlocked: Stage 1 Core Engine is online)

### 🎯 BOUNTY #001: SANCTUARY NEWS NETWORK (SNN) → Tree DJ's quest line
- **Sector:** `05 · Town Bulletin / Broadcast Tower`
- **The Vision:** An AI News Show hosted by cute pixel/2D news anchor avatars that summarizes daily AI breakthroughs and tech newsletters (inspired by Naya's morning AI news habit).
- **AI Engineering Concepts Unlocked:** Web scraping / RSS ingestion, LLM summarization pipelines, TTS (Text-to-Speech / ElevenLabs API) + avatar lip-sync state.
- **Prerequisite:** Core FastAPI server online (`Stage 1`). ✅ Met (`api.py`).
- **Status:** Available, not started.

---

## 🔒 TIER 2 BOUNTIES (Unlocks at Sector Level 3+)

### 🎯 BOUNTY #002: BIO-TELEMETRY LINK (Fitness Watch Integration) → Sensei Pushup's quest line
- **Sector:** `04 · The Kinetic Dojo`
- **The Vision:** Connect real smartwatch / Apple Health / Garmin / Strava workout data directly to the Kinetic Dojo so heart rate, steps, and calisthenics sessions automatically charge the village power grid without manual entry.
- **AI Engineering Concepts Unlocked:** OAuth2 webhooks, time-series health data ingestion, automated anomaly/streak detection.
- **Prerequisite:** Kinetic Dojo Level 3.

### 🎯 BOUNTY #003: SONIC RESONANCE ENGINE (Music & Vibe Monitor) → Mochi's quest line
- **Sector:** `01 · The Memory Vault` + `05 · The Atelier`
- **The Vision:** Future Gabrielle monitors what you're listening to (Spotify/Apple Music API), correlates your music patterns with your focus/energy levels in Short-Term Memory, and recommends playlists or shifts the village background audio/aesthetic to match.
- **AI Engineering Concepts Unlocked:** Spotify API integration, behavioral correlation in Tier 2 Memory, recommendation embeddings.
- **Prerequisite:** 3-Tier Memory Engine online + Atelier Level 2.

### 🎯 BOUNTY #004: ENTERABLE BUILDING INTERIORS (Indoor Rooms & Interactive Stations)
- **Sector:** `All 5 Village Buildings`
- **The Vision:** Walk your chibi up to the front door of any building and press `ENTER` to step inside a cozy, custom 2D interior room:
  - **Inside The Safe House & Atelier:** Interactive `WearIt` closet rack, styling mirror, and room decor that updates as you clean.
  - **Inside The Memory Vault:** Future Gabrielle sitting at the holographic neural desk surrounded by glowing memory shelves.
  - **Inside The AI Academy:** Cozy hacker desk setup where `LearnIt` coding bootcamps run.
  - **Inside The Cipher Tea House:** Lantern-lit tea counter where you practice Mandarin dialogues with NPCs.
  - **Inside The Kinetic Dojo:** Training floor with calisthenics skill trees and workout timers.
- **AI Engineering & Game Concepts Unlocked:** Scene state transitions (`overworld` <-> `interior_scene`), context-scoped AI agents per room, spatial trigger zones.
- **Prerequisite:** Stage 2 Village Map Online. ✅ Met.
- **Status:** In progress. Isometric cutaway rooms and room entry exist in `index.html`; context-scoped AI agents per room are not built.

### 🎯 BOUNTY #005: KINETIC DECONSTRUCTOR & RPG SKILL TREE (Calisthenics AI Coach) → Sensei Pushup's quest line
- **Sector:** `04 · The Kinetic Dojo`
- **The Vision:** 
  1. **AI Move Deconstructor:** An agent where you type any target calisthenics skill (e.g., Handstand, Muscle-Up, Pistol Squat, L-Sit). The AI analyzes the biomechanics, breaks it down into primary/secondary muscle groups and prerequisite baseline progressions (e.g., Hollow Body Hold $\rightarrow$ Scapular Pulls $\rightarrow$ Negative Dip), and generates a personalized HIIT/progression workout.
  2. **Dragon Age RPG Skill Tree:** An interactive visual constellation tree (like *Dragon Age* or *Skyrim*). Nodes start locked in fog; as you log reps and master baseline moves, branch lines glow and unlock advanced movements, awarding XP and physical badges to your avatar.
- **AI Engineering & Game Concepts Unlocked:** Directed Acyclic Graph (DAG) progression trees, biomechanical prompt schemas, dynamic HIIT workout generation, interactive SVG/Canvas node graph.
- **Prerequisite:** Kinetic Dojo Level 2.

### 🎯 BOUNTY #006: SANCTUARY PACKS (Shareable NPC / Goal / Teacher Harness) → Professor Pydantic's capstone
- **Sector:** `All Sectors` + `Memory Vault` (pack library)
- **The Vision:** Build and share your own NPCs, goal frameworks and teachers as portable **packs**, like a harness anyone can plug in. Make a pack (e.g. "Mandarin Tea Auntie", "Calisthenics Sensei", "Interview Prep Coach"), export it as one file, and someone else imports it into their own village. Each NPC has a name, species, personality traits, catchphrase, what it teaches, unlock condition and lesson style.
  - **Personality traits** drive how NPCs talk, tease and teach.
  - **Goals and teachers** are data too: a pack can bundle a vision-board template, a lesson loop (Ask, Predict, Work, Reveal, Diff, Log) and the Static blockers it fights.
  - **Professor Pydantic as gatekeeper:** every imported pack is validated before it enters the village.
  - New NPCs appear as the village grows, so packs unlock by signal or level.
- **AI Engineering Concepts Unlocked:** Pydantic schemas as a shareable contract, JSON/YAML import/export, schema versioning and migration, plugin/registry architecture, **prompt-injection safety for untrusted packs** (sanitize persona text, never run pack code), model-agnostic persona prompts.
- **Design Notes:** Packs are **data only, never code**. Include a `schema_version` and a `pack_id`. Keep the personal Static-blocker data separate from any shared pack.
- **Prerequisite:** Lab 04 (NPC Registry) complete, plus Stage 1 core engine. ✅ Met.
- **Status:** Available, not started. First decision: the trait `Literal` vs free-form question below.
- **Personality System (Sims-style):** each NPC gets **up to 3 traits + 1 quirk**. Traits change how they teach (a *Strict* teacher gives tougher checks, a *Cheerful* one hypes small wins, an *Overthinker* says "ship it"), and clashing traits make funny banter. Candidate trait set:
  - **Emotional:** Cheerful, Gloomy, Hot-headed, Anxious, Dramatic, Serene, Sentimental, Sarcastic, Hopeful, Grumpy-but-Soft
  - **Social:** Outgoing, Shy, Charming, Blunt, Gossipy, Loyal, Mischievous, Nurturing, Competitive, Awkward
  - **Mind & Work:** Perfectionist, Curious, Analytical, Absent-minded, Scatterbrained, Disciplined, Procrastinator, Overthinker, Strict, Big-Picture
  - **Hobbies & Lifestyle:** Bookworm, Foodie, Night Owl, Early Bird, Neat Freak, Collector, Artsy, Music Lover, Gym Rat, Homebody, Tea Snob
  - **Quirks (pick 1):** Counts everything out loud, Speaks in schemas, Files everything, Says "per my records", Switches languages when you relax, Pins things upside-down, Narrates in third person, Fears bugs (the literal kind)
  - **Open question:** fixed `Literal` set vs free-form with a length limit (maybe a few custom slots for shared packs).

---

## 💡 RAW IDEA DROPZONE
*(Drop quick 1-line ideas here anytime during a session—Future Gabrielle will turn them into official Bounties at Session Close!)*
- **Progressive Chibi Unlock Renderer:** Fix and wire up multi-layer sprite customization (eyes, hair, skin tone, WearIt outfits) once the core AI backend is built. *(Backend is now built, so this is ready to become a Bounty.)*

