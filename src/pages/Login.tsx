import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
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

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
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
          <h1 className="text-2xl font-bold">Masuk</h1>
          <p className="text-gray-600 text-sm mt-1">
            Guru, lanjutkan diagnosis kelasmu
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
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
                Masuk
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          Belum punya akun?{" "}
          <Link to="/register" className="text-primary font-medium">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
