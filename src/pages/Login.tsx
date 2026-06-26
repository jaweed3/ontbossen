import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { LogIn, ArrowRight } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
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
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-[24px]/[32px] font-semibold tracking-tight text-on-surface">Masuk</h1>
          <p className="text-sm text-on-surface-variant mt-1">Lanjutkan diagnosis kelas</p>
        </div>

        <div className="glass-panel rounded-xl p-6" style={{ boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" label="Kata Sandi" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && (
              <div className="text-sm text-error bg-error-container/20 border border-error/20 rounded px-3 py-2">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {!loading && <ArrowRight className="h-4 w-4 mr-1.5" />}Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-5">
          Belum punya akun?{" "}
          <Link to="/register" className="text-primary hover:text-primary-fixed font-medium">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
