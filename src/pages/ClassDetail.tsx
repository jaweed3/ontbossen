import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import type { Class, Topic } from "../types";
import {
  ClipboardList,
  ArrowLeft,
  Plus,
  BookOpen,
  ChevronRight,
  Copy,
  Check,
  BarChart3,
} from "lucide-react";

export function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<Class | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    supabase
      .from("classes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!data) navigate("/dashboard");
        else setCls(data);
      });

    supabase
      .from("topics")
      .select("*")
      .eq("class_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTopics(data);
      });
  }, [id, navigate]);

  async function deleteTopic(topicId: string) {
    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", topicId);
    if (!error) {
      setTopics(topics.filter((t) => t.id !== topicId));
    }
  }

  function copyClassCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!cls) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <ClipboardList className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{cls.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card className="mb-8 bg-primary text-white">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80 mb-1">Kode Kelas</p>
                <p className="text-3xl font-mono font-bold tracking-[0.3em]">
                  {cls.code}
                </p>
                <p className="text-sm opacity-80 mt-2">
                  Bagikan kode ini ke siswa. Mereka tidak perlu akun.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => copyClassCode(cls.code)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Tersalin" : "Salin"}
                </Button>
                <Link to={`/class/${id}/topics/new`}>
                  <Button className="bg-white text-primary hover:bg-gray-100">
                    <Plus className="h-4 w-4 mr-2" />
                    Topik Baru
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Daftar Topik</h2>

        {topics.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Belum ada topik</p>
            <p className="text-sm">
              Buat topik pertama untuk mulai membuat soal diagnostik
            </p>
            <Link to={`/class/${id}/topics/new`}>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Buat Topik
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {topics.map((topic) => (
              <Card key={topic.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{topic.name}</h3>
                    {topic.description && (
                      <p className="text-sm text-gray-500">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/class/${id}/topic/${topic.id}`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Hasil
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTopic(topic.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </Button>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
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
