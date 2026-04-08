"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,220,255,0.3)]">
              <span className="text-sm font-black text-white">AX</span>
            </div>
            <span className="text-xl font-black text-white">
              ALGORITHM<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">X</span>
            </span>
          </a>
          <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Log in to continue your journey</p>
        </div>

        <div className="bg-[#111833] border border-white/[0.06] rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(0,220,255,0.1)] transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(0,220,255,0.1)] transition"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-sm tracking-wider hover:from-cyan-300 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 shadow-[0_0_30px_rgba(0,220,255,0.2)]"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold transition">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}