import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, GraduationCap, Building, Star, MessageSquare,
  Plus, Eye, Calendar, ThumbsUp, FileText, ArrowRight,
  ShieldCheck, Shield, CheckCircle, AlertTriangle,
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

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

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

  const initial = user?.name?.charAt(0)?.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Page Header ── */}
      <div className="bg-[#070d1a] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 text-white font-black text-xl">
              {initial}
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-0.5">Dashboard</p>
              <h1 className="text-2xl font-black text-white leading-tight">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button onClick={fetchUserData} className="text-red-600 font-semibold text-sm ml-4 hover:text-red-700">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="space-y-4">

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.year_of_study} · {user?.faculty}</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { icon: Mail,         value: user?.email,                   muted: true },
                  { icon: Building,     value: getUniversityName(user?.email) },
                  { icon: GraduationCap,value: `${user?.year_of_study} Student` },
                ].map(({ icon: Icon, value }) => (
                  <div key={value} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Icon className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    <span className="truncate">{value}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                {user?.verified ? (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Verified Student</span>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Email Not Verified</span>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                      Verify your university email to write reviews and access all features.
                    </p>
                    {verifyMsg && <p className="text-xs text-red-600">{verifyMsg}</p>}
                    <button
                      onClick={handleSendVerification}
                      disabled={verifyLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {verifyLoading ? 'Sending…' : 'Send Verification Code'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Two-Factor Auth</span>
                </div>
                {user?.mfa_enabled ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">Off</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                {user?.mfa_enabled ? 'Your account is protected with an authenticator app.' : 'Add an extra layer of security to your account.'}
              </p>
              <Link to="/mfa-setup"
                className="flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 group transition-colors">
                {user?.mfa_enabled ? 'Manage 2FA' : 'Enable 2FA'}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, value: userStats.reviewsCount, label: 'Reviews',       color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20'   },
                { icon: Star,          value: userStats.avgRating > 0 ? userStats.avgRating : '—', label: 'Avg Rating', color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { icon: ThumbsUp,      value: userStats.helpfulVotes, label: 'Helpful Votes', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              ].map(({ icon: Icon, value, label, color, bg }) => (
                <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-0.5">
                      {loading ? <span className="inline-block w-8 h-6 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" /> : value}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link to="/properties"
                  className="flex items-center gap-3 px-4 py-3.5 bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-600 text-white dark:text-slate-900 dark:hover:text-white rounded-xl font-semibold text-sm transition-all group">
                  <Eye className="w-4 h-4" />
                  <span>Browse</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
                <Link to="/reviews"
                  className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm transition-all group border border-gray-100 dark:border-gray-700">
                  <Plus className="w-4 h-4" />
                  <span>My Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
                <Link to="/application"
                  className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm transition-all group border border-gray-100 dark:border-gray-700">
                  <FileText className="w-4 h-4" />
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Your Recent Reviews</h3>
                {recentReviews.length > 0 && (
                  <Link to="/reviews" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">View all</Link>
                )}
              </div>

              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-2">
                      <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : userStats.reviewsCount === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <MessageSquare className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No reviews yet</p>
                  <p className="text-xs text-gray-400 mb-5">Share your experience to help fellow students find the best accommodation.</p>
                  <Link to="/properties"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 group">
                    Write Your First Review
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div key={review.id}
                      className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <Link to={`/properties/${review.property_id}`}
                          className="font-semibold text-blue-600 hover:text-blue-700 text-sm leading-snug">
                          {review.property_name}
                        </Link>
                        <span className={`text-xs font-bold flex-shrink-0 ${getRatingColor(review.overall_rating)}`}>
                          {review.overall_rating}/5
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed">
                        {review.review_text}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(review.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> {review.helpful_count} helpful
                        </span>
                      </div>
                    </div>
                  ))}
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
