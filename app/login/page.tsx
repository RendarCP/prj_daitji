import { redirect } from "next/navigation";
import { sanitizeNextPath } from "@/lib/auth/utils";
import { createClient } from "@/lib/supabase/server";
import { LoginClient } from "./LoginClient";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    email?: string;
    mode?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { next: rawNext, email, mode } = await searchParams;
  const next = sanitizeNextPath(rawNext);

  if (mode === "signup") {
    const signupUrl = new URL(
      `/signup?next=${encodeURIComponent(next)}`,
      "http://localhost",
    );

    if (email) {
      signupUrl.searchParams.set("email", email);
    }

    redirect(`${signupUrl.pathname}${signupUrl.search}`);
  }

  if (user) {
    redirect(next);
  }

  return <LoginClient nextPath={next} />;
}
