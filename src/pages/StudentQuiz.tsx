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

    supabase
      .from("classes")
      .select("id, name")
      .eq("code", code)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setError("Kode kelas tidak ditemukan. Periksa kembali.");
          setLoading(false);
          return;
        }

        setClassData(data);

        supabase
          .from("topics")
          .select("id, name")
          .eq("class_id", data.id)
          .order("created_at", { ascending: false })
          .then(({ data: topicsData }) => {
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
    if (!studentName.trim()) {
      setNameError("Masukkan nama atau inisial");
      return;
    }
    if (!selectedTopic || !classData) return;

    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .eq("topic_id", selectedTopic);

    if (!questionsData || questionsData.length === 0) {
      setError("Belum ada soal untuk topik ini.");
      return;
    }

    setQuestions(shuffleArray(questionsData));
    setCurrentQ(0);
    setAnswers({});
    setNameError("");
  }, [studentName, selectedTopic, classData]);

  function handleSelect(answer: string) {
    setAnswers({ ...answers, [questions[currentQ].id]: answer });
  }

  function nextQuestion() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  }

  function prevQuestion() {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  }

  async function submitQuiz() {
    if (!classData || !selectedTopic) return;
    setSubmitting(true);

    const { data: session } = await supabase
      .from("quiz_sessions")
      .insert({
        topic_id: selectedTopic,
        class_id: classData.id,
      })
      .select()
      .single();

    if (!session) {
      alert("Gagal mengirim. Coba lagi.");
      setSubmitting(false);
      return;
    }

    const answerRows = Object.entries(answers).map(
      ([questionId, selected_answer]) => ({
        question_id: questionId,
        session_id: session.id,
        student_name: studentName.trim(),
        selected_answer,
      })
    );

    const { error: insertError } = await supabase
      .from("answers")
      .insert(answerRows);

    if (insertError) {
      alert("Gagal mengirim. Coba lagi.");
    } else {
      setDone(true);
    }
    setSubmitting(false);
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="py-8">
            <p className="text-red-500 font-medium">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Selesai! </h2>
            <p className="text-gray-600">
              Jawabanmu sudah tercatat. Guru akan melihat hasilnya.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <header className="bg-white/80 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <span className="font-bold">{classData?.name || "DiagnosaKelas"}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-8 space-y-4">
              <div className="text-center mb-4">
                <ClipboardList className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="text-xl font-bold">
                  {classData?.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  Kode: {code}
                </p>
              </div>

              <Input
                id="studentName"
                label="Nama atau Inisial"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setNameError("");
                }}
                error={nameError}
                placeholder="Contoh: Andi"
              />

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Topik
                </p>
                <div className="grid gap-2">
                  {topics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTopic(t.id)}
                      className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        selectedTopic === t.id
                          ? "border-primary bg-primary-light text-primary"
                          : "border-border bg-white hover:border-primary/50"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={startQuiz}
                disabled={!selectedTopic || !studentName.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Mulai
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-500">
                  Soal {currentQ + 1} dari {questions.length}
                </span>
                <span className="text-sm font-medium text-primary">
                  {answeredCount}/{questions.length} terjawab
                </span>
              </div>

              <div className="flex gap-1 mb-6">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      answers[questions[i].id]
                        ? "bg-primary"
                        : i === currentQ
                          ? "bg-primary/40"
                          : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <h3 className="text-lg font-semibold mb-6">
                {questions[currentQ].question_text}
              </h3>

              <div className="space-y-3">
                {questions[currentQ].options.map((opt, i) => {
                  const isSelected = answers[questions[currentQ].id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                        isSelected
                          ? "border-primary bg-primary-light text-primary font-medium"
                          : "border-border bg-white hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQ === 0}
                >
                  Sebelumnya
                </Button>

                {currentQ < questions.length - 1 ? (
                  <Button
                    onClick={nextQuestion}
                    disabled={!answers[questions[currentQ].id]}
                  >
                    Selanjutnya
                  </Button>
                ) : (
                  <Button
                    onClick={submitQuiz}
                    loading={submitting}
                    disabled={!allAnswered}
                  >
                    {submitting ? "Mengirim..." : "Kumpulkan"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
