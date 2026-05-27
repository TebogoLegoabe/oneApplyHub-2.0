import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, GraduationCap, Building, Star, MessageSquare,
  Eye, Calendar, ThumbsUp, FileText, ArrowRight,
  ShieldCheck, Shield, BookOpen, TrendingUp, ChevronRight,
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
      setError('Unable to load dashboard data. Please try again.');
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

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'S';

  const STATS = [
    {
      icon: MessageSquare,
      value: userStats.reviewsCount,
      label: 'Reviews Written',
      iconClass: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
      valueClass: 'text-gray-900 dark:text-white',
    },
    {
      icon: Star,
      value: userStats.avgRating > 0 ? `${userStats.avgRating}` : '0',
      label: 'Avg Rating',
      iconClass: 'text-amber-500',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      valueClass: 'text-gray-900 dark:text-white',
    },
    {
      icon: ThumbsUp,
      value: userStats.helpfulVotes,
      label: 'Helpful Votes',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      valueClass: 'text-gray-900 dark:text-white',
    },
  ];

  const ACTIONS = [
    { to: '/properties', icon: Eye, label: 'Browse Properties', description: 'Explore student accommodation' },
    { to: '/reviews', icon: BookOpen, label: 'My Reviews', description: 'View your submitted reviews' },
    { to: '/application', icon: FileText, label: 'Apply Now', description: 'Submit a student application' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl tracking-tight">{initials}</span>
              </div>
              {user?.verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  <ShieldCheck className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-0.5">My Dashboard</p>
              <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{user?.year_of_study} · {user?.faculty || 'oneApplyHub'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {error && (
          <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            <button onClick={fetchUserData} className="text-red-600 font-semibold text-sm ml-4">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="space-y-4">

            {/* Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.year_of_study} · {user?.faculty}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 space-y-3">
                {[
                  { Icon: Mail, text: user?.email, truncate: true },
                  { Icon: Building, text: getUniversityName(user?.email) },
                  { Icon: GraduationCap, text: `${user?.year_of_study} Student` },
                ].map(({ Icon, text, truncate }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className={truncate ? 'truncate' : ''}>{text}</span>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-4 pt-2">
                {user?.verified ? (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl px-3 py-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Verified Student</p>
                      <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500">Email confirmed</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-3 space-y-2.5">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Email Not Verified</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                      Verify your email to write reviews and unlock all features.
                    </p>
                    {verifyMsg && <p className="text-xs text-red-600">{verifyMsg}</p>}
                    <button
                      onClick={handleSendVerification}
                      disabled={verifyLoading}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      {verifyLoading ? 'Sending…' : 'Send Verification Code'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-800 dark:text-white">Two-Factor Auth</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  user?.mfa_enabled
                    ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30'
                    : 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
                }`}>
                  {user?.mfa_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <Link
                to="/mfa-setup"
                className="flex items-center justify-between w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                {user?.mfa_enabled ? 'Manage settings' : 'Set up now for extra security'}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {STATS.map(({ icon: Icon, value, label, iconClass, iconBg, valueClass }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${iconClass}`} />
                  </div>
                  <p className={`text-2xl font-black ${valueClass}`}>
                    {loading
                      ? <span className="inline-block w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      : value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {ACTIONS.map(({ to, icon: Icon, label, description }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                        <p className="text-xs text-gray-400">{description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Reviews</h3>
                </div>
                {recentReviews.length > 0 && (
                  <Link to="/reviews" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="p-5 space-y-3 animate-pulse">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                  ))}
                </div>
              ) : userStats.reviewsCount === 0 ? (
                <div className="px-5 py-12 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">No reviews yet</p>
                  <p className="text-xs text-gray-400 mb-4 max-w-xs leading-relaxed">
                    Help fellow students by sharing your accommodation experience.
                  </p>
                  <Link
                    to="/properties"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Write Your First Review
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-start justify-between mb-1.5">
                        <Link
                          to={`/properties/${review.property_id}`}
                          className="font-semibold text-indigo-600 hover:text-indigo-700 text-sm"
                        >
                          {review.property_name}
                        </Link>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className={`text-xs font-bold ${getRatingColor(review.overall_rating)}`}>
                            {review.overall_rating}/5
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-2 leading-relaxed">{review.review_text}</p>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(review.created_at)}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{review.helpful_count} helpful</span>
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
