import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Briefcase, GraduationCap, Layers, ArrowUpDown, X, AlertCircle } from 'lucide-react';
import { opportunitiesAPI } from '../services/api';
import OpportunityCard, { daysUntil } from '../components/OpportunityCard';
import { Alert, Button, Chip, CtaBand, EmptyState, Input, PageHeader, Skeleton } from '../components/ui';
import { PHOTOS } from '../constants/photos';

const TYPE_FILTERS = [
  { value: 'all', label: 'All types', icon: Layers },
  { value: 'internship', label: 'Internships', icon: Briefcase },
  { value: 'graduate', label: 'Graduate programmes', icon: GraduationCap },
];

const INITIAL_FILTERS = { type: 'all', search: '' };

const OpportunitiesPage = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const setFilter = (key, value) => setFilters((previous) => ({ ...previous, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    opportunitiesAPI.getOpportunities()
      .then((response) => { if (!cancelled) setOpportunities(response.data.opportunities || []); })
      .catch(() => { if (!cancelled) setError('We could not load opportunities right now. Please try again later.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return opportunities
      .filter((item) => {
        if (filters.type !== 'all' && item.opportunity_type !== filters.type) return false;
        if (query && ![item.title, item.provider, item.description, item.field, item.location].some((value) => value && String(value).toLowerCase().includes(query))) return false;
        return true;
      })
      .sort((a, b) => new Date(a.deadline || '2999-12-31') - new Date(b.deadline || '2999-12-31'));
  }, [opportunities, filters]);

  const openCount = filtered.filter((item) => daysUntil(item.deadline) > 0).length;
  const internshipCount = opportunities.filter((item) => item.opportunity_type === 'internship').length;
  const graduateCount = opportunities.filter((item) => item.opportunity_type === 'graduate').length;
  const hasActiveFilters = filters.type !== 'all' || Boolean(filters.search);
  const listTitle = TYPE_FILTERS.find((item) => item.value === filters.type)?.label || 'All opportunities';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <PageHeader
        eyebrow="Opportunities Hub"
        icon={Briefcase}
        title="Internships & graduate programmes"
        description="Vacation work, learnerships, and entry-level programmes to launch your career."
        action={<Button to="/bursaries" variant="inverse" size="sm">Looking for bursaries?</Button>}
        image={PHOTOS.mandelaBridge}
        className="mb-4"
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { value: filtered.length, label: 'Matching' },
          { value: openCount, label: 'Open now' },
          { value: internshipCount, label: 'Internships' },
          { value: graduateCount, label: 'Graduate programmes' },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <p className="text-2xl font-bold leading-none text-slate-950 dark:text-white">{loading ? <Skeleton className="inline-block h-6 w-8" /> : value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-4" aria-label="Search and filters">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Opportunity type">
            {TYPE_FILTERS.map(({ value, label, icon }) => (
              <Chip key={value} icon={icon} active={filters.type === value} onClick={() => setFilter('type', value)}>{label}</Chip>
            ))}
          </div>
          <Input
            icon={Search}
            type="search"
            aria-label="Search opportunities or providers"
            placeholder="Search by title, company, field, or location"
            wrapperClassName="md:ml-auto md:w-80"
            value={filters.search}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </div>
      </section>

      {!isAuthenticated && (
        <Alert tone="info" className="mb-4" title="Track opportunities alongside your accommodation application">
          <p>Create a free account to apply for accommodation and keep everything in one dashboard.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button to="/register" size="sm">Create account</Button>
            <Button to="/login" size="sm" variant="secondary">Log in</Button>
          </div>
        </Alert>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg" aria-live="polite">
            {listTitle} <span className="font-medium text-slate-500 dark:text-slate-400">({filtered.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sorted by closest deadline</p>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => setFilters(INITIAL_FILTERS)}>
              <X className="h-3.5 w-3.5" aria-hidden="true" />Clear filters
            </Button>
          )}
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />Soonest first
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-xl" />)}
        </div>
      ) : error ? (
        <Alert tone="error" title="Could not load opportunities" action={<Button size="sm" variant="danger" onClick={() => window.location.reload()}>Retry</Button>}>{error}</Alert>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => <OpportunityCard key={item.id} opportunity={item} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            icon={opportunities.length ? Search : AlertCircle}
            title={opportunities.length ? 'No opportunities match your filters' : 'No opportunities listed yet'}
            description={opportunities.length ? 'Try a different type or clear your search.' : 'Check back soon — new listings are added regularly.'}
            action={opportunities.length ? <Button onClick={() => setFilters(INITIAL_FILTERS)}>Clear filters</Button> : null}
          />
        </div>
      )}

      <CtaBand
        className="mt-6"
        title="Plan accommodation and career together"
        description="Apply for accommodation while you track career opportunities."
        action={<Button to={isAuthenticated ? '/application' : '/register'} variant="inverse">Apply for accommodation</Button>}
      />
    </div>
  );
};

export default OpportunitiesPage;
