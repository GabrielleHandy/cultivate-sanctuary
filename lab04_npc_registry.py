"""
========================================================================
🦉 CULTIVATE // SANCTUARY — LAB 04: PROFESSOR PYDANTIC'S REGISTRY
========================================================================
The village grows as YOU grow. New NPCs must be addable without touching
the engine, so every NPC is DATA, validated by a schema.

Professor Pydantic is NPC #001. He is also the guard of the registry:
if you hand him a malformed NPC he rejects it, in character.

Follow the 6-beat loop:
  ASK -> PREDICT -> WORK -> REVEAL -> DIFF -> LOG

------------------------------------------------------------------------
BEAT 2 — PREDICT (write your guesses BEFORE you code, then check later)
------------------------------------------------------------------------
  Q1. If someone adds an NPC whose `building` is "moon_base", what should
      happen? My guess:  It should throw a Validation_Error
      2nd Look: It looks at the world.sectors ids and checks if it exists if not it throws a ValidationError
  Q2. If two NPCs share the same `id`, what should happen?
      My guess:          Duplicate ID error
      2nd Look: It would look through the NPC Registry and if it already exists it shouldnt add the npc it should raise a Validation Error
  Q3. An NPC has unlock_signal=60 and the world signal is 45. Visible?
      My guess:          Nope not visible 

------------------------------------------------------------------------
BEAT 3 — WORK: complete TODO 1, 2 and 3 below.
Run:  python lab04_npc_registry.py
------------------------------------------------------------------------
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field, ValidationError

from world_state import SanctuaryWorld, create_initial_world


# ─── TODO 1: THE NPC SCHEMA ────────────────────────────────────────────
# Define the fields below. Think about which type or constraint protects
# the village from bad data (this is the Professor's whole job!).
#
#   id            : str, lowercase slug like "prof_pydantic"
#   name          : str, display name
#   species       : str, e.g. "owl", "cat", "frog"
#   building      : str, which sector_id they live in (checked in TODO 2)
#   teaches       : str, the AI engineering concept they guide
#   unlock_signal : int, world signal needed to meet them (0 to 100)
#   status        : "hidden" | "met", defaults to "hidden"
#   traits        : list of personality traits, e.g. ["strict", "secretly soft"]
#   catchphrase   : str, optional (e.g. "Expected: str. Received: vibes.")
#
# TRAITS DESIGN QUESTION (decide it yourself, it's a real schema choice):
#   Should `traits` be a free-form List[str], or a List[Literal[...]] from
#   a fixed set? Free-form is flexible and shareable, while a fixed set is
#   safer to validate. What would you want when other people's NPCs show up?
#   Hint: Field(max_length=...) limits how many traits an NPC can have.
#
# HINTS: Field(ge=..., le=...), Literal[...], and
#        Field(pattern=r"^[a-z_]+$") can all help.
class NPC(BaseModel):
    id: str = Field(pattern=r"^[a-z_]+$")
    name: str
    species: str
    building: str = Field(pattern=r"^[a-z_]+$")
    teaches: str
    unlock_signal: int = Field(default=0, ge=0, le=100)
    status: Literal["hidden", "met"] = "hidden"
    traits: List[str] = Field(default_factory=list, max_length=4)
    catchphrase: Optional[str] = None


class NPCRegistry(BaseModel):
    npcs: List[NPC] = Field(default_factory=list)

    # ─── TODO 2: ADD AN NPC SAFELY ─────────────────────────────────────
    # Raise ValueError (with a clear message) if:
    #   a) another NPC already uses npc.id
    #   b) npc.building is not the id of a sector in `world.sectors`
    # Otherwise append it to self.npcs.
    def add(self, npc: NPC, world: SanctuaryWorld) -> None:
        # <<< YOUR CODE FOR TODO 2 HERE >>>
        if any(existing.id == npc.id for existing in self.npcs):
            raise ValueError(f"Duplicate NPC ID: {npc.id}")
        # 2. Check for valid buildings in world.sectors
        valid_buildings = {s.id for s in world.sectors}
        if npc.building not in valid_buildings:
            raise ValueError(f"Unknown building: {npc.building}")
        # 3. Add to registry
        self.npcs.append(npc)
    # ─── TODO 3: WHO CAN I MEET RIGHT NOW? ─────────────────────────────
    # Return the NPCs whose unlock_signal <= world.signal_strength.
    # Optional: if `building` is given, only return NPCs living there.
    def available(self, world: SanctuaryWorld, building: Optional[str] = None) -> List[NPC]:
       unlocked_npcs = list(filter(lambda x: x.unlock_signal <= world.signal_strength, self.npcs))
       if (building):
            return [x for x in unlocked_npcs if x.building == building]
       return unlocked_npcs
# ─── THE PROFESSOR'S REVIEW (already written: this is the REVEAL beat) ──
def professor_review(raw: dict, registry: NPCRegistry, world: SanctuaryWorld) -> str:
    """Try to add a raw dict as an NPC. The Professor comments in character."""
    try:
        npc = NPC(**raw)
        registry.add(npc, world)
        return f"🦉 'Validated. Welcome to the village, {npc.name}.'"
    except ValidationError as e:
        problems = "; ".join(f"`{err['loc'][0]}` -> {err['msg']}" for err in e.errors())
        return f"🦉 'ValidationError. Expected structure. Received vibes. ({problems})'"
    except ValueError as e:
        return f"🦉 'Registry rejected this: {e}'"


# ─── SEED CAST: add more later, and the engine never changes ───────────
SEED_NPCS = [
    dict(id="prof_pydantic", name="Professor Pydantic", species="owl",
         building="neural_academy", teaches="structured outputs & validation",
         unlock_signal=0, traits=["strict", "secretly a softie", "allergic to vibes"],
         catchphrase="Expected: str. Received: vibes."),
    # Future cast (uncomment as you level up and each one is a real build):
    # dict(id="archivist_bobbin", name="Archivist Bobbin", species="cat",
    #      building="memory_vault", teaches="embeddings & retrieval", unlock_signal=25),
    # dict(id="mochi", name="Mochi", species="dust bunny",
    #      building="safe_house", teaches="scheduling & automation", unlock_signal=10),
]


# ─── RUNNER ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    world = create_initial_world()
    registry = NPCRegistry()

    print("=" * 68)
    print("🦉 LAB 04: PROFESSOR PYDANTIC'S REGISTRY")
    print("=" * 68)

    try:
        for raw in SEED_NPCS:
            print(professor_review(raw, registry, world))

        print("\n🧪 Bad NPC #1: unknown building")
        print(professor_review(dict(id="alien", name="Zorp", species="alien",
              building="moon_base", teaches="nothing", unlock_signal=0), registry, world))

        print("\n🧪 Bad NPC #2: duplicate id")
        print(professor_review(SEED_NPCS[0], registry, world))

        print("\n🧪 Bad NPC #3: unlock_signal=150")
        print(professor_review(dict(id="oops", name="Oops", species="owl",
              building="neural_academy", teaches="bugs", unlock_signal=150), registry, world))

        print(f"\n📡 Signal {world.signal_strength}%. Meetable now:")
        for n in registry.available(world):
            print(f"   • {n.name} ({n.species}) @ {n.building}: teaches {n.teaches}")
    except NotImplementedError as e:
        print(f"⏳ TODOs pending: {e}")

    print("\nBEATS 4-6: compare to your predictions (REVEAL), note what differed (DIFF),")
    print("then write one sentence about what you learned in instructions.md (LOG).")
