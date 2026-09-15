import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Star, Phone, MessageSquare, ThumbsUp, Camera, Globe, ExternalLink,
  Copy, Share2, ChevronRight, Building2, PenLine, ThumbsDown, CalendarDays,
} from 'lucide-react';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useHelpfulVotes } from '../hooks/useHelpfulVotes';
import { parseAmenities, renderAmenityIcon } from '../constants/amenities';
import { formatDate, getRatingBadge } from '../utils/format';
import { Badge, Button, EmptyState, Skeleton, useToast } from '../components/ui';
import { cn } from '../utils/cn';

const CARD = 'rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900';

const DetailSkeleton = () => (
  <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading property">
    <Skeleton className="mb-6 h-4 w-48" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  </div>
);

const ReviewItem = ({ review, onHelpful, helpfulMarked, helpfulPending }) => (
  <li className="py-6 first:pt-0 last:pb-0">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white">
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
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(review.created_at)}
        </span>
      </div>
    </div>

    <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{review.review_text}</p>

    {(review.pros || review.cons) && (
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {review.pros && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />What worked well
            </p>
            <p className="text-sm text-emerald-900/80 dark:text-emerald-200/80">{review.pros}</p>
          </div>
        )}
        {review.cons && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
        <Link to="/properties" className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">Properties</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
        <span className="truncate font-semibold text-slate-900 dark:text-white" aria-current="page">{property.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Hero / gallery */}
          <div className={cn(CARD, 'overflow-hidden')}>
            <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950">
              {activeImage ? (
                <img src={activeImage.image_url} alt={activeImage.caption || property.name} className="h-full w-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_55%)]" aria-hidden="true" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
                    <Camera className="h-12 w-12" aria-hidden="true" />
                    <span className="text-sm font-medium">Photos coming soon</span>
                  </div>
                </>
              )}
              <div className="absolute left-5 top-5 flex gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase text-brand-700 shadow-sm">{property.university}</span>
                {property.nsfas_accredited && <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">NSFAS accredited</span>}
              </div>
              <span className="absolute right-5 top-5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold capitalize text-white backdrop-blur">{property.property_type}</span>
              {images.length > 1 && (
                <span className="absolute bottom-4 right-5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
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
                    className={cn(
                      'h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                      index === activeImageIndex ? 'border-brand-600' : 'border-transparent hover:border-brand-300',
                    )}
                  >
                    <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{property.name}</h1>
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                    {property.address}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                  <Star className="h-4 w-4 fill-gold-500 text-gold-500" aria-hidden="true" />
                  <span className="text-lg font-bold text-slate-950 dark:text-white">{property.average_rating || 'New'}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">({reviewCount} review{reviewCount === 1 ? '' : 's'})</span>
                </div>
              </div>
              <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">About this property</h2>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-[15px]">{property.description}</p>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <section className={cn(CARD, 'p-5 sm:p-6')} aria-labelledby="amenities-heading">
              <h2 id="amenities-heading" className="mb-4 text-base font-bold text-slate-950 dark:text-white">Amenities &amp; features</h2>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300">
                      {renderAmenityIcon(amenity, 'h-4 w-4')}
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{amenity}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Reviews */}
          <section className={cn(CARD, 'p-5 sm:p-6')} aria-labelledby="reviews-heading">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 id="reviews-heading" className="text-base font-bold text-slate-950 dark:text-white">Student reviews</h2>
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
        <aside className="lg:col-span-1">
          <div className="space-y-5 lg:sticky lg:top-6">
            <div className={cn(CARD, 'p-5 sm:p-6')}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Monthly rent</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-brand-700 dark:text-brand-300">
                R{property.price_min?.toLocaleString()} – R{property.price_max?.toLocaleString()}
              </p>

              {(property.contact_info || property.website || property.address) && (
                <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
                  {property.contact_info && (
                    <div className="flex items-start gap-3">
                      <dt className="sr-only">Phone</dt>
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                      <dd className="text-slate-700 dark:text-slate-300">{property.contact_info}</dd>
                    </div>
                  )}
                  {property.website && (
                    <div className="flex items-start gap-3">
                      <dt className="sr-only">Website</dt>
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                      <dd className="min-w-0">
                        <a href={property.website} target="_blank" rel="noopener noreferrer" className="block truncate font-medium text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300">
                          {websiteLabel}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <dt className="sr-only">Address</dt>
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <dd className="text-slate-700 dark:text-slate-300">{property.address}</dd>
                  </div>
                </dl>
              )}

              <div className="mt-5 space-y-2.5">
                {isAuthenticated ? (
                  <Button to="/application?type=accommodation" size="lg" fullWidth>Apply for accommodation</Button>
                ) : (
                  <Button to="/register" size="lg" fullWidth>Create account to apply</Button>
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

              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
                <div>
                  <dd className="text-xl font-bold text-slate-950 dark:text-white">{reviewCount}</dd>
                  <dt className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Reviews</dt>
                </div>
                <div>
                  <dd className="text-xl font-bold text-slate-950 dark:text-white">{amenities.length}</dd>
                  <dt className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Amenities</dt>
                </div>
              </dl>
            </div>

            <div className={cn(CARD, 'p-5 sm:p-6')}>
              <h2 className="mb-4 text-sm font-bold text-slate-950 dark:text-white">Property details</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Property type</dt>
                  <dd className="font-medium capitalize text-slate-900 dark:text-white">{property.property_type}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">University</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">{property.university?.toUpperCase()}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">NSFAS</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">{property.nsfas_accredited ? 'Accredited' : 'Not accredited'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Listed</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">{formatDate(property.created_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
