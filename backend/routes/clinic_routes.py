from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Clinic, User

# prefixo já deixa tudo em /api/clinics
clinics_bp = Blueprint("clinics", __name__, url_prefix="/api/clinics")


@clinics_bp.route("", methods=["POST"])
@jwt_required()
def create_clinic():
    """Cria uma nova clínica.

    Apenas veterinários podem criar clínicas.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "Usuário não encontrado"}), 404

    if user.role != "veterinarian":
        return jsonify({"message": "Somente veterinários podem criar clínicas"}), 403

    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"message": "name é obrigatório"}), 400

    clinic = Clinic(
        name=name,
        region=data.get("region"),
        address=data.get("address"),
        city=data.get("city"),
        state=data.get("state"),
        zip_code=data.get("zip_code"),
        phone=data.get("phone"),
    )
    db.session.add(clinic)
    db.session.commit()

    return jsonify(clinic.to_dict()), 201


@clinics_bp.route("", methods=["GET"])
@jwt_required()
def list_clinics():
    """Lista todas as clínicas cadastradas."""
    clinics = Clinic.query.order_by(Clinic.name).all()
    return jsonify([c.to_dict() for c in clinics]), 200


@clinics_bp.route("/current", methods=["PUT"])
@jwt_required()
def set_current_clinic():
    """Define a clínica atual do veterinário logado.

    Body JSON:
    {
        "clinic_id": 123
    }
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "Usuário não encontrado"}), 404

    if user.role != "veterinarian":
        return jsonify({"message": "Somente veterinários podem definir clínica"}), 403

    data = request.get_json() or {}
    clinic_id = data.get("clinic_id")

    if not clinic_id:
        return jsonify({"message": "clinic_id é obrigatório"}), 400

    clinic = Clinic.query.get(clinic_id)
    if not clinic:
        return jsonify({"message": "Clínica não encontrada"}), 404

    user.clinic_id = clinic.id
    db.session.commit()

    return jsonify(
        {
            "message": "Clínica definida como atual",
            "clinic_id": clinic.id,
            "clinic": clinic.to_dict(),
        }
    ), 200
