import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Question } from "../types";
import { ClipboardList, Send, CheckCircle } from "lucide-react";

export function StudentQuiz() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<{ id: string; name: string } | null>(null);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [nameError, setNameError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;

    supabase.from("classes").select("id, name").eq("code", code).maybeSingle().then(({ data }) => {
      if (!data) {
        setError("Kode kelas tidak ditemukan.");
        setLoading(false);
        return;
      }
      setClassData(data);
      supabase.from("topics").select("id, name").eq("class_id", data.id).order("created_at", { ascending: false }).then(({ data: topicsData }) => {
        if (topicsData) setTopics(topicsData);
        setLoading(false);
      });
    });
  }, [code]);

  function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const startQuiz = useCallback(async () => {
    if (!studentName.trim()) { setNameError("Masukkan nama atau inisial"); return; }
    if (!selectedTopic || !classData) return;

    const key = `submitted:${selectedTopic}:${studentName.trim().toLowerCase()}`;
    const lastSubmit = localStorage.getItem(key);
    if (lastSubmit) {
      const elapsed = Date.now() - parseInt(lastSubmit);
      if (elapsed < 300000) {
        setError("Kamu sudah mengerjakan topik ini. Tunggu 5 menit untuk mengulang.");
        return;
      }
    }

    const { data: topicQuestions } = await supabase.from("questions").select("id").eq("topic_id", selectedTopic);
    const questionIds = topicQuestions?.map(q => q.id) || [];
    if (questionIds.length === 0) { setError("Belum ada soal untuk topik ini."); return; }

    const { data: existing } = await supabase
      .from("answers")
      .select("id")
      .eq("student_name", studentName.trim())
      .in("question_id", questionIds)
      .limit(1);

    if (existing && existing.length > 0) {
      setError("Kamu sudah pernah mengerjakan topik ini. Guru hanya melihat 1 submission pertama.");
      return;
    }

    const { data: questionsData } = await supabase.from("questions").select("*").eq("topic_id", selectedTopic);
    if (!questionsData || questionsData.length === 0) { setError("Belum ada soal untuk topik ini."); return; }

    setQuestions(shuffleArray(questionsData));
    setCurrentQ(0);
    setAnswers({});
    setNameError("");
  }, [studentName, selectedTopic, classData]);

  function handleSelect(answer: string) {
    setAnswers({ ...answers, [questions[currentQ].id]: answer });
  }

  function nextQuestion() { if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1); }
  function prevQuestion() { if (currentQ > 0) setCurrentQ(currentQ - 1); }

  function sanitize(input: string): string {
    return input.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
  }

  async function submitQuiz() {
    if (!classData || !selectedTopic) return;
    setSubmitting(true);

    const { data: session } = await supabase.from("quiz_sessions").insert({
      topic_id: selectedTopic, class_id: classData.id,
    }).select().single();

    if (!session) { alert("Gagal mengirim. Coba lagi."); setSubmitting(false); return; }

    const safeName = sanitize(studentName);
    if (!safeName) { alert("Nama tidak valid."); setSubmitting(false); return; }

    const { error: insertError } = await supabase.from("answers").insert(
      Object.entries(answers).map(([questionId, selected_answer]) => ({
        question_id: questionId, session_id: session.id, student_name: safeName, selected_answer,
      }))
    );

    if (insertError) alert("Gagal mengirim. Coba lagi.");
    else {
      const key = `submitted:${selectedTopic}:${studentName.trim().toLowerCase()}`;
      localStorage.setItem(key, String(Date.now()));
      setDone(true);
    }
    setSubmitting(false);
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <span className="label-uppercase">Memuat...</span>
        </div>
      </div>
    );
  }

  if (error && !classData) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="py-8">
            <p className="text-severe font-medium">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="py-8">
            <CheckCircle className="h-12 w-12 text-healthy mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-1">Selesai!</h2>
            <p className="text-sm text-text-secondary">Jawabanmu sudah tercatat. Guru akan melihat hasilnya.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <header className="glass-panel border-b border-border-glass">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-accent-blue/20 flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-accent-blue" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-text-primary">{classData?.name || "DiagnosaKelas"}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-8 space-y-4">
              <div className="text-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="h-5 w-5 text-accent-blue" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary">{classData?.name}</h2>
                <p className="text-xs text-text-tertiary mt-1 font-mono">Kode: {code}</p>
              </div>

              {error && <div className="bg-severe/10 border border-severe/30 text-severe text-sm rounded-lg px-4 py-3 font-medium">{error}</div>}

              <Input id="name" label="Nama atau Inisial" value={studentName} onChange={(e) => { setStudentName(e.target.value); setNameError(""); }} error={nameError} placeholder="Contoh: Andi" />

              <div>
                <span className="label-uppercase block mb-2">Pilih Topik</span>
                <div className="grid gap-1.5">
                  {topics.map((t) => (
                    <button key={t.id} onClick={() => setSelectedTopic(t.id)}
                      className={`text-left px-4 py-2.5 rounded border text-sm font-medium transition-all ${
                        selectedTopic === t.id
                          ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                          : "border-border-glass bg-surface-raised text-text-secondary hover:border-border-hover hover:text-text-primary"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={startQuiz} disabled={!selectedTopic || !studentName.trim()}>
                <Send className="h-4 w-4 mr-1.5" />Mulai
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-text-tertiary">Soal {currentQ + 1} dari {questions.length}</span>
                <span className="text-xs font-mono text-accent-blue tabular-nums">{answeredCount}/{questions.length}</span>
              </div>

              <div className="flex gap-1 mb-5">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    answers[questions[i].id] ? "bg-accent-blue" : i === currentQ ? "bg-accent-blue/40" : "bg-surface-raised"
                  }`} />
                ))}
              </div>

              <h3 className="text-base font-medium text-text-primary mb-5 leading-relaxed">
                {questions[currentQ].question_text}
              </h3>

              <div className="space-y-2">
                {questions[currentQ].options.map((opt, i) => {
                  const selected = answers[questions[currentQ].id] === opt;
                  return (
                    <button key={i} onClick={() => handleSelect(opt)}
                      className={`w-full text-left px-4 py-3 rounded border text-sm transition-all ${
                        selected
                          ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                          : "border-border-glass bg-surface-raised text-text-secondary hover:border-border-hover hover:text-text-primary"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevQuestion} disabled={currentQ === 0}>Sebelumnya</Button>
                {currentQ < questions.length - 1 ? (
                  <Button onClick={nextQuestion} disabled={!answers[questions[currentQ].id]}>Selanjutnya</Button>
                ) : (
                  <Button onClick={submitQuiz} loading={submitting} disabled={!allAnswered}>Kumpulkan</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
