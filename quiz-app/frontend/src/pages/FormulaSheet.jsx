import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TOPICS = [
  { id: 1, name: 'Algebra',             icon: '𝑥', color: '#6366f1', bg: '#e0e7ff' },
  { id: 2, name: 'Geometry',            icon: '△', color: '#f59e0b', bg: '#fef3c7' },
  { id: 3, name: 'Number & Operations', icon: '±', color: '#10b981', bg: '#d1fae5' },
  { id: 4, name: 'Proportionality',     icon: '%', color: '#ef4444', bg: '#fee2e2' },
  { id: 5, name: 'Data & Statistics',   icon: '📊', color: '#8b5cf6', bg: '#ede9fe' },
];

const FORMULAS = {
  1: {
    sections: [
      {
        title: 'Key Vocabulary',
        items: [
          { label: 'Variable',    formula: 'x, y, n …',         example: 'x represents an unknown number' },
          { label: 'Expression',  formula: '3x + 5',            example: 'No equals sign — cannot be solved' },
          { label: 'Equation',    formula: '3x + 5 = 11',       example: 'Has equals sign — can be solved' },
          { label: 'Inequality',  formula: 'x > 5  or  x ≤ 3', example: 'Solution is a range of values' },
        ],
      },
      {
        title: 'Solving Equations',
        items: [
          { label: 'One-step (add/sub)',  formula: 'x + a = b  →  x = b − a',           example: 'x + 4 = 9  →  x = 5' },
          { label: 'One-step (mul/div)',  formula: 'ax = b  →  x = b ÷ a',               example: '3x = 12  →  x = 4' },
          { label: 'Two-step',           formula: 'ax + b = c  →  x = (c − b) ÷ a',     example: '2x + 3 = 11  →  x = 4' },
          { label: 'Division form',      formula: 'x ÷ a = b  →  x = b × a',            example: 'x ÷ 3 = 5  →  x = 15' },
        ],
      },
      {
        title: 'Properties & Simplifying',
        items: [
          { label: 'Distributive',       formula: 'a(b + c) = ab + ac',                 example: '3(x + 4) = 3x + 12' },
          { label: 'Combine like terms', formula: 'ax + bx = (a + b)x',                 example: '3x + 5x = 8x' },
          { label: 'Commutative',        formula: 'a + b = b + a',                      example: '3 + x = x + 3' },
          { label: 'Substitution',       formula: 'Replace variable with its value',     example: 'If x=3, then 2x = 2(3) = 6' },
        ],
      },
    ],
  },

  2: {
    sections: [
      {
        title: 'Area Formulas',
        items: [
          { label: 'Rectangle',      formula: 'A = l × w',                     example: 'l=5, w=3  →  A = 15 cm²' },
          { label: 'Square',         formula: 'A = s²',                        example: 's=4  →  A = 16 cm²' },
          { label: 'Triangle',       formula: 'A = ½ × b × h',                 example: 'b=6, h=4  →  A = 12 cm²' },
          { label: 'Parallelogram',  formula: 'A = b × h',                     example: 'b=7, h=3  →  A = 21 cm²' },
          { label: 'Trapezoid',      formula: 'A = ½ × (b₁ + b₂) × h',        example: 'b₁=4, b₂=8, h=5  →  A = 30 cm²' },
          { label: 'Circle',         formula: 'A = π × r²   (π ≈ 3.14)',       example: 'r=5  →  A = 78.5 cm²' },
        ],
      },
      {
        title: 'Perimeter & Circumference',
        items: [
          { label: 'Rectangle',      formula: 'P = 2(l + w)',                  example: 'l=6, w=4  →  P = 20 cm' },
          { label: 'Square',         formula: 'P = 4s',                        example: 's=5  →  P = 20 cm' },
          { label: 'Triangle',       formula: 'P = a + b + c',                 example: '3+4+5 = 12 cm' },
          { label: 'Circle (C)',      formula: 'C = π × d  =  2πr',            example: 'd=10  →  C = 31.4 cm' },
        ],
      },
      {
        title: 'Volume & Surface Area',
        items: [
          { label: 'Rectangular prism', formula: 'V = l × w × h',             example: '3×4×5 = 60 cm³' },
          { label: 'Cube volume',        formula: 'V = s³',                    example: 's=4  →  V = 64 cm³' },
          { label: 'Cube surface area',  formula: 'SA = 6s²',                  example: 's=3  →  SA = 54 cm²' },
        ],
      },
      {
        title: 'Angles & Triangles',
        items: [
          { label: 'Triangle angles',    formula: '∠A + ∠B + ∠C = 180°',      example: '60° + 70° + ? = 180°  →  50°' },
          { label: 'Quadrilateral',      formula: 'Sum of angles = 360°',      example: '4-sided shapes always total 360°' },
          { label: 'Pentagon',           formula: 'Sum = (5−2) × 180° = 540°', example: 'Formula: (n−2) × 180°' },
          { label: 'Pythagorean',        formula: 'a² + b² = c²',              example: '3²+4²=5²  →  9+16=25 ✓' },
        ],
      },
    ],
  },

  3: {
    sections: [
      {
        title: 'Integers & Absolute Value',
        items: [
          { label: 'Absolute value',     formula: '|x| = distance from 0',     example: '|−7| = 7   |4| = 4' },
          { label: 'Opposite',           formula: 'opposite of a = −a',         example: 'Opposite of −3 is 3' },
          { label: 'Adding same signs',  formula: 'Add, keep the sign',         example: '−4 + (−3) = −7' },
          { label: 'Adding diff signs',  formula: 'Subtract, keep larger sign', example: '−8 + 5 = −3' },
          { label: 'Subtracting neg.',   formula: 'a − (−b) = a + b',           example: '5 − (−3) = 5 + 3 = 8' },
        ],
      },
      {
        title: 'Multiplying & Dividing Integers',
        items: [
          { label: 'Same signs',         formula: 'Positive result',            example: '(−3)(−4) = 12   6÷2 = 3' },
          { label: 'Different signs',    formula: 'Negative result',            example: '(−3)(4) = −12   −6÷2 = −3' },
        ],
      },
      {
        title: 'Fractions',
        items: [
          { label: 'Adding/Subtracting', formula: 'Common denominator required',  example: '1/3 + 1/6 → 2/6 + 1/6 = 3/6 = 1/2' },
          { label: 'Multiplying',        formula: 'a/b × c/d = ac/bd',            example: '2/3 × 3/4 = 6/12 = 1/2' },
          { label: 'Dividing',           formula: 'a/b ÷ c/d = a/b × d/c',       example: '2/3 ÷ 1/4 = 2/3 × 4/1 = 8/3' },
          { label: 'Reciprocal',         formula: 'Flip numerator & denominator', example: 'Reciprocal of 3/5 is 5/3' },
        ],
      },
      {
        title: 'Converting',
        items: [
          { label: 'Fraction → Decimal', formula: 'Divide numerator by denominator', example: '3/4 = 3÷4 = 0.75' },
          { label: 'Decimal → Percent',  formula: 'Multiply by 100',               example: '0.6 × 100 = 60%' },
          { label: 'Percent → Decimal',  formula: 'Divide by 100',                 example: '45% ÷ 100 = 0.45' },
        ],
      },
    ],
  },

  4: {
    sections: [
      {
        title: 'Ratios & Rates',
        items: [
          { label: 'Ratio',          formula: 'a : b  or  a/b',                 example: '3 cats to 5 dogs = 3:5' },
          { label: 'Unit rate',      formula: 'Rate with denominator = 1',       example: '$12 for 4 items → $3 per item' },
          { label: 'Proportion',     formula: 'a/b = c/d  →  ad = bc',          example: '2/5 = x/15  →  x = 6' },
          { label: 'Constant (k)',   formula: 'y = kx  →  k = y ÷ x',          example: 'y=12, x=3  →  k=4' },
        ],
      },
      {
        title: 'Percents',
        items: [
          { label: 'Find the part',       formula: 'Part = Percent × Whole',     example: '25% of 80 = 0.25 × 80 = 20' },
          { label: 'Find the whole',      formula: 'Whole = Part ÷ Percent',     example: '15 is 30% of ?  →  15÷0.30 = 50' },
          { label: 'Find the percent',    formula: 'Percent = Part ÷ Whole × 100', example: '18 out of 72 = 25%' },
          { label: 'Percent increase',    formula: '(New − Old) ÷ Old × 100',    example: '$40→$50: 10÷40×100 = 25%' },
          { label: 'Percent decrease',    formula: '(Old − New) ÷ Old × 100',    example: '$80→$60: 20÷80×100 = 25%' },
          { label: 'Sale price',          formula: 'Price − (Discount% × Price)', example: '$50 at 20% off = $50−$10 = $40' },
        ],
      },
      {
        title: 'Benchmark Percents',
        items: [
          { label: '1%',    formula: 'Divide by 100',  example: '1% of 350 = 3.5' },
          { label: '10%',   formula: 'Divide by 10',   example: '10% of 80 = 8' },
          { label: '25%',   formula: 'Divide by 4',    example: '25% of 60 = 15' },
          { label: '50%',   formula: 'Divide by 2',    example: '50% of 94 = 47' },
          { label: '33⅓%',  formula: 'Divide by 3',    example: '33⅓% of 90 = 30' },
        ],
      },
    ],
  },

  5: {
    sections: [
      {
        title: 'Measures of Center',
        items: [
          { label: 'Mean (average)', formula: 'Sum of all values ÷ Count',               example: '{4,6,8,10} → 28÷4 = 7' },
          { label: 'Median',         formula: 'Middle value when ordered',                example: '{3,5,9,11,13} → 9' },
          { label: 'Median (even)',   formula: 'Average of two middle values',            example: '{2,4,6,8} → (4+6)÷2 = 5' },
          { label: 'Mode',           formula: 'Most frequently occurring value',          example: '{3,5,5,7} → mode = 5' },
        ],
      },
      {
        title: 'Measures of Spread',
        items: [
          { label: 'Range',   formula: 'Max − Min',                                      example: '{3,8,15} → 15−3 = 12' },
          { label: 'Q1',      formula: 'Median of the lower half',                       example: '{2,4,6,8,10} → Q1 = 4' },
          { label: 'Q3',      formula: 'Median of the upper half',                       example: '{2,4,6,8,10} → Q3 = 8' },
          { label: 'IQR',     formula: 'Q3 − Q1',                                        example: 'Q3=8, Q1=4 → IQR = 4' },
          { label: 'MAD',     formula: 'Average of |each value − mean|',                 example: '{2,4,6}: mean=4, MAD=(2+0+2)÷3 ≈ 1.3' },
        ],
      },
      {
        title: 'Graphs & Displays',
        items: [
          { label: 'Dot plot',           formula: 'Each dot = one data value',           example: 'Good for small data sets' },
          { label: 'Histogram',          formula: 'Bars show frequency of intervals',    example: 'Good for large continuous data' },
          { label: 'Box plot',           formula: 'Shows min, Q1, median, Q3, max',      example: 'Box = middle 50% of data' },
          { label: 'Stem-and-leaf',      formula: 'Stem = tens digit, leaf = ones',      example: '27 → stem 2, leaf 7' },
        ],
      },
      {
        title: 'Box Plot Summary',
        items: [
          { label: 'Below Q1',          formula: 'Lowest 25% of data',                  example: 'Left whisker + left edge of box' },
          { label: 'Q1 to Median',      formula: 'Next 25% of data',                   example: 'Left half of box' },
          { label: 'Median to Q3',      formula: 'Next 25% of data',                   example: 'Right half of box' },
          { label: 'Above Q3',          formula: 'Top 25% of data',                     example: 'Right whisker' },
        ],
      },
    ],
  },
};

export default function FormulaSheet() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(topicId ? Number(topicId) : 1);

  const topic = TOPICS.find((t) => t.id === activeTab);
  const data  = FORMULAS[activeTab];

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* Header */}
      <div className="header" style={{ background: `linear-gradient(135deg, ${topic.color} 0%, ${topic.color}cc 100%)` }}>
        <span className="header-emoji">{topic.icon}</span>
        <h1>Formula Sheet</h1>
        <p>Texas Grade 6 — TEKS Reference</p>
      </div>

      <div className="container" style={{ padding: '0 20px' }}>
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', margin: '20px 0 0', fontSize: '0.9rem' }}
        >
          ← Back to topics
        </button>

        {/* Topic tabs */}
        <div className="formula-tabs">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              className={`formula-tab ${activeTab === t.id ? 'active' : ''}`}
              style={activeTab === t.id ? { background: t.color, color: 'white', borderColor: t.color } : {}}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Formula sections */}
        {data.sections.map((section) => (
          <div key={section.title} className="formula-section">
            <h3 className="formula-section-title" style={{ color: topic.color }}>
              {section.title}
            </h3>
            <div className="formula-grid">
              {section.items.map((item) => (
                <div key={item.label} className="formula-card" style={{ borderLeftColor: topic.color }}>
                  <div className="formula-label">{item.label}</div>
                  <div className="formula-expression" style={{ background: topic.bg, color: topic.color }}>
                    {item.formula}
                  </div>
                  <div className="formula-example">
                    <span className="formula-example-tag">Example:</span> {item.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Practice button */}
        <div style={{ textAlign: 'center', padding: '24px 0 40px' }}>
          <button
            className="next-btn"
            style={{ maxWidth: 280, margin: '0 auto', display: 'block', background: `linear-gradient(135deg, ${topic.color}, ${topic.color}bb)` }}
            onClick={() => navigate(`/difficulty/${activeTab}`, { state: { topicName: topic.name } })}
          >
            Practice {topic.name} →
          </button>
        </div>
      </div>
    </div>
  );
}
