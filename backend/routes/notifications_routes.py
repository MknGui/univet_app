# notifications_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Notification

notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications",
)


def _notification_to_dict(n: Notification) -> dict:
    """Serialização centralizada da notificação."""
    return {
        "id": n.id,
        "type": n.type,
        "title": n.title,
        "message": n.message,
        # se você preferir, pode mandar created_at aqui e formatar no front
        "time": n.time,
        "read": n.read,
        "link": n.link,
    }


@notifications_bp.route("", methods=["GET"])
@jwt_required()
def list_notifications():
    """Lista notificações do usuário logado, mais recentes primeiro."""
    identity = get_jwt_identity()
    if not identity:
        return jsonify({"message": "Usuário não identificado"}), 401

    user_id = int(identity)

    notifs = (
        Notification.query.filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return jsonify([_notification_to_dict(n) for n in notifs]), 200


@notifications_bp.route("/<int:notification_id>/read", methods=["PATCH"])
@jwt_required()
def mark_notification_read(notification_id: int):
    """Marca uma notificação específica como lida."""
    identity = get_jwt_identity()
    if not identity:
        return jsonify({"message": "Usuário não identificado"}), 401

    user_id = int(identity)

    notif = Notification.query.filter_by(
        id=notification_id, user_id=user_id
    ).first_or_404()

    if not notif.read:
        notif.read = True
        db.session.commit()

    return jsonify(_notification_to_dict(notif)), 200


@notifications_bp.route("/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_notifications_read():
    """Marca todas as notificações do usuário logado como lidas."""
    identity = get_jwt_identity()
    if not identity:
        return jsonify({"message": "Usuário não identificado"}), 401

    user_id = int(identity)

    Notification.query.filter_by(user_id=user_id, read=False).update(
        {"read": True}
    )
    db.session.commit()

    return jsonify({"status": "ok"}), 200