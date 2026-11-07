import Link from "next/link";
import { headers } from "next/headers";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Layers
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export async function Sidebar() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  return (
    <>
      {/* Mobile Header and horizontal nav */}
      <div className="border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 py-3 lg:hidden dark:border-slate-800/80 dark:bg-slate-950/80 sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-500">Workspace</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lead Gen SaaS</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-all duration-200 ${
                  active
                    ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 font-medium"
                    : "border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 lg:block transition-colors duration-200 sticky top-0 h-screen">
        <div className="flex h-full flex-col justify-between px-4 py-6">
          <div className="space-y-8">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-500">Workspace</p>
                <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">Lead Gen SaaS</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                      active
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium shadow-sm"
                        : "text-slate-600 hover:bg-slate-100/85 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-colors duration-200 ${
                      active ? "text-white dark:text-slate-900" : "text-slate-400 dark:text-slate-500"
                    }`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800/80 flex items-center justify-between px-2">
            <span className="text-xs text-slate-400 dark:text-slate-500">v0.1.0</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
