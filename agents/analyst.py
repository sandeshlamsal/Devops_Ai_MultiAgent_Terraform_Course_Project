import anthropic
import config
from models.schemas import ResearchFinding, AnalysisReport
from utils.logger import log

SYSTEM_PROMPT = """You are a senior research analyst with expertise in synthesizing complex \
information into clear, actionable insights. You receive research findings from multiple \
specialized researchers and produce comprehensive, well-structured analysis reports.

Your analysis must be:
- Evidence-based and grounded in the provided findings
- Structured with clear executive summary, insights, and recommendations
- Critical and balanced, acknowledging limitations and uncertainties
- Actionable with concrete, prioritized recommendations"""


class AnalystAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    async def analyze(self, query: str, findings: list[ResearchFinding]) -> AnalysisReport:
        log("analyst", f"Synthesizing {len(findings)} research findings")

        findings_text = "\n\n".join(
            f"## Finding {i+1}: {f.title}\n"
            f"Confidence: {f.confidence:.0%}\n"
            f"Summary: {f.summary}\n"
            f"Key Points:\n" + "\n".join(f"- {p}" for p in f.key_points)
            for i, f in enumerate(findings)
        )

        response = self.client.messages.create(
            model=config.ANALYST_MODEL,
            max_tokens=2048,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[
                {
                    "role": "user",
                    "content": f"""Original Query: {query}

Research Findings:
{findings_text}

Produce a comprehensive analysis report. Structure your response as JSON:
{{
  "executive_summary": "...",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "detailed_findings": ["finding 1", "finding 2", "finding 3"],
  "conclusions": "...",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}}""",
                }
            ],
        )

        import json
        raw = response.content[0].text
        start = raw.find("{")
        end = raw.rfind("}") + 1
        data = json.loads(raw[start:end])

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
