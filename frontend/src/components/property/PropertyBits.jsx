import { useState } from 'react';
import { Building2, Car, Footprints, Star } from 'lucide-react';
import { UNIVERSITIES } from '../../constants/campuses';
import { cn } from '../../utils/cn';
import { formatDistance, formatMinutes, walkBand } from '../../utils/geo';

// Residences without photos get one of these, picked per property so a grid of
// placeholders stays colourful instead of repeating one gradient.
const PLACEHOLDER_GRADIENTS = [
  'from-brand-500 via-brand-700 to-ink-900',
  'from-violet-500 via-indigo-600 to-brand-800',
  'from-coral-500 via-rose-600 to-fuchsia-800',
  'from-emerald-500 via-teal-600 to-cyan-800',
  'from-gold-400 via-orange-500 to-coral-700',
  'from-fuchsia-500 via-violet-600 to-ink-900',
];

const placeholderFor = (property) => {
  const seed = Number(property?.id) || [...String(property?.name || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PLACEHOLDER_GRADIENTS[Math.abs(seed) % PLACEHOLDER_GRADIENTS.length];
};

/**
 * Property photo with a branded gradient fallback. Listing photos are hot-linked from
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
    <div className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br', placeholderFor(property), className)} aria-hidden="true">
      <div className="bg-dots absolute inset-0 opacity-60" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <Building2 className={cn('relative h-10 w-10 text-white/45', iconClassName)} strokeWidth={1.5} />
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

const UNIVERSITY_STYLES = {
  wits: 'bg-brand-600 text-white',
  uj: 'bg-coral-600 text-white',
  both: 'bg-violet-600 text-white',
};

export const UniversityBadge = ({ university, className }) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-sm', UNIVERSITY_STYLES[university] || 'bg-white text-ink-950', className)}>
    {UNIVERSITIES[university]?.label || university}
  </span>
);

export const NsfasBadge = ({ className, long = false }) => (
  <span className={cn('inline-flex items-center rounded-full bg-lime-300 px-2.5 py-1 text-[11px] font-extrabold text-ink-950 shadow-sm', className)}>
    {long ? 'NSFAS accredited' : 'NSFAS'}
  </span>
);

const BAND_STYLES = {
  easy: 'bg-lime-100 text-lime-900 ring-lime-300 dark:bg-lime-400/15 dark:text-lime-200 dark:ring-lime-400/30',
  ok: 'bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30',
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
