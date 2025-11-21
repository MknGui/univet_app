from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError

from extensions import db
from models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "TUTOR")
    crmv = data.get("crmv")
    phone = data.get("phone")

    if not full_name or not email or not password:
        return jsonify({"message": "Nome, email e senha são obrigatórios"}), 400

    user = User(
        full_name=full_name,
        email=email,
        role=role,
        crmv=crmv,
        phone=phone,
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "E-mail já cadastrado"}), 400

    return jsonify({"message": "Usuário criado com sucesso"}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Informe email e senha"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Credenciais inválidas"}), 401

    identity = {"id": user.id, "role": user.role}
    access_token = create_access_token(identity=identity)

    return jsonify({"access_token": access_token, "user": identity}), 200
