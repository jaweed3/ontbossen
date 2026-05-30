import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Class, Teacher } from "../types";
import { ClipboardList, Plus, LogOut, Users, Copy, Check } from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate("/login");
      if (user) {
        supabase.from("teachers").select("*").eq("id", user.id).single().then(({ data }) => {
          if (data) setTeacher(data);
        });
      }
    });

    supabase.from("classes").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setClasses(data);
    });
  }, [navigate]);

  async function createClass() {
    if (!newClassName.trim()) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    const { data, error } = await supabase.from("classes").insert({
      teacher_id: user.id, name: newClassName.trim(), code,
    }).select().single();

    if (!error && data) {
      setClasses([data, ...classes]);
      setNewClassName("");
      setShowCreate(false);
    }
    setCreating(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-void">
      <header className="glass-panel border-b border-border-glass">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-accent-blue/20 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-accent-blue" />
            </div>
            <span className="font-semibold text-base tracking-tight text-text-primary">DiagnosaKelas</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">{teacher?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Kelas Saya</h1>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Kelas Baru
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-5 border-accent-blue/30">
            <CardContent className="flex gap-3 items-end py-4">
              <div className="flex-1">
                <Input id="name" label="Nama Kelas" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createClass()} placeholder="Contoh: 7A - Matematika" />
              </div>
              <Button onClick={createClass} loading={creating}>Buat</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Batal</Button>
            </CardContent>
          </Card>
        )}

        {classes.length === 0 ? (
          <div className="text-center py-24">
            <Users className="h-10 w-10 text-text-tertiary mx-auto mb-4" />
            <p className="text-base text-text-secondary">Belum ada kelas</p>
            <p className="text-sm text-text-tertiary mt-1">Buat kelas pertama untuk mulai diagnosis</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {classes.map((cls) => (
              <Card key={cls.id}>
                <CardContent className="flex items-center justify-between py-3.5">
                  <Link to={`/class/${cls.id}`} className="flex-1 hover:text-accent-blue transition-colors">
                    <h3 className="font-medium text-text-primary">{cls.name}</h3>
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded border border-border-glass">
                      <span className="font-mono font-semibold text-sm tracking-widest text-text-primary">{cls.code}</span>
                      <button onClick={() => copyCode(cls.code)} className="text-text-tertiary hover:text-accent-blue transition-colors">
                        {copied === cls.code ? <Check className="h-3.5 w-3.5 text-healthy" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <Link to={`/class/${cls.id}`}><Button variant="outline" size="sm">Buka</Button></Link>
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
