import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { ErrorMessage, InfoMessage, SuccessMessage } from "@/components/Alert";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Email Verified – SafeVision AI" },
      { name: "description", content: "Completing email verification for your SafeVision AI account." },
      { property: "og:title", content: "Email Verified – SafeVision AI" },
      { property: "og:description", content: "Completing SafeVision AI email verification." },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<"working" | "verified" | "failed">("working");

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function resolve() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session?.user) {
        setState("verified");
        timer = setTimeout(() => router.navigate({ to: "/dashboard", replace: true }), 1800);
        return;
      }
      timer = setTimeout(() => {
        if (active) setState("failed");
      }, 4000);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session?.user) {
        setState("verified");
        timer = setTimeout(() => router.navigate({ to: "/dashboard", replace: true }), 1500);
      }
    });

    void resolve();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AuthShell
      title="Email verification"
      subtitle="Finishing up your SafeVision AI account setup."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Go to login
        </Link>
      }
    >
      {state === "working" ? <InfoMessage>Verifying your email…</InfoMessage> : null}
      {state === "verified" ? (
        <SuccessMessage>
          Your email has been verified. Taking you to your dashboard…
        </SuccessMessage>
      ) : null}
      {state === "failed" ? (
        <ErrorMessage>
          We could not confirm this verification link. It may have expired or already been used —
          please log in, or request a new verification email from the login page.
        </ErrorMessage>
      ) : null}
    </AuthShell>
  );
}
