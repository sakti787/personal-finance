"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button, Card, Input, ThemeWrapper } from "@/components/ui";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error.message);
    else {
      // Insert nama ke tabel profiles
      const userId = data?.user?.id;
      if (userId) {
        await supabase.from("profiles").insert([{ id: userId, nama }]);
      }
      setSuccess("Registrasi berhasil!");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    }
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
              Buat Akun Baru
            </h1>
            <p className="text-muted">
              Isi data diri Anda untuk mulai mengelola keuangan
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  label="Nama Lengkap"
                  placeholder="John Doe"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                />

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

                {success && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[var(--success)]"
                  >
                    {success}
                  </motion.p>
                )}
              </div>

              <div className="space-y-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Memproses..." : "Daftar"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Sudah Punya Akun? Masuk
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </ThemeWrapper>
  );
}
