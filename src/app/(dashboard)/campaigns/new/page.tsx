import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NewCampaignForm } from "./NewCampaignForm";

export const metadata = {
    title: "Create campaign | B2B Lead Gen",
    description: "Create a new outreach campaign.",
};

export default function NewCampaignPage() {
    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Campaigns", href: "/campaigns" },
                    { label: "New" },
                ]}
            />

            <div>
                <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
                    Create campaign
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Set up a new outreach campaign. You can edit it any time.
                </p>
            </div>

            <NewCampaignForm />
        </main>
    );
}