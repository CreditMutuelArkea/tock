from llm_orchestrator.configurations.environement.settings import _Settings
from llm_orchestrator.configurations.logging.logger import _setup_logging


def test_environment():
    # Test settings are read successfully
    settings = _Settings()

def test_logging():
    # Test logger is instantiated successfully
    _setup_logging()