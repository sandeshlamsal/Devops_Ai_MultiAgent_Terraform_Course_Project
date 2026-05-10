import json
import anthropic
import config
from models.schemas import Subtask
from utils.logger import log, log_error

PLAN_TOOL = {
    "name": "plan_research",
    "description": "Decompose a research query into focused, parallel subtasks.",
    "input_schema": {
        "type": "object",
        "properties": {
            "subtasks": {
                "type": "array",
                "minItems": 2,
                "maxItems": 5,
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "focus_areas": {
                            "type": "array",
                            "items": {"type": "string"},
                            "minItems": 2,
                        },
                    },
                    "required": ["id", "title", "description", "focus_areas"],
                },
            }
        },
        "required": ["subtasks"],
    },
}

SYSTEM_PROMPT = """You are a research orchestrator. Your job is to break down a complex \
query into 2-5 focused, non-overlapping subtasks that can be researched independently \
and in parallel. Each subtask should have a clear scope and specific focus areas."""


class OrchestratorAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    async def plan(self, query: str) -> list[Subtask]:
        log("orchestrator", f"Planning research for: {query}")

        response = self.client.messages.create(
            model=config.ORCHESTRATOR_MODEL,
            max_tokens=1024,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            tools=[PLAN_TOOL],
            tool_choice={"type": "tool", "name": "plan_research"},
            messages=[{"role": "user", "content": f"Research query: {query}"}],
        )

        for block in response.content:
            if block.type == "tool_use" and block.name == "plan_research":
                subtasks = [Subtask(**s) for s in block.input["subtasks"]]
                log("orchestrator", f"Created {len(subtasks)} subtasks")
                return subtasks

        log_error("Orchestrator did not return subtasks")
        raise ValueError("No plan_research tool call in orchestrator response")
