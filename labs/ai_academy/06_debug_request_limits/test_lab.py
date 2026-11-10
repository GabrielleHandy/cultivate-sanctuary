import pytest
from pydantic import ValidationError

from lab05_api_gateway import HabitLogRequest


def make_request(**overrides):
    fields = dict(sector_id="safe_house", observation_text="Ten minute reset of the desk")
    fields.update(overrides)
    return HabitLogRequest(**fields)


def test_sensible_request_still_works():
    assert make_request().power_boost == 15
    assert make_request(power_boost=50).power_boost == 50


@pytest.mark.parametrize("boost", [500, 51, 0, -5])
def test_power_boost_outside_1_to_50_is_rejected(boost):
    with pytest.raises(ValidationError):
        make_request(power_boost=boost)


def test_too_short_observation_is_rejected():
    with pytest.raises(ValidationError):
        make_request(observation_text="x")


def test_too_long_observation_is_rejected():
    with pytest.raises(ValidationError):
        make_request(observation_text="a" * 281)
