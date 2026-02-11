from openai import OpenAI

from app.ai.memory import Memory
from app.ai.rag import retrieve_context
from app.config import settings

memory = Memory()

def generate_reply(message: str, channel: str) -> str:
    context = retrieve_context(message)
    memory.add_turn(channel=channel, user_message=message, bot_message=None)

    if settings.api_key:
        client = OpenAI(api_key=settings.api_key)
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Context: {context}\n\nUser: {message}"},
            ],
        )
        reply = response.choices[0].message.content or ""
    else:
        reply = f"Echo from {channel}: {message}\nContext: {context}"

    memory.update_last_bot_message(channel=channel, bot_message=reply)
    return reply
