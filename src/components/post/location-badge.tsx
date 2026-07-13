import { MapPin } from 'lucide-react';

interface LocationBadgeProps {
  location: string | null | undefined;
}

/**
 * Shows a pin icon + location text in the same visual family as DocketBadge.
 * Renders nothing at all when location is falsy — no empty badge shell.
 */
export function LocationBadge({ location }: LocationBadgeProps) {
  if (!location) return null;

  return (
    <span className="flex items-center gap-1 font-mono text-xs font-medium text-slate">
      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="font-mono-smallcaps">{location}</span>
    </span>
  );
}
