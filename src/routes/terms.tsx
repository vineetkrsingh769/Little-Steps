import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Little Steps" },
      { name: "description", content: "The rules for using Little Steps as a parent or a childcare provider." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <InfoPage title="Terms of Use" intro="By using Little Steps you agree to these terms. Please read them carefully.">
      <section>
        <h2>What Little Steps is</h2>
        <p>Little Steps is a platform that connects parents with independent daycare centers and crèches. Each center is responsible for the care it provides. We verify centers and caregivers before listing them, but we do not run the centers ourselves.</p>
      </section>
      <section>
        <h2>Accounts</h2>
        <ul>
          <li>You must give accurate details and keep your password private.</li>
          <li>Providers must only list centers they are authorised to run and must provide genuine documents.</li>
          <li>We may suspend accounts that break these terms or put children at risk.</li>
        </ul>
      </section>
      <section>
        <h2>Bookings</h2>
        <ul>
          <li>A booking is a request until the center accepts it. Centers may decline requests.</li>
          <li>Prices are calculated from the center's published hourly, daily or monthly rate at the time you book.</li>
          <li>Parents can cancel pending or accepted bookings in the app. See the Refund Policy for payment rules.</li>
          <li>Payment is currently made at the center on arrival (UPI or cash).</li>
        </ul>
      </section>
      <section>
        <h2>Reviews and messages</h2>
        <ul>
          <li>Reviews must be honest and based on a completed booking. No abusive or false content.</li>
          <li>Messages are for arranging care; do not share sensitive documents through them.</li>
        </ul>
      </section>
      <section>
        <h2>Liability</h2>
        <p>We work hard to keep listings accurate and safe, but each center is responsible for the care, premises and staff it provides. To the extent allowed by law, Little Steps is not liable for losses arising from a center's services.</p>
      </section>
      <section>
        <h2>Changes and law</h2>
        <p>We may update these terms and will show the date of the latest version above. These terms are governed by the laws of India.</p>
      </section>
    </InfoPage>
  );
}
