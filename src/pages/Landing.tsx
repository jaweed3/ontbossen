import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ClipboardList, Shield, BarChart3, ArrowRight, Search } from "lucide-react";

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
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-text-primary leading-[1.1] mb-5">
            Pusing mikirin{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-cyan">
              murid yang ga paham?
            </span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-3 leading-relaxed">
            5 soal, langsung tau: siapa aja yang ga paham, dan tepatnya di konsep mana.
          </p>
          <p className="text-sm text-text-tertiary max-w-2xl mx-auto mb-10 leading-relaxed">
            Bukan cuma nilai merah — tapi peta granular: "3 siswa severe di pecahan-campuran, 2 mild di pembagian-desimal."
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/register"><Button size="lg">Coba Gratis <ArrowRight className="h-4 w-4 ml-1.5" /></Button></Link>
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
              { icon: Search, title: "Cari Titik Kepusingan", desc: "AI bikin 5 soal per topik, masing-masing tag konsep spesifik. Guru ga perlu bikin soal manual." },
              { icon: Shield, title: "Murid Cukup Ngetik Nama", desc: "Ga perlu daftar, ga perlu email. Kode kelas + nama, kerjakan 5 soal, selesai." },
              { icon: BarChart3, title: "Peta + Action Item", desc: "Langisung tau siapa aja yang merah di konsep apa. Bukan nilai — tapi peta kepusingan per murid." },
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
