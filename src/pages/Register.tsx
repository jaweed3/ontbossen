import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { UserPlus, ArrowRight } from "lucide-react";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }

    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Gagal mendaftar. Coba lagi.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("teachers").insert({
      id: authData.user.id, name,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 relative overflow-hidden">
      {/* Atmospheric glows */}
      <div className="glow-accent top-1/4 left-1/4" />
      <div className="glow-accent bottom-1/4 right-1/4" style={{ background: "radial-gradient(circle, rgba(93, 230, 255, 0.1) 0%, rgba(93, 230, 255, 0) 70%)" }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-[24px]/[32px] font-semibold tracking-tight text-on-surface">Daftar Guru</h1>
          <p className="text-sm text-on-surface-variant mt-1">Mulai diagnosis kelas dengan AI</p>
        </div>

        <div className="glass-panel rounded-xl p-6" style={{ boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input id="name" label="Nama" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" label="Kata Sandi" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && (
              <div className="text-sm text-error bg-error-container/20 border border-error/20 rounded px-3 py-2">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {!loading && <ArrowRight className="h-4 w-4 mr-1.5" />}Daftar
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-5">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary hover:text-primary-fixed font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
