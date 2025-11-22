from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db, migrate, jwt
from routes import register_blueprints


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Extensões
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Blueprints
    register_blueprints(app)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
