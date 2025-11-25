from flask import Blueprint, jsonify, abort
from extensions import db
from models import EducationContent

education_bp = Blueprint("education", __name__)


@education_bp.route("/education", methods=["GET"])
def list_education():
    """
    Lista conteúdos educacionais (sem o HTML completo,
    só para a listagem).
    """
    items = (
        EducationContent.query
        .filter_by(is_active=True)
        .order_by(EducationContent.id.asc())
        .all()
    )
    return jsonify([item.to_dict(detail=False) for item in items]), 200


@education_bp.route("/education/<int:content_id>", methods=["GET"])
def get_education(content_id: int):
    """
    Detalhe de um conteúdo (inclui HTML).
    """
    item = EducationContent.query.get_or_404(content_id)

    if not item.is_active:
        abort(404)

    return jsonify(item.to_dict(detail=True)), 200
