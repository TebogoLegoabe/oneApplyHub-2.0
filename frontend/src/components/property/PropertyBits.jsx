import { useState } from 'react';
import { Building2, Car, Footprints, GraduationCap, School, Star } from 'lucide-react';
import { UNIVERSITIES } from '../../constants/campuses';
import { cn } from '../../utils/cn';
import { formatDistance, formatMinutes, walkBand } from '../../utils/geo';

/**
 * Property photo with a quiet neutral fallback. Listing photos are hot-linked from
 * residence websites, so a broken or blocked image falls back instead of showing an icon.
 */
export const PropertyImage = ({ property, src = property?.primary_image_url, alt = '', className, imgClassName, iconClassName }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className={cn('h-full w-full bg-slate-200 object-cover dark:bg-slate-800', imgClassName, className)}
      />
    );
  }
  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center gap-1.5 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500', className)} aria-hidden="true">
      <Building2 className={cn('h-9 w-9', iconClassName)} strokeWidth={1.5} />
      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Photo coming soon</span>
    </div>
  );
};

export const RatingPill = ({ rating, count, className }) => (
  <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-50 px-2 py-1 text-xs font-bold text-slate-800 ring-1 ring-inset ring-gold-200 dark:bg-gold-500/10 dark:text-slate-100 dark:ring-gold-400/25', className)}>
    <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-500" aria-hidden="true" />
    {rating > 0 ? Number(rating).toFixed(1) : 'New'}
    {count > 0 && <span className="font-medium text-slate-500 dark:text-slate-400">({count})</span>}
    <span className="sr-only">{rating > 0 ? ` out of 5 from ${count} review${count === 1 ? '' : 's'}` : ' — no reviews yet'}</span>
  </span>
);

/** Graduation cap for a university campus, a school building for a college. Decorative. */
export const CampusIcon = ({ campus, className = 'h-4 w-4' }) => {
  const Icon = campus?.kind === 'college' ? School : GraduationCap;
  return <Icon className={className} aria-hidden="true" />;
};

const UNIVERSITY_STYLES = {
  wits: 'bg-brand-600 text-white',
  uj: 'bg-coral-600 text-white',
  both: 'bg-ink-700 text-white',
};

export const UniversityBadge = ({ university, className }) => (
  <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-sm', UNIVERSITY_STYLES[university] || 'bg-white text-ink-950', className)}>
    {UNIVERSITIES[university]?.label || university}
  </span>
);

export const NsfasBadge = ({ className, long = false }) => (
  <span className={cn('inline-flex items-center rounded-md bg-emerald-700 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm', className)}>
    {long ? 'NSFAS accredited' : 'NSFAS'}
  </span>
);

const BAND_STYLES = {
  easy: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/30',
  ok: 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30',
  far: 'bg-coral-100 text-coral-800 ring-coral-300 dark:bg-coral-500/15 dark:text-coral-200 dark:ring-coral-400/30',
};

/** "9 min walk · 650 m to Wits Main", coloured by how walkable it is. */
export const DistanceBadge = ({ travel, className, size = 'md', showLabel = true }) => {
  if (!travel) return null;
  const band = walkBand(travel.walkMin);
  const far = band === 'far';
  const Icon = far ? Car : Footprints;
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full font-bold ring-1 ring-inset',
        BAND_STYLES[band] || BAND_STYLES.ok,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
      data-testid="distance-badge"
    >
      <Icon className={size === 'sm' ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} aria-hidden="true" />
      <span className="whitespace-nowrap">{far ? `${formatMinutes(travel.driveMin)} drive` : `${formatMinutes(travel.walkMin)} walk`}</span>
      <span className="truncate font-semibold opacity-80">
        · {formatDistance(travel.straightKm)}{showLabel && travel.label ? ` to ${travel.label}` : ''}
      </span>
    </span>
  );
};
