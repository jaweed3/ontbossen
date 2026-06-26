import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Question } from "../types";
import {
  User, BookOpen, Play, ChevronDown,
  Shield, Clock, Zap, Tag,
  ArrowLeft, ArrowRight, Home,
  CheckCircle, HelpCircle
} from "lucide-react";

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
  const [particles, setParticles] = useState(false);

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

  useEffect(() => {
    if (done) {
      setParticles(true);
      const timer = setTimeout(() => setParticles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [done]);

  const labelLetter = (i: number) => String.fromCharCode(65 + i);

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
    setError("");
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
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">Memuat...</span>
        </div>
      </div>
    );
  }

  // Error screen
  if (error && !classData) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4">
        <div className="glass-panel rounded-xl p-8 max-w-sm w-full text-center" style={{ boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ====== COMPLETION SCREEN ======
  if (done) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />

        {/* Celebration particles */}
        {particles && Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-secondary rounded-full pointer-events-none"
            style={{
              left: `${40 + Math.random() * 20}%`,
              top: `${40 + Math.random() * 20}%`,
              animation: `fade-up ${0.8 + Math.random() * 0.5}s ease-out ${0.5 + Math.random() * 0.5}s forwards`,
              opacity: 0,
            }}
          />
        ))}

        <div className="max-w-lg w-full text-center relative z-10 px-4">
          <div className="glass-panel rounded-xl p-16 flex flex-col items-center relative overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
            {/* Animated checkmark */}
            <div className="w-32 h-32 mb-8 bg-secondary-container/10 rounded-full flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(0, 203, 230, 0.15)" }}>
              <svg className="w-16 h-16 text-secondary stroke-current fill-none" style={{ strokeWidth: 4 }} viewBox="0 0 52 52">
                <circle className="opacity-20" cx="26" cy="26" r="25" />
                <path className="checkmark-draw" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            <h1 className="text-[32px]/[40px] font-bold text-on-background mb-2 fade-up" style={{ animationDelay: "0.8s" }}>
              Bagus, {studentName}!
            </h1>
            <p className="text-base/6 text-on-surface-variant max-w-md mx-auto fade-up" style={{ animationDelay: "1s" }}>
              Jawabanmu sudah tercatat. Guru kamu akan segera melihat progresmu.
            </p>

            <div className="fade-up mt-8" style={{ animationDelay: "1.2s" }}>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-12 py-4 bg-secondary text-on-secondary rounded-xl font-semibold text-[20px]/[28px] transition-all hover:scale-105 active:scale-95"
                style={{ boxShadow: "0 0 20px rgba(93, 230, 255, 0.3)" }}
              >
                <Home className="h-5 w-5" />
                Kembali ke Beranda
              </Link>
            </div>

            {/* Mini results */}
            <div className="mt-12 w-full border-t border-white/5 pt-8 grid grid-cols-2 gap-4 fade-up" style={{ animationDelay: "1.4s" }}>
              <div className="p-4 glass-panel rounded-lg text-left" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
                <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant block mb-1">WAKTU PENYELESAIAN</span>
                <span className="text-lg font-mono font-semibold text-secondary">{new Date().toLocaleTimeString("id-ID", { minute: "2-digit", second: "2-digit" })}</span>
              </div>
              <div className="p-4 glass-panel rounded-lg text-left" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
                <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant block mb-1">STATUS DIAGNOSA</span>
                <span className="text-lg font-mono font-semibold text-primary flex items-center gap-1">
                  <CheckCircle className="h-5 w-5" />
                  Berhasil
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====== QUIZ INTERACTION SCREEN ======
  if (questions.length > 0) {
    const q = questions[currentQ];
    return (
      <div className="min-h-screen bg-void flex flex-col">
        {/* Header */}
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="text-[24px]/[32px] font-bold text-primary tracking-tight">DiagnosaKelas</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">Siswa</span>
                <span className="text-sm text-on-surface font-medium">{studentName}</span>
              </div>
              <User className="h-6 w-6 text-on-surface-variant" />
            </div>
          </div>
        </nav>

        {/* Main interaction */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-8 relative overflow-hidden">
          <div className="max-w-3xl w-full flex flex-col gap-8">
            {/* Progress tracker */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                {questions.map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`rounded-full transition-all ${
                        i < currentQ ? "w-3 h-3 bg-primary" :
                        i === currentQ ? "w-4 h-4 bg-primary" :
                        "w-3 h-3 bg-white/10"
                      }`}
                      style={i === currentQ ? { boxShadow: "0 0 10px rgba(173, 198, 255, 0.4)", animation: "pulse-glow 2s infinite" } : {}}
                    />
                    {i < questions.length - 1 && (
                      <div className={`w-12 h-0.5 rounded-full ${i < currentQ ? "bg-primary/30" : "bg-white/5"}`} />
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-primary">Pertanyaan {currentQ + 1} dari {questions.length}</span>
            </div>

            {/* Quiz card */}
            <div className="glass-panel rounded-xl p-8 flex flex-col gap-6" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-primary">{q.concept_tag}</span>
                </div>
              </div>

              <h1 className="text-[32px]/[40px] font-bold text-on-surface leading-tight">{q.question_text}</h1>

              {/* Options grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(opt)}
                      className={`option-card flex items-center gap-4 p-6 rounded-xl border text-left relative overflow-hidden group transition-all ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-lg font-semibold shrink-0 transition-all ${
                        selected ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary"
                      }`}>
                        {labelLetter(oi)}
                      </div>
                      <span className={`text-base/6 transition-colors ${selected ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"}`}>{opt.replace(/^[A-D]\.\s*/, "")}</span>
                      {selected && (
                        <CheckCircle className="h-5 w-5 text-primary absolute right-4 top-1/2 -translate-y-1/2" fill="currentColor" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentQ === 0}
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                Sebelumnya
              </button>
              <div className="flex gap-4">
                <button className="bg-surface-container-high border border-white/10 text-on-surface px-8 py-4 rounded-xl text-sm font-semibold hover:bg-surface-variant transition-all active:scale-95">
                  Ragu-ragu
                </button>
                {currentQ < questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    disabled={!answers[q.id]}
                    className="bg-primary text-on-primary px-12 py-4 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ boxShadow: "0 8px 20px rgba(173, 198, 255, 0.3)" }}
                  >
                    Selanjutnya
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={submitQuiz}
                    disabled={!allAnswered || submitting}
                    className="bg-primary text-on-primary px-12 py-4 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ boxShadow: submitting ? "none" : "0 8px 20px rgba(173, 198, 255, 0.3)" }}
                  >
                    {submitting ? "Mengirim..." : "Kumpulkan"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ====== SETUP SCREEN ======
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4 relative">
      {/* Atmospheric glows */}
      <div className="glow-accent top-1/4 left-1/4" />
      <div className="glow-accent bottom-1/4 right-1/4" style={{ background: "radial-gradient(circle, rgba(93, 230, 255, 0.1) 0%, rgba(93, 230, 255, 0) 70%)" }} />

      <div className="w-full max-w-xl flex flex-col items-center relative z-10">
        {/* Logo branding */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-2" style={{ boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)" }}>
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-[24px]/[32px] font-bold text-primary tracking-tighter">DiagnosaKelas</h1>
        </div>

        {/* Setup card */}
        <main className="glass-panel w-full p-8 rounded-xl" style={{ boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>
          <div className="mb-6 space-y-2">
            <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-secondary">Fase 1: Persiapan</span>
            <h2 className="text-[20px]/[28px] font-semibold text-on-surface">Bergabung ke Kelas: {classData?.name}</h2>
            <p className="text-sm text-on-surface-variant">Lengkapi data di bawah untuk memulai sesi diagnosis hari ini.</p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-error bg-error-container/20 border border-error/20 rounded-lg px-4 py-3 font-medium">{error}</div>
          )}

          <div className="space-y-6">
            {/* Name input */}
            <div className="space-y-2">
              <label className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant block">SIAPA NAMAMU?</label>
              <div className="relative">
                <User className="h-5 w-5 text-outline-variant absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={studentName}
                  onChange={(e) => { setStudentName(e.target.value); setNameError(""); }}
                  className="w-full bg-surface-container-lowest border-b-2 border-outline-variant focus:border-secondary text-on-surface pl-12 pr-4 py-4 rounded-t-lg transition-all focus:ring-0 outline-none text-base"
                  placeholder="Ketik nama lengkapmu di sini..."
                  maxLength={50}
                />
              </div>
              {nameError && <p className="text-xs text-error">{nameError}</p>}
            </div>

            {/* Topic selection */}
            <div className="space-y-2">
              <label className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant block">PILIH TOPIK DIAGNOSIS</label>
              <div className="relative">
                <BookOpen className="h-5 w-5 text-outline-variant absolute left-4 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedTopic || ""}
                  onChange={(e) => setSelectedTopic(e.target.value || null)}
                  className="w-full bg-surface-container-lowest border-b-2 border-outline-variant focus:border-secondary text-on-surface pl-12 pr-10 py-4 rounded-t-lg transition-all focus:ring-0 outline-none appearance-none cursor-pointer text-base"
                >
                  <option value="">Pilih topik...</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="h-5 w-5 text-outline-variant absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                onClick={startQuiz}
                disabled={!selectedTopic || !studentName.trim()}
                className="w-full bg-primary text-on-primary font-semibold text-[20px]/[28px] py-4 rounded-full flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ animation: !selectedTopic || !studentName.trim() ? "none" : "pulse-subtle 3s infinite ease-in-out" }}
              >
                <Play className="h-5 w-5" fill="currentColor" />
                Mulai Quiz
              </button>
              <p className="text-center text-xs text-on-surface-variant mt-4 italic">
                "Jangan khawatir, ini adalah perjalanan belajarmu. Lakukan yang terbaik!"
              </p>
            </div>
          </div>
        </main>

        {/* Footer info */}
        <footer className="mt-8 flex items-center gap-8 text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Lingkungan Aman</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Estimasi: 15 Menit</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-xs">AI-Powered</span>
          </div>
        </footer>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="fixed bottom-0 left-0 w-full p-4 text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-white/10 flex justify-between pointer-events-none">
        <span>sys_id: dk_{classData?.name?.toLowerCase().replace(/\s+/g, "_") || "unknown"}</span>
        <span>st_lat: session_setup_v1.0.4</span>
      </div>
    </div>
  );
}
