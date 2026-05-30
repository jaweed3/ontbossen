import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Class, Teacher } from "../types";
import {
  ClipboardList,
  Plus,
  LogOut,
  Users,
  Copy,
  Check,
} from "lucide-react";

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
        supabase
          .from("teachers")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setTeacher(data);
          });
      }
    });

    supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setClasses(data);
      });
  }, [navigate]);

  async function createClass() {
    if (!newClassName.trim()) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const code = generateCode();

    const { data, error } = await supabase
      .from("classes")
      .insert({
        teacher_id: user.id,
        name: newClassName.trim(),
        code,
      })
      .select()
      .single();

    if (!error && data) {
      setClasses([data, ...classes]);
      setNewClassName("");
      setShowCreate(false);
    }
    setCreating(false);
  }

  function generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DiagnosaKelas</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {teacher?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Kelas Saya</h2>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Kelas Baru
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-6 border-primary/30">
            <CardContent className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  id="className"
                  label="Nama Kelas"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createClass()}
                  placeholder="Contoh: 7A - Matematika"
                />
              </div>
              <Button onClick={createClass} loading={creating}>
                Buat
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCreate(false)}
              >
                Batal
              </Button>
            </CardContent>
          </Card>
        )}

        {classes.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Belum ada kelas</p>
            <p className="text-sm">Buat kelas pertama untuk mulai diagnosis</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {classes.map((cls) => (
              <Card key={cls.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <Link
                    to={`/class/${cls.id}`}
                    className="flex-1 hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-lg">{cls.name}</h3>
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <span className="font-mono font-bold text-sm tracking-wider">
                        {cls.code}
                      </span>
                      <button
                        onClick={() => copyCode(cls.code)}
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        {copied === cls.code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Link to={`/class/${cls.id}`}>
                      <Button variant="outline" size="sm">
                        Buka
                      </Button>
                    </Link>
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
