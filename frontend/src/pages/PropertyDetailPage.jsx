import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Star, Phone, MessageSquare, ThumbsUp, Camera, Globe, ExternalLink,
} from 'lucide-react';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { parseAmenities, renderAmenityIcon } from '../constants/amenities';
import { formatDate, getRatingBadge } from '../utils/format';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCopyContact = () => {
    const text = [property.contact_info, property.address].filter(Boolean).join(' | ');
    navigator.clipboard.writeText(text).then(
      () => showToast('Contact details copied to clipboard!'),
      () => showToast('Could not copy. Please copy manually above.'),
    );
  };

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const propertyResponse = await propertiesAPI.getProperty(id);
        setProperty(propertyResponse.data.property);

        setReviewsLoading(true);
        const reviewsResponse = await reviewsAPI.getReviews(id);
        setReviews(reviewsResponse.data.reviews);
      } catch {
        setError('Property not found');
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };
    fetchPropertyData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-56 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            </div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Property Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/properties"
            className="bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors font-semibold"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const amenities = parseAmenities(property.amenities);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-brand-600 transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{property.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-brand-600 hover:text-brand-700 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero Image */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="aspect-[16/9] relative">
                {property.images?.length ? (
                  <img
                    src={property.images[Math.min(activeImageIndex, property.images.length - 1)].image_url}
                    alt={property.images[Math.min(activeImageIndex, property.images.length - 1)].caption || property.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-white/40" />
                    <span className="text-white/80 text-xl font-semibold ml-4">Photos Coming Soon</span>
                  </div>
                )}
                <div className="absolute top-5 left-5 flex gap-2">
                  <span className="bg-white text-brand-700 px-3 py-1.5 rounded-full text-sm font-bold">
                    {property.university.toUpperCase()}
                  </span>
                  {property.nsfas_accredited && (
                    <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      NSFAS
                    </span>
                  )}
                </div>
                <div className="absolute top-5 right-5">
                  <span className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-semibold capitalize">
                    {property.property_type}
                  </span>
                </div>
              </div>
              {property.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {property.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${i === activeImageIndex ? 'border-brand-600' : 'border-transparent hover:border-brand-300'}`}
                    >
                      <img src={img.image_url} alt={img.caption || property.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{property.name}</h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-brand-500" />
                <span className="text-sm">{property.address}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">About This Property</h3>

              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="text-brand-600 flex-shrink-0">{renderAmenityIcon(amenity, 'w-5 h-5')}</div>
                      <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Student Reviews ({property.review_count})
                </h3>
                {isAuthenticated && (
                  <Link
                    to={`/properties/${id}/review`}
                    className="bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors font-semibold text-sm"
                  >
                    Write a Review
                  </Link>
                )}
              </div>

              {reviewsLoading ? (
                <div className="space-y-6 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {review.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.author}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {review.author_year} &bull; {review.author_university?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${getRatingBadge(review.overall_rating)}`}>
                            {review.overall_rating}/5 ★
                          </span>
                          <span className="text-sm text-gray-400 hidden sm:block">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{review.review_text}</p>

                      {(review.pros || review.cons) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {review.pros && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                              <h5 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1 text-sm">👍 Pros</h5>
                              <p className="text-emerald-700 dark:text-emerald-400 text-sm">{review.pros}</p>
                            </div>
                          )}
                          {review.cons && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                              <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1 text-sm">👎 Cons</h5>
                              <p className="text-red-700 dark:text-red-400 text-sm">{review.cons}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${review.recommend ? 'text-emerald-600' : 'text-red-500'}`}>
                          {review.recommend ? '✓ Recommends' : "✗ Doesn't Recommend"}
                        </span>
                        <button className="flex items-center space-x-1.5 text-gray-400 hover:text-brand-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.helpful_count} helpful</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reviews yet</h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-5">Be the first to share your experience living here!</p>
                  {isAuthenticated && (
                    <Link
                      to={`/properties/${id}/review`}
                      className="inline-flex items-center bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors font-semibold text-sm"
                    >
                      Write the First Review
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">

              {/* Pricing Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-brand-600 mb-1">
                    R{property.price_min.toLocaleString()} to R{property.price_max.toLocaleString()}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">per month</div>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {property.average_rating || 'New'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">({property.review_count} reviews)</span>
                </div>

                {(property.contact_info || property.address) && (
                  <div className="mb-5">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Contact Information</h4>
                    <div className="space-y-2.5">
                      {property.contact_info && (
                        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{property.contact_info}</span>
                        </div>
                      )}
                      {property.website && (
                        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                          <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <a
                            href={property.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 truncate"
                          >
                            {property.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                          </a>
                        </div>
                      )}
                      <div className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{property.address}</span>
                      </div>
                    </div>
                  </div>
                )}

                {toast && (
                  <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-3 py-2 rounded-xl text-center">
                    {toast}
                  </div>
                )}

                <div className="space-y-3">
                  {property.website && (
                    <a
                      href={property.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3 px-4 rounded-xl hover:bg-brand-700 transition-colors font-semibold text-sm"
                    >
                      Visit Official Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={handleCopyContact}
                    className="w-full border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold text-sm"
                  >
                    Copy Contact Details
                  </button>
                  <button
                    onClick={() => showToast('Save feature coming soon!')}
                    className="w-full border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold text-sm"
                  >
                    Save Property
                  </button>
                  {isAuthenticated && (
                    <Link
                      to={`/properties/${id}/review`}
                      className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-sm text-center block"
                    >
                      Write a Review
                    </Link>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{property.review_count}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reviews</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{amenities.length}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Amenities</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Property Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Property Type</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{property.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">University</span>
                    <span className="font-medium text-gray-900 dark:text-white">{property.university.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Listed</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(property.created_at)}</span>
                  </div>
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
