from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models.triage import TriageRequest
from services.triage_rules import evaluate_triage

triage_bp = Blueprint("triage", __name__)


@triage_bp.post("/")
@jwt_required()
def create_triage():
    user = get_jwt_identity()
    data = request.get_json() or {}

    symptoms = data.get("symptoms")
    pet_id = data.get("pet_id")

    if not symptoms or not pet_id:
        return jsonify({"message": "Sintomas e pet_id são obrigatórios"}), 400

    result = evaluate_triage(symptoms)

    triage = TriageRequest(
        pet_id=pet_id,
        tutor_id=user["id"],
        symptoms=symptoms,
        ai_summary=result["ai_summary"],
        risk_level=result["risk_level"],
        recommendations=result["recommendations"],
    )
    db.session.add(triage)
    db.session.commit()

    return jsonify(
        {
            "id": triage.id,
            "risk_level": triage.risk_level,
            "ai_summary": triage.ai_summary,
            "recommendations": triage.recommendations,
        }
    ), 201
