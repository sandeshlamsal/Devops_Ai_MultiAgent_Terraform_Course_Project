"""
Fetches real content from URLs — strips HTML, returns clean text.
Used to read TEKS documents, Khan Academy pages, and math content sites.
"""
import asyncio
import logging
import re
from typing import Optional

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                  'AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

MAX_CHARS = 4000   # cap per URL to avoid overloading context


async def fetch_url_text(url: str, timeout: int = 15) -> str:
    """
    Fetch a URL and return clean, readable text content.
    Removes scripts, ads, navigation, and excess whitespace.
    """
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=timeout,
            headers=HEADERS,
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove noise
        for tag in soup(['script', 'style', 'nav', 'footer', 'header',
                         'aside', 'advertisement', 'form', 'button']):
            tag.decompose()

        # Prefer main content blocks
        main = (
            soup.find('main') or
            soup.find('article') or
            soup.find(class_=re.compile(r'content|main|body', re.I)) or
            soup.body
        )

        text = (main or soup).get_text(separator='\n', strip=True)

        # Collapse excessive blank lines
        text = re.sub(r'\n{3,}', '\n\n', text)

        truncated = text[:MAX_CHARS]
        logger.info(f"Fetched {url[:60]} → {len(truncated)} chars")
        return truncated

    except Exception as exc:
        logger.warning(f"Failed to fetch {url[:60]}: {exc}")
        return ""


async def fetch_urls_parallel(urls: list[str], max_concurrent: int = 3) -> list[str]:
    """Fetch multiple URLs concurrently, return list of text contents."""
    sem = asyncio.Semaphore(max_concurrent)

    async def bounded_fetch(url):
        async with sem:
            return await fetch_url_text(url)

    results = await asyncio.gather(*[bounded_fetch(u) for u in urls])
    return [r for r in results if r]   # drop empty results
