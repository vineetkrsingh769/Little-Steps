import { Star } from "lucide-react";

export function Testimonials() {
  const stories = [
    {
      name: "Dr. Sneha Kulkarni",
      role: "Emergency Care Resident",
      city: "Pune",
      quote:
        "My hospital night shifts are completely unpredictable. Little Steps let me book an emergency overnight slot at a verified crèche near Baner within 15 minutes. The 4-digit pickup PIN is brilliant.",
      rating: 5,
    },
    {
      name: "Ankit & Neha Sharma",
      role: "Engineering Leads",
      city: "Bengaluru",
      quote:
        "Both of us work overlapping US hours in Whitefield. Traditional daycares shut down by 6 PM. Having 24×7 vetted crèches with CCTV verification and real-time seat tracking has been a total lifesaver.",
      rating: 5,
    },
    {
      name: "Meera Iyer",
      role: "Product Designer & Single Mother",
      city: "Mumbai",
      quote:
        "The transparent pricing and caregiver profiles with background check badges made all the difference. My 2-year-old daughter loves the sensory play area, and I get instant updates.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">Parent Experiences</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Trusted by Working Parents</h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Hear from parents managing shift work, medical rotations, and dual-career households.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {stories.map((s) => (
            <div key={s.name} className="flex flex-col justify-between rounded-3xl border bg-card p-7 shadow-card">
              <div>
                <div className="flex gap-1">
                  {Array.from({ length: s.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90 italic">
                  &ldquo;{s.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t pt-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-peach font-display font-semibold text-accent-foreground">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-semibold leading-tight text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.role} · {s.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
