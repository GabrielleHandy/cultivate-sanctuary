import pytest

from lab05_api_gateway import HabitLogRequest, SanctuaryService


@pytest.fixture
def service(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    return SanctuaryService()


def test_a_repeated_similar_check_in_reinforces_the_memory(service):
    request = HabitLogRequest(sector_id="kinetic_dojo", observation_text="Twenty pushups after work", power_boost=5)

    first = service.record_habit(request)
    second = service.record_habit(request)

    assert first.memory_action == "created"
    assert second.memory_action == "reinforced"
    assert second.new_power == first.new_power + 5


def test_the_third_similar_check_in_graduates(service):
    request = HabitLogRequest(sector_id="kinetic_dojo", observation_text="Twenty pushups after work", power_boost=5)
    actions = [service.record_habit(request).memory_action for _ in range(3)]
    assert actions == ["created", "reinforced", "graduated"]
