import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpDown, Building2, Columns2, GraduationCap, LayoutGrid, List, LocateFixed, Map as MapIcon, Search, SlidersHorizontal, Wallet, X,
} from 'lucide-react';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { CAMPUSES, CAMPUS_BY_ID, RADIUS_OPTIONS } from '../constants/campuses';
import { MapFrame, PropertiesMap } from '../components/map';
import PropertyCard, { PropertyCardSkeleton } from '../components/property/PropertyCard';
import { Alert, Button, EmptyState, Input, PageHeader, Select } from '../components/ui';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';

const PER_PAGE = 12;
const DEBOUNCE_MS = 400;
const FILTER_KEYS = ['search', 'university', 'type', 'min_price', 'max_price', 'nsfas', 'near', 'max_km', 'sort'];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'distance', label: 'Nearest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name A–Z' },
];

const TYPE_LABELS = { residence: 'Residence', apartment: 'Apartment', house: 'House' };

const useDebouncedField = (value, commit) => {
  const [draft, setDraft] = useState(value);
  const timer = useRef(null);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const change = (next) => {
    setDraft(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(next), DEBOUNCE_MS);
  };
  const cancel = () => clearTimeout(timer.current);
  return [draft, change, cancel];
};

/* Chip colours for the dark page header and for the light mobile map toolbar. */
const CHIP_STYLES = {
  dark: {
    active: 'bg-white text-ink-950 shadow-lg ring-white',
    uj: 'bg-coral-500/20 text-white ring-coral-200/40 hover:bg-coral-500/35',
    me: 'bg-lime-300/20 text-white ring-lime-200/40 hover:bg-lime-300/35',
    base: 'bg-white/10 text-white ring-white/25 hover:bg-white/20',
  },
  light: {
    active: 'bg-ink-950 text-white ring-ink-950 dark:bg-white dark:text-ink-950 dark:ring-white',
    uj: 'bg-coral-50 text-coral-800 ring-coral-200 dark:bg-coral-500/15 dark:text-coral-200 dark:ring-coral-400/30',
    me: 'bg-lime-100 text-lime-900 ring-lime-300 dark:bg-lime-400/15 dark:text-lime-200 dark:ring-lime-400/30',
    base: 'bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-200 dark:ring-brand-400/30',
  },
};

const Chip = ({ active, onClick, children, tone = 'brand', variant = 'dark', className, ...props }) => {
  const styles = CHIP_STYLES[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset transition-all',
        active ? styles.active : styles[tone] || styles.base,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

/** Campus + "Near me" chips, shared by the page header and the mobile map toolbar. */
const CampusChips = ({ near, onChoose, locating, variant = 'dark' }) => (
  <>
    {CAMPUSES.map((campus) => (
      <Chip key={campus.id} variant={variant} active={near === campus.id} tone={campus.university} onClick={() => onChoose(campus.id)}>
        {campus.short}
      </Chip>
    ))}
    <Chip variant={variant} active={near === 'me'} tone="me" onClick={() => onChoose('me')}>
      <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />{locating ? 'Locating…' : 'Near me'}
    </Chip>
  </>
);

/** Full-screen map for phones, with its own campus toolbar and a way back to the list. */
const MobileMapLayer = ({ toolbar, onClose, children }) => {
  const closeRef = useRef(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-fade-in dark:bg-slate-950" role="dialog" aria-modal="true" aria-label="Map of residences">
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          aria-label="Back to the list"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Distance from campus">
          {toolbar}
        </div>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[600] flex justify-center">
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-bold text-white shadow-float transition-transform active:scale-95 dark:bg-white dark:text-ink-950"
        >
          <List className="h-4 w-4" aria-hidden="true" />Show list
        </button>
      </div>
    </div>
  );
};

const FilterPill = ({ label, onRemove }) => (
  <li>
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-500/30"
      aria-label={`Remove filter: ${label}`}
    >
      {label}<X className="h-3 w-3" aria-hidden="true" />
    </button>
  </li>
);

const PropertiesPage = () => {
  // The URL is the single source of truth for filters, so homepage search, campus links,
  // browser back/forward, and shared links all work.
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const geo = useGeolocation();

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    university: searchParams.get('university') || 'all',
    type: searchParams.get('type') || 'all',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    nsfas: searchParams.get('nsfas') === '1',
    near: searchParams.get('near') || '',
    max_km: searchParams.get('max_km') || '',
    sort: searchParams.get('sort') || 'recommended',
    view: searchParams.get('view') || 'split',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  }), [searchParams]);

  const updateFilters = useCallback((patch) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      Object.entries(patch).forEach(([key, value]) => {
        const isDefault = value === '' || value === 'all' || value == null || value === false
          || (key === 'page' && Number(value) <= 1) || (key === 'sort' && value === 'recommended') || (key === 'view' && value === 'split');
        if (isDefault) next.delete(key);
        else next.set(key, value === true ? '1' : String(value));
      });
      // Any change other than paging or switching view returns to the first page.
      if (!('page' in patch) && !('view' in patch)) next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const [searchDraft, setSearchDraft, cancelSearch] = useDebouncedField(filters.search, (value) => updateFilters({ search: value.trim() }));
  const [minDraft, setMinDraft, cancelMin] = useDebouncedField(filters.min_price, (value) => updateFilters({ min_price: value }));
  const [maxDraft, setMaxDraft, cancelMax] = useDebouncedField(filters.max_price, (value) => updateFilters({ max_price: value }));

  // "Near me": the position stays in memory only, never in the URL.
  useEffect(() => {
    if (filters.near === 'me' && geo.status === 'idle') geo.request();
  }, [filters.near, geo]);

  // "Nearest first" needs an origin; drop it when the campus is cleared.
  useEffect(() => {
    if (!filters.near && filters.sort === 'distance') updateFilters({ sort: 'recommended' });
  }, [filters.near, filters.sort, updateFilters]);

  const origin = useMemo(() => {
    const campus = CAMPUS_BY_ID[filters.near];
    if (campus) return { kind: 'campus', id: campus.id, lat: campus.lat, lng: campus.lng, short: campus.short, label: campus.short };
    if (filters.near === 'me' && geo.position) return { kind: 'me', id: 'me', lat: geo.position.lat, lng: geo.position.lng, short: 'you', label: 'you' };
    return null;
  }, [filters.near, geo.position]);

  const apiParams = useMemo(() => {
    const params = {};
    ['search', 'university', 'type', 'min_price', 'max_price'].forEach((key) => {
      if (filters[key] && filters[key] !== 'all') params[key] = filters[key];
    });
    if (filters.nsfas) params.nsfas = 'true';
    if (origin) {
      params.near_lat = origin.lat.toFixed(6);
      params.near_lng = origin.lng.toFixed(6);
      if (filters.max_km) params.max_km = filters.max_km;
    }
    if (filters.sort !== 'recommended') params.sort = filters.sort;
    return params;
  }, [filters, origin]);
  const apiKey = JSON.stringify(apiParams);

  /* ------------------------------------------------------------------ list */
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(null);
  const listRequest = useRef(0);

  const fetchProperties = useCallback(async () => {
    const requestId = ++listRequest.current;
    setLoading(true);
    setError('');
    try {
      const response = await propertiesAPI.getProperties({ ...JSON.parse(apiKey), page: filters.page, per_page: PER_PAGE });
      if (requestId !== listRequest.current) return;
      setProperties(response.data.properties || []);
      setTotalPages(response.data.pages || 1);
      setTotal(response.data.total ?? null);
    } catch {
      if (requestId === listRequest.current) setError('We could not load properties. Check your connection and try again.');
    } finally {
      if (requestId === listRequest.current) setLoading(false);
    }
  }, [apiKey, filters.page]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  /* ------------------------------------------------------------------ map */
  const mapVisible = filters.view === 'map' || (isDesktop && filters.view !== 'list');
  const [mapPoints, setMapPoints] = useState([]);
  const [unmapped, setUnmapped] = useState(0);
  const [mapLoading, setMapLoading] = useState(false);
  const [hoverId, setHoverId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mapRequest = useRef(0);

  useEffect(() => {
    if (!mapVisible) return;
    const requestId = ++mapRequest.current;
    setMapLoading(true);
    propertiesAPI.getPropertyMap(JSON.parse(apiKey))
      .then((response) => {
        if (requestId !== mapRequest.current) return;
        const points = response.data.properties || [];
        setMapPoints(points);
        setUnmapped(response.data.unmapped || 0);
        setSelectedId((current) => (points.some((point) => point.id === current) ? current : null));
      })
      .catch(() => { if (requestId === mapRequest.current) setMapPoints([]); })
      .finally(() => { if (requestId === mapRequest.current) setMapLoading(false); });
  }, [apiKey, mapVisible]);

  /* ------------------------------------------------------------------ helpers */
  const clearFilters = () => {
    cancelSearch(); cancelMin(); cancelMax();
    setSearchParams(filters.view !== 'split' ? { view: filters.view } : {}, { replace: true });
  };

  const chooseOrigin = (id) => {
    if (filters.near === id) {
      updateFilters({ near: '', max_km: '' });
      return;
    }
    if (id === 'me' && geo.status !== 'ready') geo.request();
    updateFilters({ near: id });
  };

  const activeFilterCount = FILTER_KEYS.filter((key) => key !== 'sort' && filters[key] && filters[key] !== 'all').length;
  // Filters hidden behind the "Filters" button on phones.
  const secondaryCount = [filters.university !== 'all', filters.type !== 'all', filters.min_price, filters.max_price, filters.nsfas, filters.sort !== 'recommended'].filter(Boolean).length;
  const closeMobileMap = useCallback(() => updateFilters({ view: 'split' }), [updateFilters]);
  const originName = origin ? (origin.kind === 'me' ? 'your location' : CAMPUS_BY_ID[origin.id]?.name) : '';

  const pills = [
    filters.search && { key: 'search', label: `“${filters.search}”`, patch: { search: '' } },
    filters.university !== 'all' && { key: 'university', label: filters.university === 'wits' ? 'Wits students' : 'UJ students', patch: { university: '' } },
    filters.type !== 'all' && { key: 'type', label: TYPE_LABELS[filters.type] || filters.type, patch: { type: '' } },
    filters.min_price && { key: 'min', label: `From ${formatCurrency(filters.min_price)}`, patch: { min_price: '' } },
    filters.max_price && { key: 'max', label: `Up to ${formatCurrency(filters.max_price)}`, patch: { max_price: '' } },
    filters.nsfas && { key: 'nsfas', label: 'NSFAS accredited', patch: { nsfas: false } },
    filters.near && { key: 'near', label: filters.near === 'me' ? 'Near me' : `Near ${CAMPUS_BY_ID[filters.near]?.short || filters.near}`, patch: { near: '', max_km: '' } },
    filters.max_km && origin && { key: 'max_km', label: `Within ${filters.max_km} km`, patch: { max_km: '' } },
  ].filter(Boolean);

  const resultLabel = loading
    ? 'Loading properties…'
    : total != null
      ? `${total} propert${total === 1 ? 'y' : 'ies'} found${origin && filters.max_km ? ` within ${filters.max_km} km of ${originName}` : ''}`
      : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} on this page`;

  const stickyTop = isAuthenticated ? 'lg:top-4 lg:h-[calc(100vh-2rem)]' : 'lg:top-20 lg:h-[calc(100vh-6rem)]';
  const layout = !isDesktop || filters.view === 'list'
    ? ''
    : filters.view === 'map'
      ? 'lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)] lg:gap-6'
      : 'lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6';
  const gridCols = filters.view === 'list' || !isDesktop
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
    : filters.view === 'map'
      ? 'grid-cols-1 2xl:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2';

  const viewOptions = [
    { value: 'list', label: 'List', icon: LayoutGrid },
    { value: 'split', label: 'Split', icon: Columns2 },
    { value: 'map', label: 'Map', icon: MapIcon },
  ];

  const map = (
    <PropertiesMap
      properties={mapPoints}
      loading={mapLoading}
      origin={origin}
      activeId={hoverId}
      onHover={setHoverId}
      selectedId={selectedId}
      onSelect={setSelectedId}
      unmapped={unmapped}
      scrollWheelZoom
      className="h-full w-full"
    />
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <PageHeader
        eyebrow="Browse properties"
        icon={Building2}
        title="Find accommodation"
        description="Compare student accommodation by campus distance, price, reviews, and NSFAS accreditation."
        className="mb-4"
        action={isDesktop && (
          <div className="inline-flex rounded-xl bg-white/10 p-1 ring-1 ring-inset ring-white/20" role="group" aria-label="Layout">
            {viewOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateFilters({ view: value })}
                aria-pressed={filters.view === value}
                className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors', filters.view === value ? 'bg-white text-ink-950 shadow' : 'text-white/85 hover:bg-white/10')}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
              </button>
            ))}
          </div>
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Distance from campus">
            <span className="inline-flex shrink-0 items-center gap-1.5 pr-1 text-xs font-semibold text-white/80">
              <GraduationCap className="h-4 w-4 text-gold-300" aria-hidden="true" />Distance from
            </span>
            <CampusChips near={filters.near} onChoose={chooseOrigin} locating={geo.status === 'loading'} />
          </div>
          {origin && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar animate-fade-in" role="group" aria-label="Maximum distance">
              <span className="shrink-0 pr-1 text-xs font-semibold text-white/80">Within</span>
              <Chip active={!filters.max_km} onClick={() => updateFilters({ max_km: '' })}>Any distance</Chip>
              {RADIUS_OPTIONS.map((km) => (
                <Chip key={km} active={filters.max_km === String(km)} onClick={() => updateFilters({ max_km: String(km) })}>{km} km</Chip>
              ))}
            </div>
          )}
          {filters.near === 'me' && geo.status === 'error' && (
            <p className="text-xs font-semibold text-gold-200" role="alert">{geo.error}</p>
          )}
        </div>
      </PageHeader>

      <section className="mb-4 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-4" aria-label="Filters">
        {/* On phones the secondary filters fold away behind "Filters"; on desktop they are always shown. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <Input
            icon={Search}
            type="search"
            aria-label="Search by name or location"
            placeholder="Search by name or location"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="more-filters"
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-bold shadow-sm transition-colors lg:hidden',
              filtersOpen
                ? 'border-ink-950 bg-ink-950 text-white dark:border-white dark:bg-white dark:text-ink-950'
                : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />Filters
            {secondaryCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-coral-600 px-1.5 text-[11px] font-bold text-white">{secondaryCount}</span>
            )}
          </button>
          <div id="more-filters" className={cn('col-span-2 grid-cols-2 gap-2 sm:gap-3 lg:contents', filtersOpen ? 'grid' : 'hidden')}>
            <Select aria-label="University" value={filters.university} onChange={(event) => updateFilters({ university: event.target.value })}>
              <option value="all">All universities</option>
              <option value="wits">Wits</option>
              <option value="uj">UJ</option>
            </Select>
            <Select aria-label="Property type" value={filters.type} onChange={(event) => updateFilters({ type: event.target.value })}>
              <option value="all">All types</option>
              <option value="residence">Residence</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
            </Select>
            <Select icon={ArrowUpDown} aria-label="Sort by" value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value })} wrapperClassName="col-span-2 lg:col-span-1">
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value} disabled={value === 'distance' && !origin}>
                  {value === 'recommended' && origin ? 'Recommended (nearest)' : label}{value === 'distance' && !origin ? ' — pick a campus' : ''}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className={cn('mt-2 grid-cols-2 gap-2 sm:mt-3 sm:gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-center lg:grid', filtersOpen ? 'grid' : 'hidden')}>
          <Input
            icon={Wallet}
            type="number"
            inputMode="numeric"
            min="0"
            aria-label="Minimum monthly price"
            placeholder="Min price (R)"
            value={minDraft}
            onChange={(event) => setMinDraft(event.target.value)}
          />
          <Input
            icon={Wallet}
            type="number"
            inputMode="numeric"
            min="0"
            aria-label="Maximum monthly price"
            placeholder="Max price (R)"
            value={maxDraft}
            onChange={(event) => setMaxDraft(event.target.value)}
          />
          <button
            type="button"
            onClick={() => updateFilters({ nsfas: !filters.nsfas })}
            aria-pressed={filters.nsfas}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold ring-1 ring-inset transition-colors',
              filters.nsfas
                ? 'bg-lime-300 text-ink-950 ring-lime-400'
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-lime-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-lime-400/10',
            )}
          >
            <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border-2', filters.nsfas ? 'border-ink-950 bg-ink-950' : 'border-slate-300 dark:border-slate-600')} aria-hidden="true">
              {filters.nsfas && <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />}
            </span>
            NSFAS only
          </button>
          <Button variant="ghost" onClick={clearFilters} disabled={activeFilterCount === 0}>
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      </section>

      {error && (
        <Alert tone="error" className="mb-4" action={<Button size="sm" variant="danger" onClick={fetchProperties}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white sm:text-xl" aria-live="polite">{resultLabel}</h2>
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            {activeFilterCount === 0 ? 'Showing all properties' : `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} applied`}
            {!loading && totalPages > 1 && <span>· Page {filters.page} of {totalPages}</span>}
            {origin && <span>· Walking times are estimates</span>}
          </p>
        </div>
        {pills.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 sm:justify-end" aria-label="Active filters">
            {pills.map(({ key, label, patch }) => <FilterPill key={key} label={label} onRemove={() => updateFilters(patch)} />)}
          </ul>
        )}
      </div>

      <div className={layout}>
        <div className={cn(filters.view === 'map' && !isDesktop && 'hidden')}>
          {loading ? (
            <div className={cn('grid gap-4', gridCols)}>
              {Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)}
            </div>
          ) : properties.length > 0 ? (
            <div className={cn('grid gap-4', gridCols)}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  origin={origin}
                  active={property.id === hoverId || property.id === selectedId}
                  onHover={mapVisible ? setHoverId : undefined}
                  headingLevel="h3"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
              <EmptyState
                icon={Building2}
                title="No properties match your filters"
                description={origin && filters.max_km ? `Nothing within ${filters.max_km} km of ${originName}. Try a bigger radius.` : 'Try widening your price range or clearing the university and property type filters.'}
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row" aria-label="Pagination">
              <Button variant="secondary" onClick={() => updateFilters({ page: filters.page - 1 })} disabled={filters.page <= 1} className="w-full sm:w-auto">
                Previous
              </Button>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Page {filters.page} of {totalPages}</span>
              <Button variant="secondary" onClick={() => updateFilters({ page: filters.page + 1 })} disabled={filters.page >= totalPages} className="w-full sm:w-auto">
                Next
              </Button>
            </nav>
          )}

          <p className={cn('mt-6 text-center text-xs text-slate-500 dark:text-slate-400', loading && 'invisible')}>
            Can&apos;t find a place? <Link to="/application" className="font-bold text-coral-700 underline-offset-2 hover:underline dark:text-coral-300">Submit an application</Link> and we will match you with available rooms.
          </p>
        </div>

        {mapVisible && isDesktop && (
          <div>
            <div className={cn('h-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-card dark:border-slate-800 lg:sticky', stickyTop)}>
              <MapFrame className="h-full w-full">{map}</MapFrame>
            </div>
          </div>
        )}
      </div>

      {mapVisible && !isDesktop && (
        <MobileMapLayer
          onClose={closeMobileMap}
          toolbar={<CampusChips variant="light" near={filters.near} onChoose={chooseOrigin} locating={geo.status === 'loading'} />}
        >
          <MapFrame className="h-full w-full">{map}</MapFrame>
        </MobileMapLayer>
      )}

      {!isDesktop && filters.view !== 'map' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center">
          <button
            type="button"
            onClick={() => updateFilters({ view: 'map' })}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-bold text-white shadow-float transition-transform active:scale-95 dark:bg-white dark:text-ink-950"
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" />Show map
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
