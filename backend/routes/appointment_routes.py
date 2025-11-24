from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from extensions import db
from models import Appointment, Pet, User

appointments_bp = Blueprint("appointments", __name__)


def _get_current_user():
    """Retorna (user_id:int, role:str) baseado no JWT."""
    identity = get_jwt_identity()
    claims = get_jwt()

    user_id = int(identity) if identity is not None else None
    role = claims.get("role") if isinstance(claims, dict) else None
    return user_id, role


def _parse_scheduled_at(value: str):
    try:
        return datetime.fromisoformat(value)
    except Exception:
        return None


def _serialize_appointment(appointment: Appointment):
    """
    Monta o dicionário que será enviado para o frontend.

    Usa o to_dict padrão do modelo e enriquece com nomes de pet, tutor e vet.
    Ajuste os atributos .name se no seu modelo eles tiverem outro nome
    (por exemplo full_name).
    """
    base = appointment.to_dict()

    pet = Pet.query.get(appointment.pet_id)
    tutor = User.query.get(appointment.tutor_id)
    vet = User.query.get(appointment.vet_id)

    base["pet_name"] = pet.name if pet else None
    base["tutor_name"] = tutor.name if tutor else None
    base["vet_name"] = vet.name if vet else None

    return base


@appointments_bp.route("/appointments", methods=["POST"])
@jwt_required()
def create_appointment():
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    data = request.get_json() or {}

    pet_id = data.get("pet_id")
    vet_id = data.get("vet_id")
    scheduled_at_raw = data.get("scheduled_at")
    reason = (data.get("reason") or "").strip() or None

    if not pet_id or not vet_id or not scheduled_at_raw:
        return jsonify(
            {"message": "pet_id, vet_id e scheduled_at são obrigatórios"}
        ), 400

    try:
        pet_id = int(pet_id)
        vet_id = int(vet_id)
    except (TypeError, ValueError):
        return jsonify({"message": "pet_id e vet_id devem ser inteiros"}), 400

    scheduled_at = _parse_scheduled_at(scheduled_at_raw)
    if not scheduled_at:
        return jsonify(
            {
                "message": (
                    "scheduled_at inválido. Use formato ISO 8601, "
                    "por exemplo 2025-11-22T14:30:00"
                )
            }
        ), 400

    pet = Pet.query.get(pet_id)
    if not pet:
        return jsonify({"message": "Pet não encontrado"}), 404

    vet = User.query.get(vet_id)
    if not vet or vet.role != "veterinarian":
        return jsonify({"message": "Veterinário inválido"}), 400

    # Regra: tutor dono do pet agenda consulta
    if role != "veterinarian":
        if pet.owner_id != user_id:
            return jsonify({"message": "Você não é tutor deste pet"}), 403
        tutor_id = user_id
    else:
        # Se o vet criar a consulta, o tutor é o dono do pet
        tutor_id = pet.owner_id

    appointment = Appointment(
        pet_id=pet.id,
        tutor_id=tutor_id,
        vet_id=vet.id,
        scheduled_at=scheduled_at,
        reason=reason,
        status="PENDING",
    )

    db.session.add(appointment)
    db.session.commit()

    # agora já devolve com nomes
    return jsonify(_serialize_appointment(appointment)), 201


@appointments_bp.route("/appointments", methods=["GET"])
@jwt_required()
def list_appointments():
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    if role == "veterinarian":
        query = Appointment.query.filter_by(vet_id=user_id)
    else:
        query = Appointment.query.filter_by(tutor_id=user_id)

    appointments = query.order_by(Appointment.scheduled_at.desc()).all()
    # enriquece todas as consultas com nomes
    return jsonify([_serialize_appointment(a) for a in appointments]), 200


@appointments_bp.route("/appointments/<int:appointment_id>", methods=["GET"])
@jwt_required()
def get_appointment(appointment_id: int):
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    appointment = Appointment.query.get_or_404(appointment_id)

    # Tutor só enxerga se for dele
    # Vet só enxerga se for responsável
    if role == "veterinarian":
        if appointment.vet_id != user_id:
            return jsonify({"message": "Acesso negado"}), 403
    else:
        if appointment.tutor_id != user_id:
            return jsonify({"message": "Acesso negado"}), 403

    return jsonify(_serialize_appointment(appointment)), 200


@appointments_bp.route("/appointments/<int:appointment_id>/cancel", methods=["PATCH"])
@jwt_required()
def cancel_appointment(appointment_id: int):
    user_id, role = _get_current_user()

    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    appointment = Appointment.query.get_or_404(appointment_id)

    # Só o tutor pode cancelar a própria consulta
    if appointment.tutor_id != user_id:
        return jsonify({"message": "Você não pode cancelar esta consulta"}), 403

    if appointment.status in ("CANCELLED", "COMPLETED"):
        return jsonify(
            {"message": "Essa consulta já foi finalizada ou cancelada"}
        ), 400

    appointment.status = "CANCELLED"
    db.session.commit()

    return jsonify(_serialize_appointment(appointment)), 200
