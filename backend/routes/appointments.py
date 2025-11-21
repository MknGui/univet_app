from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models.appointment import Appointment

appointments_bp = Blueprint("appointments", __name__)


@appointments_bp.post("/")
@jwt_required()
def create_appointment():
    user = get_jwt_identity()
    data = request.get_json() or {}

    try:
        scheduled_at = datetime.fromisoformat(data["scheduled_at"])
    except Exception:
        return jsonify({"message": "Data de agendamento inválida"}), 400

    appointment = Appointment(
        pet_id=data["pet_id"],
        tutor_id=user["id"],
        vet_id=data["vet_id"],
        scheduled_at=scheduled_at,
        notes=data.get("notes"),
        status="PENDING",
    )
    db.session.add(appointment)
    db.session.commit()

    return jsonify(
        {"id": appointment.id, "message": "Consulta agendada"}
    ), 201


@appointments_bp.get("/")
@jwt_required()
def list_appointments():
    user = get_jwt_identity()
    qs = Appointment.query.filter_by(tutor_id=user["id"]).order_by(
        Appointment.scheduled_at.desc()
    )
    return jsonify(
        [
            {
                "id": a.id,
                "pet_id": a.pet_id,
                "vet_id": a.vet_id,
                "scheduled_at": a.scheduled_at.isoformat(),
                "status": a.status,
                "notes": a.notes,
            }
            for a in qs.all()
        ]
    )
