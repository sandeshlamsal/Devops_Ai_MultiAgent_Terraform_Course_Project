"""
Researcher Agent — fetches REAL data before synthesising findings.

Data pipeline per subtask:
  1. TEKS Reader  → official Texas standards + skill list (always available)
  2. Web Search   → DuckDuckGo results for curriculum-aligned content
  3. URL Fetcher  → reads reference_urls set by Orchestrator
  4. Ollama       → synthesises the REAL content into structured ResearchFinding
"""
import json
import asyncio
import logging
import ollama
import config
from models.schemas import Subtask, ResearchFinding
from agents.tools.teks_reader  import get_full_teks_context
from agents.tools.web_search   import search_math_content
from agents.tools.url_fetcher  import fetch_urls_parallel
from utils.logger import log, log_error

logger = logging.getLogger(__name__)


class ResearcherAgent:
    def __init__(self):
        self.client = ollama.AsyncClient(host=config.OLLAMA_HOST)

    async def research(self, subtask: Subtask) -> ResearchFinding:
        log("researcher", f"Researching: {subtask.title} (TEKS {subtask.teks_ref})")

        # ── Step 1: Fetch TEKS official standards ─────────────────────────────
        # Determine parent topic name from subtask title/description
        topic_name = _infer_topic(subtask.title)
        difficulty  = _infer_difficulty(subtask.description)

        teks_context = await get_full_teks_context(topic_name, difficulty)
        logger.debug(f"TEKS context: {len(teks_context)} chars")

        # ── Step 2: Real web search ────────────────────────────────────────────
        search_results = await search_math_content(
            topic=subtask.title,
            difficulty=difficulty,
            teks_ref=subtask.teks_ref,
        )

        web_snippets = "\n\n".join(
            f"[{r.get('title', 'Source')}]\n{r.get('body', '')}"
            for r in search_results[:4]
            if r.get('body')
        )
        if web_snippets:
            log("researcher", f"  Web search: {len(search_results)} results for '{subtask.title}'")
        else:
            log("researcher", f"  Web search: no results (using TEKS baseline only)")

        # ── Step 3: Fetch reference URLs set by Orchestrator ──────────────────
        url_contents = ""
        if subtask.reference_urls:
            fetched = await fetch_urls_parallel(subtask.reference_urls[:2])
            url_contents = "\n\n".join(
                f"[URL Content {i+1}]\n{c[:800]}"
                for i, c in enumerate(fetched)
                if c
            )
            if url_contents:
                log("researcher", f"  Fetched {len(fetched)} URL(s)")

        # ── Step 4: Build real context ─────────────────────────────────────────
        real_context = f"""{teks_context}

=== WEB SEARCH RESULTS (real content) ===
{web_snippets or 'No web results available — using TEKS baseline.'}

=== REFERENCE URL CONTENT ===
{url_contents or 'No URL content available.'}"""

        # ── Step 5: Ask Ollama to synthesise the REAL content ─────────────────
        prompt = f"""You are a Grade 6 Texas math curriculum specialist.

Below is REAL curriculum data from official Texas TEKS standards and web sources.
Your task: synthesise this into a concise research summary for generating quiz questions.

Topic: {subtask.title}
TEKS Reference: {subtask.teks_ref}
Focus areas: {', '.join(subtask.focus_areas)}

=== REAL CURRICULUM DATA ===
{real_context[:3000]}

Based ONLY on the above real data, respond with valid JSON:
{{
  "summary": "2-3 paragraph summary of what Grade 6 students need to know about this topic, grounded in the TEKS data above",
  "key_points": [
    "Specific skill or concept from TEKS/web sources",
    "Another specific skill",
    "A common misconception or difficulty",
    "A typical exam question type",
    "A real-world application"
  ],
  "teks_alignment": "{subtask.teks_ref}",
  "confidence": 0.92
}}"""

        try:
            response = await self.client.chat(
                model=config.OLLAMA_MODEL,
                messages=[{"role": "user", "content": prompt}],
                format="json",
            )

            data = json.loads(response.message.content)
            finding = ResearchFinding(
                subtask_id=subtask.id,
                title=subtask.title,
                summary=data.get("summary", ""),
                key_points=data.get("key_points", []),
                confidence=float(data.get("confidence", 0.85)),
            )
            log("researcher", f"  Complete: {subtask.title} (conf {finding.confidence:.0%}, {len(finding.key_points)} key points)")
            return finding

        except (json.JSONDecodeError, KeyError) as exc:
            log_error(f"Researcher parse error for '{subtask.title}': {exc}")
            # Fallback: still return a finding using TEKS baseline content
            return ResearchFinding(
                subtask_id=subtask.id,
                title=subtask.title,
                summary=teks_context[:500],
                key_points=[f"TEKS {subtask.teks_ref}", subtask.title] + subtask.focus_areas[:3],
                confidence=0.6,
            )


# ── Helpers ───────────────────────────────────────────────────────────────────

_TOPIC_KEYWORDS = {
    'Algebra':             ['algebra', 'equation', 'expression', 'variable', 'inequality', 'solve'],
    'Geometry':            ['geometry', 'area', 'perimeter', 'angle', 'shape', 'volume', 'triangle', 'circle'],
    'Number & Operations': ['number', 'integer', 'fraction', 'decimal', 'absolute', 'rational', 'operation'],
    'Proportionality':     ['ratio', 'rate', 'percent', 'proportion', 'scale', 'unit rate'],
    'Data & Statistics':   ['data', 'statistic', 'mean', 'median', 'mode', 'range', 'iqr', 'plot', 'graph'],
}

def _infer_topic(title: str) -> str:
    title_lower = title.lower()
    for topic, keywords in _TOPIC_KEYWORDS.items():
        if any(kw in title_lower for kw in keywords):
            return topic
    return 'Algebra'

def _infer_difficulty(description: str) -> str:
    desc = description.lower()
    if any(w in desc for w in ['hard', 'complex', 'multi-step', 'advanced']):
        return 'hard'
    if any(w in desc for w in ['medium', 'two-step', 'intermediate']):
        return 'medium'
    return 'easy'
