import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss:20b")

ORCHESTRATOR_MODEL = os.getenv("ORCHESTRATOR_MODEL", "claude-sonnet-4-6")
ANALYST_MODEL = os.getenv("ANALYST_MODEL", "claude-sonnet-4-6")
CRITIC_MODEL = os.getenv("CRITIC_MODEL", "claude-sonnet-4-6")
QUESTION_GENERATOR_MODEL = os.getenv("QUESTION_GENERATOR_MODEL", "claude-sonnet-4-6")

MAX_CONCURRENT_RESEARCHERS = 3
