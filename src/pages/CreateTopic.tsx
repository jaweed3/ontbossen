import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generateQuestions } from "../lib/claude";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { ClipboardList, ArrowLeft, Sparkles, Plus, Check } from "lucide-react";
import type { GeneratedQuestion } from "../lib/claude";

export function CreateTopic() {
  const { id: classId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    if (!topicName.trim()) return;
    setGenerating(true);
    const result = await generateQuestions(topicName, description);
    setQuestions(result);
    setGenerating(false);
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

  return (
    <div className="min-h-screen bg-void">
      <header className="glass-panel border-b border-border-glass">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate(`/class/${classId}`)} className="text-text-tertiary hover:text-text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="w-7 h-7 rounded bg-accent-blue/20 flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-accent-blue" />
          </div>
          <span className="font-semibold text-base tracking-tight text-text-primary">Topik Baru</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        <Card>
          <CardContent className="space-y-4 pt-5">
            <Input id="name" label="Nama Topik" value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="Contoh: Pecahan Campuran" />
            <Input id="desc" label="Deskripsi (opsional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kelas 5 SD - Semester 1" />
            <Button onClick={handleGenerate} loading={generating} disabled={!topicName.trim()}>
              <Sparkles className="h-4 w-4 mr-1.5" />{generating ? "Menulis soal..." : "Generate 5 Soal dengan AI"}
            </Button>
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Soal ({questions.length})</h2>
              <Button variant="outline" size="sm" onClick={addQuestion}><Plus className="h-3.5 w-3.5 mr-1" />Tambah</Button>
            </div>

            {questions.map((q, qi) => (
              <Card key={qi}>
                <CardContent className="space-y-4 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <Input id={`q-${qi}`} label={`Soal ${qi + 1}`} value={q.question_text} onChange={(e) => handleQuestionChange(qi, "question_text", e.target.value)} />
                      <div>
                        <span className="label-uppercase block mb-2">Pilihan Jawaban</span>
                        {q.options.map((opt, oi) => (
                          <Input key={oi} id={`q-${qi}-${oi}`} value={opt} onChange={(e) => handleOptionChange(qi, oi, e.target.value)} className="ml-3 mb-1.5" />
                        ))}
                      </div>
                      <Input id={`q-${qi}-correct`} label="Jawaban Benar" value={q.correct_answer} onChange={(e) => handleQuestionChange(qi, "correct_answer", e.target.value)} />
                      <Input id={`q-${qi}-tag`} label="Tag Konsep" value={q.concept_tag} onChange={(e) => handleQuestionChange(qi, "concept_tag", e.target.value)} placeholder="pecahan-campuran" />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(qi)} className="!text-severe hover:!bg-severe/10">Hapus</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
              <Check className="h-4 w-4 mr-1.5" />Simpan Topik & Soal
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
