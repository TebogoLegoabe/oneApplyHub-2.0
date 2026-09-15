import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search, ExternalLink, BookOpen, Award, CheckCircle2, Building, Cpu, HeartPulse,
  Briefcase, Scale, FlaskConical, HardHat, GraduationCap, Landmark, Globe, ChevronDown, ChevronUp,
  Target, Bookmark, ArrowUpDown, X, AlertCircle,
} from 'lucide-react';
import { bursariesAPI, opportunitiesAPI } from '../services/api';
import OpportunityCard, { daysUntil, formatDeadline, DeadlineChip } from '../components/OpportunityCard';
import { Alert, Badge, Button, EmptyState, Input, PageHeader, Select, Skeleton } from '../components/ui';
import { cn } from '../utils/cn';

const FIELDS = [
  { value: 'all', label: 'All fields', icon: BookOpen },
  { value: 'engineering', label: 'Engineering', icon: HardHat },
  { value: 'it', label: 'IT & Computer Science', icon: Cpu },
  { value: 'health', label: 'Health & Medical', icon: HeartPulse },
  { value: 'business', label: 'Business & Finance', icon: Briefcase },
  { value: 'accounting', label: 'Accounting', icon: Landmark },
  { value: 'education', label: 'Education & Teaching', icon: GraduationCap },
  { value: 'law', label: 'Law', icon: Scale },
  { value: 'sciences', label: 'Natural Sciences', icon: FlaskConical },
  { value: 'general', label: 'General / All fields', icon: Globe },
];

const FIELD_COLORS = {
  engineering: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
  it: 'bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  health: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  business: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  accounting: 'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
  education: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300',
  law: 'bg-gold-100 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300',
  sciences: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const FUNDER_TONE = {
  government: 'brand',
  corporate: 'neutral',
  international: 'gold',
  private: 'warning',
  professional: 'success',
};

const TABS = [
  { id: 'bursaries', title: 'Bursaries', text: 'Funding for tuition, books, accommodation, and living costs.', icon: Award },
  { id: 'internships', title: 'Internships', text: 'Vacation work and practical experience opportunities.', icon: Briefcase },
  { id: 'graduate', title: 'Graduate roles', text: 'Entry-level programmes for final-year students and graduates.', icon: GraduationCap },
  { id: 'competitions', title: 'Competitions', text: 'Hackathons, case challenges, and innovation programmes.', icon: Target, comingSoon: true },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closing-soon', label: 'Closing soon' },
  { value: 'expired', label: 'Closed' },
];

const INITIAL_FILTERS = { field: 'all', funder: 'all', level: 'all', status: 'all', search: '' };

const CHECKLIST = [
  { icon: Bookmark, title: 'Shortlist early', text: 'Keep a list of bursaries and their deadlines in one place.' },
  { icon: GraduationCap, title: 'Prepare documents', text: 'Have your ID, transcript, proof of registration, and CV ready.' },
  { icon: Building, title: 'Apply ahead of time', text: 'Corporate bursaries often close months before funding starts.' },
];

const matchesStatus = (item, status) => {
  if (status === 'all') return true;
  const days = daysUntil(item.deadline);
  if (status === 'expired') return days <= 0;
  if (status === 'closing-soon') return days > 0 && days <= 30;
  return days > 0; // open
};

const FieldIcon = ({ field, className = 'h-5 w-5' }) => {
  const match = FIELDS.find((item) => item.value === field);
  const Icon = match?.icon || BookOpen;
  return <Icon className={className} aria-hidden="true" />;
};

const BursaryCard = ({ bursary }) => {
  const [expanded, setExpanded] = useState(false);
  const days = daysUntil(bursary.deadline);
  const expired = days <= 0;
  const fieldLabel = FIELDS.find((item) => item.value === bursary.field)?.label || bursary.field;
  const fieldColor = FIELD_COLORS[bursary.field] || FIELD_COLORS.general;
  const requirements = Array.isArray(bursary.requirements) ? bursary.requirements : [];
  const levels = Array.isArray(bursary.level) ? bursary.level : [];

  return (
    <article className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900', expired && 'opacity-75')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', fieldColor)}>
            <FieldIcon field={bursary.field} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-snug text-slate-950 dark:text-white sm:text-base">{bursary.title}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{bursary.provider}</p>
          </div>
        </div>
        <DeadlineChip days={days} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', fieldColor)}>{fieldLabel}</span>
        {bursary.funder && <Badge tone={FUNDER_TONE[bursary.funder] || 'neutral'} size="sm" className="capitalize">{bursary.funder}</Badge>}
        {levels.map((level) => <Badge key={level} size="sm" className="capitalize">{level}</Badge>)}
      </div>

      {bursary.amount && <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">{bursary.amount}</p>}
      {bursary.description && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{bursary.description}</p>}

      {requirements.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((previous) => !previous)}
            aria-expanded={expanded}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
            {expanded ? 'Hide requirements' : `View requirements (${requirements.length})`}
          </button>
          {expanded && (
            <ul className="mt-3 flex flex-wrap gap-1.5 animate-fade-in">
              {requirements.map((requirement) => (
                <li key={requirement} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />{requirement}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">Deadline: <span className="font-medium text-slate-700 dark:text-slate-200">{formatDeadline(bursary.deadline)}</span></p>
        <Button href={bursary.applicationUrl || bursary.application_url} target="_blank" rel="noopener noreferrer" size="sm" variant={expired ? 'secondary' : 'primary'}>
          {expired ? 'View details' : 'Apply now'}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
};

const BursaryPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('bursaries');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [bursaries, setBursaries] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const setFilter = (key, value) => setFilters((previous) => ({ ...previous, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    // Each feed fails independently so one outage never blanks the whole hub.
    Promise.all([
      bursariesAPI.getBursaries().catch(() => null),
      opportunitiesAPI.getOpportunities().catch(() => null),
    ])
      .then(([bursariesResponse, opportunitiesResponse]) => {
        if (cancelled) return;
        setBursaries(bursariesResponse?.data?.bursaries || []);
        setOpportunities(opportunitiesResponse?.data?.opportunities || []);
        if (!bursariesResponse && !opportunitiesResponse) setError('We could not load opportunities right now. Please try again later.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const isBursaryTab = activeTab === 'bursaries';

  const currentItems = useMemo(() => {
    if (isBursaryTab) return bursaries;
    const type = activeTab === 'internships' ? 'internship' : 'graduate';
    return opportunities.filter((item) => item.opportunity_type === type);
  }, [activeTab, isBursaryTab, bursaries, opportunities]);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return currentItems
      .filter((item) => {
        if (isBursaryTab) {
          if (filters.field !== 'all' && item.field !== filters.field) return false;
          if (filters.funder !== 'all' && item.funder !== filters.funder) return false;
          if (filters.level !== 'all' && !(item.level || []).includes(filters.level)) return false;
        }
        if (!matchesStatus(item, filters.status)) return false;
        if (query && ![item.title, item.provider, item.field, item.description].some((value) => value && String(value).toLowerCase().includes(query))) return false;
        return true;
      })
      .sort((a, b) => new Date(a.deadline || '2999-12-31') - new Date(b.deadline || '2999-12-31'));
  }, [currentItems, filters, isBursaryTab]);

  const openCount = currentItems.filter((item) => matchesStatus(item, 'open')).length;
  const urgentCount = currentItems.filter((item) => matchesStatus(item, 'closing-soon')).length;
  const hasActiveFilters = filters.field !== 'all' || filters.funder !== 'all' || filters.level !== 'all' || filters.status !== 'all' || Boolean(filters.search);
  const activeTabMeta = TABS.find((tab) => tab.id === activeTab);
  const listTitle = isBursaryTab
    ? (filters.field !== 'all' ? FIELDS.find((item) => item.value === filters.field)?.label : 'All bursaries')
    : activeTabMeta?.title;

  const STAT_TILES = [
    { value: filtered.length, label: 'Matching' },
    { value: openCount, label: 'Open now', status: 'open' },
    { value: urgentCount, label: 'Closing within 30 days', status: 'closing-soon' },
    { value: currentItems.length, label: 'Total listed' },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <PageHeader
        eyebrow="Opportunities Hub"
        icon={Award}
        title="Student opportunities"
        description="Bursaries, internships, and graduate programmes in one place. Competitions are coming soon."
        className="mb-4"
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" role="tablist" aria-label="Opportunity type">
        {TABS.map(({ id, title, text, icon: Icon, comingSoon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={comingSoon}
              onClick={() => { setActiveTab(id); setFilters(INITIAL_FILTERS); }}
              className={cn(
                'rounded-2xl border p-4 text-left shadow-card transition-all duration-200',
                active
                  ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-300/60 dark:border-brand-700 dark:bg-brand-500/10 dark:ring-brand-500/30'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
                comingSoon ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:hover:border-brand-900',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-sm', active ? 'bg-brand-600 text-white' : 'bg-white text-brand-600 dark:bg-slate-800 dark:text-brand-300')}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {comingSoon ? <Badge size="sm">Coming soon</Badge> : active && <Badge tone="brand" size="sm">Viewing</Badge>}
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
            </button>
          );
        })}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_TILES.map(({ value, label, status }) => {
          const clickable = Boolean(status);
          const active = clickable && filters.status === status;
          const Tag = clickable ? 'button' : 'div';
          return (
            <Tag
              key={label}
              type={clickable ? 'button' : undefined}
              aria-pressed={clickable ? active : undefined}
              onClick={clickable ? () => setFilter('status', active ? 'all' : status) : undefined}
              className={cn(
                'rounded-2xl border p-4 text-left shadow-card transition-colors',
                active ? 'border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-500/10' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
                clickable && 'cursor-pointer hover:border-brand-300 dark:hover:border-brand-700',
              )}
            >
              <p className="text-xl font-bold leading-none text-slate-950 dark:text-white">{loading ? <Skeleton className="inline-block h-5 w-8" /> : value}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </Tag>
          );
        })}
      </div>

      {isBursaryTab && (
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900" aria-label="Filter by field of study">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Field of study</p>
          <div className="flex flex-wrap gap-2">
            {FIELDS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter('field', value)}
                aria-pressed={filters.field === value}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                  filters.field === value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900" aria-label="Search and filters">
        <div className={cn('grid grid-cols-1 gap-3', isBursaryTab ? 'md:grid-cols-5' : 'md:grid-cols-3')}>
          <Input
            icon={Search}
            type="search"
            aria-label="Search opportunities or providers"
            placeholder="Search opportunities or providers"
            wrapperClassName="md:col-span-2"
            value={filters.search}
            onChange={(event) => setFilter('search', event.target.value)}
          />
          <Select aria-label="Deadline status" value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
            {STATUS_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label === 'All' ? 'Any deadline' : label}</option>)}
          </Select>
          {isBursaryTab && (
            <>
              <Select aria-label="Funder type" value={filters.funder} onChange={(event) => setFilter('funder', event.target.value)}>
                <option value="all">All funders</option>
                <option value="government">Government</option>
                <option value="corporate">Corporate</option>
                <option value="private">Private foundation</option>
                <option value="professional">Professional body</option>
                <option value="international">International</option>
              </Select>
              <Select aria-label="Study level" value={filters.level} onChange={(event) => setFilter('level', event.target.value)}>
                <option value="all">All study levels</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="honours">Honours</option>
                <option value="masters">Masters</option>
                <option value="phd">PhD</option>
              </Select>
            </>
          )}
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
            {listTitle} <span className="font-medium text-slate-400">({filtered.length})</span>
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
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-2xl" />)}
        </div>
      ) : error ? (
        <Alert tone="error" title="Could not load opportunities" action={<Button size="sm" variant="danger" onClick={() => window.location.reload()}>Retry</Button>}>{error}</Alert>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (isBursaryTab ? <BursaryCard key={item.id} bursary={item} /> : <OpportunityCard key={item.id} opportunity={item} />))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            icon={currentItems.length ? Search : AlertCircle}
            title={currentItems.length ? 'No opportunities match your filters' : `No ${activeTabMeta?.title?.toLowerCase() || 'opportunities'} listed yet`}
            description={currentItems.length ? 'Try a different field, deadline status, or clear your filters.' : 'Check back soon — new listings are added regularly.'}
            action={currentItems.length ? <Button onClick={() => setFilters(INITIAL_FILTERS)}>Clear filters</Button> : null}
          />
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-labelledby="checklist-heading">
        <h3 id="checklist-heading" className="mb-4 text-sm font-bold text-slate-950 dark:text-white">Application checklist</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CHECKLIST.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white shadow-card dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold">Plan accommodation and funding together</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">Apply for accommodation while you track funding opportunities.</p>
          </div>
          <Button to={isAuthenticated ? '/application' : '/register'} variant="inverse" className="shrink-0">Apply for accommodation</Button>
        </div>
      </div>
    </div>
  );
};

export default BursaryPage;
