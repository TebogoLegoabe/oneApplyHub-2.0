import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, GraduationCap, Building, Star, MessageSquare, Plus, Eye, Calendar, ThumbsUp } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    reviewsCount: 0,
    avgRating: 0,
    helpfulVotes: 0
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's review data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your dashboard');
        return;
      }

      const response = await fetch('http://localhost:5000/api/reviews/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch review data');
      }

      const data = await response.json();
      
      setUserStats(data.stats);
      setRecentReviews(data.recent_reviews || []);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const getUniversityName = (email) => {
    if (email.includes('wits')) return 'University of the Witwatersrand';
    if (email.includes('uj')) return 'University of Johannesburg';
    return 'University';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
           Review your accommodation and help fellow students find the best places to stay!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 sm:mx-0 mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={fetchUserData}
              className="mt-2 text-red-600 hover:text-red-700 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                      <p className="text-sm text-gray-500">{user?.year_of_study} • {user?.faculty}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {user?.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      {getUniversityName(user?.email || '')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {user?.year_of_study} Student
                    </div>
                  </div>

                  {user?.verified ? (
                    <div className="mt-4 px-3 py-2 bg-green-100 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800 font-medium">✓ Verified Student</p>
                    </div>
                  ) : (
                    <div className="mt-4 px-3 py-2 bg-yellow-100 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">⏳ Verification Pending</p>
                      <p className="text-xs text-yellow-700 mt-1">Check your email for verification link</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Stats Cards */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 truncate">Reviews Written</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {loading ? '...' : userStats.reviewsCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Star className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 truncate">Average Rating Given</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {loading ? '...' : 
                           userStats.avgRating > 0 ? `${userStats.avgRating} ★` : 'No reviews yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Helpful Votes Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg sm:col-span-2">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ThumbsUp className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 truncate">Total Helpful Votes Received</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {loading ? '...' : userStats.helpfulVotes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="sm:col-span-2">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Link
                          to="/properties"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Browse Properties
                        </Link>
                        <Link
                          to="/properties"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Write a Review
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ) : userStats.reviewsCount === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
                    <p className="text-gray-500 mb-4">
                      Help fellow students by sharing your accommodation experience!
                    </p>
                    <Link
                      to="/properties"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Write Your First Review
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Link
                                to={`/properties/${review.property_id}`}
                                className="font-medium text-blue-600 hover:text-blue-700"
                              >
                                {review.property_name}
                              </Link>
                              <span className={`text-sm font-semibold ${getRatingColor(review.overall_rating)}`}>
                                {review.overall_rating}/5 ★
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{review.review_text}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(review.created_at)}
                              </div>
                              <div className="flex items-center">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {review.helpful_count} helpful
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {recentReviews.length > 0 && (
                      <div className="text-center pt-4">
                        <Link
                          to="/reviews"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View all your reviews →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;