import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Calendar, Filter, Search, AlertCircle } from 'lucide-react';
import { reviewsAPI } from '../services/api';

const INITIAL_FILTERS = { university: 'all', rating: 'all', search: '', page: 1 };

const getRatingColor = (rating) => {
  if (rating >= 4) return 'text-emerald-700 bg-emerald-50';
  if (rating >= 3) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getUniversityDisplay = (university) => {
  if (!university) return '';
  const lower = university.toLowerCase();
  if (lower === 'wits') return 'WITS';
  if (lower === 'uj') return 'UJ';
  return university.toUpperCase();
};

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

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Debounce search: only fire filter update 400ms after user stops typing
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchInput]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

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
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: response.data.helpful_count } : r
        )
      );
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

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.overall_rating || r.rating || 0), 0) / reviews.length).toFixed(1)
      : '0';
  const recommendationCount = reviews.filter((r) => r.recommend || r.would_recommend).length;
  const propertiesReviewedCount = new Set(reviews.map((r) => r.property_name || r.property?.title)).size;

  const selectClass =
    'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-1">Student Reviews</h1>
          <p className="text-blue-100 text-sm">
            Honest reviews from verified Wits and UJ students about their accommodation experiences.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews or properties..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <select className={selectClass} value={filters.university} onChange={(e) => handleFilterChange('university', e.target.value)}>
              <option value="all">All Universities</option>
              <option value="wits">Wits Students</option>
              <option value="uj">UJ Students</option>
            </select>
            <select className={selectClass} value={filters.rating} onChange={(e) => handleFilterChange('rating', e.target.value)}>
              <option value="all">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2.5 flex-shrink-0" />
              <span className="text-red-800 dark:text-red-300 text-sm">{error}</span>
            </div>
            <button
              onClick={() => { setError(null); fetchReviews(); }}
              className="text-red-600 hover:text-red-700 font-medium text-sm ml-4 flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { value: totalReviews,          label: 'Total Reviews',        color: 'text-blue-600'   },
            { value: `${averageRating}★`,   label: 'Average Rating',       color: 'text-amber-500'  },
            { value: recommendationCount,   label: 'Recommendations',      color: 'text-emerald-600' },
            { value: propertiesReviewedCount, label: 'Properties Reviewed', color: 'text-purple-600' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-3 flex items-center gap-3">
              <div>
                <div className={`text-lg font-bold leading-none ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {helpfulError && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm px-4 py-2.5 rounded-xl">
              {helpfulError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reviews ({totalReviews})</h2>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Latest first</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {review.anonymous ? 'A' : (review.author || review.user?.name || 'U').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {review.anonymous ? 'Anonymous Student' : (review.author || review.user?.name || 'Anonymous')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {review.author_year || review.user?.year_of_study || ''}{' '}
                          &middot;{' '}
                          {getUniversityDisplay(review.author_university || review.user?.university)}
                        </p>
                        <Link
                          to={`/properties/${review.property_id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                        >
                          {review.property_name || review.property?.title || 'Property'}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRatingColor(review.overall_rating || review.rating)}`}>
                        {review.overall_rating || review.rating}/5 ★
                      </span>
                      <span className="hidden sm:flex items-center text-xs text-gray-400 gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed text-sm">
                    {review.review_text || review.comment || 'No review text available.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${(review.recommend || review.would_recommend) ? 'text-emerald-600' : 'text-red-500'}`}>
                        {(review.recommend || review.would_recommend) ? '✓ Recommends' : "✗ Doesn't Recommend"}
                      </span>
                      <span className="sm:hidden text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleMarkHelpful(review.id)}
                        disabled={helpfulLoading[review.id] || markedHelpful.has(review.id)}
                        className={`flex items-center gap-1.5 text-xs transition-colors disabled:cursor-not-allowed ${
                          markedHelpful.has(review.id)
                            ? 'text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg'
                            : 'text-gray-400 hover:text-blue-600 disabled:opacity-50'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${helpfulLoading[review.id] ? 'animate-pulse' : markedHelpful.has(review.id) ? 'fill-current' : ''}`} />
                        <span>
                          {helpfulLoading[review.id]
                            ? 'Marking...'
                            : markedHelpful.has(review.id)
                            ? `${review.helpful_count || 0} helpful ✓`
                            : `${review.helpful_count || 0} helpful`}
                        </span>
                      </button>
                      <Link to={`/properties/${review.property_id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        View Property
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No reviews found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Try adjusting your search criteria or filters.</p>
              <button
                onClick={() => { setFilters(INITIAL_FILTERS); setSearchInput(''); }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Page {filters.page} of {totalPages}</span>
            <button
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page === totalPages}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next →
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-7 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Share Your Experience</h3>
          <p className="text-blue-100 mb-5 text-sm">
            Help fellow students by sharing your honest review of your accommodation.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-white text-blue-600 px-7 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
          >
            Find Properties to Review
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
