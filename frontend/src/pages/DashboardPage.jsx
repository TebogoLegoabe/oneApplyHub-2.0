import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, GraduationCap, Building, Star, MessageSquare,
  Plus, Eye, Calendar, ThumbsUp, FileText, ArrowRight, ShieldCheck, Shield,
} from 'lucide-react';
import { reviewsAPI } from '../services/api';
import { formatDate, getRatingColor, getUniversityName } from '../utils/format';

const DashboardPage = () => {
  const { user, sendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({ reviewsCount: 0, avgRating: 0, helpfulVotes: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getUserStats();
      setUserStats(response.data.stats);
      setRecentReviews(response.data.recent_reviews || []);
      setError(null);
    } catch {
      setError('Unable to load your dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSendVerification = async () => {
    setVerifyLoading(true);
    setVerifyMsg('');
    const result = await sendVerificationCode(user.email);
    setVerifyLoading(false);
    if (result.success) {
      navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
    } else {
      setVerifyMsg(result.error || 'Failed to send code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-slate-300 text-xs mt-0.5">
                Review accommodations and help fellow students find the best places to stay.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={fetchUserData} className="text-red-600 hover:text-red-700 font-semibold text-sm ml-4">
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-5 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.year_of_study} &middot; {user?.faculty}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 space-y-2.5">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Building className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span>{getUniversityName(user?.email)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <GraduationCap className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span>{user?.year_of_study} Student</span>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-3">
                {user?.verified ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">Verified Student</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 space-y-2">
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold">Email Not Verified</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Verify your university email to write reviews and access all features.
                      Check your inbox for the code or request a new one.
                    </p>
                    {verifyMsg && <p className="text-xs text-red-600 dark:text-red-400">{verifyMsg}</p>}
                    <button
                      onClick={handleSendVerification}
                      disabled={verifyLoading}
                      className="w-full flex items-center justify-center gap-2 mt-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {verifyLoading ? 'Sending…' : 'Send Verification Code'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Security card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-5 py-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Two-Factor Auth</span>
                </div>
                {user?.mfa_enabled ? (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700">Active</span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">Not set up</span>
                )}
              </div>
              <Link
                to="/mfa-setup"
                className="mt-3 block text-center text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {user?.mfa_enabled ? 'Manage MFA' : 'Enable MFA'} →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', value: userStats.reviewsCount, label: 'Reviews Written' },
                { icon: Star, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', value: userStats.avgRating > 0 ? userStats.avgRating : '—', label: 'Avg Rating Given' },
                { icon: ThumbsUp, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', value: userStats.helpfulVotes, label: 'Helpful Votes' },
              ].map(({ icon: Icon, iconBg, iconColor, value, label }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{loading ? '—' : value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to="/properties"
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  <Eye className="w-4 h-4 mr-2" /> Browse Properties
                </Link>
                <Link
                  to="/reviews"
                  className="flex items-center justify-center px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> My Reviews
                </Link>
                <Link
                  to="/application"
                  className="flex items-center justify-center px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" /> Apply Now
                </Link>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Your Recent Reviews</h3>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-14 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : userStats.reviewsCount === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">No reviews yet</h4>
                  <p className="text-sm text-gray-500 mb-5">Share your experience to help fellow students!</p>
                  <Link
                    to="/properties"
                    className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 group"
                  >
                    Write Your First Review
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          to={`/properties/${review.property_id}`}
                          className="font-semibold text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {review.property_name}
                        </Link>
                        <span className={`text-sm font-bold ${getRatingColor(review.overall_rating)}`}>
                          {review.overall_rating}/5
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">{review.review_text}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> {formatDate(review.created_at)}
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="w-3 h-3 mr-1" /> {review.helpful_count} helpful
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentReviews.length > 0 && (
                    <Link
                      to="/reviews"
                      className="block text-center text-sm text-blue-600 hover:text-blue-700 font-semibold pt-2"
                    >
                      View all reviews
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
