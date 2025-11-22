from datetime import datetime
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # tutor, veterinarian, admin
    role = db.Column(db.String(20), nullable=False, default="tutor")

    # obrigatório só se for veterinarian
    crmv = db.Column(db.String(50), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Pet(db.Model):
    __tablename__ = "pets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    species = db.Column(db.String(80))      # cachorro, gato, etc.
    sex = db.Column(db.String(20))          # macho, fêmea, etc.
    age = db.Column(db.Integer)             # idade em anos (opcional)
    notes = db.Column(db.Text)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    owner = db.relationship("User", backref=db.backref("pets", lazy=True))

    breeds = db.relationship(
        "PetBreed",
        back_populates="pet",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "species": self.species,
            "sex": self.sex,
            "age": self.age,   # << aqui
            "notes": self.notes,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "breeds": [b.name for b in self.breeds],
        }



class PetBreed(db.Model):
    __tablename__ = "pet_breeds"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey("pets.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)  # nome livre da raça

    pet = db.relationship("Pet", back_populates="breeds")

    def to_dict(self):
        return {
            "id": self.id,
            "pet_id": self.pet_id,
            "name": self.name,
        }
