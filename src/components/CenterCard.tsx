import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { imageFor, inr, type Center } from "@/lib/centers";

export function CenterCard({ c }: { c: Center }) {
  return (
    <Link
      to="/centers/$id"
      params={{ id: c.id }}
      className="group overflow-hidden rounded-3xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={imageFor(c.image_key, c.id)} alt={c.name} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {c.is_24x7 && <Badge className="absolute left-3 top-3 rounded-full bg-primary text-primary-foreground">24×7</Badge>}
        <div className="absolute right-2 top-2"><FavoriteButton centerId={c.id} overlay /></div>
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight">{c.name}</h3>
          <span className="flex items-center gap-1 text-sm font-medium"><Star className="h-4 w-4 fill-warning text-warning" />{c.rating}</span>
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{c.city}</p>
        <div className="flex flex-wrap gap-1.5">
          {c.timings.map((t) => (
            <Badge key={t} variant="secondary" className="rounded-full capitalize"><Clock className="mr-1 h-3 w-3" />{t}</Badge>
          ))}
        </div>
        <p className="pt-1 text-sm"><span className="font-display text-lg font-semibold text-primary">{inr(c.hourly_price)}</span> <span className="text-muted-foreground">/ hour</span></p>
      </div>
    </Link>
  );
}
