"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signOut } from "@/lib/auth/client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      const result = await signOut();

      if (result?.error) {
        toast.error(result.error.message);
        setIsPending(false);
        return;
      }

      toast.success("You have been signed out.");

      // Hard navigation ensures all cached server state and session cookies
      // are dropped before the landing page renders.
      window.location.href = "/";
    } catch {
      toast.error("Could not sign out. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing out…
        </>
      ) : (
        "Logout"
      )}
    </Button>
  );
}