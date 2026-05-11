"""
Kafka consumer: quiz.quiz-completed
Generates personalised study plan with Claude → publishes to quiz.study-plan-ready
"""
import asyncio
import logging
import anthropic
import config
from agents.kafka.client import (
    make_producer, make_consumer,
    TOPIC_QUIZ_COMPLETED, TOPIC_STUDY_PLAN_READY,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a supportive Grade 6 math tutor.
Given a student's quiz results, write a short, encouraging, actionable study plan (max 200 words).
Use simple language. Format with bullet points. Focus on what to practise next."""


async def generate_plan(payload: dict) -> str:
    student_name = payload.get('studentName', 'the student')
    topic        = payload['topicName']
    difficulty   = payload['difficulty']
    score_pct    = payload['scorePercent']
    wrong        = payload.get('wrongAnswers', [])

    wrong_summary = '\n'.join(
        f"- {a['questionText']} (chose {a['chosenText']}, correct: {a['correctText']})"
        for a in wrong[:5]
    )

    prompt = f"""Student: {student_name}
Topic: {topic}  |  Difficulty: {difficulty}  |  Score: {score_pct}%

Wrong answers:
{wrong_summary if wrong_summary else 'None — perfect score!'}

Write a short personalised study plan for this student."""

    client   = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model=config.CRITIC_MODEL,   # Haiku — cost-efficient for this task
        max_tokens=512,
        system=[{
            'type': 'text',
            'text': SYSTEM_PROMPT,
            'cache_control': {'type': 'ephemeral'},
        }],
        messages=[{'role': 'user', 'content': prompt}],
    )
    return response.content[0].text.strip()


def run_study_plan_pipeline():
    """Blocking Kafka consumer loop — runs in its own thread."""
    consumer = make_consumer([TOPIC_QUIZ_COMPLETED], 'study-plan-group')
    producer = make_producer()
    logger.info("Study plan consumer started → listening on quiz.quiz-completed")

    for message in consumer:
        payload = message.value
        session_id = payload.get('sessionId', '?')
        user_id    = payload.get('userId')

        if not user_id:
            logger.debug(f"[{session_id}] Anonymous session — skipping study plan")
            continue

        try:
            plan = asyncio.run(generate_plan(payload))
        except Exception as exc:
            logger.error(f"[{session_id}] Study plan error: {exc}", exc_info=True)
            continue

        producer.send(TOPIC_STUDY_PLAN_READY, value={
            'sessionId': session_id,
            'userId':    user_id,
            'plan':      plan,
        })
        producer.flush()
        logger.info(f"[{session_id}] Study plan published for user {user_id}")
