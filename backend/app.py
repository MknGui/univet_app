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
