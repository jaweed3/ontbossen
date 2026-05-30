export interface Teacher {
  id: string;
  email: string;
  name: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Topic {
  id: string;
  class_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Question {
  id: string;
  topic_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  concept_tag: string;
}

export interface Answer {
  id: string;
  question_id: string;
  session_id: string;
  student_name: string;
  selected_answer: string;
  created_at: string;
}

export interface QuizSession {
  id: string;
  topic_id: string;
  class_id: string;
  created_at: string;
}

export type QuestionWithStats = Question & {
  total_answers: number;
  correct_count: number;
  incorrect_count: number;
  accuracy: number;
};

export type StudentResult = {
  student_name: string;
  total: number;
  correct: number;
  answers: {
    question_id: string;
    question_text: string;
    selected_answer: string;
    correct_answer: string;
    concept_tag: string;
    is_correct: boolean;
  }[];
};
