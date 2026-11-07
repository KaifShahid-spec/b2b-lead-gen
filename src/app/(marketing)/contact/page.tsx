import { ContactForm } from "./ContactForm";
import { Mail, MessageSquare, Building2 } from "lucide-react";

export const metadata = {
  title: "Contact | Lead Gen SaaS",
  description: "Get in touch with our team.",
};

const channels = [
  {
    icon: Mail,
    title: "Email us",
    description: "support@leadgen.example.com",
    detail: "We reply within one business day.",
  },
  {
    icon: MessageSquare,
    title: "Live chat",
    description: "Available Mon–Fri, 9am–6pm",
    detail: "For quick questions from existing customers.",
  },
  {
    icon: Building2,
    title: "Enterprise",
    description: "sales@leadgen.example.com",
    detail: "Talk to our team about custom pricing and onboarding.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
          Contact
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
          Questions about pricing, features, or getting started? We&apos;d love to hear from you.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
            Send us a message
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            We&apos;ll get back to you within one business day.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <div className="space-y-4">
          {channels.map(({ icon: Icon, title, description, detail }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-slate-50">
                {title}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}