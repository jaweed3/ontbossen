import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

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
      id: authData.user.id,
      name,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <ClipboardList className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Daftar Guru</h1>
          <p className="text-gray-600 text-sm mt-1">
            Mulai diagnosis kelas dengan AI
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                id="name"
                label="Nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                label="Kata Sandi"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Daftar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary font-medium">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
