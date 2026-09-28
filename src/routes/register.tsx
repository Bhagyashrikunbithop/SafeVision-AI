import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, fieldClass, labelClass, submitClass } from "@/components/AuthShell";
import { ErrorMessage, SuccessMessage } from "@/components/Alert";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account – SafeVision AI" },
      {
        name: "description",
        content:
          "Create your SafeVision AI account to run helmet detection and keep a private history of your analyses.",
      },
      { property: "og:title", content: "Create Account – SafeVision AI" },
      { property: "og:description", content: "Create your SafeVision AI account." },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: "Please enter your full name." })
      .max(100, { message: "Name must be less than 100 characters." }),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email address." })
      .max(255, { message: "Email must be less than 255 characters." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(72, { message: "Password must be less than 72 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ fullName, email, password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the details you entered.");
      return;
    }

    setBusy(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: parsed.data.email.toLowerCase(),
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: parsed.data.fullName },
        },
      });

      if (err) {
        console.error("[SafeVision] Registration failed:", err);
        const msg = err.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already been registered")) {
          setError("An account with this email already exists. Please log in instead.");
        } else if (msg.includes("password")) {
          setError("Please choose a stronger password of at least 8 characters.");
        } else {
          setError("We could not create your account right now. Please try again in a moment.");
        }
        return;
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists. Please log in instead.");
        return;
      }

      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="One more step before you can log in."
        footer={
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Go to login
          </Link>
        }
      >
        <SuccessMessage>
          Account created successfully. Please check your email and verify your account before
          logging in.
        </SuccessMessage>
        <p className="mt-4 text-sm text-muted-foreground">
          The verification link opens SafeVision AI and confirms your email automatically. If the
          email hasn't arrived, check your spam folder — you can also request a new one from the
          login page.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your analyses, violations and number-plate results privately."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className={labelClass} htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            className={fieldClass}
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

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
              autoComplete="new-password"
              className={`${fieldClass} pr-11`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
        </div>

        <div>
          <label className={labelClass} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            className={fieldClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
          />
        </div>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <button type="submit" disabled={busy} className={submitClass}>
          {busy ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
}
