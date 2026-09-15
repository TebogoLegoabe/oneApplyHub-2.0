import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building, Star, MessageSquare, CalendarDays, ThumbsUp, FileText, ArrowRight,
  TrendingUp, Users, CheckCircle2, Clock, Home, Award,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { reviewsAPI } from '../services/api';
import { formatDate } from '../utils/format';
import { Alert, Button, Card, CardHeader, EmptyState, Skeleton } from '../components/ui';
import { cn } from '../utils/cn';

const STAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

const ChartTooltip = ({ active, payload, render }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="max-w-[220px] rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white shadow-xl">
      {render(payload[0])}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, tone, loading }) => (
  <Card padded={false} className="p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          {loading ? <Skeleton className="inline-block h-7 w-16" /> : value}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{sub}</p>
      </div>
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
  </Card>
);

const QUICK_LINKS = [
  { to: '/properties', icon: Home, label: 'Browse properties', text: 'Compare verified accommodation.' },
  { to: '/application', icon: FileText, label: 'My application', text: 'Start or track your application.' },
  { to: '/bursaries', icon: Award, label: 'Opportunities', text: 'Bursaries closing soon.' },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getDashboardStats();
      setData(response.data);
      setError(null);
    } catch {
      setError('We could not load your dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const cursorFill = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)';
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const overview = data?.overview || {};
  const hasRatingData = data?.rating_distribution?.some((item) => item.count > 0);

  const stats = [
    { icon: Building, label: 'Properties', value: overview.total_properties ?? 0, sub: 'Approved listings', tone: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300' },
    { icon: MessageSquare, label: 'Reviews', value: overview.total_reviews ?? 0, sub: 'Published reviews', tone: 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-300' },
    { icon: Star, label: 'Average rating', value: overview.avg_rating > 0 ? `${overview.avg_rating} / 5` : '—', sub: 'Platform average', tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' },
    { icon: ThumbsUp, label: 'Recommend', value: overview.recommend_pct > 0 ? `${overview.recommend_pct}%` : '—', sub: 'Of reviewers', tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <Card className="mb-4" padded={false}>
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">Welcome back, {firstName}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track accommodation insights, reviews, and your next steps.</p>
          </div>
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="whitespace-nowrap">{today}</span>
          </p>
        </div>
      </Card>

      {error && (
        <Alert tone="error" className="mb-4" action={<Button size="sm" variant="danger" onClick={fetchData}>Retry</Button>}>{error}</Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} loading={loading} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {QUICK_LINKS.map(({ to, icon: Icon, label, text }) => (
          <Link key={to} to={to} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-950 dark:text-white">{label}</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{text}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600 dark:text-slate-600" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3" padded={false}>
          <div className="p-5">
            <CardHeader
              icon={TrendingUp}
              title="Most reviewed properties"
              description="Properties with the highest feedback volume."
              action={<Button to="/properties" variant="ghost" size="sm" className="hidden sm:inline-flex">Browse</Button>}
              className="mb-4"
            />
            {loading ? (
              <Skeleton className="h-60" />
            ) : !data?.top_properties?.length ? (
              <EmptyState compact icon={Building} title="No review data yet" description="Insights will appear once reviews are approved." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.top_properties} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: axisColor, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: cursorFill }}
                    content={<ChartTooltip render={({ payload }) => (
                      <>
                        <p className="mb-1 font-semibold leading-snug">{payload.name}</p>
                        <p>Average rating: {payload.avg_rating} ★</p>
                        <p>{payload.review_count} review{payload.review_count !== 1 ? 's' : ''}</p>
                      </>
                    )} />}
                  />
                  <Bar dataKey="review_count" radius={[0, 8, 8, 0]} maxBarSize={20} fill="#2f5c58" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-2" padded={false}>
          <div className="p-5">
            <CardHeader icon={Star} title="Rating distribution" description="Approved review scores." className="mb-4" />
            {loading ? (
              <Skeleton className="h-60" />
            ) : !hasRatingData ? (
              <EmptyState compact icon={Star} title="No ratings yet" description="Rating stats will appear after reviews are approved." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.rating_distribution} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: cursorFill }}
                    content={<ChartTooltip render={({ payload, value }) => (
                      <>
                        <p className="font-semibold">{payload.label}</p>
                        <p>{value} review{value !== 1 ? 's' : ''}</p>
                      </>
                    )} />}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={40}>
                    {data.rating_distribution.map((_, index) => <Cell key={index} fill={STAR_COLORS[index]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden" padded={false}>
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <CardHeader
            icon={Users}
            title="Recent reviews"
            description="Latest approved feedback from students."
            action={<Button to="/reviews" variant="ghost" size="sm">See all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Button>}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-32" />)}
          </div>
        ) : !data?.recent_reviews?.length ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews yet"
            description="Be the first to share your accommodation experience."
            action={<Button to="/properties" size="sm">Browse properties <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.recent_reviews.map((review) => (
              <article key={review.id} className="flex flex-col rounded-2xl border border-slate-100 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-slate-800 dark:hover:border-brand-900">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <Link to={`/properties/${review.property_id}`} className="line-clamp-1 text-sm font-semibold leading-snug text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300">
                    {review.property_name}
                  </Link>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-50 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-gold-500/10 dark:text-slate-200">
                    <Star className="h-3 w-3 fill-gold-500 text-gold-500" aria-hidden="true" />{review.overall_rating}
                  </span>
                </div>
                <p className="mb-4 line-clamp-3 flex-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{review.review_text}</p>
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <CalendarDays className="h-3 w-3" aria-hidden="true" />{formatDate(review.created_at)}
                  </span>
                  {review.recommend && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />Recommends
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-4 rounded-2xl bg-slate-950 p-5 text-white shadow-card dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-bold">Share your accommodation experience</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">Your review helps other students make better accommodation decisions.</p>
          </div>
          <Button to="/properties" variant="inverse" className="shrink-0">
            <FileText className="h-4 w-4" aria-hidden="true" />Write a review
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
