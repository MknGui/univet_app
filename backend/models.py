from datetime import datetime, date
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # tutor, veterinarian, admin
    role = db.Column(db.String(20), nullable=False, default="tutor")

    # apenas para veterinário
    crmv = db.Column(db.String(50), nullable=True)
    specialty = db.Column(db.String(120), nullable=True)   # Ex: Dermatologia
    phone = db.Column(db.String(30), nullable=True)        # Celular / WhatsApp

    # clínica principal do vet (pode ser nula para tutor)
    clinic_id = db.Column(db.Integer, db.ForeignKey("clinics.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relação para acessar os dados da clínica
    clinic = db.relationship("Clinic", back_populates="vets")


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

    vaccines = db.relationship(
        "PetVaccine",
        back_populates="pet",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def to_dict(self, include_vaccines: bool = False):
        data = {
            "id": self.id,
            "name": self.name,
            "species": self.species,
            "sex": self.sex,
            "age": self.age,
            "notes": self.notes,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "breeds": [b.name for b in self.breeds],
        }
        if include_vaccines:
            data["vaccines"] = [v.to_dict() for v in self.vaccines]
        return data


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


class PetVaccine(db.Model):
    __tablename__ = "pet_vaccines"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey("pets.id"), nullable=False)

    name = db.Column(db.String(120), nullable=False)
    lot = db.Column(db.String(80))
    date = db.Column(db.Date, nullable=False)
    next_dose = db.Column(db.Date)
    notes = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    pet = db.relationship("Pet", back_populates="vaccines")

    def to_dict(self):
        return {
            "id": self.id,
            "pet_id": self.pet_id,
            "name": self.name,
            "lot": self.lot,
            "date": self.date.isoformat() if self.date else None,
            "next_dose": self.next_dose.isoformat() if self.next_dose else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, nullable=False)
    tutor_id = db.Column(db.Integer, nullable=False)
    vet_id = db.Column(db.Integer, nullable=False)

    scheduled_at = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.Text, nullable=True)

    status = db.Column(db.String(20), nullable=False, default="PENDING")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    def __repr__(self):
        return f"<Appointment {self.id} pet={self.pet_id} status={self.status}>"

    def to_dict(self):
        return {
            "id": self.id,
            "pet_id": self.pet_id,
            "tutor_id": self.tutor_id,
            "vet_id": self.vet_id,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class Clinic(db.Model):
    __tablename__ = "clinics"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)

    # para o filtro que você usa no front: Centro, Zona Sul, etc
    region = db.Column(db.String(80), nullable=True)

    # endereço básico
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(80), nullable=True)
    state = db.Column(db.String(2), nullable=True)
    zip_code = db.Column(db.String(20), nullable=True)

    phone = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # lista de veterinários dessa clínica
    vets = db.relationship("User", back_populates="clinic", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "region": self.region,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "zip_code": self.zip_code,
            "phone": self.phone,
        }

class Triage(db.Model):
    __tablename__ = "triages"

    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey("pets.id"), nullable=False)
    tutor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    symptoms = db.Column(db.Text, nullable=False)
    risk_level = db.Column(db.String(32), nullable=False)
    ai_summary = db.Column(db.Text, nullable=False)
    recommendations = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    pet = db.relationship("Pet", backref="triages")
    tutor = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "pet_id": self.pet_id,
            "tutor_id": self.tutor_id,
            "symptoms": self.symptoms,
            "risk_level": self.risk_level,
            "ai_summary": self.ai_summary,
            "recommendations": self.recommendations,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
