from datetime import datetime

from extensions import db


class Appointment(db.Model):
    __tablename__ = "appointments"
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
    vet_id = db.Column(
        db.Integer,
        db.ForeignKey("univet.users.id"),
        nullable=False,
    )
    scheduled_at = db.Column(db.DateTime, nullable=False)
    status = db.Column(
        db.String(20),
        nullable=False,
        default="PENDING",
    )  # PENDING, CONFIRMED, CANCELLED, DONE
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
