# setup_backend.py
import os
import textwrap

BASE_DIR = os.path.join(os.getcwd(), "backend")

FILES = {
    "requirements.txt": """
    Flask==3.0.0
    Flask-SQLAlchemy==3.1.1
    Flask-Migrate==4.0.5
    Flask-JWT-Extended==4.7.1
    psycopg2-binary==2.9.9
    python-dotenv==1.0.1
    Werkzeug==3.0.3
    flask-cors==4.0.0
    """,

    "config.py": """
    import os

    class Config:
        SQLALCHEMY_DATABASE_URI = os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg2://univet:univet@localhost:5432/univet"
        )
        SQLALCHEMY_TRACK_MODIFICATIONS = False
        JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
        FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    """,

    "extensions.py": """
    from flask_sqlalchemy import SQLAlchemy
    from flask_migrate import Migrate
    from flask_jwt_extended import JWTManager

    db = SQLAlchemy()
    migrate = Migrate()
    jwt = JWTManager()
    """,

    "app.py": """
    from flask import Flask
    from flask_cors import CORS

    from config import Config
    from extensions import db, migrate, jwt

    def create_app():
        app = Flask(__name__)
        app.config.from_object(Config)

        CORS(
            app,
            origins=[app.config["FRONTEND_ORIGIN"]],
            supports_credentials=True,
        )

        db.init_app(app)
        migrate.init_app(app, db)
        jwt.init_app(app)

        # Importa models para o Flask-Migrate enxergar
        from models.user import User  # noqa
        from models.pet import Pet  # noqa
        from models.appointment import Appointment  # noqa
        from models.triage import TriageRequest  # noqa
        from models.content import EducationalContent  # noqa

        # Blueprints
        from routes.auth import auth_bp
        from routes.pets import pets_bp
        from routes.appointments import appointments_bp
        from routes.triage import triage_bp
        from routes.content import content_bp

        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        app.register_blueprint(pets_bp, url_prefix="/api/pets")
        app.register_blueprint(appointments_bp, url_prefix="/api/appointments")
        app.register_blueprint(triage_bp, url_prefix="/api/triage")
        app.register_blueprint(content_bp, url_prefix="/api/content")

        @app.get("/api/health")
        def health():
            return {"status": "ok"}, 200

        return app


    if __name__ == "__main__":
        app = create_app()
        app.run(debug=True)
    """,

    # models/__init__.py
    os.path.join("models", "__init__.py"): """
    # Pacote de models
    """,

    # models/user.py
    os.path.join("models", "user.py"): """
    from datetime import datetime
    from werkzeug.security import generate_password_hash, check_password_hash

    from extensions import db


    class User(db.Model):
        __tablename__ = "users"
        __table_args__ = {"schema": "univet"}

        id = db.Column(db.Integer, primary_key=True)
        full_name = db.Column(db.String(150), nullable=False)
        email = db.Column(db.String(150), unique=True, nullable=False)
        password_hash = db.Column(db.String(255), nullable=False)
        role = db.Column(db.String(20), nullable=False)  # TUTOR, VET, ADMIN
        crmv = db.Column(db.String(30))
        phone = db.Column(db.String(30))
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(
            db.DateTime,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
            nullable=False,
        )

        pets = db.relationship("Pet", back_populates="tutor", lazy="dynamic")

        def set_password(self, password: str):
            self.password_hash = generate_password_hash(password)

        def check_password(self, password: str) -> bool:
            return check_password_hash(self.password_hash, password)
    """,

    # models/pet.py
    os.path.join("models", "pet.py"): """
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
    """,

    # models/appointment.py
    os.path.join("models", "appointment.py"): """
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
    """,

    # models/triage.py
    os.path.join("models", "triage.py"): """
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
    """,

    # models/content.py
    os.path.join("models", "content.py"): """
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
    """,

    # routes/__init__.py
    os.path.join("routes", "__init__.py"): """
    # Pacote de rotas
    """,

    # routes/auth.py
    os.path.join("routes", "auth.py"): """
    from flask import Blueprint, jsonify, request
    from flask_jwt_extended import create_access_token
    from sqlalchemy.exc import IntegrityError

    from extensions import db
    from models.user import User

    auth_bp = Blueprint("auth", __name__)


    @auth_bp.post("/register")
    def register():
        data = request.get_json() or {}
        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "TUTOR")
        crmv = data.get("crmv")
        phone = data.get("phone")

        if not full_name or not email or not password:
            return jsonify({"message": "Nome, email e senha são obrigatórios"}), 400

        user = User(
            full_name=full_name,
            email=email,
            role=role,
            crmv=crmv,
            phone=phone,
        )
        user.set_password(password)

        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "E-mail já cadastrado"}), 400

        return jsonify({"message": "Usuário criado com sucesso"}), 201


    @auth_bp.post("/login")
    def login():
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Informe email e senha"}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"message": "Credenciais inválidas"}), 401

        identity = {"id": user.id, "role": user.role}
        access_token = create_access_token(identity=identity)

        return jsonify({"access_token": access_token, "user": identity}), 200
    """,

    # routes/pets.py
    os.path.join("routes", "pets.py"): """
    from flask import Blueprint, jsonify, request
    from flask_jwt_extended import get_jwt_identity, jwt_required

    from extensions import db
    from models.pet import Pet

    pets_bp = Blueprint("pets", __name__)


    @pets_bp.post("/")
    @jwt_required()
    def create_pet():
        user = get_jwt_identity()
        tutor_id = user["id"]

        data = request.get_json() or {}
        name = data.get("name")
        species = data.get("species")

        if not name or not species:
            return jsonify({"message": "Nome e espécie são obrigatórios"}), 400

        pet = Pet(
            tutor_id=tutor_id,
            name=name,
            species=species,
            breed=data.get("breed"),
            sex=data.get("sex"),
            notes=data.get("notes"),
        )
        db.session.add(pet)
        db.session.commit()

        return jsonify({"id": pet.id, "message": "Pet cadastrado"}), 201


    @pets_bp.get("/")
    @jwt_required()
    def list_pets():
        user = get_jwt_identity()
        pets = Pet.query.filter_by(tutor_id=user["id"]).all()
        return jsonify(
            [
                {
                    "id": p.id,
                    "name": p.name,
                    "species": p.species,
                    "breed": p.breed,
                }
                for p in pets
            ]
        )
    """,

    # routes/appointments.py
    os.path.join("routes", "appointments.py"): """
    from datetime import datetime

    from flask import Blueprint, jsonify, request
    from flask_jwt_extended import get_jwt_identity, jwt_required

    from extensions import db
    from models.appointment import Appointment

    appointments_bp = Blueprint("appointments", __name__)


    @appointments_bp.post("/")
    @jwt_required()
    def create_appointment():
        user = get_jwt_identity()
        data = request.get_json() or {}

        try:
            scheduled_at = datetime.fromisoformat(data["scheduled_at"])
        except Exception:
            return jsonify({"message": "Data de agendamento inválida"}), 400

        appointment = Appointment(
            pet_id=data["pet_id"],
            tutor_id=user["id"],
            vet_id=data["vet_id"],
            scheduled_at=scheduled_at,
            notes=data.get("notes"),
            status="PENDING",
        )
        db.session.add(appointment)
        db.session.commit()

        return jsonify(
            {"id": appointment.id, "message": "Consulta agendada"}
        ), 201


    @appointments_bp.get("/")
    @jwt_required()
    def list_appointments():
        user = get_jwt_identity()
        qs = Appointment.query.filter_by(tutor_id=user["id"]).order_by(
            Appointment.scheduled_at.desc()
        )
        return jsonify(
            [
                {
                    "id": a.id,
                    "pet_id": a.pet_id,
                    "vet_id": a.vet_id,
                    "scheduled_at": a.scheduled_at.isoformat(),
                    "status": a.status,
                    "notes": a.notes,
                }
                for a in qs.all()
            ]
        )
    """,

    # services/__init__.py
    os.path.join("services", "__init__.py"): """
    # Pacote de serviços
    """,

    # services/triage_rules.py
    os.path.join("services", "triage_rules.py"): """
    def evaluate_triage(symptoms: str) -> dict:
        '''
        Aplica regras simples de triagem simulando uma IA.
        Ajuste as regras conforme a necessidade do projeto.
        '''
        text = symptoms.lower()

        if "convuls" in text or "não responde" in text or "nao responde" in text:
            risk = "ALTO"
            rec = "Procure atendimento veterinário de emergência imediatamente."
        elif "não come" in text or "nao come" in text or "vômito" in text or "vomito" in text or "diarre" in text:
            risk = "MÉDIO"
            rec = "Agende uma consulta nas próximas 24 horas e mantenha o animal hidratado."
        else:
            risk = "BAIXO"
            rec = "Monitore o quadro e, se persistir, agende uma consulta de rotina."

        return {
            "risk_level": risk,
            "recommendations": rec,
            "ai_summary": f"Nível de risco: {risk}. Recomendação: {rec}",
        }
    """,

    # routes/triage.py
    os.path.join("routes", "triage.py"): """
    from flask import Blueprint, jsonify, request
    from flask_jwt_extended import get_jwt_identity, jwt_required

    from extensions import db
    from models.triage import TriageRequest
    from services.triage_rules import evaluate_triage

    triage_bp = Blueprint("triage", __name__)


    @triage_bp.post("/")
    @jwt_required()
    def create_triage():
        user = get_jwt_identity()
        data = request.get_json() or {}

        symptoms = data.get("symptoms")
        pet_id = data.get("pet_id")

        if not symptoms or not pet_id:
            return jsonify({"message": "Sintomas e pet_id são obrigatórios"}), 400

        result = evaluate_triage(symptoms)

        triage = TriageRequest(
            pet_id=pet_id,
            tutor_id=user["id"],
            symptoms=symptoms,
            ai_summary=result["ai_summary"],
            risk_level=result["risk_level"],
            recommendations=result["recommendations"],
        )
        db.session.add(triage)
        db.session.commit()

        return jsonify(
            {
                "id": triage.id,
                "risk_level": triage.risk_level,
                "ai_summary": triage.ai_summary,
                "recommendations": triage.recommendations,
            }
        ), 201
    """,

    # routes/content.py
    os.path.join("routes", "content.py"): """
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
    """,
}


def write_file(relative_path: str, content: str):
    full_path = os.path.join(BASE_DIR, relative_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    if os.path.exists(full_path):
        print(f"[SKIP] {relative_path} já existe")
        return
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(textwrap.dedent(content).lstrip("\n"))
    print(f"[OK]   criado {relative_path}")


def main():
    print(f"Criando estrutura de backend em: {BASE_DIR}")
    os.makedirs(BASE_DIR, exist_ok=True)

    for path, content in FILES.items():
        write_file(path, content)

    print("\nPronto!")
    print("Passos sugeridos:")
    print("1) cd backend")
    print("2) python -m venv .venv")
    print("   - Ative o ambiente virtual")
    print("3) pip install -r requirements.txt")
    print("4) Configure a variável DATABASE_URL para seu PostgreSQL")
    print("5) python app.py")


if __name__ == "__main__":
    main()