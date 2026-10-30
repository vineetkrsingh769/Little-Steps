import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Cancellation & Refund Policy — Little Steps" },
      { name: "description", content: "How cancellations and refunds work for Little Steps bookings." },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <InfoPage title="Cancellation & Refund Policy" intro="Plans change — here's how cancellations and refunds work.">
      <section>
        <h2>Paying at the center (current)</h2>
        <ul>
          <li>Today, you pay the center directly on arrival by UPI or cash, so there is nothing to refund through Little Steps.</li>
          <li>You can cancel any pending or accepted booking in <strong>My bookings</strong> at no charge from us.</li>
        </ul>
      </section>
      <section>
        <h2>Online payments (coming soon)</h2>
        <p>When online payment is introduced, these rules will apply:</p>
        <ul>
          <li><strong>Center declines or cancels:</strong> full refund.</li>
          <li><strong>You cancel 24 hours or more before the start time:</strong> full refund.</li>
          <li><strong>You cancel less than 24 hours before the start time:</strong> refund minus one hour (hourly plans) or one day (daily and monthly plans).</li>
          <li><strong>Monthly plans already started:</strong> refund for the remaining full weeks.</li>
          <li>Refunds go back to the original payment method within 5–7 working days.</li>
        </ul>
      </section>
      <section>
        <h2>Problems with a booking</h2>
        <p>If the care you received was not what was promised, use <strong>Report a problem</strong> on the booking. Our team reviews every report and will reply in the app.</p>
      </section>
    </InfoPage>
  );
}
