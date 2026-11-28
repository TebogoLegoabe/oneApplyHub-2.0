import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Bike, Building2, CalendarDays, Car, CheckCircle2, ChevronRight, Copy, ExternalLink, Footprints,
  Globe, Info, Loader2, MapPin, MapPinOff, MessageSquare, Navigation, PenLine, Phone, Route, Share2, ThumbsDown, ThumbsUp,
} from 'lucide-react';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { fetchWalkingRoute, routingEnabled, ROUTING_ATTRIBUTION } from '../services/routing';
import { useAuth } from '../context/AuthContext';
import { useHelpfulVotes } from '../hooks/useHelpfulVotes';
import { parseAmenities, renderAmenityIcon } from '../constants/amenities';
import { CAMPUSES, COLLEGE_CAMPUSES, UNIVERSITIES, UNIVERSITY_CAMPUSES, campusesFor } from '../constants/campuses';
import { MapFrame, PropertyLocationMap } from '../components/map';
import { CampusIcon, DistanceBadge, NsfasBadge, PropertyImage, RatingPill, UniversityBadge } from '../components/property/PropertyBits';
import { formatCurrency, formatDate, getRatingBadge } from '../utils/format';
import {
  distancesToCampuses, estimateTravel, formatDistance, formatMinutes, hasCoords, osmDirectionsUrl, osmViewUrl, toPoint, walkBand,
} from '../utils/geo';
import { Badge, Button, EmptyState, Skeleton, useToast } from '../components/ui';
import { cn } from '../utils/cn';

const CARD = 'rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900';
const GROUP_ICON = { wits: 'bg-brand-700', uj: 'bg-coral-600', college: 'bg-emerald-700' };

const BAND_TEXT = {
  easy: 'text-emerald-700 dark:text-emerald-300',
  ok: 'text-amber-700 dark:text-amber-300',
  far: 'text-coral-700 dark:text-coral-300',
};

const PRECISION_LABELS = {
  exact: 'Exact (set by our team)',
  building: 'Building (OpenStreetMap)',
  address: 'Street address',
  street: 'Approximate (street level)',
};

const DetailSkeleton = () => (
  <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading property">
    <Skeleton className="mb-6 h-4 w-48" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ reviews */

const ReviewItem = ({ review, onHelpful, helpfulMarked, helpfulPending }) => (
  <li className="py-6 first:pt-0 last:pb-0">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {review.author?.charAt(0)?.toUpperCase() || 'S'}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{review.author}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {[review.author_year, review.author_university?.toUpperCase()].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ring-black/5 dark:ring-white/10', getRatingBadge(review.overall_rating))}>
          {review.overall_rating}/5 ★
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(review.created_at)}
        </span>
      </div>
    </div>

    <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{review.review_text}</p>

    {(review.pros || review.cons) && (
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {review.pros && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />What worked well
            </p>
            <p className="text-sm text-emerald-900/80 dark:text-emerald-200/80">{review.pros}</p>
          </div>
        )}
        {review.cons && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-red-800 dark:text-red-300">
              <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />What could improve
            </p>
            <p className="text-sm text-red-900/80 dark:text-red-200/80">{review.cons}</p>
          </div>
        )}
      </div>
    )}

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <Badge tone={review.recommend ? 'success' : 'danger'}>{review.recommend ? 'Recommends' : "Doesn't recommend"}</Badge>
      <button
        type="button"
        onClick={() => onHelpful(review.id)}
        disabled={helpfulMarked || helpfulPending}
        aria-pressed={helpfulMarked}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed',
          helpfulMarked
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
            : 'text-slate-500 hover:bg-slate-100 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-300',
        )}
      >
        <ThumbsUp className={cn('h-3.5 w-3.5', helpfulMarked && 'fill-current')} aria-hidden="true" />
        {helpfulMarked ? 'Marked helpful' : 'Helpful'} · {review.helpful_count || 0}
      </button>
    </div>
  </li>
);

/* ------------------------------------------------------------------ distance to campus */

const CampusRow = ({ row, selected, onSelect, routeState, onRoute, from }) => {
  const { campus, straightKm, walkMin, cycleMin, driveMin } = row;
  const band = walkBand(walkMin);
  const route = routeState?.status === 'ready' ? routeState.data : null;
  return (
    <li>
      <div
        className={cn(
          'rounded-2xl border p-3 transition-all sm:p-4',
          selected ? 'border-brand-300 bg-brand-50/60 ring-2 ring-brand-300/50 dark:border-brand-600 dark:bg-brand-500/10 dark:ring-brand-500/30' : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
        )}
        data-testid="campus-row"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => onSelect(campus.id)} aria-pressed={selected} className="flex min-w-0 items-center gap-3 rounded-xl text-left">
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white', GROUP_ICON[campus.group] || GROUP_ICON.wits)}>
              <CampusIcon campus={campus} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">{campus.name}</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{campus.area} · {formatDistance(straightKm)} straight line</span>
            </span>
          </button>

          <dl className="grid grid-cols-3 gap-2 text-center sm:w-auto sm:min-w-[15rem]">
            <div className="rounded-xl bg-slate-50 px-2 py-1.5 dark:bg-slate-800/70">
              <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"><Footprints className="h-3 w-3" aria-hidden="true" />Walk</dt>
              <dd className={cn('text-sm font-bold', BAND_TEXT[band])}>{formatMinutes(walkMin)}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-1.5 dark:bg-slate-800/70">
              <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"><Bike className="h-3 w-3" aria-hidden="true" />Cycle</dt>
              <dd className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatMinutes(cycleMin)}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-1.5 dark:bg-slate-800/70">
              <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"><Car className="h-3 w-3" aria-hidden="true" />Drive</dt>
              <dd className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatMinutes(driveMin)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {routingEnabled && (
            <Button size="xs" variant={route ? 'soft' : 'secondary'} onClick={() => onRoute(campus)} disabled={routeState?.status === 'loading'}>
              {routeState?.status === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Route className="h-3.5 w-3.5" aria-hidden="true" />}
              {route ? 'Show route' : 'Exact walking route'}
            </Button>
          )}
          <Button size="xs" variant="ghost" href={osmDirectionsUrl(from, campus, 'foot')} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />Directions
            <span className="sr-only"> from this residence to {campus.name} (opens OpenStreetMap)</span>
          </Button>
          {route && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white" data-testid="route-result">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Walking route: {formatDistance(route.distanceKm)} · {formatMinutes(route.durationMin)}
            </span>
          )}
          {routeState?.status === 'error' && (
            <span className="text-xs font-semibold text-coral-700 dark:text-coral-300" role="alert">Route unavailable right now — use Directions.</span>
          )}
        </div>
      </div>
    </li>
  );
};

const CampusDistances = ({ property }) => {
  const defaultTab = property.university === 'uj' ? 'uj' : 'wits';
  const [tab, setTab] = useState(defaultTab);
  const campuses = useMemo(() => {
    if (tab === 'all') return CAMPUSES;
    if (tab === 'colleges') return COLLEGE_CAMPUSES;
    return UNIVERSITY_CAMPUSES.filter((campus) => campus.university === tab);
  }, [tab]);
  const rows = useMemo(() => distancesToCampuses(property, campuses), [property, campuses]);
  const [selectedId, setSelectedId] = useState(() => rows[0]?.campus.id || null);
  const [routes, setRoutes] = useState({});
  const from = useMemo(() => toPoint(property), [property]);

  useEffect(() => {
    if (!rows.some((row) => row.campus.id === selectedId)) setSelectedId(rows[0]?.campus.id || null);
  }, [rows, selectedId]);

  const loadRoute = useCallback(async (campus) => {
    setSelectedId(campus.id);
    const current = routes[campus.id];
    if (current?.status === 'ready' || current?.status === 'loading') return;
    setRoutes((previous) => ({ ...previous, [campus.id]: { status: 'loading' } }));
    try {
      const data = await fetchWalkingRoute(from, campus);
      setRoutes((previous) => ({ ...previous, [campus.id]: { status: 'ready', data } }));
    } catch {
      setRoutes((previous) => ({ ...previous, [campus.id]: { status: 'error' } }));
    }
  }, [from, routes]);

  const selectedRoute = routes[selectedId]?.status === 'ready' ? routes[selectedId].data : null;
  const tabs = [
    { id: 'wits', label: 'Wits' },
    { id: 'uj', label: 'UJ' },
    { id: 'colleges', label: 'Colleges' },
    { id: 'all', label: 'All' },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Which campuses">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              'rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors',
              tab === id ? 'bg-ink-950 text-white dark:bg-white dark:text-ink-950' : 'text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 h-72 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 sm:h-96">
        <MapFrame className="h-full w-full">
          <PropertyLocationMap
            property={property}
            campuses={campuses}
            selectedCampusId={selectedId}
            onSelectCampus={setSelectedId}
            route={selectedRoute}
            className="h-full w-full"
          />
        </MapFrame>
      </div>

      <ul className="mt-4 space-y-2.5" aria-label="Distance to each campus">
        {rows.map((row) => (
          <CampusRow
            key={row.campus.id}
            row={row}
            from={from}
            selected={row.campus.id === selectedId}
            onSelect={setSelectedId}
            routeState={routes[row.campus.id]}
            onRoute={loadRoute}
          />
        ))}
      </ul>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Times are estimates from map distance (walking routes average 1.4× the straight line at 4.5 km/h). Tap
          {routingEnabled ? ' “Exact walking route” for the real path on the map.' : ' Directions for turn-by-turn routes.'}
          {routingEnabled && ` ${ROUTING_ATTRIBUTION}.`}
        </span>
      </p>
    </>
  );
};

const NearbyResidences = ({ propertyId }) => {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setItems(null);
    propertiesAPI.getNearby(propertyId, 6)
      .then((response) => { if (!cancelled) setItems(response.data.properties || []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [propertyId]);

  if (items && items.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby="nearby-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-brand-700 dark:text-brand-300">Nearby</p>
          <h2 id="nearby-heading" className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Other residences close by</h2>
        </div>
        <Link to="/properties?view=map" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 dark:text-brand-300 sm:inline-flex">
          View on map<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(items || Array.from({ length: 3 }, (_, index) => ({ id: `skeleton-${index}` }))).map((item) => (
          <li key={item.id}>
            {items ? (
              <Link to={`/properties/${item.id}`} className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-card transition-colors hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700" data-testid="nearby-card">
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                  <PropertyImage property={item} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">{item.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">From {formatCurrency(item.price_min)} / month</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <Footprints className="h-3 w-3" aria-hidden="true" />
                    {formatDistance(item.distance_km)} away · {formatMinutes(estimateTravel(item.distance_km).walkMin)} walk
                  </p>
                </div>
              </Link>
            ) : (
              <Skeleton className="h-[6.5rem] rounded-2xl" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

/* ------------------------------------------------------------------ page */

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const onCounted = useCallback((reviewId, helpfulCount) => {
    setReviews((previous) => previous.map((review) => (review.id === reviewId ? { ...review, helpful_count: helpfulCount } : review)));
  }, []);
  const onHelpfulError = useCallback((message) => toast.error(message), [toast]);
  const { markHelpful, hasMarked, isPending } = useHelpfulVotes({ isAuthenticated, onCounted, onError: onHelpfulError });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setActiveImageIndex(0);
      try {
        const propertyResponse = await propertiesAPI.getProperty(id);
        if (cancelled) return;
        setProperty(propertyResponse.data.property);
        setLoading(false);
        setReviewsLoading(true);
        const reviewsResponse = await reviewsAPI.getReviews(id);
        if (cancelled) return;
        setReviews(reviewsResponse.data.reviews || []);
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      toast.error('Could not copy. Please copy manually.');
    }
  };

  const handleCopyContact = () => {
    const text = [property.contact_info, property.website, property.address].filter(Boolean).join('\n');
    copyText(text, 'Contact details copied to clipboard.');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.name, text: `${property.name} on oneApplyHub`, url });
        return;
      } catch {
        // User dismissed the share sheet; fall back to copying silently.
      }
    }
    copyText(url, 'Link copied to clipboard.');
  };

  if (loading) return <DetailSkeleton />;

  if (notFound || !property) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className={CARD}>
          <EmptyState
            icon={Building2}
            title="Property not found"
            description="This property does not exist or has been removed from the platform."
            action={<Button to="/properties"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to properties</Button>}
          />
        </div>
      </div>
    );
  }

  const amenities = parseAmenities(property.amenities);
  const reviewCount = property.review_count || 0;
  const reviewLink = `/properties/${id}/review`;
  const websiteLabel = property.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const images = property.images || [];
  const activeImage = images[Math.min(activeImageIndex, Math.max(0, images.length - 1))] || null;
  const located = hasCoords(property);
  const quickDistances = located ? distancesToCampuses(property, campusesFor(property.university)).slice(0, 2) : [];
  const priceRange = property.price_max && property.price_max !== property.price_min
    ? `${formatCurrency(property.price_min)} – ${formatCurrency(property.price_max)}`
    : formatCurrency(property.price_min);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
        <Link to="/properties" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Properties</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
        <span className="truncate text-slate-900 dark:text-white" aria-current="page">{property.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Gallery + summary */}
          <div className={cn(CARD, 'overflow-hidden')}>
            <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800">
              {activeImage ? (
                <PropertyImage property={property} src={activeImage.image_url} alt={activeImage.caption || property.name} />
              ) : (
                <PropertyImage property={{ ...property, primary_image_url: null }} iconClassName="h-14 w-14" />
              )}
                            <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-5 sm:top-5">
                <UniversityBadge university={property.university} />
                {property.nsfas_accredited && <NsfasBadge long />}
              </div>
              <span className="absolute right-4 top-4 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold capitalize text-white sm:right-5 sm:top-5">{property.property_type}</span>
              {images.length > 1 && (
                <span className="absolute bottom-4 right-5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {activeImageIndex + 1} / {images.length}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-3 dark:border-slate-800" role="tablist" aria-label="Property photos">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    type="button"
                    role="tab"
                    aria-selected={index === activeImageIndex}
                    aria-label={image.caption || `Photo ${index + 1}`}
                    onClick={() => setActiveImageIndex(index)}
                    className={cn('h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors', index === activeImageIndex ? 'border-coral-500' : 'border-transparent hover:border-brand-300')}
                  >
                    <PropertyImage property={property} src={image.image_url} />
                  </button>
                ))}
              </div>
            )}
            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{property.name}</h1>
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" aria-hidden="true" />
                    {property.address}
                  </p>
                </div>
                <RatingPill rating={property.average_rating} count={reviewCount} className="self-start px-3 py-1.5 text-sm" />
              </div>

              {quickDistances.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2" aria-label="Distance to nearest campuses">
                  {quickDistances.map((row) => (
                    <DistanceBadge key={row.campus.id} travel={{ ...row, label: row.campus.short }} />
                  ))}
                  <a href="#location-heading" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10">
                    All campuses<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              )}

              <h2 className="mb-2 mt-6 font-sans text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">About this property</h2>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-[15px]">{property.description}</p>
            </div>
          </div>

          {/* How far is it? */}
          <section className={cn(CARD, 'scroll-mt-24 p-5 sm:p-7')} aria-labelledby="location-heading">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
                  <Footprints className="h-3.5 w-3.5" aria-hidden="true" />Location
                </p>
                <h2 id="location-heading" className="scroll-mt-24 text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">How far is it from campus?</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Walking, cycling and driving times from {property.name} to Wits and UJ campuses and nearby colleges.</p>
              </div>
              {located && (
                <Button size="sm" variant="secondary" href={osmViewUrl(property)} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />Open in OpenStreetMap
                </Button>
              )}
            </div>

            {located ? (
              <>
                {property.geo_precision === 'street' && (
                  <p className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    The pin is placed on the street, not the exact building, so distances may be off by a few hundred metres.
                  </p>
                )}
                <CampusDistances property={property} />
              </>
            ) : (
              <EmptyState
                compact
                icon={MapPinOff}
                title="Map location coming soon"
                description="We are confirming this residence's exact location. Until then, search the address on OpenStreetMap."
                action={(
                  <Button size="sm" variant="secondary" href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(property.address || property.name)}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />Search the address
                  </Button>
                )}
              />
            )}
          </section>

          {/* Amenities */}
          {amenities.length > 0 && (
            <section className={cn(CARD, 'p-5 sm:p-7')} aria-labelledby="amenities-heading">
              <h2 id="amenities-heading" className="mb-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Amenities &amp; features</h2>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-brand-300 dark:ring-slate-700">
                      {renderAmenityIcon(amenity, 'h-4 w-4')}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{amenity}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Reviews */}
          <section className={cn(CARD, 'p-5 sm:p-7')} aria-labelledby="reviews-heading">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 id="reviews-heading" className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">Student reviews</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{reviewCount} verified review{reviewCount === 1 ? '' : 's'}</p>
              </div>
              {isAuthenticated ? (
                <Button to={reviewLink} size="sm"><PenLine className="h-3.5 w-3.5" aria-hidden="true" />Write a review</Button>
              ) : (
                <Button to="/login" state={{ from: { pathname: reviewLink } }} variant="secondary" size="sm">Sign in to review</Button>
              )}
            </div>

            {reviewsLoading ? (
              <div className="space-y-6" aria-busy="true">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-2xl" /><Skeleton className="h-4 w-40" /></div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} onHelpful={markHelpful} helpfulMarked={hasMarked(review.id)} helpfulPending={isPending(review.id)} />
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={MessageSquare}
                title="No reviews yet"
                description="Be the first to share what it is like to live here."
                action={isAuthenticated && <Button to={reviewLink} size="sm">Write the first review</Button>}
              />
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1" aria-label="Pricing and contact">
          <div className="space-y-5 lg:sticky lg:top-24">
            <div className={cn(CARD, 'overflow-hidden')}>
              <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly rent</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{priceRange}</p>
                {property.nsfas_accredited && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />NSFAS accredited
                  </p>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="space-y-2.5">
                  {isAuthenticated ? (
                    <Button to="/application?type=accommodation" variant="accent" size="lg" fullWidth>Apply for accommodation</Button>
                  ) : (
                    <Button to="/register" variant="accent" size="lg" fullWidth>Create account to apply</Button>
                  )}
                  {property.website && (
                    <Button href={property.website} target="_blank" rel="noopener noreferrer" variant="secondary" fullWidth>
                      Visit official website
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    <Button variant="secondary" onClick={handleCopyContact}><Copy className="h-4 w-4" aria-hidden="true" />Copy contact</Button>
                    <Button variant="secondary" onClick={handleShare}><Share2 className="h-4 w-4" aria-hidden="true" />Share</Button>
                  </div>
                </div>

                {(property.contact_info || property.website || property.address) && (
                  <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
                    {property.contact_info && (
                      <div className="flex items-start gap-3">
                        <dt className="sr-only">Phone</dt>
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                        <dd className="text-slate-700 dark:text-slate-300">{property.contact_info}</dd>
                      </div>
                    )}
                    {property.website && (
                      <div className="flex items-start gap-3">
                        <dt className="sr-only">Website</dt>
                        <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <dd className="min-w-0">
                          <a href={property.website} target="_blank" rel="noopener noreferrer" className="block truncate font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300">
                            {websiteLabel}
                          </a>
                        </dd>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <dt className="sr-only">Address</dt>
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" aria-hidden="true" />
                      <dd className="text-slate-700 dark:text-slate-300">{property.address}</dd>
                    </div>
                  </dl>
                )}

                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
                  <div className="rounded-2xl bg-gold-50 py-3 dark:bg-gold-500/10">
                    <dd className="text-2xl font-bold text-slate-950 dark:text-white">{reviewCount}</dd>
                    <dt className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">Reviews</dt>
                  </div>
                  <div className="rounded-2xl bg-brand-50 py-3 dark:bg-brand-500/10">
                    <dd className="text-2xl font-bold text-slate-950 dark:text-white">{amenities.length}</dd>
                    <dt className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">Amenities</dt>
                  </div>
                </dl>
              </div>
            </div>

            <div className={cn(CARD, 'p-5 sm:p-6')}>
              <h2 className="mb-4 font-sans text-sm font-bold text-slate-950 dark:text-white">Property details</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Property type</dt>
                  <dd className="font-semibold capitalize text-slate-900 dark:text-white">{property.property_type}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">University</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{UNIVERSITIES[property.university]?.label || property.university}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">NSFAS</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{property.nsfas_accredited ? 'Accredited' : 'Not accredited'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Map pin</dt>
                  <dd className="text-right font-semibold text-slate-900 dark:text-white">{located ? (PRECISION_LABELS[property.geo_precision] || 'On the map') : 'Not yet mapped'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Listed</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{formatDate(property.created_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {located && <NearbyResidences propertyId={property.id} />}
    </div>
  );
};

export default PropertyDetailPage;
