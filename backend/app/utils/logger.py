import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

def get_logger(name: str = "ai-multi-channel-chatbot") -> logging.Logger:
	return logging.getLogger(name)
