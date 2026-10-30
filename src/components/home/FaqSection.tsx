import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Little Steps verify daycares and caregivers?",
      a: "Every daycare center must submit trade licenses, fire safety certificates, and address proofs before an admin approves their listing. Caregivers undergo mandatory police verification and identity checks before receiving the verified blue checkmark (✓).",
    },
    {
      q: "Can I book childcare on short notice for night shifts or emergencies?",
      a: "Yes! Little Steps was specifically designed for non-standard schedules. You can filter for 24×7 centers and emergency drop-ins, check available seats in real-time, and send a booking request anytime of day or night.",
    },
    {
      q: "How does the secret 4-digit Pickup PIN protect my child?",
      a: "When your booking is accepted, the system generates a random 4-digit code readable only on your parent pass. The daycare staff must verify this PIN on their device before handing over your child. The daycare never sees the PIN in advance, making guessing impossible.",
    },
    {
      q: "What prevents a daycare from overbooking on popular dates?",
      a: "Capacity limits are enforced directly at the database engine level. Whenever an owner accepts a booking, the system checks every single day of the requested span. If capacity is already full, the system automatically refuses acceptance.",
    },
    {
      q: "How do payments and cancellations work?",
      a: "Payment is currently made on arrival at the daycare via UPI or cash. You can cancel any pending or accepted booking directly from your Parent Dashboard at no cost before your booking starts.",
    },
  ];

  return (
    <section className="bg-secondary/30 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">Got Questions?</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Everything you need to know about safety, verification, and flexible bookings.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border bg-card transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-6 text-left font-semibold text-foreground hover:text-primary transition"
                  aria-expanded={isOpen}
                >
                  <span className="text-base md:text-lg pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t px-6 pb-6 pt-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
