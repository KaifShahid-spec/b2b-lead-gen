import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { requireWorkspace } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const workspace = await requireWorkspace();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isOnboarding = pathname.startsWith("/onboarding");

  if (workspace.profile?.onboarding_completed === false && !isOnboarding) {
    redirect("/onboarding");
  }

  if (isOnboarding) {
    return (
      <section className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-slate-50 transition-colors duration-200">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </section>
  );
}
