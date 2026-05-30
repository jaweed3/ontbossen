-- DiagnosaKelas Schema

-- Teachers (extends Supabase auth.users)
CREATE TABLE teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  concept_tag TEXT NOT NULL DEFAULT ''
);

CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL CHECK (char_length(student_name) BETWEEN 1 AND 50),
  selected_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_code ON classes(code);
CREATE INDEX idx_topics_class ON topics(class_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_answers_session ON answers(session_id);
CREATE INDEX idx_quiz_sessions_topic ON quiz_sessions(topic_id);

-- Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Teachers can only see their own data
CREATE POLICY "teachers_select_own" ON teachers
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "teachers_insert_own" ON teachers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Classes: teachers can CRUD their own; students can read by code
CREATE POLICY "classes_select_own" ON classes
  FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "classes_select_by_code" ON classes
  FOR SELECT USING (true);
CREATE POLICY "classes_insert_own" ON classes
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "classes_update_own" ON classes
  FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "classes_delete_own" ON classes
  FOR DELETE USING (auth.uid() = teacher_id);

-- Topics: teachers own through class
CREATE POLICY "topics_select_own" ON topics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE id = topics.class_id AND teacher_id = auth.uid())
  );
CREATE POLICY "topics_select_all" ON topics
  FOR SELECT USING (true);
CREATE POLICY "topics_insert_own" ON topics
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE id = topics.class_id AND teacher_id = auth.uid())
  );
CREATE POLICY "topics_delete_own" ON topics
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM classes WHERE id = topics.class_id AND teacher_id = auth.uid())
  );

-- Questions: teachers can CRUD; students can read for quiz
CREATE POLICY "questions_select_own" ON questions
  FOR SELECT USING (true);
CREATE POLICY "questions_insert_own" ON questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM topics t JOIN classes c ON c.id = t.class_id
      WHERE t.id = questions.topic_id AND c.teacher_id = auth.uid()
    )
  );
CREATE POLICY "questions_delete_own" ON questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM topics t JOIN classes c ON c.id = t.class_id
      WHERE t.id = questions.topic_id AND c.teacher_id = auth.uid()
    )
  );

-- Quiz sessions: teachers CRUD, students insert
CREATE POLICY "quiz_sessions_select_own" ON quiz_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE id = quiz_sessions.class_id AND teacher_id = auth.uid())
  );
CREATE POLICY "quiz_sessions_insert" ON quiz_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE id = class_id)
  );
CREATE POLICY "quiz_sessions_select" ON quiz_sessions
  FOR SELECT USING (true);

-- Answers: teachers read, students insert
CREATE POLICY "answers_select_own" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions qs
      JOIN classes c ON c.id = qs.class_id
      WHERE qs.id = answers.session_id AND c.teacher_id = auth.uid()
    )
  );
CREATE POLICY "answers_insert" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id)
  );
