from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models.pet import Pet

pets_bp = Blueprint("pets", __name__)


@pets_bp.post("/")
@jwt_required()
def create_pet():
    user = get_jwt_identity()
    tutor_id = user["id"]

    data = request.get_json() or {}
    name = data.get("name")
    species = data.get("species")

    if not name or not species:
        return jsonify({"message": "Nome e espécie são obrigatórios"}), 400

    pet = Pet(
        tutor_id=tutor_id,
        name=name,
        species=species,
        breed=data.get("breed"),
        sex=data.get("sex"),
        notes=data.get("notes"),
    )
    db.session.add(pet)
    db.session.commit()

    return jsonify({"id": pet.id, "message": "Pet cadastrado"}), 201


@pets_bp.get("/")
@jwt_required()
def list_pets():
    user = get_jwt_identity()
    pets = Pet.query.filter_by(tutor_id=user["id"]).all()
    return jsonify(
        [
            {
                "id": p.id,
                "name": p.name,
                "species": p.species,
                "breed": p.breed,
            }
            for p in pets
        ]
    )
