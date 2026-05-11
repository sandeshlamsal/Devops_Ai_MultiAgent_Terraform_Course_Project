import json
import anthropic
import config
from models.schemas import ResearchFinding
from utils.logger import log

SYSTEM_PROMPT = """You are an expert Texas Grade 6 math curriculum writer.
Given research findings on a math topic, generate well-crafted multiple-choice quiz questions.

Each question must:
- Be appropriate for Grade 6 level
- Have exactly 4 answer choices (a, b, c, d)
- Have one clearly correct answer
- Include a concise step-by-step explanation

Always respond with valid JSON only — no other text."""


class QuestionGeneratorAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

    async def generate(
        self,
        topic_name: str,
        difficulty: str,
        count: int,
        findings: list[ResearchFinding],
    ) -> list[dict]:
        log('analyst', f"Generating {count} {difficulty} {topic_name} questions from {len(findings)} findings")

        findings_text = '\n\n'.join(
            f'Research {i+1}: {f.title}\n{f.summary}\nKey points: {"; ".join(f.key_points[:3])}'
            for i, f in enumerate(findings)
        )

        prompt = f"""Topic: {topic_name}
Difficulty: {difficulty}
Grade level: 6 (Texas TEKS)
Number of questions needed: {count}

Research findings to draw from:
{findings_text}

Generate exactly {count} multiple-choice questions. Respond ONLY with this JSON array:
[
  {{
    "question_text": "Question here",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_option": "a",
    "explanation": "Step-by-step explanation here"
  }}
]"""

        response = self.client.messages.create(
            model=config.ANALYST_MODEL,
            max_tokens=4096,
            system=[{
                'type': 'text',
                'text': SYSTEM_PROMPT,
                'cache_control': {'type': 'ephemeral'},
            }],
            messages=[{'role': 'user', 'content': prompt}],
        )

        raw = response.content[0].text.strip()
        # Extract JSON array even if wrapped in markdown code fences
        if '```' in raw:
            raw = raw.split('```')[1].lstrip('json').strip()

        questions = json.loads(raw)
        log('analyst', f"Generated {len(questions)} questions")
        return questions
