import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, ExternalLink, Briefcase, Clock, MapPin, DollarSign,
  AlertCircle, Building, Loader2, ChevronDown, ChevronUp, Calendar,
  ArrowRight, CheckCircle, FileText, Zap, Award,
} from 'lucide-react';
import { opportunitiesAPI } from '../services/api';

const OPPORTUNITY_TYPE_FILTERS = [
  { value: 'all', label: 'All types', icon: Briefcase },
  { value: 'internship', label: 'Internships', icon: Zap },
  { value: 'graduate', label: 'Graduate programs', icon: Award },
];

const daysUntil = (dateStr) => {
  const d = new Date(dateStr);
  return Math.ceil((d - new Date()) / 864e5);
};

const OpportunityCard = ({ opportunity }) => {
  const [expanded, setExpanded] = useState(false);
  const days = daysUntil(opportunity.deadline);
  const isUrgent = days <= 30 && days > 0;
  const expired = days <= 0;
  const typeLabel = opportunity.opportunity_type === 'internship' ? 'Internship' : 'Graduate Program';
  const typeColor = opportunity.opportunity_type === 'internship'
    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
    : 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800';

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">{opportunity.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{opportunity.provider}</p>
            </div>
          </div>
          <div className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${expired ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : isUrgent ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'}`}>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{expired ? 'Expired' : isUrgent ? `${days} days left` : `${days} days`}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold ${typeColor}`}>{typeLabel}</span>
          {opportunity.field && <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{opportunity.field}</span>}
          {opportunity.location && <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"><MapPin className="h-3.5 w-3.5" />{opportunity.location}</span>}
          {opportunity.duration && <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"><Calendar className="h-3.5 w-3.5" />{opportunity.duration}</span>}
        </div>

        <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{opportunity.description}</p>

        {opportunity.salary_range && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10">
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{opportunity.salary_range}</span>
          </div>
        )}

        <button onClick={() => setExpanded((p) => !p)} className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide requirements' : 'View full details'}
        </button>

        {expanded && (
          <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            {opportunity.requirements && (
              <div>
                <h4 className="mb-2 text-sm font-bold text-slate-950 dark:text-white">Requirements</h4>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{opportunity.requirements}</p>
              </div>
            )}
            {opportunity.deadline && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Closes: <span className="font-bold text-slate-900 dark:text-white">{new Date(opportunity.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
              </div>
            )}
          </div>
        )}

        <a href={opportunity.application_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-brand-700 dark:hover:bg-brand-700 group-hover:shadow-lg">
          Apply now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  );
};

const OpportunitiesPage = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({ type: 'all', search: '' });
  const handleFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    opportunitiesAPI.getOpportunities()
      .then((res) => { if (!cancelled) setOpportunities(res.data.opportunities || []); })
      .catch(() => { if (!cancelled) setError('Could not load opportunities. Please try again later.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => opportunities.filter((o) => {
    if (filters.type !== 'all' && o.opportunity_type !== filters.type) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!o.title.toLowerCase().includes(q) && !o.provider.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [opportunities, filters]);

  const openCount = filtered.filter((o) => daysUntil(o.deadline) > 0).length;
  const internships = opportunities.filter(o => o.opportunity_type === 'internship').length;
  const graduates = opportunities.filter(o => o.opportunity_type === 'graduate').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Zap className="h-4 w-4" /> Launch Your Career
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Internships & Graduate Programs</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Discover paid internships, graduate schemes, and entry-level opportunities from leading organizations</p>
        </div>

        {/* Opportunity Type Cards */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Internships', count: internships, desc: 'Vacation work and practical experience', icon: Zap, color: 'from-blue-500 to-blue-600' },
            { title: 'Graduate Programs', count: graduates, desc: 'Entry-level roles for recent grads', icon: Award, color: 'from-purple-500 to-purple-600' },
            { title: 'Total Opportunities', count: opportunities.length, desc: 'Active positions available', icon: Briefcase, color: 'from-brand-500 to-brand-600' },
          ].map(({ title, count, desc, icon: Icon, color }) => (
            <div key={title} className={`rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-lg transition hover:shadow-xl`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold opacity-90">{desc}</p>
                  <p className="mt-3 text-4xl font-bold">{count}</p>
                  <p className="mt-2 text-sm font-bold opacity-90">{title}</p>
                </div>
                <Icon className="h-8 w-8 opacity-40" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: filtered.length, label: 'Found' },
            { value: openCount, label: 'Open now' },
            { value: Math.max(0, filtered.filter(o => daysUntil(o.deadline) <= 30 && daysUntil(o.deadline) > 0).length), label: 'Closing soon' },
            { value: opportunities.length, label: 'Total listed' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-2xl font-bold text-slate-950 dark:text-white">{value}</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">Opportunity type</p>
            <div className="flex flex-wrap gap-2">
              {OPPORTUNITY_TYPE_FILTERS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleFilter('type', value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${filters.type === value
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by role, company, or field..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={filters.search}
                onChange={(e) => handleFilter('search', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Auth Prompt */}
        {!isAuthenticated && (
          <div className="mb-8 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-6 dark:border-brand-800 dark:from-brand-500/10 dark:to-blue-500/10">
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 shrink-0 text-brand-600 dark:text-brand-400" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-950 dark:text-white">Save opportunities and track deadlines</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create an account to save your favorite opportunities and get deadline reminders.</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link to="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">Sign up</Link>
                <Link to="/login" className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/30">Login</Link>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {filters.type !== 'all'
                ? `${OPPORTUNITY_TYPE_FILTERS.find((f) => f.value === filters.type)?.label} (${filtered.length})`
                : `Opportunities (${filtered.length})`
              }
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Sorted by application deadline</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <Calendar className="h-4 w-4" /> Soonest first
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-500" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Loading opportunities…</h3>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-8 py-16 text-center shadow-sm dark:border-red-900 dark:bg-red-500/10">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">{error}</h3>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {[...filtered].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Search className="mx-auto mb-4 h-10 w-10 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">No opportunities found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">Try adjusting your search or filters to find opportunities that match your interests.</p>
            <button
              onClick={() => setFilters({ type: 'all', search: '' })}
              className="mt-5 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 dark:from-slate-950 dark:to-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">Also applying for accommodation?</h3>
              <p className="mt-2 text-slate-300">Secure your housing while pursuing these career opportunities.</p>
            </div>
            <Link
              to="/application"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Apply for accommodation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
