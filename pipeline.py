import asyncio
import config
from agents.orchestrator import OrchestratorAgent
from agents.researcher import ResearcherAgent
from agents.analyst import AnalystAgent
from agents.critic import CriticAgent
from models.schemas import PipelineResult
from utils.logger import log_info


async def run(query: str) -> PipelineResult:
    log_info(f"Pipeline started: '{query}'")

    orchestrator = OrchestratorAgent()
    subtasks = await orchestrator.plan(query)

    researcher = ResearcherAgent()
    semaphore = asyncio.Semaphore(config.MAX_CONCURRENT_RESEARCHERS)

    async def bounded_research(subtask):
        async with semaphore:
            return await researcher.research(subtask)

    log_info(f"Running {len(subtasks)} research tasks concurrently...")
    findings = await asyncio.gather(*[bounded_research(t) for t in subtasks])

    analyst = AnalystAgent()
    analysis = await analyst.analyze(query, list(findings))

    critic = CriticAgent()
    critique = await critic.critique(analysis)

    log_info("Pipeline complete")
    return PipelineResult(
        query=query,
        subtasks=subtasks,
        findings=list(findings),
        analysis=analysis,
        critique=critique,
    )
