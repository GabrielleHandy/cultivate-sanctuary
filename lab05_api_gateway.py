"""
========================================================================
🏛️ CULTIVATE // SANCTUARY — LAB 05: THE NEURAL API GATEWAY
========================================================================
Welcome to Stage 1!
In this lab, you transition from running standalone Python scripts
to deploying an actual production-grade REST API using FastAPI.

Every time you log a coding sprint, calisthenics set, or Mandarin drill,
your habit payload will hit this API:
  1. Validates the incoming JSON schema using Pydantic.
  2. Updates the Sanctuary World coordinates & sector power grid.
  3. Consolidates the realization into the 3-Tier Memory Vault.
  4. Persists the updated world state to a local `sanctuary_save.json`.

Follow the 6-beat loop:
  ASK -> PREDICT -> WORK -> REVEAL -> DIFF -> LOG

------------------------------------------------------------------------
BEAT 2 — PREDICT (Write your guesses BEFORE you code, then check later)
------------------------------------------------------------------------
  Q1. If a client sends a POST request with `sector_id: "moon_base"`,
      who stops it? Pydantic at the door, or the engine inside?
      My guess:  engine inside then pydantic sends the response back

  Q2. If someone logs 3 similar study observations in a row, what happens
      to the Memory Vault and Future Gabrielle's signal strength?
      My guess:  Signal strength increases and the memory into longterm memory

  Q3. Why do AI engineers use FastAPI instead of basic Flask for modern
      LLM & Agentic backends?
      My guess: quick automated endpoints?

------------------------------------------------------------------------
BEAT 3 — WORK: Complete TODO 1, 2, and 3 below.
Run:  python lab05_api_gateway.py
------------------------------------------------------------------------
"""

import json
from pathlib import Path
from typing import Dict, Any, Literal, Optional
from pydantic import BaseModel, Field

# In AI systems, FastAPI and Pydantic are best friends:
# Pydantic defines the contract, FastAPI generates the endpoints & OpenAPI docs!
from world_state import SanctuaryWorld, create_initial_world
from sanctuary_engine import SanctuaryEngine
from lab04_npc_registry import NPCRegistry, SEED_NPCS, NPC


SAVE_FILE = Path("sanctuary_save.json")


# ─── TODO 1: DEFINE THE HABIT LOG REQUEST & RESPONSE CONTRACTS ─────────
# When an agent or frontend sends a habit check-in, we need strict schemas:
#
# Request Contract:
#   sector_id: Literal["neural_academy", "safe_house", "cipher_teahouse", "memory_vault", "kinetic_dojo"]
#   observation_text: str (min_length=3, max_length=280)
#   power_boost: int (default=15, between 1 and 50)
#
# Response Contract:
#   status: str ("success")
#   session: int
#   sector_name: str
#   new_power: int
#   signal_strength: int
#   memory_action: str ("created", "merged", "graduated")

class HabitLogRequest(BaseModel):
    # <<< YOUR CODE FOR TODO 1 HERE >>>
    sector_id : Literal["neural_academy", "safe_house", "cipher_teahouse", "memory_vault", "kinetic_dojo"]
    observation_text: str
    power_boost: int = 15



class HabitLogResponse(BaseModel):
    # <<< YOUR CODE FOR TODO 1 HERE >>>
    status: str 
    session: int 
    sector_name: str 
    new_power: int 
    signal_strength: int 
    memory_action: Literal["created", "merged", "graduated"]


# ─── PERSISTENCE ENGINE: LOAD & SAVE STATE ─────────────────────────────
class SanctuaryService:
    """Manages the in-memory engine and syncs state to sanctuary_save.json."""

    def __init__(self):
        self.engine = SanctuaryEngine()
        self.registry = NPCRegistry()
        # Seed default NPCs from Lab 04
        for raw in SEED_NPCS:
            try:
                npc = NPC(**raw)
                self.registry.add(npc, self.engine.world)
            except Exception:
                pass
        self.load_state()

    def save_state(self) -> None:
        """Serializes current world and memory vault state to disk."""
        data = {
            "world": self.engine.world.model_dump(),
            "vault": [item.model_dump() for item in self.engine.vault.items],
            "session": self.engine.current_session
        }
        with open(SAVE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def load_state(self) -> None:
        """Loads saved progress if file exists."""
        if not SAVE_FILE.exists():
            return
        try:
            with open(SAVE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            # Rehydrate Pydantic models from disk
            self.engine.world = SanctuaryWorld(**data["world"])
            self.engine.current_session = data.get("session", 1)
        except Exception as e:
            print(f"⚠️ Could not load save file (starting fresh): {e}")

    # ─── TODO 2: THE HABIT LOGIC PIPELINE ──────────────────────────────
    # Process a validated HabitLogRequest:
    #   1. Call self.engine.sync_habit_action(req.sector_id, req.observation_text, req.power_boost)
    #   2. Persist state to disk via self.save_state()
    #   3. Return a HabitLogResponse populated with the updated report values.
    def record_habit(self, req: HabitLogRequest) -> HabitLogResponse:
        report = self.engine.sync_habit_action(req.sector_id, req.observation_text, req.power_boost)

        self.save_state()
        
        return HabitLogResponse(
            status="success",
            session=report["session"],
            sector_name=report["sector"],
            new_power=report["sector_power"],
            signal_strength=report["signal_strength"],
            memory_action=report["memory_action"]
        )

    # ─── TODO 3: QUERY THE WORLD STATUS ────────────────────────────────
    # Return a clean dictionary snapshot representing the current world:
    #   - world_name (str)
    #   - signal_strength (int)
    #   - active_session (int)
    #   - meetable_npcs (list of names from self.registry.available(self.engine.world))
    #   - sector_powers (dict mapping sector_id -> power_level)
    def get_world_summary(self) -> Dict[str, Any]:
        return {"world_name": self.engine.world.world_name,
                "signal_strength": self.engine.world.signal_strength,
                "active_session": self.engine.current_session,
                "meetable_npcs": [npc.name for npc in self.registry.available(self.engine.world)],
                "sector_powers": {sector.id: sector.power_level for sector in self.engine.world.sectors}
}


# ─── SIMULATED REST GATEWAY TEST RUNNER ─────────────────────────────────
if __name__ == "__main__":
    print("=" * 68)
    print("⚡ LAB 05: THE NEURAL API GATEWAY")
    print("=" * 68)

    service = SanctuaryService()

    try:
        print("\n📡 Current World Summary (Pre-Flight Check):")
        summary = service.get_world_summary()
        for k, v in summary.items():
            print(f"   • {k}: {v}")

        print("\n🧪 Test 1: Submitting Valid Habit Check-in (Neural Academy)...")
        req1 = HabitLogRequest(
            sector_id="neural_academy",
            observation_text="Built first FastAPI gateway request contract",
            power_boost=20
        )
        res1 = service.record_habit(req1)
        print("✅ HABIT RECORDED SUCCESSFULLY:")
        print(f"   • Sector: {res1.sector_name} -> Power: {res1.new_power}%")
        print(f"   • Signal Strength: {res1.signal_strength}%")
        print(f"   • Memory Action: {res1.memory_action}")
        print(f"   • Disk Persistence: {'sanctuary_save.json created!' if SAVE_FILE.exists() else 'Missing!'}")

        print("\n🧪 Test 2: Pydantic Gatekeeper Check (Testing invalid sector)...")
        try:
            bad_req = HabitLogRequest(
                sector_id="moon_base",  # Illegal literal!
                observation_text="Floating in space"
            )
            print("❌ Guardrail failed! Illegal sector was accepted.")
        except Exception as e:
            print(f"🛡️ Pydantic Guardrail Caught Error at the Door: {type(e).__name__}")

    except NotImplementedError as e:
        print(f"\n⏳ TODOs pending: {e}")
