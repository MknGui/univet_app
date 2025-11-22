from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models import Pet, PetBreed, PetVaccine

pets_bp = Blueprint("pets", __name__)


def _get_current_user():
    """Retorna (user_id:int, role:str) baseado no JWT."""
    identity = get_jwt_identity()
    claims = get_jwt()

    user_id = int(identity) if identity is not None else None
    role = claims.get("role") if isinstance(claims, dict) else None
    return user_id, role


@pets_bp.route("/pets", methods=["GET"])
@jwt_required()
def list_pets():
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    query = Pet.query

    # tutor vê apenas os próprios pets, veterinarian pode ver todos
    if role != "veterinarian":
        query = query.filter_by(owner_id=user_id)

    pets = query.order_by(Pet.created_at.desc()).all()
    return jsonify([p.to_dict() for p in pets]), 200


@pets_bp.route("/pets", methods=["POST"])
@jwt_required()
def create_pet():
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    species = (data.get("species") or "").strip() or None
    sex = (data.get("sex") or "").strip() or None
    notes = (data.get("notes") or "").strip() or None

    # idade pode vir como número ou string
    age_raw = data.get("age")
    age = None
    if age_raw not in (None, ""):
        try:
            age = int(age_raw)
        except (TypeError, ValueError):
            return jsonify({"message": "Idade deve ser um número inteiro"}), 400

        if age < 0:
            return jsonify({"message": "Idade não pode ser negativa"}), 400

    # pode vir array de raças ou string única
    breeds_data = data.get("breeds") or []
    if isinstance(breeds_data, str):
        breeds_data = [breeds_data]

    if not name:
        return jsonify({"message": "Nome do pet é obrigatório"}), 400

    owner_id = user_id  # tutor cria para ele mesmo

    pet = Pet(
        name=name,
        species=species,
        sex=sex,
        age=age,
        notes=notes,
        owner_id=owner_id,
    )

    for breed_name in breeds_data:
        breed_name = (breed_name or "").strip()
        if not breed_name:
            continue
        pet.breeds.append(PetBreed(name=breed_name))

    db.session.add(pet)
    db.session.commit()

    return jsonify(pet.to_dict()), 201


@pets_bp.route("/pets/<int:pet_id>", methods=["GET"])
@jwt_required()
def get_pet(pet_id: int):
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    pet = Pet.query.get_or_404(pet_id)

    if role != "veterinarian" and pet.owner_id != user_id:
        return jsonify({"message": "Acesso negado"}), 403

    return jsonify(pet.to_dict(include_vaccines=True)), 200


@pets_bp.route("/pets/<int:pet_id>", methods=["PUT"])
@jwt_required()
def update_pet(pet_id: int):
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    pet = Pet.query.get_or_404(pet_id)

    if role != "veterinarian" and pet.owner_id != user_id:
        return jsonify({"message": "Acesso negado"}), 403

    data = request.get_json() or {}

    name = (data.get("name") or pet.name or "").strip()
    species = (data.get("species") or pet.species or "").strip() or None
    sex = (data.get("sex") or pet.sex or "").strip() or None
    notes = (data.get("notes") or pet.notes or "").strip() or None

    age_raw = data.get("age", pet.age)
    age = pet.age
    if age_raw in (None, ""):
        age = None
    else:
        try:
            age = int(age_raw)
        except (TypeError, ValueError):
            return jsonify({"message": "Idade deve ser um número inteiro"}), 400
        if age < 0:
            return jsonify({"message": "Idade não pode ser negativa"}), 400

    pet.name = name
    pet.species = species
    pet.sex = sex
    pet.notes = notes
    pet.age = age

    # atualização de raças (opcional)
    if "breeds" in data or "breed" in data:
        breeds_data = data.get("breeds")
        if breeds_data is None:
            # se veio explicitamente null, zera as raças
            pet.breeds.clear()
        else:
            if isinstance(breeds_data, str):
                breeds_data = [breeds_data]
            breeds_clean = []
            for b in breeds_data:
                s = (b or "").strip()
                if s:
                    breeds_clean.append(s)

            pet.breeds.clear()
            for bname in breeds_clean:
                pet.breeds.append(PetBreed(name=bname))

    db.session.commit()

    return jsonify(pet.to_dict(include_vaccines=True)), 200


@pets_bp.route("/pets/<int:pet_id>", methods=["DELETE"])
@jwt_required()
def delete_pet(pet_id: int):
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    pet = Pet.query.get_or_404(pet_id)

    if role != "veterinarian" and pet.owner_id != user_id:
        return jsonify({"message": "Acesso negado"}), 403

    db.session.delete(pet)
    db.session.commit()

    return jsonify({"message": "Pet removido com sucesso"}), 200


# -------------------------------
# Carteira de vacinação
# -------------------------------

@pets_bp.route("/pets/<int:pet_id>/vaccines", methods=["GET"])
@jwt_required()
def list_pet_vaccines(pet_id: int):
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    pet = Pet.query.get_or_404(pet_id)
    if role != "veterinarian" and pet.owner_id != user_id:
        return jsonify({"message": "Acesso negado"}), 403

    vaccines = (
        PetVaccine.query.filter_by(pet_id=pet_id)
        .order_by(PetVaccine.date.desc())
        .all()
    )
    return jsonify([v.to_dict() for v in vaccines]), 200


@pets_bp.route("/pets/<int:pet_id>/vaccines", methods=["POST"])
@jwt_required()
def create_pet_vaccine(pet_id: int):
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    pet = Pet.query.get_or_404(pet_id)
    if role != "veterinarian" and pet.owner_id != user_id:
        return jsonify({"message": "Acesso negado"}), 403

    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    lot = (data.get("lot") or "").strip() or None
    notes = (data.get("notes") or "").strip() or None

    date_str = data.get("date")
    if not name or not date_str:
        return jsonify({"message": "Nome da vacina e data são obrigatórios"}), 400

    try:
        date_value = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Data inválida, use o formato YYYY-MM-DD"}), 400

    next_dose_str = data.get("next_dose")
    next_dose_value = None
    if next_dose_str:
        try:
            next_dose_value = datetime.strptime(next_dose_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "Data da próxima dose inválida, use o formato YYYY-MM-DD"}), 400

    vaccine = PetVaccine(
        pet_id=pet.id,
        name=name,
        lot=lot,
        date=date_value,
        next_dose=next_dose_value,
        notes=notes,
    )

    db.session.add(vaccine)
    db.session.commit()

    return jsonify(vaccine.to_dict()), 201
