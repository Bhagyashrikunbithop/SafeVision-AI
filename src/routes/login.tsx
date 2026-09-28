import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, fieldClass, labelClass, submitClass } from "@/components/AuthShell";
import { ErrorMessage, InfoMessage, SuccessMessage } from "@/components/Alert";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login – SafeVision AI" },
      {
        name: "description",
        content:
          "Log in to SafeVision AI to run live, image and video helmet detection and review your saved analyses.",
      },
      { property: "og:title", content: "Login – SafeVision AI" },
      { property: "og:description", content: "Log in to your SafeVision AI account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setUnverified(false);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (err) {
        console.error("[SafeVision] Login failed:", err);
        const msg = err.message.toLowerCase();
        if (msg.includes("confirm")) {
          setUnverified(true);
          setError("Your email is not verified yet. Please verify it before logging in.");
        } else if (msg.includes("invalid")) {
          setError("Incorrect email or password. Please check your details and try again.");
        } else if (msg.includes("failed to fetch") || msg.includes("network")) {
          setError("We could not reach the sign-in service. Please check your connection.");
        } else {
          setError("We could not sign you in right now. Please try again in a moment.");
        }
        return;
      }

      if (!data.user?.email_confirmed_at) {
        setUnverified(true);
        setError("Your email is not verified yet. Please verify it before logging in.");
        return;
      }

      router.navigate({ to: "/dashboard", replace: true });
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setNotice(null);
    setError(null);
    if (!email.trim()) {
      setError("Enter your email address first, then request a new verification email.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (err) {
      console.error("[SafeVision] Resend verification failed:", err);
      setError("We could not send the verification email just now. Please try again shortly.");
      return;
    }
    setNotice("Verification email sent. Please check your inbox, including the spam folder.");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your road-safety monitoring."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className={`${fieldClass} pr-11`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}

        {unverified ? (
          <InfoMessage>
            Not received the email?{" "}
            <button
              type="button"
              onClick={resend}
              disabled={busy}
              className="font-semibold text-primary hover:underline"
            >
              Resend verification email
            </button>
          </InfoMessage>
        ) : null}

        <button type="submit" disabled={busy} className={submitClass}>
          {busy ? "Signing in…" : "Login"}
        </button>
      </form>
    </AuthShell>
  );
}
