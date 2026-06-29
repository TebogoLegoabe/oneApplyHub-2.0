import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  Building, Star, MessageSquare, Calendar, ThumbsUp,
  FileText, ArrowRight, TrendingUp, Users, CheckCircle,
  Award, Search, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { reviewsAPI } from '../services/api';
import { formatDate } from '../utils/format';

const STAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

const RatingTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-950 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-white/10">
      <p className="font-bold">{payload[0].payload.label}</p>
      <p>{payload[0].value} review{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const PropertyTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-950 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-white/10 max-w-[220px]">
      <p className="font-bold leading-snug mb-1">{d.name}</p>
      <p>Average rating: {d.avg_rating} ★</p>
      <p>{d.review_count} review{d.review_count !== 1 ? 's' : ''}</p>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, tone, loading }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
          {loading ? <span className="inline-block h-7 w-14 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" /> : value}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, description }) => (
  <Link
    to={to}
    className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-950 dark:text-white">{title}</h3>
        <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-blue-500" />
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const overview = data?.overview || {};
  const hasRatingData = data?.rating_distribution?.some((d) => d.count > 0);

  const stats = [
    {
      icon: Building,
      label: 'Properties',
      value: overview.total_properties ?? 0,
      sub: 'Approved listings',
      tone: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    },
    {
      icon: MessageSquare,
      label: 'Reviews',
      value: overview.total_reviews ?? 0,
      sub: 'Published reviews',
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    },
    {
      icon: Star,
      label: 'Average rating',
      value: overview.avg_rating > 0 ? `${overview.avg_rating} ★` : 'N/A',
      sub: 'Platform average',
      tone: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-300',
    },
    {
      icon: ThumbsUp,
      label: 'Recommend',
      value: overview.recommend_pct > 0 ? `${overview.recommend_pct}%` : 'N/A',
      sub: 'Of reviewers',
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5" />
                {today}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Review platform activity, track accommodation insights, and continue your next steps from one workspace.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[35rem]">
              <QuickAction
                to="/properties"
                icon={Search}
                title="Find a place"
                description="Browse listings"
              />
              <QuickAction
                to="/application"
                icon={FileText}
                title="Application"
                description="Track progress"
              />
              <QuickAction
                to="/bursaries"
                icon={Award}
                title="Opportunities"
                description="View options"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            <button onClick={fetchData} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} loading={loading} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">Most reviewed properties</h3>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Properties with the highest student feedback volume.</p>
              </div>
              <Link to="/properties" className="hidden rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:inline-flex">
                Browse
              </Link>
            </div>

            {loading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ) : !data?.top_properties?.length ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <Building className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No review data yet</p>
                <p className="mt-1 text-xs text-slate-400">Insights will appear once reviews are approved.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.top_properties} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: axisColor, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<PropertyTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }} />
                  <Bar dataKey="review_count" radius={[0, 8, 8, 0]} maxBarSize={22} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Rating distribution</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Breakdown of approved review scores.</p>
              </div>
            </div>

            {loading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ) : !hasRatingData ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <Star className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No ratings yet</p>
                <p className="mt-1 text-xs text-slate-400">Rating stats will appear after reviews are approved.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.rating_distribution} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<RatingTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={44}>
                    {data.rating_distribution.map((_, i) => <Cell key={i} fill={STAR_COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Recent reviews</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Latest approved feedback from students.</p>
              </div>
            </div>
            <Link to="/reviews" className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
            </div>
          ) : !data?.recent_reviews?.length ? (
            <div className="flex flex-col items-center py-14 text-center">
              <MessageSquare className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
              <p className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-200">No reviews yet</p>
              <p className="mb-5 max-w-xs text-xs text-slate-400">
                Be the first to share your accommodation experience with fellow students.
              </p>
              <Link to="/properties" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                Browse Properties <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.recent_reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-100 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:hover:border-blue-900">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <Link to={`/properties/${review.property_id}`} className="line-clamp-1 text-sm font-bold leading-snug text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      {review.property_name}
                    </Link>
                    <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 dark:bg-amber-500/10">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{review.overall_rating}</span>
                    </div>
                  </div>
                  <p className="mb-4 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {review.review_text}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />{formatDate(review.created_at)}
                    </div>
                    {review.recommend && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3" />Recommends
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold">Share your accommodation experience</h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-300">
                Your review helps other students make better accommodation decisions.
              </p>
            </div>
            <Link to="/properties" className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-slate-100">
              <FileText className="h-4 w-4" />Write a Review
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
