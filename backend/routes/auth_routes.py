from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from extensions import db
from models import User, Clinic  # <- inclui Clinic
import re

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

CRMV_REGEX = r"^CRMV-[A-Z]{2}\s\d{2,6}$"
EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"


def _user_to_dict(user: User) -> dict:
    """Serialização centralizada do usuário (login / me)."""
    clinic = getattr(user, "clinic", None)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "crmv": getattr(user, "crmv", None),
        "specialty": getattr(user, "specialty", None),
        "phone": getattr(user, "phone", None),
        "cpf": getattr(user, "cpf", None),
        "clinic_id": getattr(user, "clinic_id", None),
        "clinic_name": clinic.name if clinic else None,
        "clinic_region": clinic.region if clinic else None,
    }


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

    return jsonify(
        {
            "access_token": access_token,
            "user": _user_to_dict(user),
        }
    ), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    """Retorna os dados do usuário logado."""
    identity = get_jwt_identity()
    if not identity:
        return jsonify({"message": "Usuário não identificado"}), 401

    user = User.query.get_or_404(int(identity))
    return jsonify(_user_to_dict(user)), 200


@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_me():
    """Atualiza os dados básicos do usuário logado."""
    identity = get_jwt_identity()
    if not identity:
        return jsonify({"message": "Usuário não identificado"}), 401

    user = User.query.get_or_404(int(identity))
    data = request.get_json() or {}

    # nome
    name = (data.get("name") or user.name or "").strip()
    # email
    email = (data.get("email") or user.email or "").strip().lower()
    # telefone
    phone = (data.get("phone") or "").strip() or None
    # cpf (se o modelo tiver esse campo)
    cpf = (data.get("cpf") or "").strip() or None

    # campos específicos de vet (podem vir ou não)
    crmv = data.get("crmv")
    specialty = data.get("specialty")

    if not name or not email:
        return jsonify({"message": "Nome e e-mail são obrigatórios"}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"message": "E-mail inválido"}), 400

    # garante que não vai colidir email com outro usuário
    existing = User.query.filter_by(email=email).first()
    if existing and existing.id != user.id:
        return jsonify({"message": "Email já está em uso por outro usuário"}), 409

    user.name = name
    user.email = email
    user.phone = phone

    # usa getattr/setattr pra não quebrar se o campo ainda não existir na tabela
    if hasattr(user, "cpf"):
        user.cpf = cpf

    # se for veterinário, permite atualizar CRMV e especialidade
    if user.role == "veterinarian":
        if crmv is not None:
            crmv = crmv.strip().upper()
            # permite limpar o CRMV se vier vazio, mas valida se tiver conteúdo
            if crmv and not re.match(CRMV_REGEX, crmv):
                return jsonify(
                    {"message": "CRMV inválido. Use o formato: CRMV-UF 12345"}
                ), 400
            user.crmv = crmv or None

        if specialty is not None:
            specialty = specialty.strip() or None
            user.specialty = specialty

    db.session.commit()

    return jsonify(_user_to_dict(user)), 200
