import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, ExternalLink, BookOpen, Award, Clock,
  CheckCircle, AlertCircle, Building, Cpu, HeartPulse,
  Briefcase, Scale, FlaskConical, HardHat, GraduationCap,
  Landmark, Globe, ChevronDown, ChevronUp, Target, Bookmark,
} from 'lucide-react';
import BURSARIES from '../data/bursaries.json';

const FIELDS = [
  { value: 'all', label: 'All Fields', icon: BookOpen },
  { value: 'engineering', label: 'Engineering', icon: HardHat },
  { value: 'it', label: 'IT & Computer Science', icon: Cpu },
  { value: 'health', label: 'Health & Medical', icon: HeartPulse },
  { value: 'business', label: 'Business & Finance', icon: Briefcase },
  { value: 'accounting', label: 'Accounting', icon: Landmark },
  { value: 'education', label: 'Education & Teaching', icon: GraduationCap },
  { value: 'law', label: 'Law', icon: Scale },
  { value: 'sciences', label: 'Natural Sciences', icon: FlaskConical },
  { value: 'general', label: 'General / All Fields', icon: Globe },
];

const FIELD_COLORS = {
  engineering: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  it: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
  health: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  business: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  accounting: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  education: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  law: 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300',
  sciences: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  general: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

const FUNDER_BADGE = {
  government: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
  corporate: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  international: 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300',
  private: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  professional: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
};

const INITIAL_FILTERS = { field: 'all', funder: 'all', level: 'all', search: '' };
const SELECT_CLASS = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const OPPORTUNITY_TYPES = [
  { title: 'Bursaries', text: 'Funding for tuition, books, accommodation, and living costs.', icon: Award, active: true },
  { title: 'Internships', text: 'Vacation work and practical experience opportunities.', icon: Briefcase },
  { title: 'Graduate roles', text: 'Entry level programmes for final year students and graduates.', icon: GraduationCap },
  { title: 'Competitions', text: 'Hackathons, case challenges, and innovation programmes.', icon: Target },
];

const daysUntil = (dateStr) => {
  const d = new Date(dateStr);
  return Math.ceil((d - new Date()) / 864e5);
};

const FieldIcon = ({ field, className = 'w-5 h-5' }) => {
  const f = FIELDS.find((x) => x.value === field);
  if (!f) return <BookOpen className={className} />;
  const Icon = f.icon;
  return <Icon className={className} />;
};

const BursaryCard = ({ bursary }) => {
  const [expanded, setExpanded] = useState(false);
  const days = daysUntil(bursary.deadline);
  const isUrgent = days <= 30 && days > 0;
  const expired = days <= 0;
  const fieldLabel = FIELDS.find((f) => f.value === bursary.field)?.label || bursary.field;
  const fieldColor = FIELD_COLORS[bursary.field] || FIELD_COLORS.general;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${fieldColor}`}>
            <FieldIcon field={bursary.field} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-snug text-slate-950 dark:text-white">{bursary.title}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{bursary.provider}</p>
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
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${fieldColor}`}>{fieldLabel}</span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${FUNDER_BADGE[bursary.funder] || FUNDER_BADGE.corporate}`}>{bursary.funder}</span>
        {bursary.level.map((l) => <span key={l} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">{l}</span>)}
      </div>

      <p className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">{bursary.amount}</p>
      <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{bursary.description}</p>

      <button onClick={() => setExpanded((p) => !p)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400">
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Hide requirements' : 'View requirements'}
      </button>

      {expanded && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bursary.requirements.map((req, i) => <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"><CheckCircle className="h-3 w-3 text-emerald-500" />{req}</span>)}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">Deadline: {new Date(bursary.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <a href={bursary.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700">
          Apply now <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
};

const BursaryPage = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const handleFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const filtered = useMemo(() => BURSARIES.filter((b) => {
    if (filters.field !== 'all' && b.field !== filters.field) return false;
    if (filters.funder !== 'all' && b.funder !== filters.funder) return false;
    if (filters.level !== 'all' && !b.level.includes(filters.level)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !b.provider.toLowerCase().includes(q) && !b.field.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  const openCount = filtered.filter((b) => daysUntil(b.deadline) > 0).length;
  const urgentCount = filtered.filter((b) => { const d = daysUntil(b.deadline); return d > 0 && d <= 30; }).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><Award className="h-3.5 w-3.5" />Opportunity Hub</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">Student opportunities</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">Find bursaries now, with internships, graduate roles, and competitions planned for the hub.</p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {OPPORTUNITY_TYPES.map(({ title, text, icon: Icon, active }) => <div key={title} className={`rounded-2xl border p-4 shadow-sm ${active ? 'border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-500/10' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300"><Icon className="h-5 w-5" /></div><h3 className="text-sm font-bold text-slate-950 dark:text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p>{!active && <p className="mt-2 text-[11px] font-bold text-slate-400">Coming soon</p>}</div>)}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[{ value: filtered.length, label: 'Found' }, { value: openCount, label: 'Open now' }, { value: urgentCount, label: 'Closing soon' }, { value: BURSARIES.length, label: 'Total listed' }].map(({ value, label }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="text-xl font-bold leading-none text-slate-950 dark:text-white">{value}</div><div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</div></div>)}
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Field of study</p>
          <div className="flex flex-wrap gap-2">{FIELDS.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => handleFilter('field', value)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${filters.field === value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search opportunities or providers" className={`${SELECT_CLASS} pl-9`} value={filters.search} onChange={(e) => handleFilter('search', e.target.value)} /></div>
            <select className={SELECT_CLASS} value={filters.funder} onChange={(e) => handleFilter('funder', e.target.value)}><option value="all">All funders</option><option value="government">Government</option><option value="corporate">Corporate</option><option value="private">Private foundation</option><option value="professional">Professional body</option><option value="international">International</option></select>
            <select className={SELECT_CLASS} value={filters.level} onChange={(e) => handleFilter('level', e.target.value)}><option value="all">All study levels</option><option value="undergraduate">Undergraduate</option><option value="honours">Honours</option><option value="masters">Masters</option><option value="phd">PhD</option></select>
          </div>
        </div>

        {!isAuthenticated && <div className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-500/10"><div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><div><p className="text-sm font-bold text-brand-950 dark:text-brand-200">Track saved opportunities</p><p className="mt-1 text-xs text-brand-700 dark:text-brand-300">Create an account to save opportunities and manage application deadlines.</p><div className="mt-3 flex gap-2"><Link to="/register" className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">Create account</Link><Link to="/login" className="rounded-xl border border-brand-300 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:text-brand-300">Login</Link></div></div></div></div>}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">{filters.field !== 'all' ? FIELDS.find((f) => f.value === filters.field)?.label : 'All bursaries'} ({filtered.length})</h2><p className="text-xs text-slate-500 dark:text-slate-400">Sorted by closest deadline</p></div><div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"><Filter className="h-3.5 w-3.5" />Soonest first</div></div>

        {filtered.length > 0 ? <div className="space-y-3">{[...filtered].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map((b) => <BursaryCard key={b.id} bursary={b} />)}</div> : <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><Search className="mx-auto mb-4 h-9 w-9 text-slate-400" /><h3 className="text-base font-bold text-slate-950 dark:text-white">No opportunities found</h3><p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">Try adjusting your field or filters.</p><button onClick={() => setFilters(INITIAL_FILTERS)} className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">Clear filters</button></div>}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"><h3 className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Application checklist</h3><div className="grid grid-cols-1 gap-3 md:grid-cols-3">{[{ icon: Bookmark, title: 'Save opportunities', text: 'Keep a shortlist of bursaries and deadlines.' }, { icon: GraduationCap, title: 'Prepare documents', text: 'Keep ID, transcript, proof of registration, and CV ready.' }, { icon: Building, title: 'Apply early', text: 'Corporate bursaries often close months before funding starts.' }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><Icon className="h-4 w-4" /></div><div><h4 className="text-xs font-bold text-slate-950 dark:text-white">{title}</h4><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p></div></div>)}</div></div>

        <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold sm:text-base">Plan accommodation and funding together</h3><p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">Apply for accommodation while tracking funding opportunities.</p></div><Link to="/application" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-100">Apply for accommodation</Link></div></div>
      </div>
    </div>
  );
};

export default BursaryPage;
