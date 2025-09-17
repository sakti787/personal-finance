"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <h1 className="text-4xl font-extrabold mb-4 text-white text-center drop-shadow-lg">Selamat Datang di Uang Sakti</h1>
      <form
        onSubmit={handleLogin}
        className="bg-gray-950 p-8 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
          <button
            type="button"
            className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded transition duration-200"
            onClick={() => router.push("/register")}
          >
            Register
          </button>
      </form>
    </div>
  );
}
