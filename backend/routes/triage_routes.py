# triage_routes.py
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from extensions import db
from models import Pet, Triage
from services.notifications_service import create_notification

triage_bp = Blueprint("triage", __name__)


def _get_current_user():
    """Retorna (user_id:int, role:str) baseado no JWT."""
    identity = get_jwt_identity()
    claims = get_jwt()

    user_id = int(identity) if identity is not None else None
    role = claims.get("role") if isinstance(claims, dict) else None
    return user_id, role


def _analyze_symptoms(symptoms: str) -> dict:
    """
    Regras simples de triagem (IA simulada) conforme visão do produto:
    - Palavras muito graves -> urgent
    - Sintomas moderados -> monitor
    - Restante -> ok
    """

    text = (symptoms or "").lower()

    urgent_keywords = [
        "convuls",             # convulsão
        "não respira",
        "nao respira",
        "dificuldade para respirar",
        "respiração rápida",
        "respiracao rapida",
        "sangue",
        "sangrando",
        "não levanta",
        "nao levanta",
        "inconsciente",
        "não responde",
        "nao responde",
    ]

    warning_keywords = [
        "vômit", "vomit",      # vômito/vomitando
        "diarre",              # diarreia
        "febre", "febril",
        "apatia", "letarg",
        "não come", "nao come",
        "não bebe", "nao bebe",
        "mancando", "claudicação",
        "coçando", "coceira",
    ]

    urgent_hits = sum(1 for k in urgent_keywords if k in text)
    warning_hits = sum(1 for k in warning_keywords if k in text)
    length = len(text.split())

    if urgent_hits >= 1 or warning_hits >= 3:
        risk_level = "urgent"
        ai_summary = (
            "Os sintomas relatados indicam um quadro potencialmente grave ou emergencial."
        )
        recommendations = (
            "Recomendo levar o animal imediatamente a um pronto-atendimento veterinário. "
            "Evite oferecer alimentos ou medicamentos por conta própria e mantenha o animal em local calmo."
        )
    elif warning_hits >= 1 or length > 25:
        risk_level = "monitor"
        ai_summary = (
            "Os sintomas sugerem um desconforto moderado que merece acompanhamento próximo."
        )
        recommendations = (
            "Observe o animal pelas próximas horas, registrando mudanças de apetite, vômitos, fezes e comportamento. "
            "Se os sintomas persistirem por mais de 24h ou piorarem, agende uma consulta o quanto antes."
        )
    else:
        risk_level = "ok"
        ai_summary = (
            "Os sintomas descritos parecem leves ou inespecíficos neste momento."
        )
        recommendations = (
            "Mantenha a rotina normal do animal, com água fresca e ambiente confortável. "
            "Caso surjam novos sintomas ou haja piora, agende uma avaliação veterinária."
        )

    return {
        "risk_level": risk_level,
        "ai_summary": ai_summary,
        "recommendations": recommendations,
    }


@triage_bp.route("/triage/", methods=["POST"])
@jwt_required()
def create_triage():
    """
    Espera JSON:
    {
      "pet_id": number,
      "symptoms": string
    }

    Retorna TriageResult:
    {
      "id": number,
      "risk_level": string,
      "ai_summary": string,
      "recommendations": string,
      ...campos extras (pet_id, tutor_id, created_at)
    }
    """
    user_id, role = _get_current_user()
    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    data = request.get_json() or {}
    pet_id = data.get("pet_id")
    symptoms = (data.get("symptoms") or "").strip()

    if not pet_id or not symptoms:
        return jsonify({"message": "pet_id e symptoms são obrigatórios"}), 400

    try:
        pet_id = int(pet_id)
    except (TypeError, ValueError):
        return jsonify({"message": "pet_id deve ser um inteiro"}), 400

    pet = Pet.query.get(pet_id)
    if not pet:
        return jsonify({"message": "Pet não encontrado"}), 404

    # Regra de segurança:
    # - Tutor só pode triagem para o próprio pet
    # - Veterinário pode para qualquer pet
    if role != "veterinarian" and pet.owner_id != user_id:
        return jsonify({"message": "Você não é tutor deste pet"}), 403

    analysis = _analyze_symptoms(symptoms)

    triage = Triage(
        pet_id=pet.id,
        tutor_id=pet.owner_id,
        symptoms=symptoms,
        risk_level=analysis["risk_level"],
        ai_summary=analysis["ai_summary"],
        recommendations=analysis["recommendations"],
        created_at=datetime.utcnow(),
    )

    db.session.add(triage)
    db.session.commit()

    # Notificação para o tutor com o resultado da triagem
    risk_level = analysis.get("risk_level")
    if risk_level == "urgent":
        risk_label = "Urgente"
    elif risk_level == "monitor":
        risk_label = "Atenção"
    else:
        risk_label = "Leve"

    title = f"Triagem de {pet.name}: {risk_label}"
    message = analysis.get("ai_summary") or "Sua triagem foi concluída."

    create_notification(
        user_id=pet.owner_id,
        type="triage",
        title=title,
        message=message,
    )

    return jsonify(triage.to_dict()), 201
