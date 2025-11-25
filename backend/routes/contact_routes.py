from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import ContactMessage

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/contact-messages", methods=["POST"])
@jwt_required()
def create_contact_message():
    """
    Salva uma mensagem de contato enviada pelo usuário logado.

    Espera JSON:
    {
      "subject": "Assunto",
      "message": "Texto da mensagem"
    }
    """
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"message": "Usuário não identificado"}), 401

    data = request.get_json() or {}
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    if not subject or not message:
        return jsonify({"message": "Assunto e mensagem são obrigatórios"}), 400

    contact = ContactMessage(
        user_id=int(user_id),
        subject=subject,
        message=message,
    )

    db.session.add(contact)
    db.session.commit()

    return jsonify(contact.to_dict()), 201
