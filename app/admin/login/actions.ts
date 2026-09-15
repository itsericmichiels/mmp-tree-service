// app/admin/login/actions.ts
"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/lib/adminAuth";

function safeNextPath(next: string): string {
  return next.startsWith("/admin") ? next : "/admin/blog";
}

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/admin/blog"));

  const token = password === process.env.ADMIN_PASSWORD ? await createSessionToken() : null;
  if (!token) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  // Vercel (and any proxy in front of this app) sets x-forwarded-proto, so
  // this reflects whether the browser actually reached us over HTTPS —
  // unlike checking NODE_ENV, it stays correct for `next start` in local/CI
  // testing over plain HTTP, where a Secure cookie would silently be
  // dropped by the browser.
  const secure = (await headers()).get("x-forwarded-proto") === "https";

  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  (await cookies()).set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  redirect("/admin/login");
}
