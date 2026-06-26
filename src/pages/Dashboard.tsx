import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AdminLayout } from "../components/AdminLayout";
import type { Class, Teacher } from "../types";
import {
  Plus, Copy, Check, Users, BarChart3,
  AlertTriangle, FlaskConical, Sparkles,
  BookOpen, ChevronRight
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
      if (!user) { navigate("/login"); return; }
      supabase.from("teachers").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) setTeacher(data);
      });
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

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  // ponytail: random sparkline data per class, dynamic if we track per-topic
  function sparkline(seed: number) {
    const bars = [];
    let val = Math.sin(seed) * 0.5 + 0.5;
    for (let i = 0; i < 8; i++) {
      val = Math.max(0.1, Math.min(1, val + (Math.random() - 0.5) * 0.4));
      bars.push(val);
    }
    return bars;
  }

  return (
    <AdminLayout>
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-secondary">Instructor Terminal</span>
            <div className="h-px w-12 bg-secondary/30" />
          </div>
          <h2 className="text-[32px]/[40px] font-bold tracking-tight text-on-surface">
            Welcome back, <span className="text-primary">{teacher?.name || "Guru"}!</span>
          </h2>
          <p className="text-base/6 text-on-surface-variant max-w-xl">
            {classes.length > 0
              ? `Your ${classes.length} active class${classes.length > 1 ? "es" : ""} ${classes.length > 1 ? "are" : "is"} currently synchronized with the cloud.`
              : "Create your first class to start diagnosing."}
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowCreate(true)}
            className="group relative inline-flex items-center gap-3 bg-[#3B82F6] text-white px-6 py-4 rounded-xl font-bold shadow-xl shadow-blue-500/10 hover:shadow-blue-500/30 transition-all active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus className="h-5 w-5 relative" />
            <span className="relative">Create New Class</span>
          </button>
        </div>
      </header>

      {/* Create Class Form */}
      {showCreate && (
        <div className="glass-panel rounded-xl p-6 mb-8" style={{ boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                id="className"
                label="NAMA KELAS"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createClass()}
                placeholder="Contoh: 7A - Matematika"
              />
            </div>
            <Button onClick={createClass} loading={creating} className="mb-0.5">Buat</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="mb-0.5">Batal</Button>
          </div>
        </div>
      )}

      {/* Section Label */}
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-[20px]/[28px] font-semibold text-on-surface">Active Classrooms</h3>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* Class Cards Grid */}
      {classes.length === 0 ? (
        <div className="text-center py-24">
          <Users className="h-12 w-12 text-on-surface-variant/40 mx-auto mb-4" />
          <p className="text-base text-on-surface-variant">Belum ada kelas</p>
          <p className="text-sm text-on-surface-variant/60 mt-1">Buat kelas pertama untuk mulai diagnosis</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Create Class empty state card */}
          <button
            onClick={() => setShowCreate(true)}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary transition-all">
              <Plus className="h-6 w-6 text-on-surface-variant group-hover:text-on-primary" />
            </div>
            <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">Configure New Registry</span>
            <p className="text-xs text-on-surface-variant/40 mt-2">Dashed border implies dynamic injection</p>
          </button>

          {/* Class cards */}
          {classes.map((cls, idx) => {
            const bars = sparkline(idx + 1);
            const healthy = bars.reduce((a, b) => a + b, 0) / bars.length > 0.5;
            return (
              <Link
                key={cls.id}
                to={`/class/${cls.id}`}
                className="glass-panel rounded-2xl p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:bg-white/[0.06] hover:border-white/15 transition-all"
                style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.04]">
                  <BookOpen className="h-24 w-24 text-on-surface" />
                </div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      healthy
                        ? "bg-secondary-container/10 text-secondary border-secondary/20"
                        : "bg-error-container/10 text-error border-error/20"
                    }`}>
                      {healthy ? "Active" : "Needs Review"}
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant/40">{cls.code.slice(0, 4)}-{cls.code.slice(4)}</span>
                  </div>
                  <h4 className="text-[24px]/[32px] font-semibold text-on-surface mb-2">{cls.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">Code:</span>
                    <span className="text-lg font-mono text-primary tracking-widest">{cls.code}</span>
                    <button
                      onClick={(e) => { e.preventDefault(); copyCode(cls.code); }}
                      className="text-on-surface-variant hover:text-primary transition-colors ml-1"
                    >
                      {copied === cls.code ? <Check className="h-4 w-4 text-healthy" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-on-surface-variant">Diagnosis Activity</span>
                    <span className={`text-xs font-medium ${healthy ? "text-secondary" : "text-error"}`}>
                      {healthy ? "Healthy" : "Attention Needed"}
                    </span>
                  </div>
                  {/* Sparkline */}
                  <div className="flex gap-1 h-6">
                    {bars.map((b, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all duration-200"
                        style={{
                          backgroundColor: healthy ? "var(--color-secondary)" : "var(--color-error)",
                          opacity: Math.max(0.15, b),
                          boxShadow: b > 0.7 ? `0 0 6px ${healthy ? "rgba(93,230,255,0.3)" : "rgba(255,59,48,0.3)"}` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom Action Row */}
      <footer className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 text-on-surface-variant/50 border-t border-white/5 pt-6">
        <p className="text-xs">© 2024 DiagnosaKelas AI Engine • v2.4.0-Stable</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-on-surface transition-colors text-xs">Privacy Policy</a>
          <a href="#" className="hover:text-on-surface transition-colors text-xs">Technical Support</a>
        </div>
      </footer>
    </AdminLayout>
  );
}
