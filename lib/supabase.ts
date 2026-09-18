import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { createDemoClient } from "@/lib/demo-supabase";
import { SITE_CONFIG } from "@/lib/site-config";

export function createClient() {
  if (SITE_CONFIG.demo.enabled) {
    return createDemoClient({
      storage: typeof window === "undefined" ? undefined : window.sessionStorage,
    });
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
