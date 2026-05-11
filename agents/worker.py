"""
Agent Worker Service
Runs all Kafka consumers in parallel threads.
Start: python -m agents.worker
"""
import logging
import threading
import time
import os
from kafka import KafkaAdminClient
from kafka.admin import NewTopic
from kafka.errors import TopicAlreadyExistsError

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(name)s] %(levelname)s %(message)s',
)
logger = logging.getLogger('worker')

BOOTSTRAP  = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
ALL_TOPICS = [
    'quiz.generate-questions',
    'quiz.questions-ready',
    'quiz.quiz-completed',
    'quiz.study-plan-ready',
]


def ensure_topics():
    """Create Kafka topics if they don't exist yet."""
    for attempt in range(10):
        try:
            admin = KafkaAdminClient(bootstrap_servers=BOOTSTRAP)
            topics = [
                NewTopic(name=t, num_partitions=3, replication_factor=1)
                for t in ALL_TOPICS
            ]
            admin.create_topics(topics, validate_only=False)
            logger.info(f"Topics ensured: {ALL_TOPICS}")
            admin.close()
            return
        except TopicAlreadyExistsError:
            logger.info("Topics already exist")
            return
        except Exception as exc:
            logger.warning(f"Kafka not ready yet ({attempt+1}/10): {exc}")
            time.sleep(5)
    raise RuntimeError("Could not connect to Kafka after 10 attempts")


def start_thread(target, name: str) -> threading.Thread:
    t = threading.Thread(target=target, name=name, daemon=True)
    t.start()
    logger.info(f"Started thread: {name}")
    return t


if __name__ == '__main__':
    from agents.kafka.question_pipeline   import run_question_pipeline
    from agents.kafka.study_plan_pipeline import run_study_plan_pipeline

    logger.info("Agent worker starting…")
    ensure_topics()

    threads = [
        start_thread(run_question_pipeline,   'question-pipeline'),
        start_thread(run_study_plan_pipeline, 'study-plan-pipeline'),
    ]

    logger.info("All consumers running. Ctrl-C to stop.")
    try:
        while all(t.is_alive() for t in threads):
            time.sleep(5)
    except KeyboardInterrupt:
        logger.info("Shutting down agent worker")
