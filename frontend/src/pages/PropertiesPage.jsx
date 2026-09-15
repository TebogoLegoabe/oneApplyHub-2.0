import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, Home, X, Building2 } from 'lucide-react';
import { propertiesAPI } from '../services/api';
import { parseAmenities, renderAmenityIcon } from '../constants/amenities';
import { Alert, Button, EmptyState, Input, PageHeader, Select, Skeleton } from '../components/ui';
import { cn } from '../utils/cn';

const FILTER_KEYS = ['search', 'university', 'type', 'min_price', 'max_price'];
const SEARCH_DEBOUNCE_MS = 400;

const PropertyCard = ({ property }) => {
  const amenities = parseAmenities(property.amenities);
  const reviewCount = property.review_count || 0;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950">
        {property.primary_image_url ? (
          <img
            src={property.primary_image_url}
            alt={property.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_55%)]" aria-hidden="true" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="h-9 w-9 text-white/20" aria-hidden="true" />
            </div>
          </>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-brand-700 shadow-sm">{property.university}</span>
          {property.nsfas_accredited && <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">NSFAS</span>}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold capitalize text-white backdrop-blur">
          {property.property_type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-950 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
            {property.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-50 px-2 py-1 text-xs font-bold text-slate-700 ring-1 ring-inset ring-gold-200/70 dark:bg-gold-500/10 dark:text-slate-200 dark:ring-gold-400/20">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" aria-hidden="true" />
            {property.average_rating || 'New'}
          </span>
        </div>

        <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
          <span className="truncate">{property.address}</span>
        </p>

        <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{property.description}</p>

        {amenities.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-1.5" aria-label="Amenities">
            {amenities.slice(0, 3).map((amenity) => (
              <li key={amenity} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {renderAmenityIcon(amenity, 'h-3 w-3')}
                <span className="truncate">{amenity}</span>
              </li>
            ))}
            {amenities.length > 3 && (
              <li className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-400 dark:bg-slate-800/60">+{amenities.length - 3}</li>
            )}
          </ul>
        )}

        <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-bold text-brand-700 dark:text-brand-300">
                R{property.price_min?.toLocaleString()} – R{property.price_max?.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">per month</p>
            </div>
            <p className="shrink-0 text-[11px] font-medium text-slate-400">{reviewCount} review{reviewCount === 1 ? '' : 's'}</p>
          </div>
          <Button to={`/properties/${property.id}`} fullWidth>View details</Button>
        </div>
      </div>
    </article>
  );
};

const PropertyCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <Skeleton className="aspect-[4/3] rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

const PropertiesPage = () => {
  // The URL is the single source of truth for filters, so the homepage search,
  // browser back/forward, and shared links all work.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    university: searchParams.get('university') || 'all',
    type: searchParams.get('type') || 'all',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  }), [searchParams]);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(null);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef(null);

  const updateFilters = useCallback((patch) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      Object.entries(patch).forEach(([key, value]) => {
        const isDefault = value === '' || value === 'all' || value == null || (key === 'page' && Number(value) <= 1);
        if (isDefault) next.delete(key);
        else next.set(key, String(value));
      });
      // Any filter change other than paging returns to the first page.
      if (!('page' in patch)) next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Keep the text box in sync if the URL changes from outside (e.g. Clear filters).
  useEffect(() => { setSearchInput(filters.search); }, [filters.search]);

  const handleSearchInput = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateFilters({ search: value.trim() }), SEARCH_DEBOUNCE_MS);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: filters.page };
      FILTER_KEYS.forEach((key) => {
        if (filters[key] && filters[key] !== 'all') params[key] = filters[key];
      });
      const response = await propertiesAPI.getProperties(params);
      setProperties(response.data.properties || []);
      setTotalPages(response.data.pages || 1);
      setTotal(response.data.total ?? null);
    } catch {
      setError('We could not load properties. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const activeFilterCount = FILTER_KEYS.filter((key) => filters[key] && filters[key] !== 'all').length;
  const clearFilters = () => {
    clearTimeout(debounceRef.current);
    setSearchParams({}, { replace: true });
  };

  const resultLabel = loading
    ? 'Loading properties…'
    : total != null
      ? `${total} propert${total === 1 ? 'y' : 'ies'} found`
      : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} on this page`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <PageHeader
        eyebrow="Browse properties"
        icon={Home}
        title="Find accommodation"
        description="Compare student accommodation by campus, type, price, reviews, and NSFAS accreditation."
        className="mb-4"
      />

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900" aria-label="Filters">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <Input
            icon={Search}
            type="search"
            aria-label="Search by name or location"
            placeholder="Search by name or location"
            wrapperClassName="lg:col-span-2"
            value={searchInput}
            onChange={(event) => handleSearchInput(event.target.value)}
          />
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
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <Input
            type="number"
            inputMode="numeric"
            min="0"
            aria-label="Minimum monthly price"
            placeholder="Min price (R)"
            value={filters.min_price}
            onChange={(event) => updateFilters({ min_price: event.target.value })}
          />
          <Input
            type="number"
            inputMode="numeric"
            min="0"
            aria-label="Maximum monthly price"
            placeholder="Max price (R)"
            value={filters.max_price}
            onChange={(event) => updateFilters({ max_price: event.target.value })}
          />
          <Button variant="ghost" onClick={clearFilters} disabled={activeFilterCount === 0} className="sm:justify-self-end">
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

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg" aria-live="polite">{resultLabel}</h2>
          {!loading && totalPages > 1 && <p className="text-xs text-slate-500 dark:text-slate-400">Page {filters.page} of {totalPages}</p>}
        </div>
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          {activeFilterCount === 0 ? 'Showing all properties' : `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} applied`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <PropertyCardSkeleton key={index} />)}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            icon={Building2}
            title="No properties match your filters"
            description="Try widening your price range or clearing the university and property type filters."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row" aria-label="Pagination">
          <Button variant="secondary" onClick={() => updateFilters({ page: filters.page - 1 })} disabled={filters.page <= 1} className="w-full sm:w-auto">
            Previous
          </Button>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Page {filters.page} of {totalPages}</span>
          <Button variant="secondary" onClick={() => updateFilters({ page: filters.page + 1 })} disabled={filters.page >= totalPages} className="w-full sm:w-auto">
            Next
          </Button>
        </nav>
      )}

      <p className={cn('mt-6 text-center text-xs text-slate-400 dark:text-slate-500', loading && 'invisible')}>
        Can't find a place? <Link to="/application" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">Submit an application</Link> and we will match you with available rooms.
      </p>
    </div>
  );
};

export default PropertiesPage;
