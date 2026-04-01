"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!hasSupabaseConfig || !supabase) {
      router.replace("/login");
      return;
    }

    const supabaseClient = supabase;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const checkAuth = async () => {
      try {
        for (let attempt = 0; attempt < 4; attempt += 1) {
          const {
            data: { session },
            error,
          } = await supabaseClient.auth.getSession();

          if (!error && session?.user) {
            if (isMounted) {
              setIsCheckingAuth(false);
            }
            return;
          }

          const {
            data: { user },
            error: userError,
          } = await supabaseClient.auth.getUser();

          if (!userError && user) {
            if (isMounted) {
              setIsCheckingAuth(false);
            }
            return;
          }

          if (attempt < 3) {
            await sleep(350);
          }
        }

        router.replace("/login");
      } catch {
        router.replace("/login");
      }
    };

    void checkAuth();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
        return;
      }

      if (session?.user && isMounted) {
        setIsCheckingAuth(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
