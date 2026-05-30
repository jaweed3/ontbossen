import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ClipboardList, Brain, Shield, BarChart3 } from "lucide-react";

export function Landing() {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState("");

  function handleStudentGo() {
    if (classCode.trim()) {
      navigate(`/q/${classCode.trim().toUpperCase()}`);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">DiagnosaKelas</span>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link to="/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Tahu persis{" "}
            <span className="text-primary">siapa yang tertinggal</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            AI diagnostic untuk guru. Buat soal, bagikan kode kelas, dapatkan
            heatmap real-time. Bukan nilai rata-rata — tapi data granular per
            konsep.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg">Mulai Gratis</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sudah punya akun
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-md mx-auto px-4 pb-4 -mt-4">
          <div className="bg-white border-2 border-primary/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-gray-900">Untuk Murid</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Masukkan kode kelas dari guru kamu
            </p>
            <div className="flex gap-2">
              <Input
                id="classCode"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleStudentGo()}
                placeholder="Contoh: X7K3M9"
                className="uppercase font-mono tracking-wider text-center"
              />
              <Button onClick={handleStudentGo} disabled={!classCode.trim()}>
                Mulai
              </Button>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-border">
              <Brain className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">AI Generate Soal</h3>
              <p className="text-gray-600">
                Masukkan topik, AI (Claude) langsung buat 5 soal diagnostic
                dengan tag konsep spesifik.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-border">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Tanpa Akun Murid</h3>
              <p className="text-gray-600">
                Murid cukup masukin kode kelas dan nama. Selesai dalam 5 menit.
                Zero friction.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-border">
              <BarChart3 className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Heatmap Real-time</h3>
              <p className="text-gray-600">
                Langsung lihat konsep mana yang gagal dipahami kelasmu. Dapatkan
                action item, bukan angka.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
