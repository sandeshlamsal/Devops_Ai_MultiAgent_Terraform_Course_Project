import json
import re
import anthropic
import config
from models.schemas import Subtask
from utils.logger import log, log_error


def _extract_json(text: str) -> str:
    text = text.strip()
    # strip markdown code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()

SYSTEM_PROMPT = """You are a Texas Grade 6 math curriculum research orchestrator.

Your job is to break a math topic into 2-5 focused, non-overlapping research subtasks.

For EACH subtask you MUST provide:
1. search_query — a specific DuckDuckGo search string that will return real Grade 6
   Texas math content, worked examples, and practice problems
2. teks_ref — the exact Texas TEKS standard code this subtask covers (e.g. 6.7A, 6.9B)
3. reference_urls — 1-2 specific educational URLs likely to have quality content

Respond ONLY with valid JSON — no other text:
{
  "subtasks": [
    {
      "id": "1",
      "title": "Subtask title",
      "description": "What to research",
      "focus_areas": ["area 1", "area 2"],
      "search_query": "Texas TEKS 6.9A Grade 6 one-step equations examples",
      "teks_ref": "6.9A",
      "reference_urls": ["https://www.mathsisfun.com/algebra/linear-equations.html"]
    }
  ]
}"""


class OrchestratorAgent:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)

    async def plan(self, query: str) -> list[Subtask]:
        log("orchestrator", f"Planning research: {query}")

        response = await self.client.messages.create(
            model=config.ORCHESTRATOR_MODEL,
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Research query: {query}"}],
        )

        try:
            text_blocks = [b for b in response.content if b.type == "text"]
            if not text_blocks:
                raise ValueError("No text block in response")
            raw = _extract_json(text_blocks[0].text)
            log("orchestrator", f"Raw response: {raw[:200]}")
            data = json.loads(raw)
            subtasks = [Subtask(**s) for s in data["subtasks"]]
            for s in subtasks:
                log("orchestrator", f"  Subtask: '{s.title}' | TEKS: {s.teks_ref} | Query: {s.search_query[:60]}")
            return subtasks
        except (json.JSONDecodeError, KeyError) as exc:
            log_error(f"Orchestrator parse error: {exc}")
            raise ValueError(f"Orchestrator returned invalid JSON: {exc}")
