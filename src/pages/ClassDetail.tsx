import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import type { Class, Topic } from "../types";
import { ClipboardList, ArrowLeft, Plus, BookOpen, ChevronRight, Copy, Check, BarChart3 } from "lucide-react";

export function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<Class | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    supabase.from("classes").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) navigate("/dashboard");
      else setCls(data);
    });

    supabase.from("topics").select("*").eq("class_id", id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setTopics(data);
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
    <div className="min-h-screen bg-void">
      <header className="glass-panel border-b border-border-glass">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-text-tertiary hover:text-text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="w-7 h-7 rounded bg-accent-blue/20 flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-accent-blue" />
          </div>
          <span className="font-semibold text-base tracking-tight text-text-primary">{cls.name}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="glass-panel-strong rounded-xl p-6 mb-8 bg-gradient-to-br from-accent-blue/5 to-accent-cyan/5 border-accent-blue/10">
          <div className="flex items-center justify-between">
            <div>
              <span className="label-uppercase block mb-1">Kode Kelas</span>
              <p className="text-3xl font-mono font-bold tracking-[0.3em] text-text-primary">{cls.code}</p>
              <p className="text-xs text-text-tertiary mt-2">Bagikan kode ini ke siswa. Mereka tidak perlu akun.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => copyClassCode(cls.code)}>
                {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                {copied ? "Tersalin" : "Salin"}
              </Button>
              <Link to={`/class/${id}/topics/new`}>
                <Button><Plus className="h-4 w-4 mr-1.5" />Topik Baru</Button>
              </Link>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-text-primary mb-4">Daftar Topik</h2>

        {topics.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-10 w-10 text-text-tertiary mx-auto mb-4" />
            <p className="text-base text-text-secondary">Belum ada topik</p>
            <p className="text-sm text-text-tertiary mt-1">Buat topik pertama untuk mulai membuat soal diagnostik</p>
            <Link to={`/class/${id}/topics/new`}>
              <Button className="mt-4"><Plus className="h-4 w-4 mr-1.5" />Buat Topik</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-2">
            {topics.map((topic) => (
              <Card key={topic.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{topic.name}</h3>
                    {topic.description && <p className="text-xs text-text-tertiary mt-0.5">{topic.description}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link to={`/class/${id}/topic/${topic.id}`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-3.5 w-3.5 mr-1" />Hasil
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => deleteTopic(topic.id)} className="!text-severe hover:!bg-severe/10">Hapus</Button>
                    <ChevronRight className="h-4 w-4 text-text-tertiary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
