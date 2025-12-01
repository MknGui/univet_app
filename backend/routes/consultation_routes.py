from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from extensions import db
from models import Consultation, Pet, User, Appointment
from services.notifications_service import create_notification

consultations_bp = Blueprint("consultations", __name__)


def _get_current_user():
    identity = get_jwt_identity()
    claims = get_jwt()

    user_id = int(identity) if identity is not None else None
    role = claims.get("role") if isinstance(claims, dict) else None
    return user_id, role


def _parse_date(value: str):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except Exception:
        return None


@consultations_bp.route("/consultations", methods=["POST"])
@jwt_required()
def create_consultation():
    """
    Cria um registro de consulta clínica.

    Espera JSON:
    {
      "pet_id": number,
      "date": "YYYY-MM-DD",
      "diagnosis": string,
      "treatment": string,
      "observations": string | null,
      "next_visit": "YYYY-MM-DD" | null,
      "appointment_id": number | null
    }

    Se "appointment_id" for enviado, pet_id e date podem ser derivados
    do próprio agendamento.
    """
    user_id, role = _get_current_user()
    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    if role != "veterinarian":
        return jsonify(
            {"message": "Somente veterinários podem registrar consultas"}
        ), 403

    data = request.get_json() or {}

    appointment_id = data.get("appointment_id")

    pet_id = data.get("pet_id")
    date_str = data.get("date")
    diagnosis = (data.get("diagnosis") or "").strip()
    treatment = (data.get("treatment") or "").strip()
    observations = (data.get("observations") or "").strip() or None
    next_visit_str = data.get("next_visit")

    appointment = None

    # Se veio appointment_id, valida e usa como fonte de verdade
    if appointment_id is not None:
        try:
            appointment_id = int(appointment_id)
        except (TypeError, ValueError):
            return jsonify({"message": "appointment_id deve ser inteiro"}), 400

        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({"message": "Agendamento não encontrado"}), 404

        # garante que o agendamento é deste veterinário
        if appointment.vet_id != user_id:
            return jsonify({"message": "Agendamento não pertence a este veterinário"}), 403

        # se pet_id não veio, usa o do agendamento
        if pet_id is None:
            pet_id = appointment.pet_id

        # se data não veio, usa a data do agendamento
        if not date_str and appointment.scheduled_at:
            date_str = appointment.scheduled_at.date().isoformat()

    # agora valida obrigatórios
    if not pet_id or not date_str or not diagnosis or not treatment:
        return jsonify(
            {
                "message": (
                    "pet_id ou appointment_id, date, diagnosis e treatment "
                    "são obrigatórios"
                )
            }
        ), 400

    try:
        pet_id = int(pet_id)
    except (TypeError, ValueError):
        return jsonify({"message": "pet_id deve ser inteiro"}), 400

    # se veio appointment e o pet_id divergir, recusa
    if appointment and appointment.pet_id != pet_id:
        return jsonify(
            {"message": "pet_id não corresponde ao pet do agendamento informado"}
        ), 400

    pet = Pet.query.get(pet_id)
    if not pet:
        return jsonify({"message": "Pet não encontrado"}), 404

    consult_date = _parse_date(date_str)
    if not consult_date:
        return jsonify({"message": "Data inválida. Use o formato YYYY-MM-DD"}), 400

    next_visit = _parse_date(next_visit_str) if next_visit_str else None

    tutor_id = pet.owner_id
    tutor = User.query.get(tutor_id)
    vet = User.query.get(user_id)

    if not tutor:
        return jsonify({"message": "Tutor não encontrado para este pet"}), 404

    consultation = Consultation(
        pet_id=pet.id,
        tutor_id=tutor_id,
        vet_id=user_id,
        appointment_id=appointment.id if appointment else None,
        date=consult_date,
        diagnosis=diagnosis,
        treatment=treatment,
        observations=observations,
        next_visit=next_visit,
    )

    db.session.add(consultation)

    # se houver agendamento vinculado, marca como concluído
    if appointment:
        appointment.status = "COMPLETED"
        appointment.updated_at = datetime.utcnow()

    db.session.commit()

    # Notificar tutor que a consulta foi registrada
    try:
        date_label = consult_date.strftime("%d/%m/%Y")
    except Exception:
        date_label = date_str

    msg = f"Uma consulta para {pet.name} foi registrada em {date_label}."
    create_notification(
        user_id=tutor_id,
        type="success",
        title="Consulta registrada",
        message=msg,
        link=f"/tutor/consultation/{consultation.id}",
    )

    return jsonify(consultation.to_dict()), 201


@consultations_bp.route("/consultations", methods=["GET"])
@jwt_required()
def list_consultations():
    """
    Lista consultas do usuário logado.

    - Se for veterinarian: filtra por vet_id
    - Se for tutor: filtra por tutor_id
    Aceita opcional ?pet_id=...
    """
    user_id, role = _get_current_user()
    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    pet_id = request.args.get("pet_id")

    query = Consultation.query
    if role == "veterinarian":
        query = query.filter_by(vet_id=user_id)
    else:
        query = query.filter_by(tutor_id=user_id)

    if pet_id:
        try:
            query = query.filter_by(pet_id=int(pet_id))
        except (TypeError, ValueError):
            return jsonify({"message": "pet_id inválido"}), 400

    consultations = query.order_by(Consultation.date.desc()).all()

    results = []
    for c in consultations:
        data = c.to_dict()

        # adiciona nomes pro front usar
        data["pet_name"] = c.pet.name if c.pet else None
        data["tutor_name"] = c.tutor.name if c.tutor else None
        data["vet_name"] = c.vet.name if c.vet else None

        results.append(data)

    return jsonify(results), 200



@consultations_bp.route("/consultations/<int:consultation_id>", methods=["GET"])
@jwt_required()
def get_consultation(consultation_id: int):
    """Retorna uma consulta específica, respeitando permissão."""
    user_id, role = _get_current_user()
    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    consultation = Consultation.query.get_or_404(consultation_id)

    if role == "veterinarian":
        if consultation.vet_id != user_id:
            return jsonify({"message": "Acesso negado"}), 403
    else:
        if consultation.tutor_id != user_id:
            return jsonify({"message": "Acesso negado"}), 403

    data = consultation.to_dict()
    data["pet_name"] = consultation.pet.name if consultation.pet else None
    data["tutor_name"] = consultation.tutor.name if consultation.tutor else None
    data["vet_name"] = consultation.vet.name if consultation.vet else None

    return jsonify(data), 200

