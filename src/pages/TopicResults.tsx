import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { getAccuracyColor, getHeatmapColor } from "../lib/utils";
import type {
  Topic,
  QuestionWithStats,
  StudentResult,
} from "../types";
import {
  ClipboardList,
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

export function TopicResults() {
  const { id: classId, topicId } = useParams<{ id: string; topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuestionWithStats[]>([]);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    if (!topicId) return;

    supabase
      .from("topics")
      .select("*")
      .eq("id", topicId)
      .single()
      .then(({ data: topicData }) => {
        if (!topicData) {
          navigate(`/class/${classId}`);
          return;
        }
        setTopic(topicData);
      });

    supabase
      .from("questions")
      .select("*")
      .eq("topic_id", topicId)
      .then(({ data: questionsData }) => {
        const qs = questionsData || [];
        setQuestions(
          qs.map((q) => ({
            ...q,
            total_answers: 0,
            correct_count: 0,
            incorrect_count: 0,
            accuracy: 0,
          }))
        );

        supabase
          .from("answers")
          .select(
            `
            *,
            questions!inner(
              question_text,
              correct_answer,
              concept_tag
            )
          `
          )
          .eq("questions.topic_id", topicId)
          .then(({ data: answersData }) => {
            if (answersData && qs.length > 0) {
              const questionMap = new Map(qs.map((q) => [q.id, q]));
              const studentMap = new Map<string, StudentResult>();

              for (const answer of answersData) {
                const q = questionMap.get(answer.question_id);
                if (!q) continue;

                if (!studentMap.has(answer.student_name)) {
                  studentMap.set(answer.student_name, {
                    student_name: answer.student_name,
                    total: qs.length,
                    correct: 0,
                    answers: [],
                  });
                }

                const isCorrect = answer.selected_answer === q.correct_answer;
                const student = studentMap.get(answer.student_name)!;
                if (isCorrect) student.correct++;
                const qData = answer.questions as Record<string, string>;
                student.answers.push({
                  question_id: answer.question_id,
                  question_text: qData.question_text,
                  selected_answer: answer.selected_answer,
                  correct_answer: q.correct_answer,
                  concept_tag: q.concept_tag,
                  is_correct: isCorrect,
                });
              }

              const studentResults = Array.from(studentMap.values());
              setTotalStudents(studentResults.length);
              setStudents(studentResults);

              const updatedQuestions = qs.map((q) => {
                const total = answersData.filter(
                  (a) => a.question_id === q.id
                ).length;
                const correct = answersData.filter(
                  (a) => a.question_id === q.id && a.selected_answer === q.correct_answer
                ).length;
                return {
                  ...q,
                  total_answers: total,
                  correct_count: correct,
                  incorrect_count: total - correct,
                  accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
                };
              });
              setQuestions(updatedQuestions);
            }
            setLoading(false);
          });
      });
  }, [topicId, classId, navigate]);

  const classAccuracy =
    questions.length > 0
      ? Math.round(
          questions.reduce((sum, q) => sum + q.accuracy, 0) / questions.length
        )
      : 0;

  const weakestQuestion = [...questions].sort((a, b) => a.accuracy - b.accuracy)[0];

  const strugglingStudents = students.filter(
    (s) => s.correct / s.total < 0.6
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/class/${classId}`)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <ClipboardList className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">
            {topic?.name || "Hasil Diagnosis"}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-sm text-gray-500">Siswa Mengerjakan</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{classAccuracy}%</p>
              <p className="text-sm text-gray-500">Rata-rata Kelas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{students.filter(s => s.correct === s.total).length}</p>
              <p className="text-sm text-gray-500">Siswa Paham Semua</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{strugglingStudents.length}</p>
              <p className="text-sm text-gray-500">Butuh Bantuan</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        {weakestQuestion && weakestQuestion.accuracy < 70 && (
          <Card className="border-yellow-400 bg-yellow-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Action Item
                  </h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    <span className="font-medium">{strugglingStudents.length} siswa</span>{" "}
                    kesulitan di konsep{" "}
                    <span className="font-mono bg-yellow-100 px-1.5 py-0.5 rounded">
                      {weakestQuestion.concept_tag}
                    </span>{" "}
                    ({weakestQuestion.accuracy}% benar). 
                    Perlu pengulangan dan remedial khusus untuk topik ini.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Heatmap per Question */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4">Heatmap per Soal</h3>
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium truncate">
                        {q.question_text}
                      </p>
                      <span className="text-xs text-gray-400 font-mono">
                        {q.concept_tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm shrink-0">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${getAccuracyColor(q.accuracy)}`}
                      >
                        {q.accuracy}%
                      </span>
                      <span className="text-gray-400">
                        {q.correct_count}/{q.total_answers}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getHeatmapColor(q.accuracy)}`}
                      style={{ width: `${q.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Per-student breakdown */}
        {students.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-4">
                Breakdown per Siswa
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-gray-500">
                        Nama
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-gray-500">
                        Skor
                      </th>
                      {questions.map((q) => (
                        <th
                          key={q.id}
                          className="text-center py-2 px-1 font-medium text-gray-500 text-xs max-w-[100px] truncate"
                        >
                          {q.concept_tag}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .sort((a, b) => b.correct - a.correct)
                      .map((s) => (
                        <tr
                          key={s.student_name}
                          className="border-b border-border hover:bg-gray-50"
                        >
                          <td className="py-2 px-2 font-medium">
                            {s.student_name}
                          </td>
                          <td className="text-center py-2 px-2">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded ${getAccuracyColor(Math.round((s.correct / s.total) * 100))}`}
                            >
                              {s.correct}/{s.total}
                            </span>
                          </td>
                          {questions.map((q) => {
                            const answer = s.answers.find(
                              (a) => a.question_id === q.id
                            );
                            return (
                              <td
                                key={q.id}
                                className="text-center py-2 px-1"
                              >
                                {answer ? (
                                  answer.is_correct ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {totalStudents === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">
              Belum ada siswa yang mengerjakan
            </p>
            <p className="text-sm">
              Bagikan kode kelas ke siswa untuk mulai diagnosis
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate(`/class/${classId}`)}
            >
              Lihat Kode Kelas
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
