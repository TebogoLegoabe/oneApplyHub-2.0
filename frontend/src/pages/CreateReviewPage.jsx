import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StarRating = ({ rating, onRatingChange, label, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className={`transition-colors ${
            star <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
          }`}
        >
          <Star className="w-7 h-7 fill-current" />
        </button>
      ))}
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{rating > 0 ? `${rating}/5` : 'No rating'}</p>
  </div>
);

const INITIAL_REVIEW_DATA = {
  overall_rating: 0,
  value_rating: 0,
  location_rating: 0,
  safety_rating: 0,
  cleanliness_rating: 0,
  management_rating: 0,
  facilities_rating: 0,
  review_text: '',
  pros: '',
  cons: '',
  recommend: null,
  anonymous: false,
  subject: '',
};

const CreateReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [reviewData, setReviewData] = useState(INITIAL_REVIEW_DATA);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/properties/${id}/review` } } });
      return;
    }

    const fetchProperty = async () => {
      try {
        const response = await propertiesAPI.getProperty(id);
        setProperty(response.data.property);
      } catch {
        setError('Property not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, isAuthenticated, navigate]);

  const handleRatingChange = (ratingType, value) => {
    setReviewData((prev) => ({ ...prev, [ratingType]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    if (reviewData.overall_rating === 0) {
      setError('Please provide an overall rating');
      return false;
    }
    if (reviewData.review_text.trim().length < 50) {
      setError('Please write at least 50 characters in your review');
      return false;
    }
    if (reviewData.recommend === null) {
      setError('Please indicate if you would recommend this property');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    const submitData = {
      ...reviewData,
      subject: property?.name ? `Review for ${property.name}` : 'Property Review',
    };

    setSubmitting(true);
    try {
      await reviewsAPI.createReview(id, submitData);
      setSuccess(true);
      setTimeout(() => navigate(`/properties/${id}`), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Property Not Found</h1>
          <Link to="/properties" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  // Email verification gate — must verify before writing reviews
  if (!user?.verified) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verify Your Email First</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            You need to verify your email address before you can write reviews.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            This helps us keep reviews tied to real student accounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/verify-email"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              Verify Email
            </Link>
            <Link
              to={`/properties/${id}`}
              className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              Back to Property
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            Thank you for sharing your experience. Your review will help fellow students make informed decisions.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to property page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        <div className="mb-8">
          <Link
            to={`/properties/${id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-5 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Property
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Write a Review</h1>
          {property && (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Reviewing: <span className="font-semibold text-gray-900 dark:text-white">{property.name}</span>
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="border-b border-gray-100 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Overall Experience</h3>
              <StarRating
                rating={reviewData.overall_rating}
                onRatingChange={(rating) => handleRatingChange('overall_rating', rating)}
                label="Overall Rating"
                required
              />
            </div>

            <div className="border-b border-gray-100 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Rate Different Aspects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StarRating rating={reviewData.value_rating} onRatingChange={(r) => handleRatingChange('value_rating', r)} label="Value for Money" />
                <StarRating rating={reviewData.location_rating} onRatingChange={(r) => handleRatingChange('location_rating', r)} label="Location & Accessibility" />
                <StarRating rating={reviewData.safety_rating} onRatingChange={(r) => handleRatingChange('safety_rating', r)} label="Safety & Security" />
                <StarRating rating={reviewData.cleanliness_rating} onRatingChange={(r) => handleRatingChange('cleanliness_rating', r)} label="Cleanliness" />
                <StarRating rating={reviewData.management_rating} onRatingChange={(r) => handleRatingChange('management_rating', r)} label="Management Response" />
                <StarRating rating={reviewData.facilities_rating} onRatingChange={(r) => handleRatingChange('facilities_rating', r)} label="Facilities & Amenities" />
              </div>
            </div>

            <div className="border-b border-gray-100 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Your Experience</h3>
              <label htmlFor="review_text" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Tell us about your experience <span className="text-red-500">*</span>
              </label>
              <textarea
                id="review_text"
                name="review_text"
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 resize-none"
                placeholder="Share your honest experience living here. What did you like? What could be improved? This helps fellow students make informed decisions."
                value={reviewData.review_text}
                onChange={handleInputChange}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                {reviewData.review_text.length}/5000 characters (minimum 50)
              </p>
            </div>

            <div className="border-b border-gray-100 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Pros and Cons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pros" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    What did you like? <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="pros"
                    name="pros"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 resize-none"
                    placeholder="e.g., Great location, friendly staff, modern facilities..."
                    value={reviewData.pros}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="cons" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    What could be improved? <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="cons"
                    name="cons"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 resize-none"
                    placeholder="e.g., Noisy area, maintenance issues, expensive..."
                    value={reviewData.cons}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
                Would you recommend this property? <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    value="true"
                    checked={reviewData.recommend === true}
                    onChange={() => setReviewData((prev) => ({ ...prev, recommend: true }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-200 text-sm">Yes, I would recommend this property</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    value="false"
                    checked={reviewData.recommend === false}
                    onChange={() => setReviewData((prev) => ({ ...prev, recommend: false }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-200 text-sm">No, I would not recommend this property</span>
                </label>
              </div>
            </div>

            <div className="border-b border-gray-100 dark:border-gray-700 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Privacy</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={reviewData.anonymous}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 text-sm">
                  Post this review anonymously (your name and university won't be shown)
                </span>
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                to={`/properties/${id}`}
                className="px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 text-sm">Review Guidelines</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1.5">
            <li>• Be honest and fair in your review</li>
            <li>• Focus on your personal experience</li>
            <li>• Avoid personal attacks or inappropriate language</li>
            <li>• Include specific details that would help other students</li>
            <li>• Remember that your review helps the student community</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewPage;
