import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, GraduationCap, Building, Star, MessageSquare, Plus, Eye } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    reviewsCount: 0,
    avgRating: 0,
    helpfulVotes: 0
  });

  useEffect(() => {
    // In the future, we'll fetch user's review stats from API
    // For now, we'll use dummy data
    setUserStats({
      reviewsCount: 0,
      avgRating: 0,
      helpfulVotes: 0
    });
  }, []);

  const getUniversityName = (email) => {
    if (email.includes('wits')) return 'University of the Witwatersrand';
    if (email.includes('uj')) return 'University of Johannesburg';
    return 'University';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
           To be updated :)
          </p>
        </div>

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
                        <p className="text-2xl font-semibold text-gray-900">{userStats.reviewsCount}</p>
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
                          {userStats.avgRating > 0 ? `${userStats.avgRating.toFixed(1)} ★` : 'No reviews yet'}
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                {userStats.reviewsCount === 0 ? (
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
                    {/* We'll add recent reviews here later */}
                    <p className="text-gray-500">Your recent reviews will appear here.</p>
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