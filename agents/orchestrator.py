import json
import anthropic
import config
from models.schemas import Subtask
from utils.logger import log, log_error

PLAN_TOOL = {
    "name": "plan_research",
    "description": (
        "Decompose a math topic into focused research subtasks. "
        "For each subtask provide a specific web search query and Texas TEKS reference "
        "so the researcher can fetch real curriculum-aligned content."
    ),
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
                        "id":          {"type": "string"},
                        "title":       {"type": "string"},
                        "description": {"type": "string"},
                        "focus_areas": {
                            "type": "array",
                            "items": {"type": "string"},
                            "minItems": 2,
                        },
                        "search_query": {
                            "type": "string",
                            "description": (
                                "Specific DuckDuckGo search query to find real Grade 6 "
                                "Texas math content, examples, and problems for this subtask"
                            ),
                        },
                        "teks_ref": {
                            "type": "string",
                            "description": "Texas TEKS standard code (e.g. '6.7A', '6.9B')",
                        },
                        "reference_urls": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Specific educational URLs to fetch for real content",
                        },
                    },
                    "required": ["id", "title", "description", "focus_areas",
                                 "search_query", "teks_ref"],
                },
            }
        },
        "required": ["subtasks"],
    },
}

SYSTEM_PROMPT = """You are a Texas Grade 6 math curriculum research orchestrator.

Your job is to break a math topic into 2-5 focused, non-overlapping research subtasks.

For EACH subtask you MUST provide:
1. search_query — a specific DuckDuckGo search string that will return real Grade 6
   Texas math content, worked examples, and practice problems
2. teks_ref — the exact Texas TEKS standard code this subtask covers (e.g. 6.7A, 6.9B)
3. reference_urls — 1-2 specific educational URLs likely to have quality content
   (Khan Academy, IXL, Math is Fun, Texas Gateway, etc.)

Good search queries include grade level, subject, and specific skill:
  "Texas TEKS 6.9A Grade 6 one-step equations examples problems"
  "Grade 6 linear equations two-step Texas math worksheet"

Reference URLs — use these crawler-friendly sites (they return real content):
  - https://www.mathsisfun.com/algebra/linear-equations.html  (Algebra)
  - https://www.mathsisfun.com/geometry/index.html            (Geometry)
  - https://www.mathsisfun.com/numbers/fractions.html         (Number & Ops)
  - https://www.mathsisfun.com/percentages.html               (Proportionality)
  - https://www.mathsisfun.com/data/index.html                (Data & Statistics)
  - https://www.mathsisfun.com/algebra/index.html             (General Algebra)

Adjust the URL path to match the specific subtask skill being researched."""


class OrchestratorAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    async def plan(self, query: str) -> list[Subtask]:
        log("orchestrator", f"Planning research: {query}")

        response = self.client.messages.create(
            model=config.ORCHESTRATOR_MODEL,
            max_tokens=1500,
            system=[{
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }],
            tools=[PLAN_TOOL],
            tool_choice={"type": "tool", "name": "plan_research"},
            messages=[{"role": "user", "content": f"Research query: {query}"}],
        )

        for block in response.content:
            if block.type == "tool_use" and block.name == "plan_research":
                subtasks = [Subtask(**s) for s in block.input["subtasks"]]
                for s in subtasks:
                    log("orchestrator", f"  Subtask: '{s.title}' | TEKS: {s.teks_ref} | Query: {s.search_query[:60]}")
                return subtasks

        log_error("Orchestrator did not return subtasks")
        raise ValueError("No plan_research tool call in orchestrator response")
