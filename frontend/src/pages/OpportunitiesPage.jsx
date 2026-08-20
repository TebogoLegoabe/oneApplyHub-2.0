import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, ExternalLink, Briefcase, Clock,
  AlertCircle, Building, MapPin, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { opportunitiesAPI } from '../services/api';

const OPPORTUNITY_TYPE_FILTERS = [
  { value: 'all', label: 'All types' },
  { value: 'internship', label: 'Internships' },
  { value: 'graduate', label: 'Graduate programs' },
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
  const typeLabel = opportunity.opportunity_type === 'internship' ? 'Internship' : 'Graduate program';
  const typeColor = opportunity.opportunity_type === 'internship'
    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-snug text-slate-950 dark:text-white">{opportunity.title}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{opportunity.provider}</p>
          </div>
        </div>
        <div className={`shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-bold ${expired ? 'bg-red-50 text-red-600 dark:bg-red-500/10' : isUrgent ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{expired ? 'Expired' : `${days} days left`}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${typeColor}`}>{typeLabel}</span>
        {opportunity.field && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{opportunity.field}</span>}
        {opportunity.location && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"><MapPin className="h-3 w-3" />{opportunity.location}</span>}
      </div>

      {opportunity.salary_range && <p className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">{opportunity.salary_range}</p>}
      <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{opportunity.description}</p>

      <button onClick={() => setExpanded((p) => !p)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400">
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Hide details' : 'View details'}
      </button>

      {expanded && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opportunity.requirements && <div className="w-full"><p className="text-xs font-bold text-slate-950 dark:text-white">Requirements:</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{opportunity.requirements}</p></div>}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">Deadline: {new Date(opportunity.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <a href={opportunity.application_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700">
          Apply now <ExternalLink className="h-3.5 w-3.5" />
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
      if (!o.title.toLowerCase().includes(q) && !o.provider.toLowerCase().includes(q) && !o.description.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [opportunities, filters]);

  const openCount = filtered.filter((o) => daysUntil(o.deadline) > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><Briefcase className="h-3.5 w-3.5" />Opportunities Hub</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">Internships & Graduate Programs</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">Find internships and graduate programs to launch your career.</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { value: filtered.length, label: 'Found' },
            { value: openCount, label: 'Open now' },
            { value: opportunities.length, label: 'Total listed' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xl font-bold leading-none text-slate-950 dark:text-white">{value}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</p>
          <div className="flex flex-wrap gap-2">{OPPORTUNITY_TYPE_FILTERS.map(({ value, label }) => <button key={value} type="button" onClick={() => handleFilter('type', value)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${filters.type === value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>{label}</button>)}</div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search opportunities or providers" className="w-full rounded-xl border border-slate-200 bg-white pl-9 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white" value={filters.search} onChange={(e) => handleFilter('search', e.target.value)} /></div>
        </div>

        {!isAuthenticated && <div className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-500/10"><div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><div><p className="text-sm font-bold text-brand-950 dark:text-brand-200">Track saved opportunities</p><p className="mt-1 text-xs text-brand-700 dark:text-brand-300">Create an account to save opportunities and manage application deadlines.</p><div className="mt-3 flex gap-2"><Link to="/register" className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">Create account</Link><Link to="/login" className="rounded-xl border border-brand-300 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:text-brand-300">Login</Link></div></div></div></div>}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">{filters.type !== 'all' ? OPPORTUNITY_TYPE_FILTERS.find((f) => f.value === filters.type)?.label : 'All opportunities'} ({filtered.length})</h2><p className="text-xs text-slate-500 dark:text-slate-400">Sorted by closest deadline</p></div><div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"><Filter className="h-3.5 w-3.5" />Soonest first</div></div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-brand-500" />
            <h3 className="text-base font-bold text-slate-950 dark:text-white">Loading opportunities…</h3>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-12 text-center shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
            <AlertCircle className="mx-auto mb-4 h-9 w-9 text-red-500" />
            <h3 className="text-base font-bold text-slate-950 dark:text-white">{error}</h3>
          </div>
        ) : filtered.length > 0 ? <div className="space-y-3">{[...filtered].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map((o) => <OpportunityCard key={o.id} opportunity={o} />)}</div> : <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><Search className="mx-auto mb-4 h-9 w-9 text-slate-400" /><h3 className="text-base font-bold text-slate-950 dark:text-white">No opportunities found</h3><p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters.</p><button onClick={() => setFilters({ type: 'all', search: '' })} className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">Clear filters</button></div>}

        <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold sm:text-base">Plan accommodation and career together</h3><p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">Apply for accommodation while tracking career opportunities.</p></div><Link to="/application" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-100">Apply for accommodation</Link></div></div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
