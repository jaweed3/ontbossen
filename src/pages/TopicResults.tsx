import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import type { Topic, QuestionWithStats, StudentResult } from "../types";
import { ClipboardList, ArrowLeft, Users, CheckCircle2, XCircle, TrendingUp, Lightbulb } from "lucide-react";

const accuracyColor = (acc: number) =>
  acc >= 80 ? "text-healthy" : acc >= 60 ? "text-mild" : "text-severe";

const heatbarColor = (acc: number) =>
  acc >= 80 ? "bg-healthy" : acc >= 60 ? "bg-mild" : acc >= 40 ? "bg-moderate" : "bg-severe";

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

    supabase.from("topics").select("*").eq("id", topicId).single().then(({ data: topicData }) => {
      if (!topicData) { navigate(`/class/${classId}`); return; }
      setTopic(topicData);
    });

    supabase.from("questions").select("*").eq("topic_id", topicId).then(({ data: questionsData }) => {
      const qs = questionsData || [];
      setQuestions(qs.map((q) => ({ ...q, total_answers: 0, correct_count: 0, incorrect_count: 0, accuracy: 0 })));

      supabase.from("answers").select("*, questions!inner(question_text, correct_answer, concept_tag)").eq("questions.topic_id", topicId).then(({ data: answersData }) => {
        if (answersData && qs.length > 0) {
          const qMap = new Map(qs.map((q) => [q.id, q]));
          const sMap = new Map<string, StudentResult>();

          for (const a of answersData) {
            const q = qMap.get(a.question_id);
            if (!q) continue;

            if (!sMap.has(a.student_name)) {
              sMap.set(a.student_name, { student_name: a.student_name, total: qs.length, correct: 0, answers: [] });
            }

            const isCorrect = a.selected_answer === q.correct_answer;
            const s = sMap.get(a.student_name)!;
            if (isCorrect) s.correct++;
            const qData = a.questions as Record<string, string>;
            s.answers.push({
              question_id: a.question_id, question_text: qData.question_text,
              selected_answer: a.selected_answer, correct_answer: q.correct_answer,
              concept_tag: q.concept_tag, is_correct: isCorrect,
            });
          }

          const results = Array.from(sMap.values());
          setTotalStudents(results.length);
          setStudents(results);

          setQuestions(qs.map((q) => {
            const total = answersData.filter((a) => a.question_id === q.id).length;
            const correct = answersData.filter((a) => a.question_id === q.id && a.selected_answer === q.correct_answer).length;
            return { ...q, total_answers: total, correct_count: correct, incorrect_count: total - correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 };
          }));
        }
        setLoading(false);
      });
    });
  }, [topicId, classId, navigate]);

  const classAccuracy = questions.length > 0
    ? Math.round(questions.reduce((s, q) => s + q.accuracy, 0) / questions.length) : 0;
  const weakest = [...questions].sort((a, b) => a.accuracy - b.accuracy)[0];
  const struggling = students.filter((s) => s.correct / s.total < 0.6);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <span className="label-uppercase">Memuat hasil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <header className="glass-panel border-b border-border-glass">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate(`/class/${classId}`)} className="text-text-tertiary hover:text-text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="w-7 h-7 rounded bg-accent-blue/20 flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-accent-blue" />
          </div>
          <span className="font-semibold text-base tracking-tight text-text-primary">{topic?.name || "Hasil Diagnosis"}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Users, value: totalStudents, label: "Siswa Mengerjakan", color: "text-accent-blue" },
            { icon: TrendingUp, value: `${classAccuracy}%`, label: "Rata-rata Kelas", color: accuracyColor(classAccuracy) },
            { icon: CheckCircle2, value: students.filter(s => s.correct === s.total).length, label: "Paham Semua", color: "text-healthy" },
            { icon: XCircle, value: struggling.length, label: "Butuh Bantuan", color: "text-severe" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="py-4 text-center">
                <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold font-mono text-text-primary tabular-nums">{s.value}</p>
                <p className="label-uppercase mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Item */}
        {weakest && weakest.accuracy < 70 && (
          <Card className="!border-mild/30 !bg-mild/[0.03]">
            <CardContent className="py-4 flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-mild mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-mild text-sm">Action Item</h3>
                <p className="text-sm text-text-secondary mt-1">
                  <span className="font-medium text-text-primary">{struggling.length} siswa</span> kesulitan di konsep{" "}
                  <code className="font-mono text-xs bg-surface-raised px-1.5 py-0.5 rounded text-mild">{weakest.concept_tag}</code> ({weakest.accuracy}% benar). Perlu pengulangan dan remedial khusus.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Heatmap */}
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-semibold text-text-primary mb-4">Heatmap per Soal</h3>
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-text-primary truncate">{q.question_text}</p>
                      <span className="text-xs font-mono text-text-tertiary">{q.concept_tag}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm shrink-0">
                      <span className={`font-mono font-semibold tabular-nums ${accuracyColor(q.accuracy)}`}>{q.accuracy}%</span>
                      <span className="text-text-tertiary text-xs">{q.correct_count}/{q.total_answers}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-surface-raised rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${heatbarColor(q.accuracy)}`} style={{ width: `${q.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Table */}
        {students.length > 0 && (
          <Card>
            <CardContent className="pt-5">
              <h3 className="font-semibold text-text-primary mb-4">Breakdown per Siswa</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-glass">
                      <th className="text-left py-2 px-2 label-uppercase">Nama</th>
                      <th className="text-center py-2 px-2 label-uppercase">Skor</th>
                      {questions.map((q) => (
                        <th key={q.id} className="text-center py-2 px-1 label-uppercase max-w-[90px] truncate">{q.concept_tag}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.sort((a, b) => b.correct - a.correct).map((s) => (
                      <tr key={s.student_name} className="border-b border-border-glass/50 hover:bg-surface-glass transition-colors">
                        <td className="py-2.5 px-2 font-medium text-text-primary text-sm">{s.student_name}</td>
                        <td className="text-center py-2.5 px-2">
                          <span className={`font-mono font-semibold text-sm tabular-nums ${accuracyColor((s.correct / s.total) * 100)}`}>{s.correct}/{s.total}</span>
                        </td>
                        {questions.map((q) => {
                          const a = s.answers.find((a) => a.question_id === q.id);
                          return (
                            <td key={q.id} className="text-center py-2.5 px-1">
                              {a ? (
                                a.is_correct ? <CheckCircle2 className="h-4 w-4 text-healthy mx-auto" />
                                  : <XCircle className="h-4 w-4 text-severe mx-auto" />
                              ) : <span className="text-text-tertiary">-</span>}
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
          <div className="text-center py-24">
            <Users className="h-10 w-10 text-text-tertiary mx-auto mb-4" />
            <p className="text-base text-text-secondary">Belum ada siswa yang mengerjakan</p>
            <p className="text-sm text-text-tertiary mt-1">Bagikan kode kelas ke siswa untuk mulai diagnosis</p>
            <Button className="mt-4" onClick={() => navigate(`/class/${classId}`)}>Lihat Kode Kelas</Button>
          </div>
        )}
      </main>
    </div>
  );
}
