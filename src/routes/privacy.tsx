import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, SUPPORT_EMAIL } from "@/components/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Little Steps" },
      { name: "description", content: "What personal data Little Steps collects, why, who can see it, and your rights." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" intro="We collect only what's needed to arrange safe childcare, and we never sell your data.">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account:</strong> your name, email address and (optionally) mobile number.</li>
          <li><strong>Children:</strong> first name, age group and any care notes you choose to add (for example allergies).</li>
          <li><strong>Bookings, messages and reviews</strong> you create on the platform.</li>
          <li><strong>Centers:</strong> center details, photos, caregiver profiles and certifications supplied by providers.</li>
        </ul>
      </section>
      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To let you find centers, request bookings and talk to the center you booked.</li>
          <li>To keep children safe: pickup PINs, capacity checks and handling reports.</li>
          <li>To show anonymous platform statistics to our admin team (for example total bookings).</li>
        </ul>
      </section>
      <section>
        <h2>Who can see it</h2>
        <ul>
          <li>A center sees the bookings made with it: the child's name, age group, dates and your notes.</li>
          <li>Messages are visible only to the parent and the center on that booking.</li>
          <li>Reviews show your name publicly. Problem reports are visible only to you and our team.</li>
          <li>Our admin team can see data when needed to verify centers and resolve problems.</li>
        </ul>
      </section>
      <section>
        <h2>How we protect it</h2>
        <ul>
          <li>Data is stored with our database provider (Supabase) and encrypted in transit and at rest.</li>
          <li>Database rules ensure each person can only read the records they are allowed to see.</li>
        </ul>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>
          Under India's Digital Personal Data Protection Act, 2023 you can ask to see, correct or delete your personal data.
          You can update your name and phone number on your profile page at any time.
          {SUPPORT_EMAIL ? <> To request a copy or deletion, email <a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</> : " To request a copy or deletion, use the Contact page."}
        </p>
      </section>
    </InfoPage>
  );
}
