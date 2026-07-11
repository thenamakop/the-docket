import { Clock } from 'lucide-react';

interface DocketBadgeProps {
  docketNo: string;
  readingTimeMinutes?: number | null;
}

export function DocketBadge({
  docketNo,
  readingTimeMinutes,
}: DocketBadgeProps) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs font-medium text-oxblood">
      <span className="font-mono-smallcaps">{docketNo}</span>
      {typeof readingTimeMinutes === 'number' && readingTimeMinutes > 0 && (
        <span className="flex items-center gap-1 text-slate">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span className="font-mono-smallcaps">{readingTimeMinutes} min</span>
        </span>
      )}
    </div>
  );
}
