from datetime import datetime

from extensions import db


class EducationalContent(db.Model):
    __tablename__ = "educational_contents"
    __table_args__ = {"schema": "univet"}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    summary = db.Column(db.Text)
    body = db.Column(db.Text, nullable=False)
    target_species = db.Column(db.String(50))
    created_by = db.Column(db.Integer, db.ForeignKey("univet.users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
