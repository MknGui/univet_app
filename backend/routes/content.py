from flask import Blueprint, jsonify

from models.content import EducationalContent

content_bp = Blueprint("content", __name__)


@content_bp.get("/")
def list_contents():
    contents = EducationalContent.query.order_by(
        EducationalContent.created_at.desc()
    ).all()
    return jsonify(
        [
            {
                "id": c.id,
                "title": c.title,
                "summary": c.summary,
                "target_species": c.target_species,
            }
            for c in contents
        ]
    )
