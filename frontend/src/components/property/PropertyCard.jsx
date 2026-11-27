import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, MapPinOff } from 'lucide-react';
import { parseAmenities, renderAmenityIcon } from '../../constants/amenities';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/format';
import { travelFrom } from '../../utils/geo';
import { Skeleton } from '../ui';
import { DistanceBadge, NsfasBadge, PropertyImage, RatingPill, UniversityBadge } from './PropertyBits';

/**
 * Residence card. The whole card is clickable via a stretched title link, so there is
 * exactly one link per card for keyboard and screen-reader users.
 */
const PropertyCard = ({ property, origin, active = false, onHover, showAmenities = true, headingLevel: Heading = 'h3', className }) => {
  const amenities = showAmenities ? parseAmenities(property.amenities) : [];
  const travel = travelFrom(property, origin);
  const priceRange = property.price_max && property.price_max !== property.price_min
    ? `${formatCurrency(property.price_min)} – ${formatCurrency(property.price_max)}`
    : formatCurrency(property.price_min);

  return (
    <article
      onMouseEnter={onHover ? () => onHover(property.id) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover dark:bg-slate-900',
        active ? 'border-brand-400 ring-2 ring-brand-400/40 dark:border-brand-500' : 'border-slate-200/80 dark:border-slate-800',
        className,
      )}
      data-testid="property-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <PropertyImage property={property} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <UniversityBadge university={property.university} />
          {property.nsfas_accredited && <NsfasBadge />}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold capitalize text-white backdrop-blur">
          {property.property_type}
        </span>
        <div className="absolute inset-x-3 bottom-3 flex">
          {travel ? (
            <DistanceBadge travel={travel} className="shadow-lg" />
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-lg">
              <MapPinOff className="h-3.5 w-3.5" aria-hidden="true" />Map pin coming soon
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <Heading className="line-clamp-2 font-display text-base font-bold leading-snug text-slate-950 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
            <Link
              to={`/properties/${property.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:ring-0 focus-visible:after:ring-2 focus-visible:after:ring-brand-500"
            >
              {property.name}
            </Link>
          </Heading>
          <RatingPill rating={property.average_rating} count={property.review_count} />
        </div>

        <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-coral-500" aria-hidden="true" />
          <span className="truncate">{property.address}</span>
        </p>

        {amenities.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-1.5" aria-label="Amenities">
            {amenities.slice(0, 3).map((amenity) => (
              <li key={amenity} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {renderAmenityIcon(amenity, 'h-3 w-3 text-brand-600 dark:text-brand-300')}
                <span className="truncate">{amenity}</span>
              </li>
            ))}
            {amenities.length > 3 && (
              <li className="rounded-lg bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">+{amenities.length - 3} more</li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Per month</p>
            <p className="truncate font-display text-lg font-extrabold text-ink-950 dark:text-white">{priceRange}</p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-coral-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300" aria-hidden="true">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
};

export const PropertyCardSkeleton = () => (
  <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900" aria-hidden="true">
    <Skeleton className="aspect-[4/3] rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-8 w-1/3" />
    </div>
  </div>
);

export default PropertyCard;
