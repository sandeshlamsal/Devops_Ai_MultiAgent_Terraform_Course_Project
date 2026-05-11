"""
Kafka consumer: quiz.generate-questions
Runs full multi-agent pipeline → publishes to quiz.questions-ready
"""
import asyncio
import logging
import config
from agents.orchestrator import OrchestratorAgent
from agents.researcher import ResearcherAgent
from agents.question_generator_agent import QuestionGeneratorAgent
from agents.kafka.client import (
    make_producer, make_consumer,
    TOPIC_GENERATE_QUESTIONS, TOPIC_QUESTIONS_READY,
)

logger = logging.getLogger(__name__)


async def run_pipeline(payload: dict) -> dict:
    request_id = payload['requestId']
    topic_id   = payload['topicId']
    topic_name = payload['topicName']
    difficulty = payload['difficulty']
    count      = int(payload.get('count', 5))

    logger.info(f"[{request_id}] Pipeline started → {topic_name} / {difficulty} / {count}q")

    # ── Step 1: Orchestrator decomposes into research subtasks ────────────────
    orchestrator = OrchestratorAgent()
    query = (
        f"Research {count} Grade 6 Texas TEKS {difficulty}-level {topic_name} concepts "
        f"suitable for multiple-choice quiz questions."
    )
    subtasks = await orchestrator.plan(query)
    logger.info(f"[{request_id}] {len(subtasks)} subtasks created")

    # ── Step 2: Researchers run in parallel ───────────────────────────────────
    researcher = ResearcherAgent()
    semaphore  = asyncio.Semaphore(config.MAX_CONCURRENT_RESEARCHERS)

    async def bounded(subtask):
        async with semaphore:
            return await researcher.research(subtask)

    findings = list(await asyncio.gather(*[bounded(t) for t in subtasks]))
    logger.info(f"[{request_id}] {len(findings)} findings collected")

    # ── Step 3: Question Generator Agent formats questions ───────────────────
    generator = QuestionGeneratorAgent()
    questions = await generator.generate(
        topic_name=topic_name,
        difficulty=difficulty,
        count=count,
        findings=findings,
    )

    logger.info(f"[{request_id}] Pipeline complete — {len(questions)} questions ready")

    return {
        'requestId': request_id,
        'topicId':   topic_id,
        'difficulty': difficulty,
        'questions':  questions,
        'error':      None,
    }


def run_question_pipeline():
    """Blocking Kafka consumer loop — runs in its own thread."""
    consumer = make_consumer([TOPIC_GENERATE_QUESTIONS], 'question-gen-group')
    producer = make_producer()
    logger.info("Question pipeline consumer started → listening on quiz.generate-questions")

    for message in consumer:
        payload = message.value
        rid = payload.get('requestId', '?')
        try:
            result = asyncio.run(run_pipeline(payload))
        except Exception as exc:
            logger.error(f"[{rid}] Pipeline error: {exc}", exc_info=True)
            result = {
                'requestId': rid,
                'topicId':   payload.get('topicId'),
                'difficulty': payload.get('difficulty'),
                'questions':  [],
                'error':      str(exc),
            }

        producer.send(TOPIC_QUESTIONS_READY, value=result)
        producer.flush()
        logger.info(f"[{rid}] Published to {TOPIC_QUESTIONS_READY}")
