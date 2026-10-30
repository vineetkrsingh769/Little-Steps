import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Baby, Building2, CalendarCheck, Heart, LayoutDashboard, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { ProviderDashboard } from "@/components/dashboard/ProviderDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Little Steps" },
      { name: "description", content: "Manage bookings, centers and approvals." },
      { property: "og:title", content: "Dashboard — Little Steps" },
      { property: "og:description", content: "Your Little Steps dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type DashboardView = "bookings" | "children" | "saved" | "provider" | "admin";

function Dashboard() {
  const { user, roles, rolesLoading } = useAuth();
  const [activeView, setActiveView] = useState<DashboardView>("bookings");

  if (rolesLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
        Loading dashboard…
      </main>
    );
  }

  const isParent = roles.includes("parent");
  const isProvider = roles.includes("provider");
  const isAdmin = roles.includes("admin");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Workspace Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.user_metadata?.["full_name"] || "Parent"} · Manage bookings, centers & approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/centers"
            className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition"
          >
            + Book Childcare
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        {/* Left Sidebar Navigation */}
        <aside className="space-y-6">
          {/* Mobile view pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {isParent && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveView("bookings")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                    activeView === "bookings" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  My Bookings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("children")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                    activeView === "children" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  My Children
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("saved")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                    activeView === "saved" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Saved Centers
                </button>
              </>
            )}
            {isProvider && (
              <button
                type="button"
                onClick={() => setActiveView("provider")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                  activeView === "provider" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                Daycare Management
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveView("admin")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                  activeView === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                Admin Governance
              </button>
            )}
          </div>

          {/* Desktop Left Sidebar Card */}
          <nav aria-label="Dashboard views" className="hidden lg:block space-y-6 rounded-3xl border bg-card p-5 shadow-card">
            {/* Parent Section */}
            {isParent && (
              <div className="space-y-1.5">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  Parent Portal
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView("bookings")}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    activeView === "bookings"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>My Bookings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("children")}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    activeView === "children"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Baby className="h-4 w-4" />
                  <span>My Children</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("saved")}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    activeView === "saved"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>Saved Centers</span>
                </button>
              </div>
            )}

            {/* Provider Section */}
            {isProvider && (
              <div className="space-y-1.5 border-t pt-4">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  Daycare Center
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView("provider")}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    activeView === "provider"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Centers & Requests</span>
                </button>
              </div>
            )}

            {/* Admin Section */}
            {isAdmin && (
              <div className="space-y-1.5 border-t pt-4">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  Administration
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView("admin")}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    activeView === "admin"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Console</span>
                </button>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content Area */}
        <section className="min-w-0">
          {(activeView === "bookings" || activeView === "children" || activeView === "saved") && (
            <ParentDashboard activeTab={activeView} />
          )}
          {activeView === "provider" && <ProviderDashboard />}
          {activeView === "admin" && <AdminDashboard />}
        </section>
      </div>
    </main>
  );
}
