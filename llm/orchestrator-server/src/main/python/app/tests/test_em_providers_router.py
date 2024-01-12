from fastapi.testclient import TestClient

from llm_orchestrator.main import app
from llm_orchestrator.models.em.em_provider import EMProvider
from llm_orchestrator.models.errors.errors_models import ErrorMessages, ErrorCode

client = TestClient(app)

urls_prefix='/em-providers'

def test_get_all_em_providers():
    response = client.get(f"{urls_prefix}")
    assert response.status_code == 200
    assert len(response.json()) == len(EMProvider)

def test_get_em_provider_by_id():
    response = client.get(f"{urls_prefix}/{list(EMProvider)[0]}")
    assert response.status_code == 200
    assert response.json()['provider'] == list(EMProvider)[0]

def test_get_em_provider_by_id_wrong_id():
    response = client.get(f"{urls_prefix}/wrong_id")
    assert response.status_code == 400
    assert response.json()['message'] == ErrorMessages().get_message(ErrorCode.AI_PROVIDER_UNKNOWN).message

def test_get_em_provider_setting_by_id():
    response = client.get(f"{urls_prefix}/{list(EMProvider)[0]}/setting/example")
    assert response.status_code == 200
    assert response.json()['provider'] == list(EMProvider)[0]

def test_check_em_provider_setting():
    response = client.get(f"{urls_prefix}/{list(EMProvider)[0]}/setting/example")
    data = {
        "setting": response.json()
    }
    response = client.post(f"{urls_prefix}/{list(EMProvider)[0]}/setting/status", json=data)
    assert response.status_code == 200
    assert response.json()['valid'] == False