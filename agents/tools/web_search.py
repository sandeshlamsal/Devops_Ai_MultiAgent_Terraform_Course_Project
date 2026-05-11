"""
Real web search using DuckDuckGo — no API key required.
Returns actual search results with titles, URLs, and snippets.
"""
import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """
    Search the web using DuckDuckGo.

    Returns list of {title, href, body} dicts with real content.
    Falls back to empty list on failure so the pipeline keeps running.
    """
    loop = asyncio.get_event_loop()

    def _sync_search():
        from ddgs import DDGS
        with DDGS() as ddgs:
            return list(ddgs.text(query, max_results=max_results))

    try:
        results = await loop.run_in_executor(None, _sync_search)
        logger.info(f"Web search '{query[:60]}' → {len(results)} results")
        return results
    except Exception as exc:
        logger.warning(f"Web search failed for '{query[:60]}': {exc}")
        return []


async def search_math_content(topic: str, difficulty: str, teks_ref: str = "") -> list[dict]:
    """
    Targeted search for Grade 6 Texas math content.
    Tries 3 progressive queries to maximise relevant results.
    """
    queries = [
        f"Texas TEKS {teks_ref} Grade 6 {topic} {difficulty} math problems examples",
        f"Grade 6 {topic} math {difficulty} problems Texas curriculum",
        f"6th grade {topic} math worksheet examples",
    ]

    all_results = []
    for q in queries:
        results = await search_web(q, max_results=3)
        all_results.extend(results)
        if len(all_results) >= 5:
            break

    # Deduplicate by URL
    seen = set()
    unique = []
    for r in all_results:
        if r.get('href') not in seen:
            seen.add(r.get('href'))
            unique.append(r)

    return unique[:6]
