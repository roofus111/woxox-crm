"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/legal/stores/auth.store";

const AUTH_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1/legal").replace(
    /\/legal\/?$/,
    ""
  ) + "/auth";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@woxox.local");
  const [password, setPassword] = useState("demo123");
  const [name, setName] = useState("Demo Advocate");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const path = mode === "login" ? "/login" : "/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name };

      const res = await fetch(`${AUTH_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || `Auth failed (${res.status})`);
      }

      const data = json.data as {
        token: string;
        workspaceId: string;
        user: {
          id: string;
          email: string;
          name: string;
          roles: string[];
          workspaceIds: string[];
        };
      };

      setSession({
        token: data.token,
        workspaceId: data.workspaceId,
        user: data.user,
      });
      router.replace("/legal/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0b1220] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,196,24,0.12),_transparent_55%)]" />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md space-y-5 rounded-xl border border-white/10 bg-[#121a2b] p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <Image
            src="/brand/woxox-mark.png"
            alt="WOXOX"
            width={140}
            height={120}
            className="h-16 w-auto object-contain"
            priority
          />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5C418]">
            LegalOS India
          </p>
          <h1 className="font-serif text-2xl text-white">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
        </div>

        {mode === "register" && (
          <div>
            <label className="text-xs text-white/60">Name</label>
            <Input
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label className="text-xs text-white/60">Email</label>
          <Input
            className="mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs text-white/60">Password</label>
          <Input
            className="mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "register" ? 8 : 1}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" variant="gold" className="w-full" disabled={pending}>
          {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
        </Button>

        <button
          type="button"
          className="w-full text-center text-sm text-white/55 hover:text-white"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
        </button>

        <p className="text-center text-[11px] text-white/40">
          Demo: demo@woxox.local / demo123
        </p>
      </form>
    </div>
  );
}
