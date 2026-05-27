import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, GraduationCap, Building, Star, MessageSquare,
  Eye, Calendar, ThumbsUp, FileText, ArrowRight, ShieldCheck,
  Shield, BookOpen, Sparkles, TrendingUp,
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

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 left-4 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* big avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/40 ring-2 ring-white/10">
                  <span className="text-white font-black text-2xl tracking-tight">{initials}</span>
                </div>
                {user?.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-0.5">Student Dashboard</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Welcome back, {firstName}!
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  {user?.year_of_study} · {user?.faculty || 'oneApplyHub Member'}
                </p>
              </div>
            </div>

            {/* mini stat strip in header */}
            <div className="flex items-center gap-3 sm:gap-4">
              {[
                { label: 'Reviews', value: userStats.reviewsCount },
                { label: 'Helpful', value: userStats.helpfulVotes },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 min-w-[72px]">
                  <p className="text-xl font-black text-white">{loading ? '·' : value}</p>
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                </div>
              ))}
              <div className="text-center bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/20 rounded-xl px-4 py-2.5 min-w-[72px]">
                <p className="text-xl font-black text-amber-300">
                  {loading ? '·' : userStats.avgRating > 0 ? userStats.avgRating : '0'}
                </p>
                <p className="text-xs text-amber-400/80 font-medium">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* bottom fade */}
        <div className="h-6 bg-gradient-to-b from-transparent to-slate-50 dark:to-gray-950" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {error && (
          <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            <button onClick={fetchUserData} className="text-red-600 hover:text-red-700 font-semibold text-sm ml-4">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
              {/* card top accent */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white font-black text-lg">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{user?.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.year_of_study} · {user?.faculty}</p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-4">
                  {[
                    { Icon: Mail, text: user?.email, truncate: true },
                    { Icon: Building, text: getUniversityName(user?.email) },
                    { Icon: GraduationCap, text: `${user?.year_of_study} Student` },
                  ].map(({ Icon, text, truncate }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <span className={truncate ? 'truncate' : ''}>{text}</span>
                    </div>
                  ))}
                </div>

                {user?.verified ? (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-xl px-3 py-2.5">
                    <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-800/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Verified Student</p>
                      <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Email confirmed</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-100 dark:bg-amber-800/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Email Not Verified</p>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                      Verify your email to write reviews and access all features.
                    </p>
                    {verifyMsg && <p className="text-xs text-red-600 dark:text-red-400">{verifyMsg}</p>}
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

            {/* Security Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Two-Factor Auth</span>
                  </div>
                  {user?.mfa_enabled ? (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Active</span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">Off</span>
                  )}
                </div>
                <Link
                  to="/mfa-setup"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:border-indigo-600 transition-all duration-200"
                >
                  {user?.mfa_enabled ? 'Manage MFA' : 'Enable MFA'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: MessageSquare,
                  value: userStats.reviewsCount,
                  label: 'Reviews Written',
                  gradient: 'from-blue-600 to-indigo-600',
                  bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
                  border: 'border-blue-100 dark:border-blue-800/40',
                  valueColor: 'text-blue-700 dark:text-blue-300',
                  labelColor: 'text-blue-500 dark:text-blue-400',
                  iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
                },
                {
                  icon: Star,
                  value: userStats.avgRating > 0 ? userStats.avgRating : '0',
                  label: 'Avg Rating Given',
                  gradient: 'from-amber-500 to-orange-500',
                  bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
                  border: 'border-amber-100 dark:border-amber-800/40',
                  valueColor: 'text-amber-600 dark:text-amber-300',
                  labelColor: 'text-amber-500 dark:text-amber-400',
                  iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
                },
                {
                  icon: ThumbsUp,
                  value: userStats.helpfulVotes,
                  label: 'Helpful Votes',
                  gradient: 'from-emerald-500 to-teal-500',
                  bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
                  border: 'border-emerald-100 dark:border-emerald-800/40',
                  valueColor: 'text-emerald-700 dark:text-emerald-300',
                  labelColor: 'text-emerald-500 dark:text-emerald-400',
                  iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
                },
              ].map(({ icon: Icon, value, label, bg, border, valueColor, labelColor, iconBg }) => (
                <div key={label} className={`${bg} border ${border} rounded-2xl p-4 flex flex-col gap-3`}>
                  <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-2xl font-black leading-none ${valueColor}`}>
                      {loading ? <span className="inline-block w-8 h-6 bg-current opacity-20 rounded animate-pulse" /> : value}
                    </p>
                    <p className={`text-[11px] font-semibold mt-1 ${labelColor}`}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    to="/properties"
                    className="group flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md shadow-blue-900/20 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-xs text-center">Browse Properties</span>
                  </Link>
                  <Link
                    to="/reviews"
                    className="group flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl hover:from-violet-700 hover:to-purple-800 transition-all duration-200 shadow-md shadow-violet-900/20 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-xs text-center">My Reviews</span>
                  </Link>
                  <Link
                    to="/application"
                    className="group flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl hover:from-emerald-700 hover:to-teal-800 transition-all duration-200 shadow-md shadow-emerald-900/20 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-xs text-center">Apply Now</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Your Recent Reviews</h3>
                  </div>
                  {recentReviews.length > 0 && (
                    <Link to="/reviews" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                    ))}
                  </div>
                ) : userStats.reviewsCount === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
                      <MessageSquare className="w-7 h-7 text-indigo-400 dark:text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No reviews yet</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
                      Share your accommodation experience to help fellow students find their perfect home.
                    </p>
                    <Link
                      to="/properties"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-900/20"
                    >
                      Write Your First Review
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="group border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            to={`/properties/${review.property_id}`}
                            className="font-bold text-indigo-600 hover:text-indigo-700 text-sm"
                          >
                            {review.property_name}
                          </Link>
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg flex-shrink-0">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className={`text-xs font-bold ${getRatingColor(review.overall_rating)}`}>
                              {review.overall_rating}/5
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mb-2.5 leading-relaxed">{review.review_text}</p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400">
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
    </div>
  );
};

export default DashboardPage;
