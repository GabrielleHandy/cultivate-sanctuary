import pytest
from pydantic import ValidationError

from lab05_api_gateway import SAVE_FILE, HabitLogRequest, SanctuaryService


@pytest.fixture
def service(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)  # every test gets its own empty save folder
    return SanctuaryService()


def test_first_check_in_is_recorded_and_saved(service):
    before = service.get_world_summary()["sector_powers"]["kinetic_dojo"]
    response = service.record_habit(
        HabitLogRequest(sector_id="kinetic_dojo", observation_text="Twenty pushups after work", power_boost=10)
    )
    assert response.status == "success"
    assert response.new_power == before + 10
    assert response.memory_action == "created"
    assert SAVE_FILE.exists()


def test_unknown_sector_is_stopped_at_the_door():
    with pytest.raises(ValidationError):
        HabitLogRequest(sector_id="moon_base", observation_text="Floating in space")


def test_world_summary_shape(service):
    summary = service.get_world_summary()
    assert set(summary) == {"world_name", "signal_strength", "active_session", "meetable_npcs", "sector_powers"}
    assert "Professor Pydantic" in summary["meetable_npcs"]
    assert len(summary["sector_powers"]) == 5
