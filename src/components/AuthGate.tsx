"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Checking authentication...
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
