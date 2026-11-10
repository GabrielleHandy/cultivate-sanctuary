"""Small helpers shared by lab tests."""
import importlib.util
from pathlib import Path


def load_starter(test_file: str, name: str = "starter"):
    """Import `starter.py` (or another module) that sits next to a lab's test file."""
    path = Path(test_file).resolve().parent / f"{name}.py"
    spec = importlib.util.spec_from_file_location(f"{path.parent.name}_{name}", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
