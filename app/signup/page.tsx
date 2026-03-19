import { redirect } from "next/navigation";
import { sanitizeNextPath } from "@/lib/auth/utils";
import { createClient } from "@/lib/supabase/server";
import { SignupClient } from "./SignupClient";

interface SignupPageProps {
  searchParams: Promise<{
    next?: string;
    email?: string;
  }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { next: rawNext, email } = await searchParams;
  const next = sanitizeNextPath(rawNext);

  if (user) {
    redirect(next);
  }

  return <SignupClient nextPath={next} initialEmail={email} />;
}
