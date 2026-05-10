import json
import asyncio
import ollama
import config
from models.schemas import Subtask, ResearchFinding
from utils.logger import log, log_error


class ResearcherAgent:
    def __init__(self):
        self.client = ollama.AsyncClient(host=config.OLLAMA_HOST)

    async def research(self, subtask: Subtask) -> ResearchFinding:
        log("researcher", f"Researching: {subtask.title}")

        prompt = f"""You are a research specialist. Research the following topic and respond ONLY with valid JSON.

Topic: {subtask.title}
Description: {subtask.description}
Focus Areas: {", ".join(subtask.focus_areas)}

Respond with this exact JSON structure:
{{
  "summary": "2-3 paragraph summary of findings",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "confidence": 0.85
}}"""

        response = await self.client.chat(
            model=config.OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            format="json",
        )

        try:
            data = json.loads(response.message.content)
            finding = ResearchFinding(
                subtask_id=subtask.id,
                title=subtask.title,
                summary=data.get("summary", ""),
                key_points=data.get("key_points", []),
                confidence=float(data.get("confidence", 0.7)),
            )
            log("researcher", f"Completed: {subtask.title} (confidence: {finding.confidence:.0%})")
            return finding
        except (json.JSONDecodeError, KeyError) as e:
            log_error(f"Researcher failed to parse response for '{subtask.title}': {e}")
            return ResearchFinding(
                subtask_id=subtask.id,
                title=subtask.title,
                summary=response.message.content,
                key_points=[],
                confidence=0.5,
            )
