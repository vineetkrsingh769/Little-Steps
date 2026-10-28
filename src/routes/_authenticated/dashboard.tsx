import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function Dashboard() {
  const { roles, rolesLoading } = useAuth();
  const views = [
    roles.includes("parent") && { v: "parent", l: "My bookings", c: <ParentDashboard /> },
    roles.includes("provider") && { v: "provider", l: "My centers", c: <ProviderDashboard /> },
    roles.includes("admin") && { v: "admin", l: "Admin", c: <AdminDashboard /> },
  ].filter(Boolean) as { v: string; l: string; c: React.ReactNode }[];
  const [tab, setTab] = useState<string | undefined>();

  if (rolesLoading) return <main className="mx-auto max-w-6xl px-4 py-16 text-muted-foreground">Loading…</main>;
  if (views.length === 0) return <main className="mx-auto max-w-6xl px-4 py-16">No role assigned to this account yet.</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <Tabs value={tab ?? views[0]?.v ?? ""} onValueChange={setTab}>
        {views.length > 1 && (
          <TabsList className="mb-6">{views.map((x) => <TabsTrigger key={x.v} value={x.v}>{x.l}</TabsTrigger>)}</TabsList>
        )}
        {views.map((x) => <TabsContent key={x.v} value={x.v}>{x.c}</TabsContent>)}
      </Tabs>
    </main>
  );
}
