import { CalendarCheck, KeyRound, Search } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Discover & Compare",
      desc: "Filter verified centers by city, 24×7 night care, and age groups. Compare safety measures, certifications, and transparent pricing upfront.",
    },
    {
      step: "02",
      icon: CalendarCheck,
      title: "Live Capacity Lock",
      desc: "Select hourly, daily, or monthly care. Our live availability engine checks remaining seats and locks your slot instantly without risk of overbooking.",
    },
    {
      step: "03",
      icon: KeyRound,
      title: "Secure 4-Digit Pickup",
      desc: "Once confirmed, you receive a secret 4-digit Pickup PIN. Show it to center staff at drop-off/pickup for tamper-proof child handover authentication.",
    },
  ];

  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">Simple & Safe Process</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">How Little Steps Works</h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            From search to child pickup, every step is protected by verified credentials and automated database guards.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className="relative flex flex-col justify-between rounded-3xl border bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-2xl font-black text-muted-foreground/30">{s.step}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
