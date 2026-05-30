-- Tighten RLS: quiz_sessions insert must reference a real class
DROP POLICY IF EXISTS "quiz_sessions_insert" ON quiz_sessions;
CREATE POLICY "quiz_sessions_insert" ON quiz_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE id = class_id)
  );

-- Tighten RLS: answers insert must reference a real session
DROP POLICY IF EXISTS "answers_insert" ON answers;
CREATE POLICY "answers_insert" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id)
  );

-- Add length constraint on student_name
ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_student_name_check;
ALTER TABLE answers ADD CONSTRAINT answers_student_name_check
  CHECK (char_length(student_name) BETWEEN 1 AND 50);
