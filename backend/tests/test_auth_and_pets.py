# backend/tests/test_auth_and_pets.py

import uuid
import pytest

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))
from app import create_app
from extensions import db


@pytest.fixture(scope="session")
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
    })
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Client de teste do Flask."""
    with app.test_client() as client:
        yield client


@pytest.fixture
def tutor_token_and_headers(client):
    """
    Cria um tutor novo, faz login e devolve:
    - access_token
    - headers prontos com Authorization: Bearer <token>
    """

    # E-mail único pra não bater em unique constraint
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"test_tutor_{unique_suffix}@example.com"
    password = "test-password-123"

    # 1) Registrar usuário
    register_payload = {
        "full_name": "Tutor de Teste",
        "email": email,
        "password": password,
        # role e outros campos são opcionais e têm default no backend
    }
    resp = client.post("/api/auth/register", json=register_payload)
    assert resp.status_code == 201, resp.get_data(as_text=True)

    # 2) Login para pegar o token
    login_payload = {
        "email": email,
        "password": password,
    }
    resp = client.post("/api/auth/login", json=login_payload)
    assert resp.status_code == 200, resp.get_data(as_text=True)

    data = resp.get_json()
    assert "access_token" in data
    token = data["access_token"]

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    return token, headers


def test_create_pet_and_list(client, tutor_token_and_headers):
    """
    Fluxo completo:
    - cria um pet com POST /api/pets/
    - lista pets com GET /api/pets/
    - verifica se o pet criado está na lista
    """

    _, headers = tutor_token_and_headers

    # Nome único pra não confundir com outros pets
    pet_name = f"Rex-{uuid.uuid4().hex[:6]}"

    create_payload = {
        "name": pet_name,
        "species": "Dog",
        "breed": "Vira-lata",
        "sex": "M",
        "notes": "Pet criado nos testes automatizados",
    }

    # 1) Criar pet
    resp_create = client.post("/api/pets/", json=create_payload, headers=headers)
    assert resp_create.status_code == 201, resp_create.get_data(as_text=True)

    data_create = resp_create.get_json()
    assert "id" in data_create
    assert data_create["message"] == "Pet cadastrado"

    # 2) Listar pets
    resp_list = client.get("/api/pets/", headers=headers)
    assert resp_list.status_code == 200, resp_list.get_data(as_text=True)

    pets = resp_list.get_json()
    assert isinstance(pets, list)

    # 3) Verificar se o pet recém-criado está na lista
    found = False
    for p in pets:
        if p.get("name") == pet_name and p.get("species") == "Dog":
            found = True
            break

    assert found, "Pet criado não foi encontrado na listagem de /api/pets/"
