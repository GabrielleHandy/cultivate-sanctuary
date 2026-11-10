"""
========================================================================
🏛️ CULTIVATE // SANCTUARY — LAB 03: THE NEURAL STATE BRIDGE
========================================================================
Connects the World State with the 3-Tier Memory Engine.
(Lab 03: complete.)
========================================================================
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

from world_state import SanctuaryWorld, Sector, create_initial_world
from memory_engine import MemoryVault


class SanctuaryEngine(BaseModel):
    world: SanctuaryWorld = Field(default_factory=create_initial_world)
    vault: MemoryVault = Field(default_factory=MemoryVault)
    current_session: int = Field(default=1, ge=1)

    def get_sector(self, sector_id: str) -> Optional[Sector]:
        """Finds and returns a sector by its ID."""
        for s in self.world.sectors:
            if s.id == sector_id:
                return s
        return None

    def sync_habit_action(
        self,
        sector_id: str,
        observation_text: str,
        power_boost: int = 25
    ) -> Dict[str, Any]:
        """
        Processes a real-world habit check-in:
        1. Moves avatar coordinates toward the sector.
        2. Charges the sector's power grid (and triggers level-up if charged).
        3. Consolidates the observation into the 3-tier Memory Vault.
        """
        sector = self.get_sector(sector_id)
        if not sector:
            raise ValueError(f"Unknown sector ID: {sector_id}")

        # 1. Avatar walks to the sector and faces it.
        self.world.avatar.x = sector.x
        self.world.avatar.y = sector.y
        self.world.avatar.facing = "right" if sector.x > 50 else ("left" if sector.x < 50 else "down")
        self.world.avatar.is_walking = False

        # 2. Charge the sector's power grid; level up at 100.
        sector.is_online = True
        sector.power_level += power_boost
        if sector.power_level >= 100:
            sector.level +=1
            sector.power_level = max(1, (sector.power_level - 100))
            sector.visual_state = "color_restored"
        elif sector.power_level >= 30:
            sector.visual_state = "blueprint_glow"

        # 3. Consolidate into the Memory Vault; a graduation boosts the 2027 signal.
        mem_result = self.vault.process_observation(new_text=observation_text, session_num = self.current_session)
        if mem_result["action"] == "graduated":
            self.world.signal_strength = min(100, self.world.signal_strength +5)
            
        return {
            "session": self.current_session,
            "sector": sector.name,
            "sector_level": sector.level,
            "sector_power": sector.power_level,
            "visual_state": sector.visual_state,
            "avatar_coords": (self.world.avatar.x, self.world.avatar.y),
            "avatar_facing": self.world.avatar.facing,
            "signal_strength": self.world.signal_strength,
            "memory_action": mem_result["action"],
            "vault_items_count": len(self.vault.items),
        }


# ─── LAB 03 INTERACTIVE SIMULATION RUNNER ─────────────────────────────────

if __name__ == "__main__":
    print("=" * 68)
    print("⚡ INITIALIZING SANCTUARY STATE ENGINE...")
    print("=" * 68)

    engine = SanctuaryEngine()

    print(f"🌍 Starting World: {engine.world.world_name}")
    print(f"📡 Future Gabrielle Signal: {engine.world.signal_strength}%")
    print(f"📍 Avatar: {engine.world.avatar.name} at ({engine.world.avatar.x}, {engine.world.avatar.y})")
    print("-" * 68)

    # Simulation Action 1: Coding Lab at Neural Academy
    print("\n[ACTION 1] 💻 Logging 45m AI Engineering Lab...")
    try:
        report1 = engine.sync_habit_action(
            sector_id="neural_academy",
            observation_text="Learns fastest through hands-on Codecademy style micro-labs",
            power_boost=30
        )
        print("✅ ACTION 1 REPORT:")
        for k, v in report1.items():
            print(f"   • {k}: {v}")
    except Exception as e:
        print(f"⚠️ Caught error: {e}")
