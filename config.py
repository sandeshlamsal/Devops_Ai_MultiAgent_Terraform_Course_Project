import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

ORCHESTRATOR_MODEL       = os.getenv("ORCHESTRATOR_MODEL",       "claude-sonnet-4-6")
RESEARCHER_MODEL         = os.getenv("RESEARCHER_MODEL",         "claude-haiku-4-5-20251001")
ANALYST_MODEL            = os.getenv("ANALYST_MODEL",            "claude-sonnet-4-6")
CRITIC_MODEL             = os.getenv("CRITIC_MODEL",             "claude-sonnet-4-6")
QUESTION_GENERATOR_MODEL = os.getenv("QUESTION_GENERATOR_MODEL", "claude-sonnet-4-6")

MAX_CONCURRENT_RESEARCHERS = 3
