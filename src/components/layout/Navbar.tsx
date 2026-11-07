import { requireWorkspace } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { User } from "lucide-react";

export async function Navbar() {
  const workspace = await requireWorkspace().catch(() => null);
  const fullName = workspace?.profile?.name || workspace?.profile?.email || "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {workspace?.team?.name || "Workspace"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-slate-200/60 pr-4 dark:border-slate-800/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700">
              {initials || <User className="h-4 w-4" />}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline-block">
              {fullName}
            </span>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
