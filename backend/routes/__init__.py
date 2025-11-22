from .auth_routes import auth_bp
from .pet_routes import pets_bp


def register_blueprints(app):
    # auth_bp já tem url_prefix="/api/auth" definido no próprio blueprint
    app.register_blueprint(auth_bp)

    # pets_bp recebe prefixo aqui
    app.register_blueprint(pets_bp, url_prefix="/api")