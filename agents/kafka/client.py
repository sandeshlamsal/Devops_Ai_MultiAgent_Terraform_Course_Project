import os
import json
import logging
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import NoBrokersAvailable

logger = logging.getLogger(__name__)

BOOTSTRAP = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')

# ── Topic names ───────────────────────────────────────────────────────────────
TOPIC_GENERATE_QUESTIONS = 'quiz.generate-questions'
TOPIC_QUESTIONS_READY    = 'quiz.questions-ready'
TOPIC_QUIZ_COMPLETED     = 'quiz.quiz-completed'
TOPIC_STUDY_PLAN_READY   = 'quiz.study-plan-ready'

ALL_TOPICS = [
    TOPIC_GENERATE_QUESTIONS,
    TOPIC_QUESTIONS_READY,
    TOPIC_QUIZ_COMPLETED,
    TOPIC_STUDY_PLAN_READY,
]


def make_producer() -> KafkaProducer:
    return KafkaProducer(
        bootstrap_servers=BOOTSTRAP,
        value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
        acks='all',
        retries=3,
    )


def make_consumer(topics: list[str], group_id: str) -> KafkaConsumer:
    return KafkaConsumer(
        *topics,
        bootstrap_servers=BOOTSTRAP,
        group_id=group_id,
        value_deserializer=lambda v: json.loads(v.decode('utf-8')),
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        consumer_timeout_ms=-1,   # block forever
    )
