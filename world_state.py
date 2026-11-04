"""
CULTIVATE // SANCTUARY — MISSION 001: WORLD-BUILDING & AVATAR SCHEMA
--------------------------------------------------------------------
This module defines the deterministic Pydantic models for:
1. AvatarSprite: Starts as a blank wireframe chibi (x, y coordinates + progressive visual unlocks).
2. Sector: The 5 Village Buildings mapped around the Central Tree of Vision.
3. Bounty: Anti-rabbit-hole side-quests pinned to the Village Bounty Board.
4. SanctuaryWorld: The master state that Claude reads and updates via structured outputs.
"""

from typing import List, Literal
from pydantic import BaseModel, Field, ValidationError


# ─── 1. AVATAR SPRITE SCHEMA (Progressive Chibi Unlocks) ──────────────────
class AvatarSprite(BaseModel):
    name: str = "Gabrielle"
    x: int = Field(default=50, ge=0, le=100, description="Horizontal map coordinate (0-100)")
    y: int = Field(default=50, ge=0, le=100, description="Vertical map coordinate (0-100)")
    facing: Literal["up", "down", "left", "right"] = "down"
    is_walking: bool = False

    # Progressive Visual Unlocks (Starts as blank chibi mannequin from reference)
    render_stage: Literal["wireframe", "inked_sketch", "flat_color", "full_shaded"] = "wireframe"
    unlocked_layers: List[Literal["base_body", "eyes_face", "hair_style", "cyber_hoodie", "neon_aura"]] = Field(
        default=["base_body"]
    )
    primary_color: str = "#a78bfa"  # Default wireframe violet


# ─── 2. VILLAGE SECTOR SCHEMA (Mapped to the Town Layout) ─────────────────
class Sector(BaseModel):
    id: str
    name: str
    map_position: Literal["top_left", "top_right", "mid_left", "mid_right", "bottom_center", "center_plaza"]
    x: int = Field(ge=0, le=100)
    y: int = Field(ge=0, le=100)
    habit_fuel: Literal["ai_engineering", "mandarin", "calisthenics", "cleaning", "content", "memory_core"]
    is_online: bool = False
    level: int = Field(default=1, ge=1, le=10)
    power_level: int = Field(default=0, ge=0, le=100)
    visual_state: Literal["blackout_wireframe", "blueprint_glow", "color_restored"] = "blackout_wireframe"
    unlocked_upgrades: List[str] = Field(default_factory=list)


# ─── 3. BOUNTY BOARD SCHEMA (Anti-Rabbit-Hole Idea Vault) ─────────────────
class Bounty(BaseModel):
    id: str
    title: str
    sector_id: str
    description: str
    required_level: int = Field(default=2, ge=1, le=10)
    status: Literal["locked", "available", "completed"] = "locked"


# ─── 4. MASTER SANCTUARY WORLD SCHEMA ─────────────────────────────────────
class SanctuaryWorld(BaseModel):
    world_name: str = "CULTIVATE // SANCTUARY"
    signal_strength: int = Field(default=14, ge=0, le=100, description="Connection % to Sept 2027 Future Gabrielle")
    grid_mode: Literal["blackout_terminal", "hybrid_blueprint", "full_sanctuary"] = "blackout_terminal"
    avatar: AvatarSprite = Field(default_factory=AvatarSprite)
    sectors: List[Sector]
    bounties: List[Bounty]


def create_initial_world() -> SanctuaryWorld:
    """Initializes the Sanctuary matching Gabrielle's top-down village map."""
    return SanctuaryWorld(
        avatar=AvatarSprite(x=50, y=50),  # Starts at the Center Plaza (Tree of Vision)
        sectors=[
            Sector(
                id="safe_house",
                name="05 · The Safe House & Atelier (WearIt)",
                map_position="top_left",
                x=20, y=20,
                habit_fuel="cleaning",
                power_level=20,
                unlocked_upgrades=["Wireframe Mannequin"]
            ),
            Sector(
                id="neural_academy",
                name="02 · The Neural Academy (LearnIt)",
                map_position="top_right",
                x=80, y=20,
                habit_fuel="ai_engineering",
                is_online=True,
                power_level=35,
                visual_state="blueprint_glow",
                unlocked_upgrades=["Pydantic Schema Terminal"]
            ),
            Sector(
                id="cipher_teahouse",
                name="03 · The Cipher Tea House (Mandarin)",
                map_position="mid_left",
                x=18, y=52,
                habit_fuel="mandarin",
                power_level=10,
            ),
            Sector(
                id="memory_vault",
                name="01 · The Memory Vault (Town Hall / EnvisionIt)",
                map_position="mid_right",
                x=82, y=52,
                habit_fuel="memory_core",
                is_online=True,
                power_level=14,
                visual_state="blueprint_glow",
                unlocked_upgrades=["2027 Signal Receiver"]
            ),
            Sector(
                id="kinetic_dojo",
                name="04 · The Kinetic Dojo (Calisthenics)",
                map_position="bottom_center",
                x=50, y=85,
                habit_fuel="calisthenics",
                power_level=15,
            ),
        ],
        bounties=[
            Bounty(
                id="BOUNTY-001",
                title="Sanctuary News Network (SNN)",
                sector_id="memory_vault",
                description="AI News broadcast show with cute anchor avatars.",
                required_level=2,
            ),
            Bounty(
                id="BOUNTY-002",
                title="Bio-Telemetry Link",
                sector_id="kinetic_dojo",
                description="Sync smartwatch/fitness tracker to auto-power the Dojo.",
                required_level=3,
            ),
            Bounty(
                id="BOUNTY-003",
                title="Sonic Resonance Engine",
                sector_id="safe_house",
                description="Future Gabrielle monitors music/Spotify & recommends focus vibes.",
                required_level=2,
            ),
            Bounty(
                id="BOUNTY-004",
                title="Enterable Building Interiors",
                sector_id="safe_house",
                description="Walk through the front door of any building into a custom 2D indoor room (WearIt Closet, Memory Desk, Tea Counter, Coding Lab, Dojo Floor).",
                required_level=2,
            ),
        ]
    )


if __name__ == "__main__":
    world = create_initial_world()
    print("=" * 68)
    print(f"  🖥️  {world.world_name} // GRID: {world.grid_mode.upper()}")
    print(f"  📡  2027 SIGNAL: {world.signal_strength}% | AVATAR: {world.avatar.name} @ ({world.avatar.x}, {world.avatar.y})")
    print(f"  🎨  SPRITE STAGE: {world.avatar.render_stage} | LAYERS: {world.avatar.unlocked_layers}")
    print("=" * 68)
    for s in world.sectors:
        status = "🟢 ONLINE " if s.is_online else "⚫ BLACKOUT"
        bar = "█" * (s.power_level // 10) + "░" * (10 - (s.power_level // 10))
        print(f"  [{status}] {s.name:<45} [{bar}] {s.power_level}%")
    print("-" * 68)

    # ─── TEST THE AI GUARDRAIL (What happens when an LLM hallucinates?) ───
    print("\n🧪 TESTING AI GUARDRAIL (Simulating bad LLM output: power_level=150, habit_fuel='workout')...")
    try:
        bad_sector = Sector(
            id="kinetic_dojo",
            name="Broken Dojo",
            map_position="bottom_center",
            x=50, y=85,
            habit_fuel="workout",  # Invalid Literal!
            power_level=150        # Exceeds le=100!
        )
    except ValidationError as e:
        print("✅ GUARDRAIL CAUGHT HALLUCINATION! Pydantic blocked the corrupt data:")
        for err in e.errors():
            print(f"   ❌ Field `{err['loc'][0]}` -> {err['msg']} (got: {err['input']!r})")
