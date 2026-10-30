import type { ReactNode } from "react";

/** Contact address shown on the policy pages; leave empty to hide the email lines. */
export const SUPPORT_EMAIL = "";

export const POLICY_LINKS = [
  { to: "/safety", label: "Safety" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/refunds", label: "Refunds" },
  { to: "/contact", label: "Contact" },
] as const;

export function InfoPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{intro}</p>
      <p className="mt-1 text-xs text-muted-foreground">Last updated 30 October 2026</p>
      <div className="mt-8 space-y-8 leading-relaxed [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </main>
  );
}
