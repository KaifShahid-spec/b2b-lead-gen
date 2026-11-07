export const metadata = {
  title: "Privacy Policy | Lead Gen SaaS",
  description: "How we collect, use, and protect your data.",
};

const sections = [
  {
    heading: "Information we collect",
    paragraphs: [
      "We collect information you provide directly — account details, workspace data, and any lead records you import or create.",
      "We also collect usage data automatically: pages visited, features used, device type, and approximate location. This helps us improve the product.",
    ],
  },
  {
    heading: "How we use your information",
    paragraphs: [
      "We use your data to provide the service, communicate with you about your account, and detect abuse or security issues.",
      "We do not sell your data. We do not share it with third parties except as needed to operate the service (e.g. payment processing, email delivery).",
    ],
  },
  {
    heading: "Data storage and security",
    paragraphs: [
      "Your data is stored on encrypted infrastructure. All data in transit is encrypted using TLS.",
      "Access to production systems is limited to authorized personnel and audited.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can request a copy of your data, export it, or ask us to delete your account at any time by contacting support.",
      "If you are in the EU/UK, you have additional rights under GDPR. If you are in California, you have rights under CCPA.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "For privacy questions, email privacy@leadgen.example.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
        Legal
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 text-slate-700 dark:text-slate-300">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-16 text-sm text-slate-500 dark:text-slate-400">
        This is placeholder content. Replace with your actual privacy policy before going live.
      </p>
    </article>
  );
}