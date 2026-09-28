import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, fieldClass, labelClass, submitClass } from "@/components/AuthShell";
import { ErrorMessage, SuccessMessage } from "@/components/Alert";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password – SafeVision AI" },
      {
        name: "description",
        content: "Request a password reset email for your SafeVision AI account.",
      },
      { property: "og:title", content: "Forgot Password – SafeVision AI" },
      { property: "og:description", content: "Reset your SafeVision AI password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter the email address you registered with.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) {
      console.error("[SafeVision] Password reset request failed:", err);
      setError("We could not send the reset email right now. Please try again in a moment.");
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to choose a new password."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <SuccessMessage>
          If an account exists for that email, a password reset link is on its way. Open the link to
          set a new password.
        </SuccessMessage>
      ) : (
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
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          <button type="submit" disabled={busy} className={submitClass}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
