import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [reviewData, setReviewData] = useState({
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
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/properties/${id}/review` } } });
      return;
    }

    const fetchProperty = async () => {
      try {
        const response = await propertiesAPI.getProperty(id);
        setProperty(response.data.property);
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Property not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, isAuthenticated, navigate]);

  const handleRatingChange = (ratingType, value) => {
    setReviewData(prev => ({
      ...prev,
      [ratingType]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  if (!validateForm()) {
    return;
  }

  // Add a proper subject value
  const submitData = {
    ...reviewData,
    subject: property?.name ? `Review for ${property.name}` : 'Property Review'
  };

  console.log('=== BEFORE SUBMISSION ===');
  console.log('Original reviewData:', reviewData);
  console.log('Submit data:', submitData);
  console.log('Subject value:', submitData.subject);
  console.log('Subject type:', typeof submitData.subject);

  setSubmitting(true);
  try {
    console.log('Calling API with data:', JSON.stringify(submitData, null, 2));
    await reviewsAPI.createReview(id, submitData);
    setSuccess(true);
    setTimeout(() => {
      navigate(`/properties/${id}`);
    }, 2000);
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Full error:', error);
    setError(`Backend error: ${JSON.stringify(error.response?.data)}`);
  } finally {
    setSubmitting(false);
  }
};

  const StarRating = ({ rating, onRatingChange, label, required = false }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`transition-colors ${
                star <= rating
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {rating > 0 ? `${rating}/5` : 'No rating'}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <Link to="/properties" className="text-blue-600 hover:text-blue-700">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for sharing your experience. Your review will help fellow students make informed decisions.
          </p>
          <p className="text-sm text-gray-500">Redirecting to property page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/properties/${id}`}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Property
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
          {property && (
            <div className="text-lg text-gray-600">
              Reviewing: <span className="font-semibold">{property.name}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Rating */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Experience</h3>
              <StarRating
                rating={reviewData.overall_rating}
                onRatingChange={(rating) => handleRatingChange('overall_rating', rating)}
                label="Overall Rating"
                required
              />
            </div>

            {/* Detailed Ratings */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Rate Different Aspects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StarRating
                  rating={reviewData.value_rating}
                  onRatingChange={(rating) => handleRatingChange('value_rating', rating)}
                  label="Value for Money"
                />
                <StarRating
                  rating={reviewData.location_rating}
                  onRatingChange={(rating) => handleRatingChange('location_rating', rating)}
                  label="Location & Accessibility"
                />
                <StarRating
                  rating={reviewData.safety_rating}
                  onRatingChange={(rating) => handleRatingChange('safety_rating', rating)}
                  label="Safety & Security"
                />
                <StarRating
                  rating={reviewData.cleanliness_rating}
                  onRatingChange={(rating) => handleRatingChange('cleanliness_rating', rating)}
                  label="Cleanliness"
                />
                <StarRating
                  rating={reviewData.management_rating}
                  onRatingChange={(rating) => handleRatingChange('management_rating', rating)}
                  label="Management Response"
                />
                <StarRating
                  rating={reviewData.facilities_rating}
                  onRatingChange={(rating) => handleRatingChange('facilities_rating', rating)}
                  label="Facilities & Amenities"
                />
              </div>
            </div>

            {/* Written Review */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Experience</h3>
              <div>
                <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="review_text"
                  name="review_text"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your honest experience living here. What did you like? What could be improved? This helps fellow students make informed decisions."
                  value={reviewData.review_text}
                  onChange={handleInputChange}
                  required
                />
                <div className="text-sm text-gray-500 mt-1">
                  {reviewData.review_text.length}/1000 characters (minimum 50)
                </div>
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pros and Cons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pros" className="block text-sm font-medium text-gray-700 mb-2">
                    What did you like? (Optional)
                  </label>
                  <textarea
                    id="pros"
                    name="pros"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Great location, friendly staff, modern facilities..."
                    value={reviewData.pros}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="cons" className="block text-sm font-medium text-gray-700 mb-2">
                    What could be improved? (Optional)
                  </label>
                  <textarea
                    id="cons"
                    name="cons"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Noisy area, maintenance issues, expensive..."
                    value={reviewData.cons}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Would you recommend this property? <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recommend"
                    value="true"
                    checked={reviewData.recommend === true}
                    onChange={(e) => setReviewData(prev => ({ ...prev, recommend: true }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Yes, I would recommend this property</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recommend"
                    value="false"
                    checked={reviewData.recommend === false}
                    onChange={(e) => setReviewData(prev => ({ ...prev, recommend: false }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">No, I would not recommend this property</span>
                </label>
              </div>
            </div>

            {/* Privacy Options */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={reviewData.anonymous}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">
                  Post this review anonymously (your name and university won't be shown)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                to={`/properties/${id}`}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">Review Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
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