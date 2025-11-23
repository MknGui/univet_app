from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db  # mantido para o futuro, se precisar
from models import User, Clinic

vets_bp = Blueprint("vets", __name__, url_prefix="/api/vets")


@vets_bp.route("", methods=["GET"])
@jwt_required()
def list_vets():
    """Lista veterinários disponíveis.

    Opcionalmente aceita ?region=Centro para filtrar pela região da clínica.
    Retorna num formato compatível com o front (VetOption).
    """
    region = request.args.get("region")

    # só usuários com role = veterinarian
    query = User.query.filter_by(role="veterinarian")

    # se veio filtro de região, faz join com Clinic
    if region:
        query = (
            query.join(Clinic, Clinic.id == User.clinic_id, isouter=True)
            .filter(Clinic.region == region)
        )

    vets = query.all()

    result = []
    for v in vets:
        clinic = v.clinic  # pode ser None

        result.append(
            {
                "id": v.id,
                "name": v.name,
                "email": v.email,
                "crmv": v.crmv,
                "specialty": v.specialty,
                "phone": v.phone,
                # campos que o front espera (VetOption)
                "clinic_name": clinic.name if clinic else None,
                "region": clinic.region if clinic else None,
            }
        )

    return jsonify(result), 200
