import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ClipboardList, Brain, Shield, BarChart3, ArrowRight } from "lucide-react";

export function Landing() {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState("");

  function handleStudentGo() {
    if (classCode.trim()) navigate(`/q/${classCode.trim().toUpperCase()}`);
  }

  return (
    <div className="min-h-screen bg-void">
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border-glass">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-accent-blue/20 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-accent-blue" />
            </div>
            <span className="font-semibold text-base tracking-tight text-text-primary">DiagnosaKelas</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Masuk</Button></Link>
            <Link to="/register"><Button size="sm">Daftar</Button></Link>
          </div>
        </div>
      </header>

      <main className="pt-14">
        <section className="max-w-5xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-xs font-medium text-accent-cyan">AI-Powered Diagnostic</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-text-primary leading-[1.1] mb-5">
            Tahu persis{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-cyan">
              siapa yang tertinggal
            </span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            AI diagnostic untuk guru. Buat soal, bagikan kode kelas, dapatkan heatmap real-time.
            Bukan nilai rata-rata — tapi data granular per konsep.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/register"><Button size="lg">Mulai Gratis <ArrowRight className="h-4 w-4 ml-1.5" /></Button></Link>
            <Link to="/login"><Button variant="outline" size="lg">Masuk</Button></Link>
          </div>
        </section>

        <section className="max-w-md mx-auto px-6 pb-20">
          <div className="glass-panel-strong rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-accent-cyan" />
              <span className="label-uppercase">Untuk Murid</span>
            </div>
            <p className="text-sm text-text-secondary mb-4">Masukkan kode kelas dari guru kamu</p>
            <div className="flex gap-2">
              <Input
                id="code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleStudentGo()}
                placeholder="X7K3M9"
                className="text-center uppercase font-mono tracking-widest"
              />
              <Button onClick={handleStudentGo} disabled={!classCode.trim()}>Mulai</Button>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-28">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Brain, title: "AI Generate Soal", desc: "Masukkan topik, AI langsung buat 5 soal diagnostic dengan tag konsep spesifik." },
              { icon: Shield, title: "Tanpa Akun Murid", desc: "Cukup kode kelas dan nama. Selesai dalam 5 menit. Zero friction." },
              { icon: BarChart3, title: "Heatmap Real-time", desc: "Langsung lihat konsep mana yang gagal dipahami. Action item, bukan angka." },
            ].map((f, i) => (
              <div key={i} className="glass-panel-strong rounded-xl p-6 group hover:border-border-hover transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center mb-4 group-hover:bg-accent-blue/20 transition-colors">
                  <f.icon className="h-5 w-5 text-accent-blue" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1.5">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
