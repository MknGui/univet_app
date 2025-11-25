# backend/services/notifications_service.py

from datetime import datetime

from extensions import db
from models import Notification, User


def create_notification(user_id, type, title, message, link=None):
    """
    Cria uma notificação simples para o usuário.

    Parâmetros:
      - user_id: ID do usuário que vai receber
      - type: 'appointment' | 'triage' | 'info' | 'success'...
      - title: título curto
      - message: texto da mensagem
      - link: rota do frontend, ex: '/tutor/appointment/123'
    """

    # Se o usuário não existir, não faz nada
    user = User.query.get(user_id)
    if not user:
        return

    notif = Notification(
        user_id=user.id,
        type=type,
        title=title,
        message=message,
        # mesmo campo que o notifications_routes devolve para o front :contentReference[oaicite:1]{index=1}
        time=datetime.now().strftime("%d/%m/%Y %H:%M"),
        read=False,
        link=link,
    )

    db.session.add(notif)
    db.session.commit()
