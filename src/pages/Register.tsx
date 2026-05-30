import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ClipboardList } from "lucide-react";

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
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-5 w-5 text-accent-blue" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Daftar Guru</h1>
          <p className="text-sm text-text-secondary mt-1">Mulai diagnosis kelas dengan AI</p>
        </div>

        <div className="glass-panel-strong rounded-xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input id="name" label="Nama" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" label="Kata Sandi" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && (
              <div className="text-sm text-severe bg-severe/10 border border-severe/20 rounded px-3 py-2">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full">Daftar</Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-5">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-accent-blue hover:text-blue-400 font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
