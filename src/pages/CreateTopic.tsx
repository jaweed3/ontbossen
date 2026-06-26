import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generateQuestions } from "../lib/claude";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AdminLayout } from "../components/AdminLayout";
import { Sparkles, Plus, Check, Trash2, Edit3 } from "lucide-react";
import type { GeneratedQuestion } from "../lib/claude";
import type { Class } from "../types";

export function CreateTopic() {
  const { id: classId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<Class | null>(null);
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<"input" | "loading" | "preview">("input");

  useEffect(() => {
    if (!classId) return;
    supabase.from("classes").select("*").eq("id", classId).single().then(({ data }) => {
      if (data) setCls(data);
    });
  }, [classId]);

  async function handleGenerate() {
    if (!topicName.trim()) return;
    setPhase("loading");
    setGenerating(true);
    const result = await generateQuestions(topicName, description);
    setQuestions(result);
    setGenerating(false);
    setPhase("preview");
  }

  function handleQuestionChange(index: number, field: keyof GeneratedQuestion, value: string) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  function handleOptionChange(qIndex: number, oIndex: number, value: string) {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  }

  function addQuestion() {
    setQuestions([...questions, {
      question_text: "", options: ["A. ", "B. ", "C. ", "D. "], correct_answer: "", concept_tag: "",
    }]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!classId || !topicName.trim() || questions.length === 0) return;
    setSaving(true);

    const { data: topic, error: topicError } = await supabase.from("topics").insert({
      class_id: classId, name: topicName.trim(), description,
    }).select().single();

    if (topicError || !topic) { alert("Gagal menyimpan topik"); setSaving(false); return; }

    const { error: questionsError } = await supabase.from("questions").insert(
      questions.map((q) => ({ topic_id: topic.id, question_text: q.question_text, options: q.options, correct_answer: q.correct_answer, concept_tag: q.concept_tag }))
    );

    if (questionsError) { alert("Gagal menyimpan soal"); setSaving(false); return; }
    navigate(`/class/${classId}/topic/${topic.id}`);
  }

  const labelLetter = (i: number) => String.fromCharCode(65 + i);

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant mb-6">
        <Link to="/dashboard" className="hover:text-on-surface transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to={`/class/${classId}`} className="hover:text-on-surface transition-colors">{cls?.name || "Kelas"}</Link>
        <span>/</span>
        <span className="text-primary">Create New Topic</span>
      </div>

      {/* Phase 1: Input */}
      {phase === "input" && (
        <section className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-[32px]/[40px] font-bold tracking-tight text-on-surface">Generate Diagnostic Quiz</h2>
            <p className="text-base/6 text-on-surface-variant max-w-xl mx-auto">
              Enter a topic and description. Our AI will distill it into 5 questions targeting specific concept gaps.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-8 space-y-6 relative overflow-hidden shadow-2xl" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
            <div className="relative space-y-6">
              <div className="space-y-2">
                <label className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant/70">Topic Title</label>
                <input
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-[20px]/[28px] font-semibold px-0 py-1 placeholder:text-on-surface-variant/30 transition-all outline-none text-on-surface"
                  placeholder="e.g., Pecahan Campuran"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant/70">Deskripsi Pembelajaran / Learning Objective</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-white/5 rounded-lg focus:border-primary focus:ring-0 text-sm p-4 placeholder:text-on-surface-variant/30 transition-all resize-none outline-none text-on-surface"
                  placeholder="Siswa dapat mengubah pecahan campuran menjadi pecahan biasa dan melakukan operasi penjumlahan dasar..."
                  rows={4}
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={!topicName.trim() || generating}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary py-4 rounded-xl text-[20px]/[28px] font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={generating ? {} : { boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)", animation: "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                >
                  <Sparkles className="h-6 w-6" fill="currentColor" />
                  Generate 5 Soal dengan AI
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loading */}
      {phase === "loading" && (
        <section className="flex flex-col items-center justify-center py-24 space-y-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-lg font-mono text-primary">Menganalisis Kurikulum...</p>
            <p className="text-xs text-on-surface-variant mt-2">AI sedang merancang soal diagnostik presisi tinggi.</p>
          </div>
        </section>
      )}

      {/* Phase 2: Preview & Edit */}
      {phase === "preview" && (
        <section className="max-w-4xl mx-auto space-y-6 pb-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[24px]/[32px] font-semibold text-on-surface">Preview Diagnostic Soal</h3>
              <p className="text-sm text-on-surface-variant">Tinjau dan sesuaikan soal sebelum dipublikasikan.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleGenerate} loading={generating}>
              <Sparkles className="h-4 w-4 mr-1" /> Regenerate All
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="glass-panel rounded-xl p-6 space-y-4 border-l-4 border-l-primary group" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">SOAL #{qi + 1}</span>
                    <input
                      value={q.concept_tag}
                      onChange={(e) => handleQuestionChange(qi, "concept_tag", e.target.value)}
                      className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[10px] font-mono ml-2 outline-none border-0"
                      placeholder="concept-tag"
                    />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-on-surface-variant">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeQuestion(qi)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-error">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <input
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(qi, "question_text", e.target.value)}
                  className="w-full text-base border-b border-white/5 pb-2 bg-transparent outline-none text-on-surface focus:border-primary transition-colors"
                />

                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => {
                    const isCorrect = q.correct_answer === opt;
                    return (
                      <div
                        key={oi}
                        onClick={() => handleQuestionChange(qi, "correct_answer", opt)}
                        className={`p-3 rounded flex items-center gap-2 cursor-pointer transition-all ${
                          isCorrect
                            ? "bg-primary/10 border border-primary/20 text-on-surface"
                            : "bg-white/5 border border-transparent text-on-surface-variant hover:bg-white/10"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCorrect ? "bg-primary text-on-primary" : "bg-white/10 text-on-surface"
                        }`}>
                          {labelLetter(oi)}
                        </span>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const updated = [...q.options];
                            updated[oi] = e.target.value;
                            handleOptionChange(qi, oi, e.target.value);
                          }}
                          className="bg-transparent outline-none text-sm flex-1 min-w-0"
                        />
                        {isCorrect && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all text-[11px]/[16px] tracking-[0.08em] font-bold uppercase"
            >
              + Tambah Soal Manual
            </button>
          </div>

          {/* Sticky bottom save bar */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 glass-panel p-4 rounded-t-2xl flex items-center justify-between border-t border-primary/20 z-30" style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-4 pl-4">
              <Check className="h-5 w-5 text-secondary" />
              <span className="text-xs text-on-surface-variant">{questions.length} Soal diagnostik siap dipublikasikan.</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setPhase("input")}>Draft</Button>
              <Button onClick={handleSave} loading={saving}>
                Save & Publish to Class
              </Button>
            </div>
          </div>
        </section>
      )}
    </AdminLayout>
  );
}
