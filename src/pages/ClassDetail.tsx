import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { AdminLayout } from "../components/AdminLayout";
import type { Class, Topic } from "../types";
import {
  Plus, BookOpen, Copy, Check, BarChart3,
  Trash2, Users, FlaskConical
} from "lucide-react";

export function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<Class | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [copied, setCopied] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    supabase.from("classes").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) { navigate("/dashboard"); return; }
      setCls(data);
    });

    supabase.from("topics").select("*").eq("class_id", id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setTopics(data);
    });

    // ponytail: count distinct students from sessions
    supabase.from("quiz_sessions").select("student_name").eq("class_id", id)
      .then(({ data }) => {
        if (data) setStudentCount(new Set(data.map(s => s.student_name)).size);
      });
  }, [id, navigate]);

  async function deleteTopic(topicId: string) {
    const { error } = await supabase.from("topics").delete().eq("id", topicId);
    if (!error) setTopics(topics.filter((t) => t.id !== topicId));
  }

  function copyClassCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!cls) return null;

  return (
    <AdminLayout>
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant mb-6">
        <Link to="/dashboard" className="hover:text-on-surface transition-colors">Dashboard</Link>
        <span className="text-xs">/</span>
        <span className="text-primary">{cls.name}</span>
      </div>

      {/* Class Header */}
      <div className="glass-panel rounded-xl p-6 mb-8 relative overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 blur-[80px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-secondary" />
              <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-secondary">
                {studentCount} Siswa · {topics.length} Topik
              </span>
            </div>
            <h2 className="text-[32px]/[40px] font-bold tracking-tight text-on-surface">{cls.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">Kode Kelas:</span>
              <span className="text-lg font-mono text-primary tracking-[0.3em] font-bold">{cls.code}</span>
              <button
                onClick={() => copyClassCode(cls.code)}
                className="text-on-surface-variant hover:text-primary transition-colors ml-1"
              >
                {copied ? <Check className="h-4 w-4 text-healthy" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-on-surface-variant/60 mt-1">Bagikan kode ini ke siswa. Mereka tidak perlu akun.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => copyClassCode(cls.code)} className="text-sm">
              {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copied ? "Tersalin" : "Salin Kode"}
            </Button>
            <Link to={`/class/${id}/topics/new`}>
              <Button className="text-sm">
                <Plus className="h-4 w-4 mr-1.5" />Topik Baru
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-[20px]/[28px] font-semibold text-on-surface">Daftar Topik</h3>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="h-12 w-12 text-on-surface-variant/40 mx-auto mb-4" />
          <p className="text-base text-on-surface-variant">Belum ada topik</p>
          <p className="text-sm text-on-surface-variant/60 mt-1">Buat topik pertama untuk mulai membuat soal diagnostik</p>
          <Link to={`/class/${id}/topics/new`}>
            <Button className="mt-4"><Plus className="h-4 w-4 mr-1.5" />Buat Topik</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="glass-panel rounded-xl p-5 flex items-center justify-between group hover:bg-white/[0.06] transition-all"
              style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FlaskConical className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-on-surface truncate">{topic.name}</h3>
                  {topic.description && (
                    <p className="text-xs text-on-surface-variant/60 mt-0.5 truncate">{topic.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/class/${id}/topic/${topic.id}`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-3.5 w-3.5 mr-1" />Hasil
                  </Button>
                </Link>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
