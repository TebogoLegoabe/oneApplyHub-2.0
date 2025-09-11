import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, Wifi, Shield, Car, Users, 
  Phone, MessageSquare, ThumbsUp,
  Check, Camera
} from 'lucide-react'; // Removed unused imports: Mail, Calendar, X, ExternalLink
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Removed unused 'user'
  
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const propertyResponse = await propertiesAPI.getProperty(id);
        setProperty(propertyResponse.data.property);
        
        // Fetch reviews
        setReviewsLoading(true);
        const reviewsResponse = await reviewsAPI.getReviews(id);
        setReviews(reviewsResponse.data.reviews);
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Property not found');
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]);

  const parseAmenities = (amenitiesString) => {
    try {
      return JSON.parse(amenitiesString || '[]');
    } catch {
      return [];
    }
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'WiFi': <Wifi className="w-5 h-5" />,
      'Security': <Shield className="w-5 h-5" />,
      '24/7 Security': <Shield className="w-5 h-5" />,
      'Parking': <Car className="w-5 h-5" />,
      'Gym': <Users className="w-5 h-5" />,
      'Study Areas': <MessageSquare className="w-5 h-5" />,
      'Laundry': <Check className="w-5 h-5" />,
      'Dining Hall': <Users className="w-5 h-5" />
    };
    return iconMap[amenity] || <Check className="w-5 h-5" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/properties"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const amenities = parseAmenities(property.amenities);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-blue-600">Properties</Link>
          <span>/</span>
          <span className="text-gray-900">{property.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Property Images */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="h-96 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative">
                <Camera className="w-16 h-16 text-white opacity-50" />
                <span className="text-white text-xl font-semibold ml-4">Photos Coming Soon</span>
                <div className="absolute top-4 left-4 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {property.university.toUpperCase()}
                </div>
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                   {property.property_type}
                 </span>
  {property.nsfas_accredited && (
    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
      NSFAS
    </span>
  )}
</div>
              </div>
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.name}</h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{property.address}</span>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">About This Property</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities & Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-600">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-gray-700 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Student Reviews ({property.review_count})
                </h3>
                {isAuthenticated && (
                  <Link
                    to={`/properties/${id}/review`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Write a Review
                  </Link>
                )}
              </div>

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {review.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.author}</p>
                            <p className="text-sm text-gray-500">
                              {review.author_year} • {review.author_university?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded text-sm font-semibold ${getRatingColor(review.overall_rating)}`}>
                            {review.overall_rating}/5 ★
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{review.review_text}</p>
                      
                      {(review.pros || review.cons) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          {review.pros && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h5 className="font-medium text-green-800 mb-1">👍 Pros</h5>
                              <p className="text-green-700 text-sm">{review.pros}</p>
                            </div>
                          )}
                          {review.cons && (
                            <div className="bg-red-50 p-3 rounded-lg">
                              <h5 className="font-medium text-red-800 mb-1">👎 Cons</h5>
                              <p className="text-red-700 text-sm">{review.cons}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className={`font-medium ${review.recommend ? 'text-green-600' : 'text-red-600'}`}>
                            {review.recommend ? '✓ Recommends' : '✗ Doesn\'t Recommend'}
                          </span>
                        </div>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.helpful_count} helpful</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
                  <p className="text-gray-600 mb-4">
                    Be the first to share your experience living here!
                  </p>
                  {isAuthenticated && (
                    <Link
                      to={`/properties/${id}/review`}
                      className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Write the First Review
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Pricing Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  R{property.price_min.toLocaleString()} - R{property.price_max.toLocaleString()}
                </div>
                <div className="text-gray-600">per month</div>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center justify-center space-x-2 mb-6 p-4 bg-gray-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-gray-900">
                  {property.average_rating || 'New'}
                </span>
                <span className="text-gray-600">
                  ({property.review_count} reviews)
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-900">Contact Information</h4>
                <div className="space-y-3">
                  {property.contact_info && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{property.contact_info}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{property.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Get Contact Details
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  Save Property
                </button>
                {isAuthenticated && (
                  <Link
                    to={`/properties/${id}/review`}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center block"
                  >
                    Write a Review
                  </Link>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{property.review_count}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{amenities.length}</div>
                    <div className="text-sm text-gray-600">Amenities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Type Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Property Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium capitalize">{property.property_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">University</span>
                  <span className="font-medium">{property.university.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium">{formatDate(property.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;