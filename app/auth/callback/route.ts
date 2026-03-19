import { NextRequest, NextResponse } from "next/server";
import { sanitizeNextPath } from "@/lib/auth/utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const isPasswordRecovery = next === "/auth/reset-password";
  const redirectUrl = new URL(next, requestUrl.origin);

  const getErrorRedirectUrl = (errorCode: string) => {
    const errorTarget = new URL(
      isPasswordRecovery ? "/auth/reset-password" : "/login",
      requestUrl.origin,
    );

    errorTarget.searchParams.set("error", errorCode);

    if (!isPasswordRecovery && next !== "/dashboard") {
      errorTarget.searchParams.set("next", next);
    }

    return errorTarget;
  };

  if (!code) {
    return NextResponse.redirect(getErrorRedirectUrl("missing_code"));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(getErrorRedirectUrl("oauth_exchange_failed"));
  }

  return NextResponse.redirect(redirectUrl);
}
