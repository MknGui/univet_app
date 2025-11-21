from datetime import datetime

from extensions import db


class TriageRequest(db.Model):
    __tablename__ = "triage_requests"
    __table_args__ = {"schema": "univet"}

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(
        db.Integer,
        db.ForeignKey("univet.pets.id"),
        nullable=False,
    )
    tutor_id = db.Column(
        db.Integer,
        db.ForeignKey("univet.users.id"),
        nullable=False,
    )
    symptoms = db.Column(db.Text, nullable=False)
    ai_summary = db.Column(db.Text)
    risk_level = db.Column(db.String(20))
    recommendations = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
