# Cultivate // Sanctuary 🌿⚡

> **A model-agnostic 3-tier memory engine & gamified life operating system.**

Cultivate Sanctuary bridges human cognitive patterns with adaptive AI agents. It replaces overwhelming, static productivity tools with a living, cyber-cozy simulation where real-world habits (AI engineering, language learning, movement, and domestic order) power a top-down sanctuary world and an evolving AI avatar.

---

## 🧠 Cognitive 3-Tier Memory Architecture

Modeled on human memory consolidation to maintain high personalization without context bloat:

```
┌────────────────────────────────────────────────────────┐
│               TIER 1: WORKING MEMORY                   │
│   current_block, current_blocker, session_focus        │
│   (Small, ephemeral, updated every session)            │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              TIER 2: SHORT-TERM MEMORY                 │
│   • Max 15 slots (bounded context)                     │
│   • Semantic/Token Similarity clustering               │
│   • Supporting evidence grouping                       │
│   • LRU + Low-Access eviction tie-breaker              │
│   • Candidate decay after 5 untouched sessions         │
└───────────────────────────┬────────────────────────────┘
                            │ (access_count >= 3)
┌───────────────────────────▼────────────────────────────┐
│              TIER 3: LONG-TERM MEMORY                  │
│   Permanent behavioral patterns (LT-1 ... LT-N)        │
│   Audited via monthly memory refresh protocol          │
└────────────────────────────────────────────────────────┘
```

---

## 🗺️ Sanctuary Sectors

The Sanctuary world connects 5 core life domains around a central **Tree of Vision**:

| Sector | Domain | Habit Fuel |
| :--- | :--- | :--- |
| **01 · The Memory Vault** | Life Architecture & Future Self | Daily check-ins & 3-Tier memory consolidation |
| **02 · The Neural Academy** | AI Systems & Software Engineering | Coding reps, paper breakdowns, & scenario labs |
| **03 · The Cipher Tea House** | Language Acquisition | Mandarin Chinese drills & conversational practice |
| **04 · The Kinetic Dojo** | Physical Longevity & Strength | Calisthenics reps, mobility, & movement tracking |
| **05 · The Safe House & Atelier** | Domestic Order & Aesthetic | 10-minute reset sessions & WearIt style themes |

---

## 🛠️ Quickstart

### Prerequisites
* Python 3.10+
* `pydantic >= 2.7.0`

### Installation
```bash
git clone https://github.com/your-username/cultivate-sanctuary.git
cd cultivate-sanctuary
pip install -e .
```

### Running Tests
```bash
python memory_engine.py
```
