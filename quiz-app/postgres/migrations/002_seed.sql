-- Topics (Texas TEKS Grade 6)
INSERT INTO topics (id, name, description, icon, color) VALUES
  (1, 'Algebra',             'Expressions, equations, and inequalities (TEKS 6,7,9,10)',          '𝑥', '#6366f1'),
  (2, 'Geometry',            'Area, volume, angles, and shapes (TEKS 8)',                          '△', '#f59e0b'),
  (3, 'Number & Operations', 'Integers, fractions, decimals, and absolute value (TEKS 2,3)',       '±', '#10b981'),
  (4, 'Proportionality',     'Ratios, rates, percents, and proportional relationships (TEKS 4,5)', '%', '#ef4444'),
  (5, 'Data & Statistics',   'Mean, median, mode, range, IQR, and graphs (TEKS 12,13)',            '📊', '#8b5cf6')
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, icon=EXCLUDED.icon, color=EXCLUDED.color;

-- ── Algebra Easy ──────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(1,'easy','Solve for x:  x + 3 = 8','x = 4','x = 5','x = 11','x = 3','b','Subtract 3 from both sides: x = 8 − 3 = 5'),
(1,'easy','Solve for x:  x − 2 = 7','x = 5','x = 14','x = 9','x = 2','c','Add 2 to both sides: x = 7 + 2 = 9'),
(1,'easy','Solve for x:  2x = 10','x = 5','x = 8','x = 20','x = 12','a','Divide both sides by 2: x = 10 ÷ 2 = 5'),
(1,'easy','What is 5x when x = 2?','7','3','52','10','d','Replace x with 2: 5 × 2 = 10'),
(1,'easy','Solve for x:  x + 10 = 15','x = 25','x = 5','x = 10','x = 150','b','Subtract 10: x = 15 − 10 = 5'),
(1,'easy','Solve for x:  x − 5 = 3','x = 2','x = 15','x = 8','x = 5','c','Add 5: x = 3 + 5 = 8'),
(1,'easy','Solve for x:  4x = 20','x = 16','x = 24','x = 80','x = 5','d','Divide by 4: x = 20 ÷ 4 = 5'),
(1,'easy','What is 3x when x = 4?','34','7','12','1','c','Replace x with 4: 3 × 4 = 12'),
(1,'easy','Which of these is a variable?','7','n','3 + 5','100','b','A variable is a letter representing an unknown number.'),
(1,'easy','Solve for x:  x + 6 = 14','x = 20','x = 84','x = 6','x = 8','d','Subtract 6: x = 14 − 6 = 8');

-- ── Algebra Medium ────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(1,'medium','Solve for x:  2x + 3 = 11','x = 7','x = 4','x = 14','x = 5','b','Subtract 3: 2x = 8. Divide by 2: x = 4'),
(1,'medium','Solve for x:  3x − 6 = 9','x = 1','x = 3','x = 5','x = 6','c','Add 6: 3x = 15. Divide by 3: x = 5'),
(1,'medium','Simplify:  3x + 2x − x','4x','6x','5x','3x²','a','(3 + 2 − 1)x = 4x'),
(1,'medium','Solve for x:  5x + 2 = 22','x = 4','x = 5','x = 24','x = 110','a','Subtract 2: 5x = 20. Divide by 5: x = 4'),
(1,'medium','Solve for x:  x ÷ 2 + 1 = 5','x = 3','x = 12','x = 8','x = 6','c','Subtract 1: x/2 = 4. Multiply by 2: x = 8'),
(1,'medium','If a = 5 and b = 3, what is 2a − b?','13','7','4','16','b','2(5) − 3 = 10 − 3 = 7'),
(1,'medium','Solve for x:  4x − 4 = 12','x = 2','x = 3','x = 4','x = 8','c','Add 4: 4x = 16. Divide by 4: x = 4'),
(1,'medium','Which value of x satisfies  x ÷ 3 − 1 = 2?','x = 6','x = 1','x = 9','x = 3','c','Add 1: x/3 = 3. Multiply by 3: x = 9'),
(1,'medium','Solve for x:  2(x + 3) = 14','x = 4','x = 11','x = 7','x = 10','a','Divide by 2: x + 3 = 7. Subtract 3: x = 4'),
(1,'medium','If 2a + b = 10 and b = 4, find a.','a = 6','a = 2','a = 3','a = 7','c','Substitute b=4: 2a+4=10 → a=3');

-- ── Algebra Hard ──────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(1,'hard','Solve for x:  4(x − 2) = 2x + 6','x = 5','x = 7','x = 3','x = 9','b','Expand: 4x−8=2x+6 → 2x=14 → x=7'),
(1,'hard','If f(x) = 2x + 1, what is f(5)?','10','7','11','3','c','f(5) = 2(5)+1 = 11'),
(1,'hard','Solve for x:  (x + 3) ÷ 2 = 7','x = 7','x = 11','x = 17','x = 3','b','Multiply by 2: x+3=14. Subtract 3: x=11'),
(1,'hard','Simplify:  3(2x − 4) + 2(x + 5)','8x + 2','8x − 2','6x − 2','5x + 2','b','6x−12+2x+10 = 8x−2'),
(1,'hard','If 3x + 2y = 16 and x = 2, find y.','y = 4','y = 7','y = 5','y = 2','c','6+2y=16 → 2y=10 → y=5'),
(1,'hard','Solve for x:  5(x + 1) = 3(x + 5)','x = 5','x = 3','x = 10','x = 4','a','5x+5=3x+15 → 2x=10 → x=5'),
(1,'hard','Simplify:  (3x + 6) ÷ 3','x + 6','x + 2','3x + 2','6x','b','3x/3 + 6/3 = x+2'),
(1,'hard','Solve for x:  3x + 2 = 5x − 4','x = 1','x = 6','x = 3','x = 9','c','2=2x−4 → 6=2x → x=3'),
(1,'hard','If p = 3 and q = −2, what is p² + q²?','1','25','13','5','c','9 + 4 = 13'),
(1,'hard','Which inequality is equivalent to  3x − 5 > 10?','x > 15','x > 5','x < 5','x > 3','b','Add 5: 3x>15. Divide: x>5');

-- ── Geometry Easy ─────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(2,'easy','What is the perimeter of a square with side 4 cm?','8 cm','12 cm','16 cm','20 cm','c','4 × side = 4 × 4 = 16 cm'),
(2,'easy','What is the area of a rectangle 3 cm × 5 cm?','16 cm²','8 cm²','15 cm²','30 cm²','c','Area = 5 × 3 = 15 cm²'),
(2,'easy','How many sides does a triangle have?','2','3','4','5','b','A triangle has exactly 3 sides.'),
(2,'easy','How many degrees are in a right angle?','45°','180°','60°','90°','d','A right angle is exactly 90°.'),
(2,'easy','What is the area of a square with side 5 cm?','10 cm²','20 cm²','25 cm²','15 cm²','c','Area = 5² = 25 cm²'),
(2,'easy','How many sides does a hexagon have?','5','7','8','6','d','Hex = 6 in Greek.'),
(2,'easy','How many right angles does a rectangle have?','2','3','4','1','c','All 4 corners of a rectangle are 90°.'),
(2,'easy','What is the perimeter of a rectangle 2 cm × 6 cm?','12 cm','16 cm','8 cm','10 cm','b','2 × (6+2) = 16 cm'),
(2,'easy','What shape has 4 equal sides and 4 right angles?','Rectangle','Rhombus','Square','Triangle','c','Only a square has both.'),
(2,'easy','A circle has a diameter of 8 cm. What is its radius?','2 cm','4 cm','8 cm','16 cm','b','Radius = 8 ÷ 2 = 4 cm');

-- ── Geometry Medium ───────────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(2,'medium','Area of a triangle with base 6 cm and height 4 cm?','24 cm²','10 cm²','12 cm²','48 cm²','c','½ × 6 × 4 = 12 cm²'),
(2,'medium','What is the sum of interior angles in a quadrilateral?','180°','270°','360°','540°','c','Any 4-sided shape sums to 360°.'),
(2,'medium','Two angles of a triangle are 60° and 70°. What is the third?','40°','50°','60°','130°','b','180−60−70 = 50°'),
(2,'medium','Perimeter of an equilateral triangle with side 8 cm?','16 cm','24 cm','32 cm','64 cm','b','3 × 8 = 24 cm'),
(2,'medium','A circle has radius 6 cm. What is its diameter?','3 cm','36 cm','12 cm','18 cm','c','2 × 6 = 12 cm'),
(2,'medium','Area of a parallelogram with base 7 cm and height 4 cm?','11 cm²','28 cm²','14 cm²','22 cm²','b','7 × 4 = 28 cm²'),
(2,'medium','A polygon with 5 sides is called a ___','Hexagon','Octagon','Pentagon','Heptagon','c','Penta = 5.'),
(2,'medium','Two angles of a triangle are 45° and 90°. What is the third?','55°','90°','45°','135°','c','180−45−90 = 45°'),
(2,'medium','Area of a triangle with base 10 cm and height 6 cm?','60 cm²','16 cm²','30 cm²','120 cm²','c','½ × 10 × 6 = 30 cm²'),
(2,'medium','An angle measuring 135° is called a(n) ___ angle.','Acute','Right','Obtuse','Reflex','c','Obtuse: between 90° and 180°.');

-- ── Geometry Hard ─────────────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(2,'hard','What is the volume of a cube with side 4 cm?','12 cm³','64 cm³','48 cm³','16 cm³','b','4³ = 64 cm³'),
(2,'hard','A right triangle has legs 6 cm and 8 cm. What is the hypotenuse?','14 cm','7 cm','10 cm','48 cm','c','c²=36+64=100 → c=10 cm'),
(2,'hard','Area of a trapezoid: parallel sides 6 cm and 10 cm, height 4 cm?','32 cm²','60 cm²','40 cm²','24 cm²','a','½ × (6+10) × 4 = 32 cm²'),
(2,'hard','What is the sum of interior angles of a pentagon?','360°','450°','540°','720°','c','(5−2)×180 = 540°'),
(2,'hard','Volume of a rectangular prism 3 cm × 4 cm × 5 cm?','47 cm³','60 cm³','24 cm³','36 cm³','b','3×4×5 = 60 cm³'),
(2,'hard','In a parallelogram, one angle is 70°. What is the adjacent angle?','70°','20°','110°','90°','c','180−70 = 110°'),
(2,'hard','Area of a circle with radius 5 cm? (π ≈ 3.14)','15.7 cm²','31.4 cm²','78.5 cm²','25 cm²','c','3.14 × 25 = 78.5 cm²'),
(2,'hard','What is the surface area of a cube with side 3 cm?','27 cm²','54 cm²','36 cm²','18 cm²','b','6 × 9 = 54 cm²'),
(2,'hard','A triangle has angles in ratio 1:2:3. What is the largest angle?','60°','90°','120°','45°','b','3×30° = 90°'),
(2,'hard','Circumference of a circle with diameter 10 cm? (π ≈ 3.14)','62.8 cm','31.4 cm','15.7 cm','314 cm','b','3.14 × 10 = 31.4 cm');

-- ── Number & Operations Easy ──────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(3,'easy','What is |−9|?','−9','9','0','81','b','Absolute value is always positive. |−9| = 9'),
(3,'easy','What is the opposite of −4?','4','−4','1/4','−1/4','a','The opposite of a negative number is positive.'),
(3,'easy','What is −3 + 8?','−11','−5','5','11','c','Start at −3, add 8: −3 + 8 = 5'),
(3,'easy','Which number is greater: −2 or −5?','−5','They are equal','−2','Cannot tell','c','On a number line −2 is right of −5.'),
(3,'easy','What is 1/2 + 1/4?','2/6','1/3','3/4','2/4','c','2/4 + 1/4 = 3/4'),
(3,'easy','What is 0.25 as a fraction in simplest form?','25/10','1/4','2/5','1/5','b','25/100 = 1/4'),
(3,'easy','What is −6 × 2?','12','−3','3','−12','d','Negative × Positive = Negative'),
(3,'easy','What is 3/4 as a decimal?','0.34','0.43','0.75','1.33','c','3 ÷ 4 = 0.75'),
(3,'easy','What is −10 ÷ 2?','5','−20','20','−5','d','Negative ÷ Positive = Negative. −10 ÷ 2 = −5'),
(3,'easy','What is the absolute value of 7?','−7','7','1/7','49','b','|7| = 7');

-- ── Number & Operations Medium ────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(3,'medium','What is −4 × (−3)?','−12','12','−7','7','b','Negative × Negative = Positive'),
(3,'medium','What is −18 ÷ (−6)?','−3','3','−108','108','b','Negative ÷ Negative = Positive'),
(3,'medium','What is 2/3 ÷ 1/6?','1/9','2/18','4','3','c','2/3 × 6/1 = 12/3 = 4'),
(3,'medium','What is −5 − (−2)?','−7','7','−3','3','c','Subtracting a negative = adding positive: −5+2 = −3'),
(3,'medium','What is the reciprocal of 4/5?','4/5','5/4','−4/5','1/20','b','Flip numerator and denominator.'),
(3,'medium','What is 1.2 + (−2.7)?','3.9','−3.9','1.5','−1.5','d','1.2 − 2.7 = −1.5'),
(3,'medium','Which is the least: −1, −1/2, −3/2, 0?','−1/2','0','−3/2','−1','c','−3/2 = −1.5, farthest left on number line'),
(3,'medium','What is 3/4 × 8/9?','11/13','24/36','2/3','3/2','c','(3×8)/(4×9) = 24/36 = 2/3'),
(3,'medium','What is −7 + (−4)?','3','−3','11','−11','d','Adding two negatives: −11'),
(3,'medium','What is 5/6 − 1/3?','4/3','4/6','1/2','2/3','c','5/6 − 2/6 = 3/6 = 1/2');

-- ── Number & Operations Hard ──────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(3,'hard','What is (−2/3) × (−9/4)?','−3/2','3/2','−6/12','6','b','Neg×Neg=Pos. (2×9)/(3×4) = 18/12 = 3/2'),
(3,'hard','What is 5/8 − 3/4?','2/4','1/8','−1/8','−2/8','c','5/8 − 6/8 = −1/8'),
(3,'hard','What is −3/4 ÷ 3/8?','−2','2','−9/32','9/32','a','−3/4 × 8/3 = −24/12 = −2'),
(3,'hard','A temperature is −8°F. It rises 15°F. What is the new temperature?','−23°F','23°F','7°F','−7°F','c','−8 + 15 = 7°F'),
(3,'hard','What is |−5 + 3|?','−2','8','2','−8','c','−5+3 = −2. |−2| = 2'),
(3,'hard','What is (−3)² − (−2)³?','−17','1','17','−1','c','9 − (−8) = 9 + 8 = 17'),
(3,'hard','What is (−4)(−2)(−3)?','24','−24','−9','9','b','(−4)(−2)=8. 8×(−3)=−24'),
(3,'hard','What is 7/8 ÷ (−7/4)?','1/2','−1/2','2','−2','b','7/8 × (−4/7) = −28/56 = −1/2'),
(3,'hard','If |x| = 6, what are the possible values of x?','x = 6 only','x = −6 only','x = 6 or x = −6','x = 36','c','Distance from zero can be 6 or −6.'),
(3,'hard','The product of two negative numbers is always ___','Negative','Zero','Positive','Undefined','c','Negative × Negative = Positive always.');

-- ── Proportionality Easy ──────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(4,'easy','What is the ratio of 4 to 8 in simplest form?','4:8','2:4','1:2','1:4','c','Divide both by 4: 1:2'),
(4,'easy','What is 25% of 60?','12','15','20','25','b','25% = 1/4. 60 ÷ 4 = 15'),
(4,'easy','Write 1/4 as a percent.','14%','40%','4%','25%','d','1 ÷ 4 = 0.25 = 25%'),
(4,'easy','If 3 pens cost $6, how much does 1 pen cost?','$3','$1','$2','$18','c','$6 ÷ 3 = $2 per pen'),
(4,'easy','What is 0.8 as a percent?','8%','0.8%','80%','800%','c','0.8 × 100 = 80%'),
(4,'easy','What is 10% of 70?','0.7','7','17','700','b','70 ÷ 10 = 7'),
(4,'easy','A car travels 50 mph. How far in 2 hours?','25 miles','52 miles','100 miles','150 miles','c','50 × 2 = 100 miles'),
(4,'easy','Write 3/10 as a decimal.','3.1','0.03','0.3','1.3','c','3 ÷ 10 = 0.3'),
(4,'easy','What is 50% of 48?','12','48','96','24','d','48 ÷ 2 = 24'),
(4,'easy','If y = 4x, what is y when x = 5?','9','1','45','20','d','y = 4 × 5 = 20');

-- ── Proportionality Medium ────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(4,'medium','A shirt costs $40 and is 20% off. What is the discount amount?','$4','$20','$8','$32','c','20% of $40 = $8'),
(4,'medium','What is 35% of 120?','35','42','48','55','b','0.35 × 120 = 42'),
(4,'medium','12 is what percent of 48?','4%','40%','25%','12%','c','12/48 = 25%'),
(4,'medium','A car travels 60 miles in 2 hours. What is the unit rate?','120 mph','62 mph','30 mph','58 mph','c','60 ÷ 2 = 30 mph'),
(4,'medium','What is 15% of 200?','15','25','30','300','c','0.15 × 200 = 30'),
(4,'medium','If y = 6x, what is x when y = 42?','7','36','48','6','a','x = 42 ÷ 6 = 7'),
(4,'medium','A recipe needs 3 cups for 4 servings. How many cups for 12 servings?','6 cups','12 cups','9 cups','36 cups','c','3 × (12÷4) = 9 cups'),
(4,'medium','45 is 75% of what number?','33.75','60','75','90','b','n = 45 ÷ 0.75 = 60'),
(4,'medium','A map scale is 1 cm = 25 km. How far for 6 cm?','31 km','125 km','150 km','25 km','c','6 × 25 = 150 km'),
(4,'medium','Write 3/8 as a percent.','38%','83%','37.5%','30.8%','c','3 ÷ 8 = 0.375 = 37.5%');

-- ── Proportionality Hard ──────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(4,'hard','A price increased from $40 to $50. What is the percent increase?','10%','20%','25%','30%','c','Increase=$10. 10/40 = 25%'),
(4,'hard','If 30% of a number is 18, what is the number?','5.4','48','60','54','c','n = 18 ÷ 0.30 = 60'),
(4,'hard','Two ratios 3:4 and x:12 are equivalent. Find x.','4','6','9','16','c','3/4 = x/12 → 4x=36 → x=9'),
(4,'hard','A jacket is $90 after a 25% discount. What was the original price?','$112.50','$115','$120','$125','c','90 = 75% of original → 90÷0.75 = $120'),
(4,'hard','A store marks up a $60 item by 30%. What is the selling price?','$18','$78','$90','$72','b','Markup=18. Price=$60+$18=$78'),
(4,'hard','If 8 workers finish a job in 6 days, how many days for 4 workers?','3 days','8 days','12 days','48 days','c','8×6=4×d → d=12 days'),
(4,'hard','A price dropped from $80 to $60. What is the percent decrease?','20%','25%','33%','75%','b','Decrease=20. 20/80 = 25%'),
(4,'hard','If 2/5 of a number is 14, what is the number?','5.6','28','35','70','c','n = 14 × (5/2) = 35'),
(4,'hard','A solution is 20% acid. How many mL of acid in 350 mL?','20 mL','35 mL','70 mL','280 mL','c','0.20 × 350 = 70 mL'),
(4,'hard','y = 2.5x is proportional. If y = 17.5, find x.','6','7','8','43.75','b','x = 17.5 ÷ 2.5 = 7');

-- ── Data & Statistics Easy ────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(5,'easy','Find the mean of: 4, 6, 8, 10, 12','6','7','8','10','c','Sum=40. 40÷5 = 8'),
(5,'easy','Find the median of: 3, 5, 7, 9, 11','5','6','7','9','c','Middle of 5 values = 3rd value = 7'),
(5,'easy','Find the mode of: 2, 3, 3, 5, 7','2','3','5','7','b','3 appears twice — most frequent.'),
(5,'easy','Find the range of: 5, 12, 3, 18, 8','10','12','15','18','c','18 − 3 = 15'),
(5,'easy','Find the mean of: 10, 20, 30','10','20','30','60','b','60 ÷ 3 = 20'),
(5,'easy','Find the median of: 2, 5, 8, 11, 14','5','8','11','6.5','b','Middle value of 5 = 3rd = 8'),
(5,'easy','Which measure shows the most common value?','Mean','Median','Range','Mode','d','Mode = value that appears most often.'),
(5,'easy','Find the range of: 15, 22, 8, 31','13','19','23','31','c','31 − 8 = 23'),
(5,'easy','Find the mean of: 7, 9, 11, 13','9','10','11','40','b','40 ÷ 4 = 10'),
(5,'easy','A dot plot shows 5 dots above value 3. What does this mean?','3 appears 5 times','5 appears 3 times','The mean is 5','The range is 3','a','Each dot = one data value.');

-- ── Data & Statistics Medium ──────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(5,'medium','Find the median of: 4, 8, 12, 16, 20, 24','12','14','16','13','b','Even count: avg of 3rd and 4th = (12+16)÷2 = 14'),
(5,'medium','What is the IQR if Q1 = 8 and Q3 = 20?','8','10','12','28','c','IQR = Q3 − Q1 = 20 − 8 = 12'),
(5,'medium','In a box plot, what does the line inside the box represent?','Mean','Mode','Median','Range','c','The middle line marks the median.'),
(5,'medium','Which measure of center is most affected by an outlier?','Mode','Median','Mean','Range','c','Mean uses all values so outliers shift it significantly.'),
(5,'medium','Find the mode of: 3, 5, 5, 7, 8, 8, 8, 9','5','6','7','8','d','8 appears 3 times — most frequent.'),
(5,'medium','Find the median of: 6, 11, 14, 18, 22, 27','14','16','18','15','b','(14+18)÷2 = 16'),
(5,'medium','What does the range of a data set tell us?','The most common value','The middle value','Difference between max and min','The average','c','Range = max − min. Measures spread.'),
(5,'medium','Data: 5, 10, 10, 15, 60. Which is higher — mean or median?','Mean','Median','They are equal','Cannot tell','a','Mean=20, Median=10. Outlier 60 pulls mean up.'),
(5,'medium','Find the mean of: 13, 17, 19, 23, 28','18','19','20','21','c','Sum=100. 100÷5 = 20'),
(5,'medium','In a stem-and-leaf plot, what does the stem usually represent?','The ones digit','The tens digit','The median','The mode','b','Stems are leading digits — usually tens.');

-- ── Data & Statistics Hard ────────────────────────────────────────────────────
INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation) VALUES
(5,'hard','Data: 2, 4, 6, 8, 10. What is the Mean Absolute Deviation (MAD)?','2','2.4','3','4','b','Mean=6. Deviations: 4,2,0,2,4. MAD=12÷5=2.4'),
(5,'hard','Box plot: min=5,Q1=10,median=18,Q3=25,max=40. What % is above Q3?','50%','75%','25%','10%','c','Q3 = 75th percentile → 25% is above it.'),
(5,'hard','Scores: 72,85,68,90,95,72,88. What is the median?','72','85','88','90','b','Sorted: 68,72,72,85,88,90,95. Middle = 85'),
(5,'hard','Data: 8,12,14,16,20,22,26. What is the IQR?','8','10','14','18','b','Median=16. Q1=12, Q3=22. IQR=22−12=10'),
(5,'hard','Which display best shows distribution of a large continuous data set?','Dot plot','Histogram','Stem-and-leaf','Pictograph','b','Histograms group data into intervals — ideal for large sets.'),
(5,'hard','Data: {6,8,10,12}. A new value 14 is added. What is the new mean?','9','10','11','12','b','(6+8+10+12+14)÷5 = 50÷5 = 10'),
(5,'hard','A box plot shows Q1=5, Q3=12. What is the IQR?','5','7','12','17','b','IQR = 12 − 5 = 7'),
(5,'hard','What percent of data falls between Q1 and Q3 in a box plot?','25%','50%','75%','100%','b','The box spans the middle 50% of data.'),
(5,'hard','In a histogram, what does each bar represent?','A single data value','The mean of the data','A range of values and their frequency','The mode','c','Each bar covers an interval and its height = frequency.'),
(5,'hard','Two sets have the same mean but different IQRs. What does this indicate?','Same spread','One is larger','Different variability','Medians differ','c','Different IQR = different spread/variability.');
