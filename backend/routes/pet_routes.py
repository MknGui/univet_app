from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, Pet, PetBreed, User

pets_bp = Blueprint("pets", __name__)


@pets_bp.route("/pets", methods=["GET"])
@jwt_required()
def list_pets():
    # identity agora é o id do usuário (string)
    identity = get_jwt_identity()
    claims = get_jwt()

    user_id = int(identity) if identity is not None else None
    role = claims.get("role")

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    query = Pet.query

    # tutor vê apenas os próprios pets, vet pode ver todos
    if role != "veterinarian":
        query = query.filter_by(owner_id=user_id)

    pets = query.order_by(Pet.created_at.desc()).all()
    return jsonify([p.to_dict() for p in pets]), 200


@pets_bp.route("/pets", methods=["POST"])
@jwt_required()
def create_pet():
    identity = get_jwt_identity()
    claims = get_jwt()

    user_id = int(identity) if identity is not None else None
    role = claims.get("role")

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

    # pode vir array de raças
    breeds_data = data.get("breeds") or []
    if isinstance(breeds_data, str):
        breeds_data = [breeds_data]

    # validação básica
    if not name:
        return jsonify({"message": "Nome do pet é obrigatório"}), 400

    owner_id = user_id

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

