import { LandingContent } from "@/components/landing/LandingContent";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  let isLoggedIn = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      isLoggedIn = !!user;
    } catch {
      // Supabase not configured yet
    }
  }

  return (
    <AppShell isLoggedIn={isLoggedIn}>
      <LandingContent />
    </AppShell>
  );
}
