"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "./actions";

type Props = {
    initialName: string;
    email: string;
};

export function ProfileForm({ initialName, email }: Props) {
    const [name, setName] = useState(initialName);
    const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);

        startTransition(async () => {
            const result = await updateProfile({ name });

            if (result.ok) {
                setMessage({ kind: "ok", text: "Profile updated." });
            } else {
                setMessage({ kind: "err", text: result.error });
            }
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled readOnly />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Email is managed by your account and cannot be changed here.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    maxLength={100}
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

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={isPending || name === initialName}>
                    {isPending ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}