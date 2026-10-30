import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Baby, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    mode: z.enum(["signin", "signup"]).optional(),
    type: z.enum(["parent", "provider"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Sign in / Register — Little Steps" },
      { name: "description", content: "Sign in or create a parent or childcare provider account on Little Steps." },
      { property: "og:title", content: "Sign in / Register — Little Steps" },
      { property: "og:description", content: "Access your Little Steps parent or daycare portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(search.mode ?? "signin");
  const [type, setType] = useState<"parent" | "provider">(search.type ?? "parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else setResetSent(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name, account_type: type },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  }

  if (sent)
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary mb-4">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Click it to activate your account.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 rounded-full"
          onClick={() => {
            setSent(false);
            setMode("signin");
          }}
        >
          Return to sign in
        </Button>
      </main>
    );

  if (mode === "forgot")
    return (
      <main className="bg-hero min-h-[80vh] px-4 py-16">
        <div className="mx-auto max-w-md space-y-5 rounded-[2rem] bg-card p-8 shadow-card border">
          <div>
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your registered email and we'll send you a password reset link.
            </p>
          </div>
          {resetSent ? (
            <div className="rounded-2xl bg-secondary/50 p-4 text-xs text-muted-foreground leading-relaxed">
              If an account exists for <span className="font-semibold text-foreground">{email}</span>, a link has been dispatched. Please check your inbox and spam folder.
            </div>
          ) : (
            <form onSubmit={sendReset} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="reset-email" className="text-xs">Email address</Label>
                <Input
                  id="reset-email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="rounded-xl"
                  required
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl" disabled={busy}>
                {busy ? "Sending link…" : "Send reset link"}
              </Button>
            </form>
          )}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => {
              setMode("signin");
              setResetSent(false);
            }}
          >
            ← Back to sign in
          </Button>
        </div>
      </main>
    );

  return (
    <main className="bg-hero min-h-[85vh] px-4 py-12 flex items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-[2rem] bg-card p-8 shadow-card border">
        {/* Role Segmented Switcher Preview */}
        <div className="space-y-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account Type
          </Label>
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-secondary/60 p-1.5 border">
            <button
              type="button"
              onClick={() => setType("parent")}
              aria-pressed={type === "parent"}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
                type === "parent"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Baby className="h-4 w-4 text-primary" />
              <span>Parent Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setType("provider")}
              aria-pressed={type === "provider"}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
                type === "provider"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-4 w-4 text-primary" />
              <span>Daycare Provider</span>
            </button>
          </div>
        </div>

        {/* Dynamic Title */}
        <div className="pt-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "signup"
              ? type === "parent"
                ? "Create Parent Account"
                : "Register Daycare Center"
              : type === "parent"
                ? "Parent Sign In"
                : "Daycare Provider Sign In"}
          </h1>
        </div>

        {/* Auth Form */}
        <form onSubmit={submit} className="space-y-3.5">
          {mode === "signup" && (
            <div className="space-y-1">
              <Label htmlFor="full-name" className="text-xs">
                {type === "parent" ? "Your full name" : "Owner / Manager name"}
              </Label>
              <Input
                id="full-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === "parent" ? "e.g. Priya Sharma" : "e.g. Rajesh Mehta"}
                className="rounded-xl"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">Email address</Label>
            <Input
              id="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xs">Password</Label>
              {mode === "signin" && (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setMode("forgot")}
                >
                  Forgot password?
                </Button>
              )}
            </div>
            <Input
              id="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl"
              required
            />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl font-semibold" disabled={busy}>
            {busy
              ? "Processing…"
              : mode === "signup"
                ? type === "parent"
                  ? "Create Parent Account"
                  : "Register Center Account"
                : "Sign In"}
          </Button>
        </form>

        {/* Google OAuth & Mode Toggling */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full rounded-xl text-xs font-medium" onClick={google}>
            Continue with Google
          </Button>
          {mode === "signup" && (
            <p className="text-[11px] text-center text-muted-foreground">
              Google signup automatically initializes a parent account.
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground pt-1">
            {mode === "signup" ? "Already have an account?" : "New to Little Steps?"}{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs font-semibold text-primary"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? "Sign in instead" : "Create an account"}
            </Button>
          </p>
        </div>
      </div>
    </main>
  );
}
