import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/auth";
import { Sparkles } from "lucide-react";

const navLinks = [
    { href: "/about", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
];

const footerColumns = [
    {
        title: "Product",
        links: [
            { href: "/about", label: "Features" },
            { href: "/pricing", label: "Pricing" },
            { href: "/blog", label: "Blog" },
        ],
    },
    {
        title: "Company",
        links: [
            { href: "/contact", label: "Contact" },
            { href: "/about", label: "About" },
        ],
    },
    {
        title: "Legal",
        links: [
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
        ],
    },
];

export default async function MarketingLayout({ children }: { children: ReactNode }) {
    const session = await getCurrentSession();

    return (
        <div className="flex min-h-screen flex-col bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                            <Sparkles className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-semibold tracking-tight">Lead Gen SaaS</span>
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        {session ? (
                            <Button asChild size="sm">
                                <Link href="/dashboard">Open dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/signup">Get started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <span className="text-sm font-semibold tracking-tight">Lead Gen SaaS</span>
                        </Link>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                            Find, enrich, and convert B2B leads — all in one workspace.
                        </p>
                    </div>

                    {footerColumns.map((col) => (
                        <div key={col.title}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {col.title}
                            </p>
                            <ul className="mt-3 space-y-2">
                                {col.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-200 py-6 dark:border-slate-800">
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                        © {new Date().getFullYear()} Lead Gen SaaS. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}