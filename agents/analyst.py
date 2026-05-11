import json
import re
import anthropic
import config
from models.schemas import ResearchFinding, AnalysisReport
from utils.logger import log

SYSTEM_PROMPT = """You are a senior research analyst. Synthesize research findings into a
clear, actionable analysis report. Respond ONLY with valid JSON — no other text."""


class AnalystAgent:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)

    async def analyze(self, query: str, findings: list[ResearchFinding]) -> AnalysisReport:
        log("analyst", f"Synthesizing {len(findings)} research findings")

        findings_text = "\n\n".join(
            f"## Finding {i+1}: {f.title}\n"
            f"Confidence: {f.confidence:.0%}\n"
            f"Summary: {f.summary}\n"
            f"Key Points:\n" + "\n".join(f"- {p}" for p in f.key_points)
            for i, f in enumerate(findings)
        )

        prompt = f"""Original Query: {query}

Research Findings:
{findings_text}

Produce a comprehensive analysis report as JSON:
{{
  "executive_summary": "...",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "detailed_findings": ["finding 1", "finding 2", "finding 3"],
  "conclusions": "...",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}}"""

        response = await self.client.messages.create(
            model=config.ANALYST_MODEL,
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )

        text_blocks = [b for b in response.content if b.type == "text"]
        raw = text_blocks[0].text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        report = AnalysisReport(
            topic=query,
            executive_summary=data["executive_summary"],
            key_insights=data["key_insights"],
            detailed_findings=data["detailed_findings"],
            conclusions=data["conclusions"],
            recommendations=data["recommendations"],
        )
        log("analyst", "Analysis complete")
        return report
