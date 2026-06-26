import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { AdminLayout } from "../components/AdminLayout";
import type { Topic, QuestionWithStats, StudentResult } from "../types";
import {
  CheckCircle2, XCircle, Download, Share2,
  Search, ChevronLeft, ChevronRight,
  AlertTriangle
} from "lucide-react";

const severityColor = (acc: number) =>
  acc >= 80 ? "text-healthy" : acc >= 60 ? "text-mild" : "text-severe";

const severityBorder = (acc: number) =>
  acc >= 80 ? "border-l-status-healthy" : acc >= 60 ? "border-l-status-moderate" : "border-l-status-severe";

const severityBg = (acc: number) =>
  acc >= 80 ? "bg-status-healthy" : acc >= 60 ? "bg-status-moderate" : "bg-status-severe";

export function TopicResults() {
  const { id: classId, topicId } = useParams<{ id: string; topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [className, setClassName] = useState("");
  const [questions, setQuestions] = useState<QuestionWithStats[]>([]);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!topicId) return;

    supabase.from("topics").select("*").eq("id", topicId).single().then(({ data: topicData }) => {
      if (!topicData) return;
      setTopic(topicData);
    });

    supabase.from("classes").select("name").eq("id", classId).single().then(({ data }) => {
      if (data) setClassName(data.name);
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
  }, [topicId, classId]);

  const classAccuracy = questions.length > 0
    ? Math.round(questions.reduce((s, q) => s + q.accuracy, 0) / questions.length) : 0;
  const weakest = [...questions].sort((a, b) => a.accuracy - b.accuracy)[0];
  const struggling = students.filter((s) => s.correct / s.total < 0.6);
  const mastered = students.filter((s) => s.correct === s.total);

  const filteredStudents = students.filter(s =>
    s.student_name.toLowerCase().includes(search.toLowerCase())
  );

  function initials(name: string) {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }

  function avatarColor(name: string) {
    const colors = ["bg-primary-container", "bg-secondary-container", "bg-tertiary-container", "bg-error-container"];
    return colors[name.length % colors.length];
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">Memuat hasil...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-2">
          <Link to={`/class/${classId}`} className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-[11px]/[16px] tracking-[0.08em] font-bold uppercase">
            ← Back to Class Detail
          </Link>
          <div>
            <h2 className="text-[32px]/[40px] font-bold tracking-tight text-on-surface">{topic?.name || "Hasil Diagnosis"}</h2>
            <p className="text-base/6 text-secondary/80">{className}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-1" /> Export Data
          </Button>
          <Button size="sm">
            <Share2 className="h-4 w-4 mr-1" /> Share Insight
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel rounded-xl p-6" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
          <p className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant mb-2">Total Students</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px]/[40px] font-mono font-bold text-on-surface">{totalStudents}</span>
            <span className="text-xs text-on-surface-variant">Active</span>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-6 border-l-4 border-l-status-moderate" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
          <p className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant mb-2">Class Average</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px]/[40px] font-mono font-bold text-mild">{classAccuracy}%</span>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-6 border-l-4 border-l-status-healthy" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
          <p className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant mb-2">Mastered Concepts</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px]/[40px] font-mono font-bold text-healthy">{mastered.length}</span>
            <span className="text-xs text-on-surface-variant">Students</span>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-6 border-l-4 border-l-status-severe" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
          <p className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant mb-2">Needs Help</p>
          <div className="flex items-baseline gap-1 text-severe">
            <span className="text-[32px]/[40px] font-mono font-bold">{struggling.length}</span>
            <AlertTriangle className="h-5 w-5" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Action Item Banner */}
      {weakest && weakest.accuracy < 70 && (
        <div className="glass-panel rounded-xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 group hover:bg-error-container/10 transition-all cursor-pointer" style={{ boxShadow: "0 0 20px rgba(255, 59, 48, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 59, 48, 0.4)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-severe/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-severe" />
            </div>
            <div>
              <h4 className="text-[20px]/[28px] font-semibold text-on-surface">Urgent Intervention Required</h4>
              <p className="text-sm text-on-surface-variant">
                <span className="font-bold text-severe">{struggling.length} siswa</span> sangat kesulitan di konsep{' '}
                <code className="bg-white/5 px-1 rounded font-mono text-sm">{weakest.concept_tag}</code> (Accuracy {weakest.accuracy}%).
              </p>
            </div>
          </div>
          <span className="whitespace-nowrap px-6 py-3 bg-severe text-white rounded-xl font-bold text-[11px]/[16px] tracking-[0.08em] uppercase group-hover:scale-105 transition-transform">
            View Lesson Plan
          </span>
        </div>
      )}

      {/* Total students == 0 */}
      {totalStudents === 0 && (
        <div className="text-center py-24">
          <CheckCircle2 className="h-12 w-12 text-on-surface-variant/40 mx-auto mb-4" />
          <p className="text-base text-on-surface-variant">Belum ada siswa yang mengerjakan</p>
          <p className="text-sm text-on-surface-variant/60 mt-1">Bagikan kode kelas ke siswa untuk mulai diagnosis</p>
          <Link to={`/class/${classId}`}><Button className="mt-4">Lihat Kode Kelas</Button></Link>
        </div>
      )}

      {totalStudents > 0 && (
        <>
          {/* Heatmap Grid */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px]/[28px] font-semibold text-on-surface">Question Heatmap</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-healthy" />
                  <span className="text-xs text-on-surface-variant">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-mild" />
                  <span className="text-xs text-on-surface-variant">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-severe" />
                  <span className="text-xs text-on-surface-variant">Severe</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.map((q) => {
                const color = severityColor(q.accuracy);
                const barColor = severityBg(q.accuracy);
                return (
                  <div key={q.id} className={`glass-panel rounded-xl p-4 space-y-2 hover:border-white/20 transition-colors ${
                    q.accuracy < 60 ? "border-severe/30 bg-severe/[0.02]" : ""
                  }`} style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-secondary">{q.concept_tag}</span>
                      <span className="text-lg font-mono font-semibold" style={{ color: q.accuracy >= 80 ? "#34C759" : q.accuracy >= 60 ? "#FF9F0A" : "#FF3B30" }}>{q.accuracy}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full rounded-full" style={{ width: `${q.accuracy}%`, backgroundColor: q.accuracy >= 80 ? "#34C759" : q.accuracy >= 60 ? "#FF9F0A" : "#FF3B30" }} />
                      <div className="h-full bg-white/5" style={{ width: `${100 - q.accuracy}%` }} />
                    </div>
                    <p className="text-xs text-on-surface-variant/60 italic truncate">"{q.question_text}"</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Student Table */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px]/[28px] font-semibold text-on-surface">Student Performance Grid</h3>
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-surface-container border-none rounded-lg text-xs w-48 lg:w-64 pl-8 pr-3 py-2 outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/40"
                  placeholder="Search student..."
                />
                <Search className="h-4 w-4 text-on-surface-variant absolute left-2.5 top-2.5" />
              </div>
            </div>
            <div className="glass-panel rounded-xl overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-6 py-4 text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">Student Name</th>
                      <th className="px-6 py-4 text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">Total Score</th>
                      {questions.map((q) => (
                        <th key={q.id} className="px-6 py-4 text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant text-center">{q.concept_tag}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.sort((a, b) => b.correct - a.correct).map((s) => {
                      const pct = Math.round((s.correct / s.total) * 100);
                      return (
                        <tr key={s.student_name} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${avatarColor(s.student_name)} flex items-center justify-center text-xs font-bold`}>
                                {initials(s.student_name)}
                              </div>
                              <span className="text-sm font-semibold text-on-surface">{s.student_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-mono font-semibold" style={{ color: pct >= 80 ? "#34C759" : pct >= 60 ? "#FF9F0A" : "#FF3B30" }}>{s.correct}/{s.total}</span>
                          </td>
                          {questions.map((q) => {
                            const a = s.answers.find((a) => a.question_id === q.id);
                            return (
                              <td key={q.id} className="px-6 py-4 text-center">
                                {a ? (
                                  a.is_correct
                                    ? <CheckCircle2 className="h-5 w-5 text-healthy mx-auto" fill="currentColor" />
                                    : <XCircle className="h-5 w-5 text-severe mx-auto" fill="currentColor" />
                                ) : <span className="text-on-surface-variant/40">—</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredStudents.length === 0 && search && (
                <div className="text-center py-8 text-sm text-on-surface-variant/60">
                  No students match "{search}"
                </div>
              )}
              <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Showing {filteredStudents.length} of {students.length} students</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-white/5 rounded border border-white/5 disabled:opacity-30" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-white/5 rounded border border-white/5">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
