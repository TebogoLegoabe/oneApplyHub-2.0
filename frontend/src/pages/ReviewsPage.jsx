import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Calendar, Filter, Search, AlertCircle, MessageSquare, Star, Home } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import { formatDate, getRatingBadge, getUniversityCode } from '../utils/format';

const INITIAL_FILTERS = { university: 'all', rating: 'all', search: '', page: 1 };

const getMarkedHelpful = () => {
  try {
    const marked = localStorage.getItem('markedHelpful');
    return marked ? new Set(JSON.parse(marked)) : new Set();
  } catch {
    return new Set();
  }
};

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [helpfulLoading, setHelpfulLoading] = useState({});
  const [markedHelpful, setMarkedHelpful] = useState(getMarkedHelpful);
  const [helpfulError, setHelpfulError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: filters.page, per_page: 12 };
      if (filters.university !== 'all') params.university = filters.university;
      if (filters.rating !== 'all') params.min_rating = filters.rating;
      if (filters.search) params.search = filters.search;
      const response = await reviewsAPI.getAllReviews(params);
      const data = response.data;
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
      setError(err.response?.data?.error || err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchInput]);

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const handleMarkHelpful = async (reviewId) => {
    if (!localStorage.getItem('token')) {
      setHelpfulError('Please log in to mark reviews as helpful.');
      setTimeout(() => setHelpfulError(null), 3000);
      return;
    }
    if (markedHelpful.has(reviewId)) return;
    setHelpfulLoading((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const response = await reviewsAPI.markHelpful(reviewId);
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, helpful_count: response.data.helpful_count } : r));
      const updated = new Set([...markedHelpful, reviewId]);
      setMarkedHelpful(updated);
      localStorage.setItem('markedHelpful', JSON.stringify([...updated]));
    } catch (err) {
      setHelpfulError(err.response?.data?.error || 'Failed to mark review as helpful.');
      setTimeout(() => setHelpfulError(null), 3000);
    } finally {
      setHelpfulLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.overall_rating || r.rating || 0), 0) / reviews.length).toFixed(1) : '0';
  const recommendationCount = reviews.filter((r) => r.recommend || r.would_recommend).length;
  const propertiesReviewedCount = new Set(reviews.map((r) => r.property_name || r.property?.title)).size;
  const selectClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <MessageSquare className="h-3.5 w-3.5" />Student reviews
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Accommodation reviews</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">Read student feedback about safety, value, management, location, and overall experience.</p>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search reviews or properties" className={`${selectClass} pl-9`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <select className={selectClass} value={filters.university} onChange={(e) => handleFilterChange('university', e.target.value)}>
              <option value="all">All universities</option><option value="wits">Wits students</option><option value="uj">UJ students</option>
            </select>
            <select className={selectClass} value={filters.rating} onChange={(e) => handleFilterChange('rating', e.target.value)}>
              <option value="all">All ratings</option><option value="4">4+ stars</option><option value="3">3+ stars</option><option value="2">2+ stars</option><option value="1">1+ stars</option>
            </select>
          </div>
        </div>

        {error && <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"><AlertCircle className="h-4 w-4" />{error}</div>}

        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[{ value: totalReviews, label: 'Reviews', icon: MessageSquare }, { value: `${averageRating}★`, label: 'Average rating', icon: Star }, { value: recommendationCount, label: 'Recommendations', icon: ThumbsUp }, { value: propertiesReviewedCount, label: 'Properties', icon: Home }].map(({ value, label, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0"><div className="text-xl font-black leading-none text-slate-950 dark:text-white">{value}</div><div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{label}</div></div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><Icon className="h-4 w-4" /></div>
              </div>
            </div>
          ))}
        </div>

        {helpfulError && <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{helpfulError}</div>}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-base font-black text-slate-950 dark:text-white sm:text-lg">Recent reviews</h2><p className="text-xs text-slate-500 dark:text-slate-400">{totalReviews} review{totalReviews === 1 ? '' : 's'} found</p></div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"><Filter className="h-3.5 w-3.5" />Latest first</div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => {
              const rating = review.overall_rating || review.rating;
              const authorName = review.anonymous ? 'Anonymous student' : (review.author || review.user?.name || 'Anonymous');
              const initial = review.anonymous ? 'A' : authorName.charAt(0);
              const recommends = review.recommend || review.would_recommend;
              return (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-black text-white">{initial}</div>
                      <div className="min-w-0"><p className="truncate text-sm font-black text-slate-950 dark:text-white">{authorName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{review.author_year || review.user?.year_of_study || 'Student'} · {getUniversityCode(review.author_university || review.user?.university)}</p><Link to={`/properties/${review.property_id}`} className="mt-0.5 inline-block truncate text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">{review.property_name || review.property?.title || 'Property'}</Link></div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${getRatingBadge(rating)}`}>{rating}/5 ★</span><span className="inline-flex items-center gap-1 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5" />{formatDate(review.created_at)}</span></div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.review_text || review.comment || 'No review text available.'}</p>
                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <span className={`text-xs font-bold ${recommends ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{recommends ? '✓ Recommends' : 'Does not recommend'}</span>
                    <div className="flex flex-wrap items-center gap-3"><button onClick={() => handleMarkHelpful(review.id)} disabled={helpfulLoading[review.id] || markedHelpful.has(review.id)} className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"><ThumbsUp className="h-3.5 w-3.5" />{review.helpful_count || 0} helpful</button><Link to={`/properties/${review.property_id}`} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">View property</Link></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><Search className="mx-auto mb-4 h-9 w-9 text-slate-400" /><h3 className="text-base font-black text-slate-950 dark:text-white">No reviews found</h3><p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">Try adjusting your search criteria or filters.</p><button onClick={() => { setFilters(INITIAL_FILTERS); setSearchInput(''); }} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Clear filters</button></div>
        )}

        {totalPages > 1 && <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row"><button onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))} disabled={filters.page === 1} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto">Previous</button><span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Page {filters.page} of {totalPages}</span><button onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))} disabled={filters.page === totalPages} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto">Next</button></div>}
        <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold sm:text-base">Share your accommodation experience</h3><p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">Help fellow students make better accommodation decisions.</p></div><Link to="/properties" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-100">Find properties to review</Link></div></div>
      </div>
    </div>
  );
};

export default ReviewsPage;
