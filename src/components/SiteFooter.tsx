import { Link } from "@tanstack/react-router";
import { Baby, Shield, Sparkles } from "lucide-react";

export function SiteFooter() {
  const cities = ["Bengaluru", "Mumbai", "Pune", "Delhi"];

  return (
    <footer className="mt-24 border-t bg-card text-sm">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground">
                <Baby className="h-5 w-5" />
              </span>
              Little Steps
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              India&apos;s trusted digital childcare network. Connecting working parents with verified crèches and 24×7 daycares offering flexible hourly, daily, and monthly plans.
            </p>
            <div className="flex items-center gap-2 rounded-2xl bg-secondary/80 px-3.5 py-2 text-xs font-medium text-secondary-foreground w-fit">
              <Shield className="h-4 w-4 text-primary" />
              <span>Compliant with India DPDP Act, 2023</span>
            </div>
          </div>

          {/* Popular Cities */}
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Explore Cities</p>
            <ul className="space-y-2 text-muted-foreground">
              {cities.map((city) => (
                <li key={city}>
                  <Link
                    to="/centers"
                    search={{ city }}
                    className="hover:text-primary transition"
                  >
                    Daycares in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Parents */}
          <div className="space-y-3">
            <p className="font-semibold text-foreground">For Parents</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/centers" className="hover:text-primary transition">Find Daycare Centers</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-primary transition">Safety Standards</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition">Parent Dashboard</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition">Support & Grievances</Link>
              </li>
            </ul>
          </div>

          {/* For Providers & Legal */}
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Providers & Legal</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/auth" search={{ mode: "signup", type: "provider" }} className="hover:text-primary transition">
                  List Your Daycare
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition">Terms of Service</Link>
              </li>
              <li>
                <Link to="/refunds" className="hover:text-primary transition">Cancellation & Refunds</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Little Steps. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Built for working parents across India
          </p>
        </div>
      </div>
    </footer>
  );
}
