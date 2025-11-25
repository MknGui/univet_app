from .auth_routes import auth_bp
from .pet_routes import pets_bp
from .appointment_routes import appointments_bp
from .vet_routes import vets_bp
from .clinic_routes import clinics_bp
from .triage_routes import triage_bp
from .contact_routes import contact_bp
from .education_routes import education_bp
from .notifications_routes import notifications_bp


def register_blueprints(app):
    # auth_bp já tem url_prefix="/api/auth" definido no próprio blueprint
    app.register_blueprint(auth_bp)

    # pets_bp recebe prefixo aqui
    app.register_blueprint(pets_bp, url_prefix="/api")
    app.register_blueprint(appointments_bp, url_prefix="/api")
    app.register_blueprint(vets_bp)
    app.register_blueprint(clinics_bp)
    app.register_blueprint(triage_bp, url_prefix="/api")
    app.register_blueprint(contact_bp, url_prefix="/api")
    app.register_blueprint(education_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp)

