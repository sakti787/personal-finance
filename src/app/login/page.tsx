"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button, Card, Input, ThemeWrapper } from "@/components/ui";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else router.push("/");
    setLoading(false);
  };

  return (
    <ThemeWrapper>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Selamat Datang di Uang Sakti
            </h1>
            <p className="text-muted">
              Masuk untuk mulai mengelola keuangan Anda
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="email"
                  label="Email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={error || undefined}
                  required
                />
              </div>

              <div className="space-y-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Memproses..." : "Masuk"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/register")}
                  className="w-full"
                >
                  Daftar Akun Baru
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </ThemeWrapper>
  );
}
