from datetime import datetime

from extensions import db


class Pet(db.Model):
    __tablename__ = "pets"
    __table_args__ = {"schema": "univet"}

    id = db.Column(db.Integer, primary_key=True)
    tutor_id = db.Column(
        db.Integer,
        db.ForeignKey("univet.users.id"),
        nullable=False,
    )
    name = db.Column(db.String(100), nullable=False)
    species = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(100))
    sex = db.Column(db.String(10))
    birth_date = db.Column(db.Date)
    weight_kg = db.Column(db.Numeric(5, 2))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    tutor = db.relationship("User", back_populates="pets")
