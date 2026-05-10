from pydantic import BaseModel, Field
from enum import Enum


class AgentRole(str, Enum):
    ORCHESTRATOR = "orchestrator"
    RESEARCHER = "researcher"
    ANALYST = "analyst"
    CRITIC = "critic"


class Subtask(BaseModel):
    id: str
    title: str
    description: str
    focus_areas: list[str]


class ResearchFinding(BaseModel):
    subtask_id: str
    title: str
    summary: str
    key_points: list[str]
    confidence: float = Field(ge=0.0, le=1.0, default=0.7)


class AnalysisReport(BaseModel):
    topic: str
    executive_summary: str
    key_insights: list[str]
    detailed_findings: list[str]
    conclusions: str
    recommendations: list[str]


class CritiqueResult(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    gaps: list[str]
    improved_recommendations: list[str]
    overall_score: float = Field(ge=0.0, le=10.0)


class PipelineResult(BaseModel):
    query: str
    subtasks: list[Subtask]
    findings: list[ResearchFinding]
    analysis: AnalysisReport
    critique: CritiqueResult
