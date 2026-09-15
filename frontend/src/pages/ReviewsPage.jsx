import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, CalendarDays, Search, MessageSquare, Star, Home, ArrowUpDown } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useHelpfulVotes } from '../hooks/useHelpfulVotes';
import { formatDate, getRatingBadge, getUniversityCode } from '../utils/format';
import { Alert, Badge, Button, EmptyState, Input, PageHeader, Select, Skeleton, useToast } from '../components/ui';
import { cn } from '../utils/cn';

const INITIAL_FILTERS = { university: 'all', rating: 'all', search: '', page: 1 };
const PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 400;

const StatTile = ({ icon: Icon, value, label }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  </div>
);

const ReviewCard = ({ review, onHelpful, helpfulMarked, helpfulPending }) => {
  const rating = review.overall_rating || review.rating;
  const authorName = review.anonymous ? 'Anonymous student' : (review.author || review.user?.name || 'Anonymous');
  const initial = review.anonymous ? 'A' : authorName.charAt(0).toUpperCase();
  const recommends = review.recommend || review.would_recommend;
  const propertyName = review.property_name || review.property?.title || 'Property';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white">{initial}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{authorName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {[review.author_year || review.user?.year_of_study || 'Student', getUniversityCode(review.author_university || review.user?.university)].filter(Boolean).join(' · ')}
            </p>
            <Link to={`/properties/${review.property_id}`} className="mt-0.5 inline-block truncate text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300">
              {propertyName}
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ring-black/5 dark:ring-white/10', getRatingBadge(rating))}>{rating}/5 ★</span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(review.created_at)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{review.review_text || review.comment || 'No review text available.'}</p>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <Badge tone={recommends ? 'success' : 'danger'}>{recommends ? 'Recommends' : 'Does not recommend'}</Badge>
        <div className="flex flex-wrap items-center gap-2">
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
          <Button to={`/properties/${review.property_id}`} variant="ghost" size="sm">View property</Button>
        </div>
      </div>
    </article>
  );
};

const ReviewsPage = () => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef(null);

  const onCounted = useCallback((reviewId, helpfulCount) => {
    setReviews((previous) => previous.map((review) => (review.id === reviewId ? { ...review, helpful_count: helpfulCount } : review)));
  }, []);
  const onHelpfulError = useCallback((message) => toast.error(message), [toast]);
  const { markHelpful, hasMarked, isPending } = useHelpfulVotes({ isAuthenticated, onCounted, onError: onHelpfulError });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: filters.page, per_page: PER_PAGE };
      if (filters.university !== 'all') params.university = filters.university;
      if (filters.rating !== 'all') params.min_rating = filters.rating;
      if (filters.search) params.search = filters.search;
      const { data } = await reviewsAPI.getAllReviews(params);
      if (data.reviews) {
        setReviews(data.reviews);
        setTotalPages(data.total_pages || 1);
        setTotalReviews(data.total || data.reviews.length);
      } else if (Array.isArray(data)) {
        setReviews(data);
        setTotalPages(1);
        setTotalReviews(data.length);
      } else {
        setReviews([]);
        setTotalPages(1);
        setTotalReviews(0);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'We could not load reviews right now.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters((previous) => (previous.search === searchInput.trim() ? previous : { ...previous, search: searchInput.trim(), page: 1 }));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [searchInput]);

  const handleFilterChange = (key, value) => setFilters((previous) => ({ ...previous, [key]: value, page: key === 'page' ? value : 1 }));
  const resetFilters = () => { setFilters(INITIAL_FILTERS); setSearchInput(''); };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + (review.overall_rating || review.rating || 0), 0) / reviews.length).toFixed(1)
    : '—';
  const recommendationCount = reviews.filter((review) => review.recommend || review.would_recommend).length;
  const propertiesReviewedCount = new Set(reviews.map((review) => review.property_id || review.property_name)).size;
  const hasActiveFilters = filters.university !== 'all' || filters.rating !== 'all' || Boolean(filters.search);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <PageHeader
        eyebrow="Student reviews"
        icon={MessageSquare}
        title="Accommodation reviews"
        description="Read student feedback about safety, value, management, location, and overall experience."
        className="mb-4"
      />

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900" aria-label="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            icon={Search}
            type="search"
            aria-label="Search reviews or properties"
            placeholder="Search reviews or properties"
            wrapperClassName="md:col-span-2"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Select aria-label="University" value={filters.university} onChange={(event) => handleFilterChange('university', event.target.value)}>
            <option value="all">All universities</option>
            <option value="wits">Wits students</option>
            <option value="uj">UJ students</option>
          </Select>
          <Select aria-label="Minimum rating" value={filters.rating} onChange={(event) => handleFilterChange('rating', event.target.value)}>
            <option value="all">All ratings</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
            <option value="2">2+ stars</option>
            <option value="1">1+ stars</option>
          </Select>
        </div>
      </section>

      {error && (
        <Alert tone="error" className="mb-4" action={<Button size="sm" variant="danger" onClick={fetchReviews}>Retry</Button>}>{error}</Alert>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={MessageSquare} value={totalReviews} label="Reviews" />
        <StatTile icon={Star} value={averageRating === '—' ? '—' : `${averageRating} / 5`} label="Average on this page" />
        <StatTile icon={ThumbsUp} value={recommendationCount} label="Recommendations" />
        <StatTile icon={Home} value={propertiesReviewedCount} label="Properties" />
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">Recent reviews</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">{totalReviews} review{totalReviews === 1 ? '' : 's'} found</p>
        </div>
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />Latest first
        </p>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-2xl" />)}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onHelpful={markHelpful} helpfulMarked={hasMarked(review.id)} helpfulPending={isPending(review.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            icon={Search}
            title="No reviews found"
            description={hasActiveFilters ? 'Try adjusting your search or filters.' : 'Reviews will appear here once students share their experiences.'}
            action={hasActiveFilters ? <Button onClick={resetFilters}>Clear filters</Button> : <Button to="/properties" variant="secondary">Browse properties</Button>}
          />
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row" aria-label="Pagination">
          <Button variant="secondary" onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))} disabled={filters.page === 1} className="w-full sm:w-auto">Previous</Button>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Page {filters.page} of {totalPages}</span>
          <Button variant="secondary" onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))} disabled={filters.page === totalPages} className="w-full sm:w-auto">Next</Button>
        </nav>
      )}

      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white shadow-card dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold">Share your accommodation experience</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">Help fellow students make better accommodation decisions.</p>
          </div>
          <Button to="/properties" variant="inverse" className="shrink-0">Find a property to review</Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
