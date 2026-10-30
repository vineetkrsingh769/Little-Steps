import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety — Little Steps" },
      { name: "description", content: "How Little Steps verifies centers and caregivers and keeps every booking and pickup safe." },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  return (
    <InfoPage title="Safety at Little Steps" intro="Every rule below is enforced by the platform itself — not just promised.">
      <section>
        <h2>Verified centers</h2>
        <ul>
          <li>A new center stays hidden from parents until our team reviews and approves it.</li>
          <li>If an approved center changes its name, address, city or certifications, it goes back for review before it can take new bookings.</li>
          <li>Each center lists its safety measures and certifications on its page.</li>
        </ul>
      </section>
      <section>
        <h2>Verified caregivers</h2>
        <ul>
          <li>Caregiver profiles show experience and role. A blue tick means our team has verified that caregiver.</li>
          <li>Only our team can give or remove the verified tick — centers can't set it themselves.</li>
        </ul>
      </section>
      <section>
        <h2>No overbooking</h2>
        <ul>
          <li>Each center sets how many children it can care for per day.</li>
          <li>Before a booking is accepted, the system checks every day of that booking — including longer monthly plans that started earlier — and refuses it if any day is full.</li>
          <li>Parents see how many seats are free for their dates before they book.</li>
        </ul>
      </section>
      <section>
        <h2>Secure pickup PIN</h2>
        <ul>
          <li>When a center accepts a booking, a random 4-digit pickup PIN is created that only the parent can see.</li>
          <li>The center checks the PIN in the app before handing over a child. The center never sees the PIN itself, only whether it matches.</li>
          <li>Never share your PIN with anyone except the center at pickup.</li>
        </ul>
      </section>
      <section>
        <h2>Fair prices and honest reviews</h2>
        <ul>
          <li>Booking prices are calculated by the system from the center's published rates, so they can't be changed after you book.</li>
          <li>Only parents with a completed booking can review a center, and centers can't edit their own rating.</li>
        </ul>
      </section>
      <section>
        <h2>If something goes wrong</h2>
        <ul>
          <li>Use <strong>Report a problem</strong> on any booking. Only you and our team can see the report.</li>
          <li><strong>In an emergency, call 112 first.</strong> Little Steps is not an emergency service.</li>
        </ul>
      </section>
    </InfoPage>
  );
}
