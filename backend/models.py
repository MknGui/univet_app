from datetime import datetime
from extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # tutor, vet, admin
    role = db.Column(db.String(20), nullable=False, default="tutor")

    # obrigatório só se for vet
    crmv = db.Column(db.String(50), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
class Pet(db.Model):
    __tablename__ = "pets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    species = db.Column(db.String(80))
    breed = db.Column(db.String(80))
    sex = db.Column(db.String(20))
    notes = db.Column(db.Text)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    owner = db.relationship("User", backref=db.backref("pets", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "species": self.species,
            "breed": self.breed,
            "sex": self.sex,
            "notes": self.notes,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
