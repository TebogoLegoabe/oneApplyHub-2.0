import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building, Star, MessageSquare, Calendar, ThumbsUp,
  FileText, ArrowRight, ShieldCheck, Shield, Award,
  Home, Map, LogOut, TrendingUp, Users, CheckCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { reviewsAPI } from '../services/api';
import { formatDate } from '../utils/format';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
  { to: '/properties', icon: Map, label: 'Browse Properties' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/bursaries', icon: Award, label: 'Opportunities Hub' },
  { to: '/application', icon: FileText, label: 'Apply' },
];

const STAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

const RatingTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <p className="font-bold">{payload[0].payload.label}</p>
      <p>{payload[0].value} review{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const PropertyTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl max-w-[200px]">
      <p className="font-bold leading-snug mb-1">{d.name}</p>
      <p>Avg rating: {d.avg_rating} ★</p>
      <p>{d.review_count} review{d.review_count !== 1 ? 's' : ''}</p>
    </div>
  );
};

const DashboardPage = () => {
  const { user, logout, sendVerificationCode } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewsAPI.getDashboardStats();
      setData(res.data);
      setError(null);
    } catch {
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSendVerification = async () => {
    setVerifyLoading(true);
    setVerifyMsg('');
    const result = await sendVerificationCode(user.email);
    setVerifyLoading(false);
    if (result.success) {
      navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
    } else {
      setVerifyMsg(result.error || 'Failed to send code.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'S';
  const axisColor = isDark ? '#6b7280' : '#9ca3af';
  const gridColor = isDark ? '#374151' : '#f3f4f6';

  const OVERVIEW = [
    {
      icon: Building,
      label: 'Total Properties',
      value: data?.overview.total_properties ?? 0,
      sub: 'Approved listings',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: MessageSquare,
      label: 'Total Reviews',
      value: data?.overview.total_reviews ?? 0,
      sub: 'Published reviews',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-500',
    },
    {
      icon: Star,
      label: 'Platform Avg Rating',
      value: data?.overview.avg_rating > 0 ? `${data.overview.avg_rating} ★` : 'N/A',
      sub: 'Out of 5.0',
      iconBg: 'bg-yellow-50 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-500',
    },
    {
      icon: ThumbsUp,
      label: 'Would Recommend',
      value: data?.overview.recommend_pct > 0 ? `${data.overview.recommend_pct}%` : 'N/A',
      sub: 'Of reviewers',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-gray-950 min-h-screen">

      {/* ══ SIDEBAR ══ */}
      <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col border-r border-white/5">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white font-black text-sm">{initials}</span>
              </div>
              {user?.verified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  <ShieldCheck className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          {user?.verified ? (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />Verified Student
            </div>
          ) : (
            <div>
              {verifyMsg && <p className="text-[10px] text-red-400 mb-1.5">{verifyMsg}</p>}
              <button
                onClick={handleSendVerification}
                disabled={verifyLoading}
                className="w-full text-[11px] font-semibold py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
              >
                {verifyLoading ? 'Sending…' : 'Verify Email'}
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 pb-2">Navigation</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
              </Link>
            );
          })}
          <div className="pt-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 pb-2">Account</p>
            <Link
              to="/mfa-setup"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all"
            >
              <div className="flex items-center gap-3"><Shield className="w-4 h-4" />Two-Factor Auth</div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                user?.mfa_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
              }`}>{user?.mfa_enabled ? 'On' : 'Off'}</span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />Log Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main className="flex-1 min-w-0 flex flex-col overflow-auto">

        {/* Top bar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Platform Overview</h1>
            <p className="text-xs text-gray-400 mt-0.5">Live community stats across all properties</p>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <button onClick={fetchData} className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1.5 rounded-lg">
                Retry
              </button>
            )}
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-indigo-500/20"
            >
              <MessageSquare className="w-3.5 h-3.5" />Write a Review
            </Link>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 space-y-6">

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* ── Overview cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {OVERVIEW.map(({ icon: Icon, label, value, sub, iconBg, iconColor }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {loading
                    ? <span className="inline-block w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    : value}
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Bar chart: Top properties by review count */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Most Reviewed Properties</h3>
              </div>

              {loading ? (
                <div className="h-52 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
              ) : !data?.top_properties?.length ? (
                <div className="h-52 flex flex-col items-center justify-center text-center">
                  <Building className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-400">No review data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={data.top_properties}
                    layout="vertical"
                    margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: axisColor, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      label={{ value: 'Reviews', position: 'insideBottom', offset: -2, fill: axisColor, fontSize: 10 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<PropertyTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                    <Bar dataKey="review_count" radius={[0, 6, 6, 0]} maxBarSize={20} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bar chart: Rating distribution */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Rating Distribution</h3>
              </div>

              {loading ? (
                <div className="h-52 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
              ) : !data?.rating_distribution?.some(d => d.count > 0) ? (
                <div className="h-52 flex flex-col items-center justify-center text-center">
                  <Star className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-400">No ratings yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={data.rating_distribution}
                    margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<RatingTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {data.rating_distribution.map((_, i) => (
                        <Cell key={i} fill={STAR_COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Legend */}
              {data?.rating_distribution && (
                <div className="flex justify-between mt-3 px-1">
                  {data.rating_distribution.map((d, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs font-black text-gray-700 dark:text-gray-200">{d.count}</div>
                      <div className="text-[10px] text-gray-400">{d.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Recent community reviews ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Community Reviews</h3>
              </div>
              <Link
                to="/reviews"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
            ) : !data?.recent_reviews?.length ? (
              <div className="py-16 flex flex-col items-center text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">No reviews yet</p>
                <p className="text-xs text-gray-400 mb-5 max-w-xs">
                  Be the first to share your accommodation experience with fellow students.
                </p>
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Browse Properties <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recent_reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        to={`/properties/${review.property_id}`}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 leading-snug line-clamp-1"
                      >
                        {review.property_name}
                      </Link>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-gray-700 dark:text-gray-200">
                          {review.overall_rating}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 mb-3">
                      {review.review_text}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.created_at)}
                      </div>
                      {review.recommend && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3" />Recommends
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── CTA ── */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Stayed at a student residence?</h3>
              <p className="text-sm text-indigo-200">Your review helps thousands of students make better accommodation decisions.</p>
            </div>
            <Link
              to="/properties"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />Write a Review
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
