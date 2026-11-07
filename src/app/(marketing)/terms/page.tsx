export const metadata = {
  title: "Terms of Service | Lead Gen SaaS",
  description: "The terms that govern your use of the service.",
};

const sections = [
  {
    heading: "Acceptance of terms",
    paragraphs: [
      "By creating an account or using the service, you agree to these terms. If you do not agree, do not use the service.",
    ],
  },
  {
    heading: "Your account",
    paragraphs: [
      "You are responsible for maintaining the security of your account and password. Notify us immediately if you suspect unauthorized access.",
      "You must be at least 16 years old to use the service.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "You agree not to use the service to send spam, violate any laws, infringe intellectual property, or attempt to gain unauthorized access to systems.",
      "We may suspend accounts that violate these rules.",
    ],
  },
  {
    heading: "Subscriptions and billing",
    paragraphs: [
      "Paid plans are billed in advance on a recurring basis. You can cancel at any time and will retain access through the end of the current period.",
      "Refunds are handled on a case-by-case basis. Contact support if you believe you were charged in error.",
    ],
  },
  {
    heading: "Termination",
    paragraphs: [
      "You can delete your account at any time. We may terminate accounts that violate these terms or pose a security risk.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "The service is provided as-is. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "For legal questions, email legal@leadgen.example.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
        Legal
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
        Terms of Service
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
        This is placeholder content. Replace with your actual terms before going live.
      </p>
    </article>
  );
}