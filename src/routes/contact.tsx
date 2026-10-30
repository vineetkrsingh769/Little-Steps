import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, SUPPORT_EMAIL } from "@/components/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Little Steps" },
      { name: "description", content: "How to reach the Little Steps team for help with bookings, centers or your account." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <InfoPage title="Contact us" intro="We're here to help parents and centers.">
      <section>
        <h2>About a booking</h2>
        <p>Open <Link to="/dashboard" className="text-primary underline">your dashboard</Link> and use <strong>Messages</strong> to talk to the center, or <strong>Report a problem</strong> to reach our team. Reports are answered in the app, usually within one working day.</p>
      </section>
      <section>
        <h2>List your center</h2>
        <p><Link to="/auth" search={{ mode: "signup", type: "provider" }} className="text-primary underline">Create a provider account</Link>, add your center and caregivers, and our team will review it.</p>
      </section>
      {SUPPORT_EMAIL && (
        <section>
          <h2>Email</h2>
          <p><a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        </section>
      )}
      <section>
        <h2>Emergencies</h2>
        <p><strong>Call 112.</strong> Little Steps is not an emergency service.</p>
      </section>
    </InfoPage>
  );
}
