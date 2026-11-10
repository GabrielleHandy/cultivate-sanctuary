import pytest
from pydantic import ValidationError

from world_state import Sector, create_initial_world


def make_sector(**overrides):
    fields = dict(id="kinetic_dojo", name="Dojo", map_position="bottom_center", x=50, y=85, habit_fuel="calisthenics")
    fields.update(overrides)
    return Sector(**fields)


def test_initial_world_has_five_sectors_and_an_avatar():
    world = create_initial_world()
    assert len(world.sectors) == 5
    assert world.avatar.name


def test_valid_sector_is_accepted():
    assert make_sector().power_level == 0


def test_unknown_habit_fuel_is_rejected():
    with pytest.raises(ValidationError):
        make_sector(habit_fuel="workout")


def test_power_above_100_is_rejected():
    with pytest.raises(ValidationError):
        make_sector(power_level=150)
