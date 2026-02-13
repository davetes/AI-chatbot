import smtplib
from email.message import EmailMessage

from app.config import settings


def send_email(to_address: str, subject: str, body: str) -> None:
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_pass:
        raise RuntimeError("SMTP settings are not configured")

    msg = EmailMessage()
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = to_address
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        if settings.smtp_tls:
            server.starttls()
        server.login(settings.smtp_user, settings.smtp_pass)
        server.send_message(msg)
