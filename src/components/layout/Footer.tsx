import Link from "next/link";
import { Sparkles, Twitter, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">

          {/* Brand & Newsletter Column (Takes up 2 columns on desktop) */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Lead Gen SaaS
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-400">
              Find, enrich, and convert B2B leads — all in one workspace. Built for modern sales teams.
            </p>

            {/* Newsletter Form */}
            <form className="mt-6 flex max-w-md items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
                required
              />
              <Button type="button" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Product</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/#features" className="hover:text-emerald-600 dark:hover:text-emerald-400">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400">Pricing</Link></li>
              <li><Link href="/integrations" className="hover:text-emerald-600 dark:hover:text-emerald-400">Integrations</Link></li>
              <li><Link href="/changelog" className="hover:text-emerald-600 dark:hover:text-emerald-400">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-emerald-600 dark:hover:text-emerald-400">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-emerald-600 dark:hover:text-emerald-400">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Legal</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-emerald-600 dark:hover:text-emerald-400">Security</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Lead Gen SaaS. All rights reserved.
          </p>

          <div className="mt-4 flex items-center gap-4 sm:mt-0">
            <Link href="https://twitter.com" target="_blank" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="https://github.com" target="_blank" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}