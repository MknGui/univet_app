from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from extensions import db
from models import User, Clinic  # <- inclui Clinic
import re

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

CRMV_REGEX = r"^CRMV-[A-Z]{2}\s\d{2,6}$"
EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = data.get("name")
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    raw_role = (data.get("role") or "tutor").strip().lower()

    # normaliza role
    if raw_role in ("vet", "veterinarian", "veterinario", "veterinária", "veterinaria"):
        role = "veterinarian"
    else:
        role = "tutor"

    crmv = data.get("crmv")
    specialty = data.get("specialty")
    phone = data.get("phone")
    clinic_id = data.get("clinic_id")

    # valida campos básicos
    if not name or not email or not password:
        return jsonify({"message": "name, email e password são obrigatórios"}), 400

    # valida formato de e-mail
    if not re.match(EMAIL_REGEX, email):
        return jsonify({"message": "E-mail inválido"}), 400

    # valida CRMV se role for veterinarian
    if role == "veterinarian":
        if not crmv:
            return jsonify({"message": "CRMV é obrigatório para veterinários"}), 400

        # normaliza CRMV para uppercase
        crmv = crmv.strip().upper()

        if not re.match(CRMV_REGEX, crmv):
            return jsonify(
                {"message": "CRMV inválido. Use o formato: CRMV-UF 12345"}
            ), 400

    # email duplicado
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email já cadastrado"}), 409

    # cria usuário
    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
        crmv=crmv if role == "veterinarian" else None,
        specialty=specialty if role == "veterinarian" else None,
        phone=phone,
        clinic_id=clinic_id if role == "veterinarian" else None,
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Usuário criado com sucesso"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "email e password são obrigatórios"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Credenciais inválidas"}), 401

    additional_claims = {"role": user.role}
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims,
    )

    clinic = user.clinic  # pode ser None

    return jsonify(
        {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "crmv": user.crmv,
                "specialty": user.specialty,
                "phone": user.phone,
                "clinic_id": user.clinic_id,
                "clinic_name": clinic.name if clinic else None,
                "clinic_region": clinic.region if clinic else None,
            },
        }
    ), 200