import json
import anthropic
import config
from models.schemas import AnalysisReport, CritiqueResult
from utils.logger import log

SYSTEM_PROMPT = """You are a critical reviewer specializing in research quality assessment. \
Your role is to rigorously evaluate analysis reports for logical consistency, completeness, \
bias, and actionability. Be constructive but unsparing in identifying weaknesses."""


class CriticAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    async def critique(self, report: AnalysisReport) -> CritiqueResult:
        log("critic", "Reviewing analysis report")

        report_text = f"""Topic: {report.topic}

Executive Summary: {report.executive_summary}

Key Insights:
{chr(10).join(f"- {i}" for i in report.key_insights)}

Detailed Findings:
{chr(10).join(f"- {f}" for f in report.detailed_findings)}

Conclusions: {report.conclusions}

Recommendations:
{chr(10).join(f"- {r}" for r in report.recommendations)}"""

        response = self.client.messages.create(
            model=config.CRITIC_MODEL,
            max_tokens=1024,
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
                    "content": f"""Critically evaluate this analysis report and respond with JSON only:

{report_text}

{{
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "gaps": ["gap 1", "gap 2"],
  "improved_recommendations": ["improved rec 1", "improved rec 2"],
  "overall_score": 7.5
}}""",
                }
            ],
        )

        raw = response.content[0].text
        start = raw.find("{")
        end = raw.rfind("}") + 1
        data = json.loads(raw[start:end])

        result = CritiqueResult(
            strengths=data["strengths"],
            weaknesses=data["weaknesses"],
            gaps=data["gaps"],
            improved_recommendations=data["improved_recommendations"],
            overall_score=float(data["overall_score"]),
        )
        log("critic", f"Review complete — score: {result.overall_score}/10")
        return result
