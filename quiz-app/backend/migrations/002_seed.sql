-- Topics
INSERT INTO topics (id, name, description, icon, color) VALUES
  (1, 'Algebra',  'Equations, expressions, and solving for unknowns', '𝑥', '#6366f1'),
  (2, 'Geometry', 'Shapes, area, perimeter, and angles',             '△', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- ── Algebra Easy ──────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(1,'easy','Solve for x:  x + 3 = 8','x = 4','x = 5','x = 11','x = 3','b','Subtract 3 from both sides: x = 8 − 3 = 5'),
(1,'easy','Solve for x:  x − 2 = 7','x = 5','x = 14','x = 9','x = 2','c','Add 2 to both sides: x = 7 + 2 = 9'),
(1,'easy','Solve for x:  2x = 10','x = 5','x = 8','x = 20','x = 12','a','Divide both sides by 2: x = 10 ÷ 2 = 5'),
(1,'easy','What is 5x when x = 2?','7','3','52','10','d','Replace x with 2: 5 × 2 = 10'),
(1,'easy','Solve for x:  x + 10 = 15','x = 25','x = 5','x = 10','x = 150','b','Subtract 10 from both sides: x = 15 − 10 = 5'),
(1,'easy','Solve for x:  x − 5 = 3','x = 2','x = 15','x = 8','x = 5','c','Add 5 to both sides: x = 3 + 5 = 8'),
(1,'easy','Solve for x:  4x = 20','x = 16','x = 24','x = 80','x = 5','d','Divide both sides by 4: x = 20 ÷ 4 = 5'),
(1,'easy','What is 3x when x = 4?','34','7','12','1','c','Replace x with 4: 3 × 4 = 12'),
(1,'easy','Which of these is a variable?','7','n','3 + 5','100','b','A variable is a letter representing an unknown number. "n" is a variable.'),
(1,'easy','Solve for x:  x + 6 = 14','x = 20','x = 84','x = 6','x = 8','d','Subtract 6 from both sides: x = 14 − 6 = 8');

-- ── Algebra Medium ────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(1,'medium','Solve for x:  2x + 3 = 11','x = 7','x = 4','x = 14','x = 5','b','Subtract 3: 2x = 8. Divide by 2: x = 4'),
(1,'medium','Solve for x:  3x − 6 = 9','x = 1','x = 3','x = 5','x = 6','c','Add 6: 3x = 15. Divide by 3: x = 5'),
(1,'medium','Simplify:  3x + 2x − x','4x','6x','5x','3x²','a','(3 + 2 − 1)x = 4x'),
(1,'medium','Solve for x:  5x + 2 = 22','x = 4','x = 5','x = 24','x = 110','a','Subtract 2: 5x = 20. Divide by 5: x = 4'),
(1,'medium','Solve for x:  x ÷ 2 + 1 = 5','x = 3','x = 12','x = 8','x = 6','c','Subtract 1: x/2 = 4. Multiply by 2: x = 8'),
(1,'medium','If a = 5 and b = 3, what is 2a − b?','13','7','4','16','b','2(5) − 3 = 10 − 3 = 7'),
(1,'medium','Solve for x:  4x − 4 = 12','x = 2','x = 3','x = 4','x = 8','c','Add 4: 4x = 16. Divide by 4: x = 4'),
(1,'medium','Which value of x satisfies  x ÷ 3 − 1 = 2?','x = 6','x = 1','x = 9','x = 3','c','Add 1: x/3 = 3. Multiply by 3: x = 9'),
(1,'medium','Solve for x:  2(x + 3) = 14','x = 4','x = 11','x = 7','x = 10','a','Divide by 2: x + 3 = 7. Subtract 3: x = 4'),
(1,'medium','If 2a + b = 10 and b = 4, find a.','a = 6','a = 2','a = 3','a = 7','c','Substitute b = 4: 2a + 4 = 10 → 2a = 6 → a = 3');

-- ── Algebra Hard ──────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(1,'hard','Solve for x:  4(x − 2) = 2x + 6','x = 5','x = 7','x = 3','x = 9','b','Expand: 4x − 8 = 2x + 6. Subtract 2x: 2x = 14. Divide: x = 7'),
(1,'hard','If f(x) = 2x + 1, what is f(5)?','10','7','11','3','c','f(5) = 2(5) + 1 = 10 + 1 = 11'),
(1,'hard','Solve for x:  (x + 3) ÷ 2 = 7','x = 7','x = 11','x = 17','x = 3','b','Multiply by 2: x + 3 = 14. Subtract 3: x = 11'),
(1,'hard','Simplify:  3(2x − 4) + 2(x + 5)','8x + 2','8x − 2','6x − 2','5x + 2','b','6x − 12 + 2x + 10 = 8x − 2'),
(1,'hard','If 3x + 2y = 16 and x = 2, find y.','y = 4','y = 7','y = 5','y = 2','c','Substitute x = 2: 6 + 2y = 16 → 2y = 10 → y = 5'),
(1,'hard','Solve for x:  5(x + 1) = 3(x + 5)','x = 5','x = 3','x = 10','x = 4','a','5x + 5 = 3x + 15 → 2x = 10 → x = 5'),
(1,'hard','Simplify:  (3x + 6) ÷ 3','x + 6','x + 2','3x + 2','6x','b','(3x)/3 + 6/3 = x + 2'),
(1,'hard','Solve for x:  3x + 2 = 5x − 4','x = 1','x = 6','x = 3','x = 9','c','Subtract 3x: 2 = 2x − 4. Add 4: 6 = 2x. x = 3'),
(1,'hard','If p = 3 and q = −2, what is p² + q²?','1','25','13','5','c','3² + (−2)² = 9 + 4 = 13'),
(1,'hard','Which inequality is equivalent to  3x − 5 > 10?','x > 15','x > 5','x < 5','x > 3','b','Add 5: 3x > 15. Divide by 3: x > 5');

-- ── Geometry Easy ─────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(2,'easy','What is the perimeter of a square with side 4 cm?','8 cm','12 cm','16 cm','20 cm','c','Perimeter = 4 × side = 4 × 4 = 16 cm'),
(2,'easy','What is the area of a rectangle 3 cm × 5 cm?','16 cm²','8 cm²','15 cm²','30 cm²','c','Area = length × width = 5 × 3 = 15 cm²'),
(2,'easy','How many sides does a triangle have?','2','3','4','5','b','A triangle always has exactly 3 sides and 3 angles.'),
(2,'easy','How many degrees are in a right angle?','45°','180°','60°','90°','d','A right angle is exactly 90°, shown by a small square symbol.'),
(2,'easy','What is the area of a square with side 5 cm?','10 cm²','20 cm²','25 cm²','15 cm²','c','Area = side² = 5² = 25 cm²'),
(2,'easy','How many sides does a hexagon have?','5','7','8','6','d','Hex = 6 in Greek. A hexagon has 6 sides.'),
(2,'easy','How many right angles does a rectangle have?','2','3','4','1','c','A rectangle has 4 corners and every corner is 90°.'),
(2,'easy','What is the perimeter of a rectangle 2 cm × 6 cm?','12 cm','16 cm','8 cm','10 cm','b','Perimeter = 2 × (l + w) = 2 × (6 + 2) = 16 cm'),
(2,'easy','What shape has 4 equal sides and 4 right angles?','Rectangle','Rhombus','Square','Triangle','c','Only a square has all 4 sides equal AND all angles at 90°.'),
(2,'easy','A circle has a diameter of 8 cm. What is its radius?','2 cm','4 cm','8 cm','16 cm','b','Radius = diameter ÷ 2 = 8 ÷ 2 = 4 cm');

-- ── Geometry Medium ───────────────────────────────────────────────────────────
INSERT INTO questions (topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(2,'medium','Area of a triangle with base 6 cm and height 4 cm?','24 cm²','10 cm²','12 cm²','48 cm²','c','Area = ½ × base × height = ½ × 6 × 4 = 12 cm²'),
(2,'medium','What is the sum of interior angles in a quadrilateral?','180°','270°','360°','540°','c','Any quadrilateral (4 sides) has interior angles summing to 360°.'),
(2,'medium','Two angles of a triangle are 60° and 70°. What is the third?','40°','50°','60°','130°','b','Third angle = 180 − 60 − 70 = 50°'),
(2,'medium','Perimeter of an equilateral triangle with side 8 cm?','16 cm','24 cm','32 cm','64 cm','b','All 3 sides are equal: 3 × 8 = 24 cm'),
(2,'medium','A circle has radius 6 cm. What is its diameter?','3 cm','36 cm','12 cm','18 cm','c','Diameter = 2 × radius = 2 × 6 = 12 cm'),
(2,'medium','Area of a parallelogram with base 7 cm and height 4 cm?','11 cm²','28 cm²','14 cm²','22 cm²','b','Area = base × height = 7 × 4 = 28 cm²'),
(2,'medium','A polygon with 5 sides is called a ___','Hexagon','Octagon','Pentagon','Heptagon','c','Penta = 5. A pentagon has 5 sides.'),
(2,'medium','Two angles of a triangle are 45° and 90°. What is the third?','55°','90°','45°','135°','c','Third = 180 − 45 − 90 = 45°'),
(2,'medium','Area of a triangle with base 10 cm and height 6 cm?','60 cm²','16 cm²','30 cm²','120 cm²','c','Area = ½ × 10 × 6 = 30 cm²'),
(2,'medium','An angle measuring 135° is called a(n) ___ angle.','Acute','Right','Obtuse','Reflex','c','Obtuse angles are between 90° and 180°. 135° is obtuse.');

-- ── Geometry Hard ─────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(2,'hard','What is the volume of a cube with side 4 cm?','12 cm³','64 cm³','48 cm³','16 cm³','b','Volume = side³ = 4 × 4 × 4 = 64 cm³'),
(2,'hard','A right triangle has legs 6 cm and 8 cm. What is the hypotenuse?','14 cm','7 cm','10 cm','48 cm','c','c² = 6² + 8² = 36 + 64 = 100 → c = 10 cm'),
(2,'hard','Area of a trapezoid: parallel sides 6 cm and 10 cm, height 4 cm?','32 cm²','60 cm²','40 cm²','24 cm²','a','Area = ½ × (a + b) × h = ½ × 16 × 4 = 32 cm²'),
(2,'hard','What is the sum of interior angles of a pentagon?','360°','450°','540°','720°','c','Sum = (n − 2) × 180° = 3 × 180° = 540°'),
(2,'hard','Volume of a rectangular prism 3 cm × 4 cm × 5 cm?','47 cm³','60 cm³','24 cm³','36 cm³','b','Volume = 3 × 4 × 5 = 60 cm³'),
(2,'hard','In a parallelogram, one angle is 70°. What is the adjacent angle?','70°','20°','110°','90°','c','Adjacent angles are supplementary: 180° − 70° = 110°'),
(2,'hard','Area of a circle with radius 5 cm? (Use π ≈ 3.14)','15.7 cm²','31.4 cm²','78.5 cm²','25 cm²','c','Area = π × r² = 3.14 × 25 = 78.5 cm²'),
(2,'hard','What is the surface area of a cube with side 3 cm?','27 cm²','54 cm²','36 cm²','18 cm²','b','Surface area = 6 × side² = 6 × 9 = 54 cm²'),
(2,'hard','A triangle has angles in ratio 1:2:3. What is the largest angle?','60°','90°','120°','45°','b','6 parts = 180°, each = 30°. Largest = 3 × 30° = 90°'),
(2,'hard','Circumference of a circle with diameter 10 cm? (Use π ≈ 3.14)','62.8 cm','31.4 cm','15.7 cm','314 cm','b','Circumference = π × d = 3.14 × 10 = 31.4 cm');
