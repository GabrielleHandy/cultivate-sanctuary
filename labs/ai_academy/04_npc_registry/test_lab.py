import pytest
from pydantic import ValidationError

from lab04_npc_registry import NPC, NPCRegistry
from world_state import create_initial_world


def make_npc(**overrides):
    fields = dict(id="prof_pydantic", name="Professor Pydantic", species="owl",
                  building="neural_academy", teaches="validation", unlock_signal=0)
    fields.update(overrides)
    return NPC(**fields)


def test_valid_npc_is_added():
    registry, world = NPCRegistry(), create_initial_world()
    registry.add(make_npc(), world)
    assert [n.id for n in registry.npcs] == ["prof_pydantic"]


def test_duplicate_id_is_rejected():
    registry, world = NPCRegistry(), create_initial_world()
    registry.add(make_npc(), world)
    with pytest.raises(ValueError):
        registry.add(make_npc(), world)


def test_unknown_building_is_rejected():
    with pytest.raises(ValueError):
        NPCRegistry().add(make_npc(building="moon_base"), create_initial_world())


def test_unlock_signal_out_of_range_is_rejected():
    with pytest.raises(ValidationError):
        make_npc(unlock_signal=150)


def test_available_respects_signal_and_building():
    registry, world = NPCRegistry(), create_initial_world()
    registry.add(make_npc(), world)
    registry.add(make_npc(id="far_future", unlock_signal=99), world)
    registry.add(make_npc(id="vault_cat", building="memory_vault"), world)

    assert {n.id for n in registry.available(world)} == {"prof_pydantic", "vault_cat"}
    assert [n.id for n in registry.available(world, building="memory_vault")] == ["vault_cat"]
