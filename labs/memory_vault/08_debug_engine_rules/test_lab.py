from sanctuary_engine import SanctuaryEngine
from world_state import SanctuaryWorld


def test_a_restored_building_stays_restored():
    engine = SanctuaryEngine()
    sector = engine.get_sector("neural_academy")
    sector.power_level = 90

    engine.sync_habit_action("neural_academy", "alpha bravo charlie", power_boost=20)   # levels up
    assert sector.visual_state == "color_restored"

    engine.sync_habit_action("neural_academy", "delta echo foxtrot", power_boost=30)    # ordinary next day
    assert sector.visual_state == "color_restored"


def test_level_never_passes_ten_and_the_world_still_validates():
    engine = SanctuaryEngine()
    sector = engine.get_sector("kinetic_dojo")
    sector.level = 10
    sector.power_level = 90

    engine.sync_habit_action("kinetic_dojo", "golf hotel india", power_boost=20)

    assert sector.level == 10
    SanctuaryWorld.model_validate(engine.world.model_dump())  # must still load from a save
