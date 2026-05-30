import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ClipboardList } from "lucide-react";

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
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-5 w-5 text-accent-blue" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Masuk</h1>
          <p className="text-sm text-text-secondary mt-1">Lanjutkan diagnosis kelas</p>
        </div>

        <div className="glass-panel-strong rounded-xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" label="Kata Sandi" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && (
              <div className="text-sm text-severe bg-severe/10 border border-severe/20 rounded px-3 py-2">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full">Masuk</Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-5">
          Belum punya akun?{" "}
          <Link to="/register" className="text-accent-blue hover:text-blue-400 font-medium">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
