"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inviteMember, removeMember, updateMemberRole } from "./actions";

type Member = {
    id: string;
    userId: string;
    role: string;
    isActive: boolean;
    email: string;
    name: string;
};

type Props = {
    teamId: string;
    teamName: string;
    ownerId: string | null;
    members: Member[];
};

const ROLES = ["owner", "admin", "member"] as const;

export function TeamManager({ teamId, teamName, ownerId, members }: Props) {
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<string>("member");
    const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleInvite(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);

        startTransition(async () => {
            const result = await inviteMember({ teamId, email: inviteEmail, role: inviteRole });

            if (result.ok) {
                setMessage({ kind: "ok", text: result.message ?? "Member added." });
                setInviteEmail("");
                setInviteRole("member");
            } else {
                setMessage({ kind: "err", text: result.error });
            }
        });
    }

    function handleRoleChange(memberId: string, role: string) {
        setMessage(null);
        startTransition(async () => {
            const result = await updateMemberRole({ memberId, role });
            if (!result.ok) setMessage({ kind: "err", text: result.error });
        });
    }

    function handleRemove(memberId: string) {
        setMessage(null);
        startTransition(async () => {
            const result = await removeMember({ memberId });
            if (!result.ok) setMessage({ kind: "err", text: result.error });
        });
    }

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Invite a member</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="invite-email">Email</Label>
                            <Input
                                id="invite-email"
                                type="email"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="teammate@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="invite-role">Role</Label>
                            <select
                                id="invite-role"
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Working…" : "Add member"}
                        </Button>
                    </form>

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        The user must already have an account. They&apos;ll be added to {teamName} immediately.
                    </p>
                </CardContent>
            </Card>

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

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Members ({members.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {members.map((m) => {
                        const isOwner = m.userId === ownerId;
                        return (
                            <div
                                key={m.id}
                                className="flex flex-col gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-slate-950 dark:text-slate-50">
                                        {m.name || m.email || m.userId}
                                        {isOwner && (
                                            <span className="ml-2 text-xs font-normal text-slate-500">
                                                (owner)
                                            </span>
                                        )}
                                    </p>
                                    <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                                        {m.email}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={m.role}
                                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                        disabled={isPending || isOwner}
                                        className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemove(m.id)}
                                        disabled={isPending || isOwner}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}