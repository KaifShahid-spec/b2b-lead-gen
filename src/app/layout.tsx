import "../styles/globals.css";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/common/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "Lead Gen SaaS",
  description: "B2B lead generation SaaS starter"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
