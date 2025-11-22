from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import User, Clinic

vets_bp = Blueprint("vets", __name__, url_prefix="/api/vets")


@vets_bp.route("", methods=["GET"])
@jwt_required()
def list_vets():
    region = request.args.get("region")

    query = User.query.filter_by(role="veterinarian")

    if region:
        query = query.join(Clinic, isouter=True).filter(Clinic.region == region)

    vets = query.all()

    result = []
    for v in vets:
        result.append(
            {
                "id": v.id,
                "name": v.name,
                "email": v.email,
                "crmv": v.crmv,
                "specialty": v.specialty,
                "phone": v.phone,
                "clinic": v.clinic.to_dict() if v.clinic else None,
            }
        )

    return jsonify(result), 200
