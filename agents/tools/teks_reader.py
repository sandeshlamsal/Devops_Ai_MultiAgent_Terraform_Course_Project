"""
Texas TEKS Grade 6 Math Standards Reader.

Provides two layers:
  1. Hardcoded baseline — official TEKS standard descriptions (always available)
  2. Live fetch — reads https://www.ixl.com/standards/texas/math/grade-6 for
     the latest skill list, with a 24-hour in-memory cache.
"""
import asyncio
import logging
import time
from agents.tools.url_fetcher import fetch_url_text

logger = logging.getLogger(__name__)

# Public TEKS reference (IXL blocks bots; Texas Gateway is open)
TEKS_IXL_URL = 'https://texreg.sos.state.tx.us/public/readtac$ext.TacPage?sl=R&app=9&p_dir=&p_rloc=&p_tloc=&p_ploc=&pg=1&p_tac=&ti=19&pt=2&ch=111&rl=27'

# ── Official Texas TEKS Grade 6 Math Standards (baseline, always available) ──
TEKS_GRADE6: dict[str, dict] = {
    'Algebra': {
        'teks_refs': ['6.7A', '6.7B', '6.7C', '6.7D', '6.9A', '6.9B', '6.9C', '6.10A', '6.10B'],
        'standards': {
            '6.7A': 'Generate equivalent numerical expressions using order of operations',
            '6.7B': 'Distinguish between expressions and equations verbally, numerically, and algebraically',
            '6.7C': 'Determine if two expressions are equivalent using concrete models, pictorial models, and algebraic representations',
            '6.7D': 'Generate equivalent expressions using the properties of operations: inverse, identity, commutative, associative, and distributive properties',
            '6.9A': 'Write one-variable, one-step equations and inequalities to represent constraints or conditions within problems',
            '6.9B': 'Represent solutions for one-variable, one-step equations and inequalities on number lines',
            '6.9C': 'Write corresponding real-world problems given one-variable, one-step equations or inequalities',
            '6.10A': 'Model and solve one-variable, one-step equations and inequalities that represent problems, including geometric concepts',
            '6.10B': 'Determine if the given value(s) make(s) one-variable, one-step equations or inequalities true',
        },
        'key_skills': [
            'Solve one-step equations: x + a = b, ax = b, x/a = b',
            'Solve two-step equations: ax + b = c',
            'Write and evaluate algebraic expressions',
            'Identify independent and dependent variables',
            'Apply distributive property: a(b+c) = ab + ac',
            'Combine like terms: 3x + 2x = 5x',
            'Write inequalities and graph on number lines',
        ],
        'difficulty_examples': {
            'easy':   'Solve: x + 5 = 12',
            'medium': 'Solve: 3x - 4 = 11',
            'hard':   'Solve: 2(x + 3) = 5x - 6; write and solve an inequality',
        },
    },

    'Geometry': {
        'teks_refs': ['6.4H', '6.8A', '6.8B', '6.8C', '6.8D', '6.11A'],
        'standards': {
            '6.8A': 'Extend previous knowledge of triangles and their properties including the triangle inequality theorem',
            '6.8B': 'Model area formulas for parallelograms, trapezoids, and triangles by decomposing and rearranging parts of these shapes',
            '6.8C': 'Write equations that represent problems related to the area of rectangles, parallelograms, trapezoids, and triangles',
            '6.8D': 'Determine solutions for problems involving the area of rectangles, parallelograms, trapezoids, and triangles',
            '6.11A': 'Graph points in all four quadrants using ordered pairs of rational numbers',
        },
        'key_skills': [
            'Area: rectangle = l×w, square = s², triangle = ½bh',
            'Area: parallelogram = bh, trapezoid = ½(b₁+b₂)h',
            'Perimeter: rectangle = 2(l+w), equilateral triangle = 3s',
            'Circumference: C = πd = 2πr, Area circle = πr²',
            'Volume: rectangular prism = l×w×h, cube = s³',
            'Surface area of rectangular prisms and cubes',
            'Angle relationships: supplementary (180°), complementary (90°)',
            'Triangle angle sum = 180°, quadrilateral = 360°',
            'Pythagorean theorem: a² + b² = c²',
        ],
        'difficulty_examples': {
            'easy':   'Find the area of a rectangle: l=6, w=4',
            'medium': 'Find the area of a trapezoid: b₁=5, b₂=9, h=4',
            'hard':   'Find the hypotenuse of a right triangle with legs 8 and 15',
        },
    },

    'Number & Operations': {
        'teks_refs': ['6.2A', '6.2B', '6.2C', '6.2D', '6.2E', '6.3A', '6.3B', '6.3C', '6.3D', '6.3E'],
        'standards': {
            '6.2A': 'Classify whole numbers, integers, and rational numbers using a visual representation such as a Venn diagram',
            '6.2B': 'Identify a number, its opposite, and its absolute value',
            '6.2C': 'Locate, compare, and order integers and rational numbers using a number line',
            '6.2D': 'Order a set of rational numbers arising from mathematical and real-world contexts',
            '6.2E': 'Extend representations for division to include fraction notation such as a/b represents the same number as a÷b',
            '6.3A': 'Recognize that dividing by a rational number and multiplying by its reciprocal result in equivalent values',
            '6.3B': 'Determine, with and without computation, whether a quantity is increased or decreased when multiplied/divided by a fraction',
            '6.3C': 'Represent integer operations with concrete models and connect the actions with the models to standardized algorithms',
            '6.3D': 'Add, subtract, multiply, and divide integers fluently',
            '6.3E': 'Multiply and divide positive rational numbers fluently',
        },
        'key_skills': [
            'Absolute value: |x| = distance from zero, always non-negative',
            'Integer operations: rules for +/- with negative numbers',
            'Multiply/divide integers: same signs → positive, different → negative',
            'Fraction operations: add/subtract (common denominator), multiply, divide (flip and multiply)',
            'Reciprocals: flip numerator and denominator',
            'Converting: fraction ↔ decimal ↔ percent',
            'Order rational numbers on number line',
        ],
        'difficulty_examples': {
            'easy':   'What is |−8|? What is −3 + 7?',
            'medium': 'Calculate: −4 × (−3); simplify 2/3 ÷ 1/4',
            'hard':   'Order from least to greatest: −1.5, 3/2, −3/4, 0; evaluate (−2)³ − (−3)²',
        },
    },

    'Proportionality': {
        'teks_refs': ['6.4A', '6.4B', '6.4C', '6.4D', '6.4E', '6.4F', '6.4G', '6.4H',
                      '6.5A', '6.5B', '6.5C'],
        'standards': {
            '6.4B': 'Apply qualitative and quantitative reasoning to solve prediction and comparison of real-world problems involving ratios and rates',
            '6.4C': 'Give examples of ratios as multiplicative comparisons of two quantities',
            '6.4D': 'Give examples of rates as the comparison by division of two quantities having different attributes',
            '6.4E': 'Represent ratios and percents with concrete models, fractions, and decimals',
            '6.4G': 'Generate equivalent forms of fractions, decimals, and percents using real-world problems',
            '6.5A': 'Represent mathematical and real-world problems involving ratios and rates using scale factors, tables, graphs, and proportions',
            '6.5B': 'Solve real-world problems to find whole given part and percent, part given whole and percent, and percent given part and whole',
        },
        'key_skills': [
            'Ratio a:b = a/b; unit rate = rate per 1 unit',
            'Proportion: a/b = c/d → ad = bc (cross multiplication)',
            'Percent formula: Part = Percent × Whole',
            'Find whole: Whole = Part ÷ Percent',
            'Percent increase: (New−Old)/Old × 100',
            'Percent decrease: (Old−New)/Old × 100',
            'Benchmark percents: 10%=÷10, 25%=÷4, 50%=÷2, 33⅓%=÷3',
            'Proportional relationship: y = kx (k = constant of proportionality)',
        ],
        'difficulty_examples': {
            'easy':   'What is 25% of 80? Write 3/4 as a percent.',
            'medium': '15 is 30% of what number? A price rose from $40 to $50 — what is the % increase?',
            'hard':   'A jacket costs $90 after a 25% discount. What was the original price?',
        },
    },

    'Data & Statistics': {
        'teks_refs': ['6.12A', '6.12B', '6.12C', '6.12D', '6.13A', '6.13B'],
        'standards': {
            '6.12A': 'Represent numeric data graphically using dot plots, stem-and-leaf plots, histograms, and box plots',
            '6.12B': 'Use graphical representation to describe the center, spread, and shape of data distribution',
            '6.12C': 'Summarize numeric data with mean, median (center) and range, IQR (spread)',
            '6.12D': 'Summarize categorical data with numerical and graphical summaries',
            '6.13A': 'Interpret numeric data summarized in dot plots, stem-and-leaf plots, histograms, and box plots',
            '6.13B': 'Distinguish between situations that yield data with and without variability',
        },
        'key_skills': [
            'Mean = sum ÷ count; affected by outliers',
            'Median = middle value (or avg of two middle); resistant to outliers',
            'Mode = most frequent value',
            'Range = max − min',
            'Q1 = median of lower half; Q3 = median of upper half',
            'IQR = Q3 − Q1 (middle 50% spread)',
            'MAD = average of |value − mean|',
            'Box plot: min, Q1, median, Q3, max (five-number summary)',
            'Histogram: bars show frequency of value intervals',
        ],
        'difficulty_examples': {
            'easy':   'Find mean, median, mode, range of: {4, 6, 6, 8, 10, 12}',
            'medium': 'Find IQR of: {3, 7, 9, 12, 15, 18, 22, 26}',
            'hard':   'Data: {2,4,6,8,10}. Calculate MAD. What does it represent?',
        },
    },
}

# ── In-memory cache for live fetch ────────────────────────────────────────────
_live_cache: dict[str, tuple[float, str]] = {}   # {url: (timestamp, content)}
_CACHE_TTL = 24 * 3600   # 24 hours


async def fetch_live_teks(topic_name: str) -> str:
    """
    Fetch live TEKS content from IXL for a specific topic.
    Returns empty string on failure (baseline always available).
    """
    url = TEKS_IXL_URL
    now = time.time()

    if url in _live_cache:
        ts, content = _live_cache[url]
        if now - ts < _CACHE_TTL:
            logger.debug(f"TEKS cache hit for {url}")
            return _extract_topic_section(content, topic_name)

    logger.info(f"Fetching live TEKS from {url}")
    content = await fetch_url_text(url, timeout=20)

    if content:
        _live_cache[url] = (now, content)
        return _extract_topic_section(content, topic_name)

    return ""


def _extract_topic_section(full_text: str, topic_name: str) -> str:
    """Extract the relevant topic section from the full IXL page text."""
    lines = full_text.split('\n')
    topic_lower = topic_name.lower()
    collecting = False
    result = []

    for line in lines:
        if topic_lower in line.lower():
            collecting = True
        elif collecting and any(
            other.lower() in line.lower()
            for other in TEKS_GRADE6
            if other.lower() != topic_lower
        ):
            if len(result) > 5:
                break

        if collecting and line.strip():
            result.append(line.strip())
            if len(result) >= 30:
                break

    return '\n'.join(result)


def get_teks_baseline(topic_name: str) -> dict:
    """Return hardcoded TEKS data for a topic (always works, no network needed)."""
    return TEKS_GRADE6.get(topic_name, TEKS_GRADE6['Algebra'])


async def get_full_teks_context(topic_name: str, difficulty: str) -> str:
    """
    Return a rich TEKS context string combining baseline + live fetch.
    Used by the Researcher agent as real curriculum grounding.
    """
    baseline = get_teks_baseline(topic_name)

    # Build structured baseline text
    standards_text = '\n'.join(
        f'  {ref}: {desc}'
        for ref, desc in list(baseline['standards'].items())[:6]
    )
    skills_text = '\n'.join(f'  • {s}' for s in baseline['key_skills'])
    example = baseline['difficulty_examples'].get(difficulty, '')

    # Attempt live fetch (non-blocking, falls back gracefully)
    live_text = await fetch_live_teks(topic_name)
    live_section = f"\nLive IXL Content:\n{live_text[:800]}" if live_text else ""

    return f"""=== TEXAS TEKS Grade 6 — {topic_name} ===

Official Standards:
{standards_text}

Key Skills for {difficulty.capitalize()} level:
{skills_text}

{difficulty.capitalize()}-level example: {example}
TEKS references: {', '.join(baseline['teks_refs'][:5])}
{live_section}"""
