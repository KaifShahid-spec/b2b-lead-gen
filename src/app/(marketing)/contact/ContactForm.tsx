"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendContactMessage } from "./actions";

export function ContactForm() {
    const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const name = String(formData.get("name") ?? "");
        const email = String(formData.get("email") ?? "");
        const subject = String(formData.get("subject") ?? "");
        const body = String(formData.get("message") ?? "");

        startTransition(async () => {
            const result = await sendContactMessage({ name, email, subject, body });

            if (result.ok) {
                setMessage({ kind: "ok", text: "Thanks — we'll be in touch soon." });
                e.currentTarget?.reset();
            } else {
                setMessage({ kind: "err", text: result.error });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required maxLength={100} placeholder="Jane Smith" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required maxLength={200} placeholder="jane@company.com" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required maxLength={150} placeholder="How can we help?" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    maxLength={4000}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
                    placeholder="Tell us what you need…"
                />
            </div>

            {message && (
                <p
                    className={
                        message.kind === "ok"
                            ? "text-sm text-emerald-600 dark:text-emerald-400"
                            : "text-sm text-red-600 dark:text-red-400"
                    }
                >
                    {message.text}
                </p>
            )}

            <Button type="submit" disabled={isPending}>
                {isPending ? "Sending…" : "Send message"}
            </Button>
        </form>
    );
}