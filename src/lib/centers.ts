import c1 from "@/assets/center-1.jpg";
import c2 from "@/assets/center-2.jpg";
import c3 from "@/assets/center-3.jpg";
import c4 from "@/assets/center-4.jpg";
import c5 from "@/assets/center-5.jpg";
import c6 from "@/assets/center-6.jpg";
import c7 from "@/assets/center-7.jpg";
import c8 from "@/assets/center-8.jpg";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Center = Database["public"]["Tables"]["centers"]["Row"];
export type Caregiver = Database["public"]["Tables"]["caregivers"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export const centerImages: Record<string, string> = {
  "center-1": c1,
  "center-2": c2,
  "center-3": c3,
  "center-4": c4,
  "center-5": c5,
  "center-6": c6,
  "center-7": c7,
  "center-8": c8,
};
const allImages = [c1, c2, c3, c4, c5, c6, c7, c8];
/** Picks a photo per center; uses the center id (when given) so listings show varied photos. */
export const imageFor = (key: string, id?: string) => {
  if (!id) return centerImages[key] ?? c1;
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return allImages[h % allImages.length];
};

/** The center's uploaded photo if it has one, otherwise a bundled sample photo. */
export const photoFor = (c: Pick<Center, "id" | "image_key" | "photo_path">) =>
  c.photo_path ? supabase.storage.from("center-photos").getPublicUrl(c.photo_path).data.publicUrl : imageFor(c.image_key, c.id);

export const AGE_GROUPS = [
  { value: "infant", label: "Infant (0–1 yr)" },
  { value: "toddler", label: "Toddler (1–3 yrs)" },
  { value: "preschool", label: "Preschool (3–6 yrs)" },
] as const;
export const TIMINGS = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" },
  { value: "emergency", label: "Emergency" },
] as const;
export const PLANS = [
  { value: "hourly", label: "Hourly", unit: "hours" },
  { value: "daily", label: "Daily", unit: "days" },
  { value: "monthly", label: "Monthly", unit: "months" },
] as const;

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const label = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v;

export function priceFor(c: Pick<Center, "hourly_price" | "daily_price" | "monthly_price">, plan: string, qty: number) {
  const unit = plan === "hourly" ? c.hourly_price : plan === "daily" ? c.daily_price : c.monthly_price;
  return unit * Math.max(1, qty);
}
