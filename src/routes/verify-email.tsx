import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, fieldClass, labelClass, submitClass } from "@/components/AuthShell";
import { ErrorMessage, InfoMessage, SuccessMessage } from "@/components/Alert";

const searchSchema = z.object({ email: z.string().optional() });

export const Route = createFileRoute("/verify-email")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Verify Your Email – SafeVision AI" },
      {
        name: "description",
        content: "Verify your email address to start using SafeVision AI helmet detection.",
      },
      { property: "og:title", content: "Verify Your Email – SafeVision AI" },
      { property: "og:description", content: "Verify your SafeVision AI email address." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const search = Route.useSearch();
  const [email, setEmail] = useState(search.email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter the email address you registered with.");
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
      setError("We could not send the verification email right now. Please try again shortly.");
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Your account needs a verified email before you can use the detection tools."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      <InfoMessage>
        Open the verification link we emailed you. Once verified, you can log in and start
        analysing.
      </InfoMessage>
      <form onSubmit={resend} className="mt-5 space-y-4" noValidate>
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
        {sent ? (
          <SuccessMessage>
            Verification email sent. Please check your inbox, including the spam folder.
          </SuccessMessage>
        ) : null}
        <button type="submit" disabled={busy} className={submitClass}>
          {busy ? "Sending…" : "Resend verification email"}
        </button>
      </form>
    </AuthShell>
  );
}
