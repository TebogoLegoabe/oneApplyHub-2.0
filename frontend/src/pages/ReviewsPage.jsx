import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ThumbsUp, Calendar, Filter, Search, AlertCircle } from 'lucide-react';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    university: 'all',
    rating: 'all',
    search: '',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [helpfulLoading, setHelpfulLoading] = useState({});

  // Get helpful reviews from localStorage
  const getMarkedHelpful = () => {
    const marked = localStorage.getItem('markedHelpful');
    return marked ? new Set(JSON.parse(marked)) : new Set();
  };

  // Save helpful reviews to localStorage
  const saveMarkedHelpful = (reviewIds) => {
    localStorage.setItem('markedHelpful', JSON.stringify([...reviewIds]));
  };

  const [markedHelpful, setMarkedHelpful] = useState(getMarkedHelpful);

  // Fetch reviews from API
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.university !== 'all') params.append('university', filters.university);
      if (filters.rating !== 'all') params.append('min_rating', filters.rating);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('per_page', '12'); // Adjust as needed
      
      const response = await fetch(`http://localhost:5000/api/reviews/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different possible response structures
      if (data.reviews) {
        // Paginated response
        setReviews(data.reviews);
        setTotalPages(data.total_pages || 1);
        setTotalReviews(data.total || data.reviews.length);
        
        // Check which reviews user has already marked as helpful
        await checkHelpfulStatus(data.reviews.map(r => r.id));
      } else if (Array.isArray(data)) {
        // Simple array response
        setReviews(data);
        setTotalPages(1);
        setTotalReviews(data.length);
        
        // Check which reviews user has already marked as helpful
        await checkHelpfulStatus(data.map(r => r.id));
      } else {
        setReviews([]);
        setTotalPages(1);
        setTotalReviews(0);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Check which reviews user has already marked as helpful
  const checkHelpfulStatus = async (reviewIds) => {
    const token = localStorage.getItem('token');
    if (!token || reviewIds.length === 0) return;

    try {
      const response = await fetch('http://localhost:5000/api/reviews/helpful-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review_ids: reviewIds })
      });

      if (response.ok) {
        const data = await response.json();
        setMarkedHelpful(new Set(data.marked_reviews));
      }
    } catch (err) {
      console.error('Error checking helpful status:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUniversityDisplay = (university) => {
    if (!university) return '';
    return university.toLowerCase() === 'wits' ? 'WITS' : 
           university.toLowerCase() === 'uj' ? 'UJ' : 
           university.toUpperCase();
  };

  // Handle marking review as helpful
  const handleMarkHelpful = async (reviewId) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to mark reviews as helpful');
      return;
    }

    // Check if already marked
    if (markedHelpful.has(reviewId)) {
      alert('You have already marked this review as helpful');
      return;
    }

    setHelpfulLoading(prev => ({ ...prev, [reviewId]: true }));

    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as helpful');
      }

      // Update the review in the local state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpful_count: data.helpful_count }
            : review
        )
      );

      // Mark this review as helpful in our tracking set
      setMarkedHelpful(prev => new Set([...prev, reviewId]));

    } catch (err) {
      console.error('Error marking review as helpful:', err);
      alert(err.message || 'Failed to mark review as helpful');
    } finally {
      setHelpfulLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Calculate average rating for display
  const averageRating = reviews.length > 0 ? 
    (reviews.reduce((sum, r) => sum + (r.overall_rating || r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0';

  const recommendationCount = reviews.filter(r => r.recommend || r.would_recommend).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Reviews</h1>
          <p className="text-gray-600">
            Read honest reviews from verified Wits and UJ students about their accommodation experiences
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews or properties..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* University Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.university}
                onChange={(e) => handleFilterChange('university', e.target.value)}
              >
                <option value="all">All Universities</option>
                <option value="wits">Wits Students</option>
                <option value="uj">UJ Students</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">Error loading reviews: {error}</span>
              <button
                onClick={fetchReviews}
                className="ml-auto text-red-600 hover:text-red-700 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalReviews}</div>
            <div className="text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{averageRating}★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{recommendationCount}</div>
            <div className="text-gray-600">Recommendations</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {new Set(reviews.map(r => r.property_name || r.property?.title)).size}
            </div>
            <div className="text-gray-600">Properties Reviewed</div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Reviews ({reviews.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Showing latest reviews</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {review.anonymous ? 'A' : (review.author || review.user?.name || 'U').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.anonymous ? 'Anonymous Student' : (review.author || review.user?.name || 'Anonymous')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {review.author_year || review.user?.year_of_study || ''} • {getUniversityDisplay(review.author_university || review.user?.university)}
                        </p>
                        <Link 
                          to={`/properties/${review.property_id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {review.property_name || review.property?.title || 'Property'}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(review.overall_rating || review.rating)}`}>
                        {review.overall_rating || review.rating}/5 ★
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {review.review_text || review.comment || 'No review text available'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm font-medium ${(review.recommend || review.would_recommend) ? 'text-green-600' : 'text-red-600'}`}>
                        {(review.recommend || review.would_recommend) ? '✓ Recommends' : '✗ Doesn\'t Recommend'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleMarkHelpful(review.id)}
                        disabled={helpfulLoading[review.id] || markedHelpful.has(review.id)}
                        className={`flex items-center space-x-1 transition-colors disabled:cursor-not-allowed ${
                          markedHelpful.has(review.id) 
                            ? 'text-green-600 bg-green-50 px-2 py-1 rounded' 
                            : 'text-gray-500 hover:text-blue-600 disabled:opacity-50'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${
                          helpfulLoading[review.id] ? 'animate-pulse' : 
                          markedHelpful.has(review.id) ? 'fill-current' : ''
                        }`} />
                        <span className="text-sm">
                          {helpfulLoading[review.id] ? 'Marking...' : 
                           markedHelpful.has(review.id) ? `${review.helpful_count || 0} helpful ✓` :
                           `${review.helpful_count || 0} helpful`}
                        </span>
                      </button>
                      <Link
                        to={`/properties/${review.property_id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Property
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-4">
                {error ? 'Unable to load reviews at this time.' : 'Try adjusting your search criteria or filters.'}
              </p>
              <button
                onClick={() => setFilters({ university: 'all', rating: 'all', search: '', page: 1 })}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {filters.page} of {totalPages}
              </span>
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Share Your Experience</h3>
          <p className="text-blue-100 mb-6">
            Help fellow students by sharing your honest review of your accommodation
          </p>
          <Link
            to="/properties"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Find Properties to Review
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
