import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  ClipboardList, Shield, ArrowRight, Search,
  Sparkles, BarChart3, Zap, CheckCircle, Rocket,
  Bell, Settings, Menu, ArrowLeft
} from "lucide-react";

export function Landing() {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState("");

  function handleStudentGo() {
    if (classCode.trim()) navigate(`/q/${classCode.trim().toUpperCase()}`);
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <span className="text-[20px]/[28px] font-bold text-primary tracking-tighter transition-all duration-200 active:scale-95">DiagnosaKelas</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant hover:text-on-surface transition-colors" href="#">DASHBOARD</a>
          <a className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant hover:text-on-surface transition-colors" href="#">CLASSES</a>
          <a className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant hover:text-on-surface transition-colors" href="#">REPORTS</a>
          <div className="flex items-center gap-4 ml-4 border-l border-white/10 pl-4">
            <Bell className="h-5 w-5 text-on-surface-variant cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-all" />
            <Settings className="h-5 w-5 text-on-surface-variant cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-all" />
          </div>
        </div>
        <Menu className="md:hidden h-6 w-6 text-on-surface" />
      </nav>

      <main className="relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Hero Grid */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary-container/10 border border-primary/20 px-3 py-1 rounded-full mb-4">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-secondary">Mission Control Ready</span>
              </div>
              <h1 className="text-[32px]/[40px] md:text-6xl font-extrabold tracking-tight text-on-surface leading-tight">
                Bukan Nilai — <span className="text-primary" style={{ textShadow: "0 0 8px rgba(173, 198, 255, 0.3)" }}>Peta Kepusingan</span> Murid.
              </h1>
              <p className="text-base/6 text-on-surface-variant max-w-2xl mx-auto lg:mx-0">
                5 soal, 3 menit. Ketahui persis konsep mana yang bikin murid macet sebelum anda melangkah ke materi berikutnya.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-xs">No accounts for students</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-xs">AI-Powered analysis</span>
                </div>
              </div>
            </div>

            {/* Hero CTA Glass Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group" style={{ boxShadow: "0 0 20px rgba(59, 130, 246, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
                <div className="space-y-4 relative z-10">
                  <div>
                    <h3 className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant mb-1">STUDENT ACCESS</h3>
                    <p className="text-[20px]/[28px] font-bold text-on-surface">Masuk ke Sesi Kelas</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant">KODE DIAGNOSA (6 DIGIT)</label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleStudentGo()}
                        placeholder="X72K9P"
                        maxLength={6}
                        className="flex-1 bg-surface-container-lowest border-b-2 border-white/10 focus:border-primary tracking-[0.5em] font-black uppercase text-center placeholder:text-white/5 text-lg"
                      />
                      <button
                        onClick={handleStudentGo}
                        className="bg-primary hover:bg-primary/90 text-on-primary px-6 rounded-lg font-bold flex items-center justify-center transition-all active:scale-95 group"
                      >
                        <Rocket className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                    <p className="text-xs text-on-surface-variant">Anda seorang guru?</p>
                    <Link
                      to="/login"
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
                    >
                      <span className="text-sm font-semibold text-on-surface">Teacher Dashboard Login</span>
                      <ArrowRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards Section */}
          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-primary mb-2">VISUALIZE STRUGGLE</h2>
              <p className="text-[24px]/[32px] font-bold text-on-surface">Mission Control untuk Pemahaman Konsep</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1 */}
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 hover:border-primary/20 transition-all duration-300" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-[20px]/[28px] text-on-surface mb-2 font-semibold">AI-Generated Diagnostics</h4>
                  <p className="text-sm/5 text-on-surface-variant">Tak perlu pusing bikin soal. Masukkan konsep, AI kami generate 5 soal distilasi yang menyasar titik buta tersering murid dalam hitungan detik.</p>
                </div>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-secondary">SMART ENGINE 2.0</span>
                </div>
              </div>

              {/* Feature 2 - highlighted */}
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 border-primary/10 bg-primary/[0.03] hover:bg-primary/10 transition-all duration-300" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-[20px]/[28px] text-on-surface mb-2 font-semibold">Heatmap Visualization</h4>
                  <p className="text-sm/5 text-on-surface-variant">Lupakan scroll excel. Lihat pola error satu kelas dalam satu peta visual. Tahu persis kapan harus re-teach atau lanjut materi.</p>
                </div>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-secondary">REAL-TIME DATA</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 hover:border-primary/20 transition-all duration-300" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-[20px]/[28px] text-on-surface mb-2 font-semibold">Zero Friction</h4>
                  <p className="text-sm/5 text-on-surface-variant">Tanpa akun murid, tanpa ribet reset password. Murid cukup masukkan nama dan kode kelas. Langsung kerjakan, langsung terdata.</p>
                </div>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <span className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-secondary">FRICTIONLESS UX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div className="mt-32">
            <div className="glass-panel rounded-2xl overflow-hidden grid lg:grid-cols-2" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)" }}>
              <div className="p-6 lg:p-12 flex flex-col justify-center gap-4">
                <h2 className="text-[32px]/[40px] font-bold tracking-tight text-on-surface">Siap memetakan kelas Anda?</h2>
                <p className="text-base/6 text-on-surface-variant">Bergabung dengan 2,000+ guru yang telah berhenti menebak-nebak pemahaman murid mereka.</p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-primary text-on-primary px-8 h-14 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all inline-flex items-center justify-center">
                      Start Diagnosis Sekarang
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-surface-container-highest border border-white/10 text-on-surface px-8 h-14 rounded-lg font-bold hover:bg-white/10 transition-all"
                    onClick={() => {}}
                  >
                    Lihat Demo Video
                  </Button>
                </div>
              </div>
              <div className="bg-surface-container-low p-4 relative overflow-hidden flex items-center justify-center min-h-[300px]">
                <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)" }} />
                <div className="relative w-full max-w-sm space-y-4">
                  <div className="flex justify-between items-center bg-background p-4 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                      <span className="text-sm text-on-surface">Konsep: Pecahan Senilai</span>
                    </div>
                    <span className="bg-error/10 text-error px-2 py-1 rounded text-[11px]/[16px] tracking-[0.08em] font-bold uppercase">72% MACET</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="aspect-square bg-error/30 border border-error/50 rounded-md animate-pulse" />
                    <div className="aspect-square bg-primary/10 border border-white/5 rounded-md" />
                    <div className="aspect-square bg-error/30 border border-error/50 rounded-md" style={{ animationDelay: "75ms" }} />
                    <div className="aspect-square bg-primary/10 border border-white/5 rounded-md" />
                    <div className="aspect-square bg-error/30 border border-error/50 rounded-md" style={{ animationDelay: "150ms" }} />
                    <div className="aspect-square bg-primary/10 border border-white/5 rounded-md" />
                    <div className="aspect-square bg-primary/10 border border-white/5 rounded-md" />
                    <div className="aspect-square bg-error/30 border border-error/50 rounded-md" style={{ animationDelay: "100ms" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-[20px]/[28px] font-bold text-primary tracking-tighter">DiagnosaKelas</span>
              <p className="text-xs text-on-surface-variant mt-2">© 2024 Technoprenuer Education Solutions.</p>
            </div>
            <div className="flex gap-6">
              <a className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant hover:text-primary transition-colors" href="#">PRIVACY</a>
              <a className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant hover:text-primary transition-colors" href="#">TERMS</a>
              <a className="text-[11px]/[16px] tracking-[0.08em] font-bold uppercase text-on-surface-variant hover:text-primary transition-colors" href="#">CONTACT</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
