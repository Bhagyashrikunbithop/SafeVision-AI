import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, fieldClass, labelClass, submitClass } from "@/components/AuthShell";
import { ErrorMessage, InfoMessage, SuccessMessage } from "@/components/Alert";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a New Password – SafeVision AI" },
      { name: "description", content: "Choose a new password for your SafeVision AI account." },
      { property: "og:title", content: "Set a New Password – SafeVision AI" },
      { property: "og:description", content: "Choose a new SafeVision AI password." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase exchanges the recovery link for a session as the page loads.
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setReady(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setReady(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      console.error("[SafeVision] Password update failed:", err);
      setError("We could not update your password. Please request a new reset link and try again.");
      return;
    }
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => router.navigate({ to: "/login", replace: true }), 2500);
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a new password to finish resetting your account."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      {done ? (
        <SuccessMessage>
          Your password has been updated. Taking you to the login page…
        </SuccessMessage>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!ready ? (
            <InfoMessage>
              Open this page from the reset link in your email. If the link has expired, request a
              new one from the forgot-password page.
            </InfoMessage>
          ) : null}
          <div>
            <label className={labelClass} htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="confirm">
              Confirm new password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your new password"
            />
          </div>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          <button type="submit" disabled={busy || !ready} className={submitClass}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
