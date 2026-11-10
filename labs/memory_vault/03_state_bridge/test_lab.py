import pytest

from sanctuary_engine import SanctuaryEngine


def test_avatar_walks_to_the_sector_and_faces_it():
    engine = SanctuaryEngine()
    report = engine.sync_habit_action("cipher_teahouse", "Practised tones with flashcards", power_boost=5)
    sector = engine.get_sector("cipher_teahouse")
    assert report["avatar_coords"] == (sector.x, sector.y)
    assert report["avatar_facing"] == "left"
    assert engine.world.avatar.is_walking is False


def test_power_is_added_and_the_sector_comes_online():
    engine = SanctuaryEngine()
    before = engine.get_sector("kinetic_dojo").power_level
    report = engine.sync_habit_action("kinetic_dojo", "Twenty pushups after work", power_boost=10)
    assert report["sector_power"] == before + 10
    assert engine.get_sector("kinetic_dojo").is_online is True


def test_unknown_sector_raises():
    with pytest.raises(ValueError):
        SanctuaryEngine().sync_habit_action("moon_base", "Floating in space")


def test_a_graduated_memory_boosts_the_signal():
    engine = SanctuaryEngine()
    start = engine.world.signal_strength
    for _ in range(3):
        report = engine.sync_habit_action("kinetic_dojo", "Twenty pushups after work", power_boost=1)
    assert report["memory_action"] == "graduated"
    assert engine.world.signal_strength == start + 5
