import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Home } from 'lucide-react';
import { propertiesAPI } from '../services/api';
import { parseAmenities, renderAmenityIcon } from '../constants/amenities';

const INITIAL_FILTERS = {
  search: '',
  university: 'all',
  type: 'all',
  minPrice: '',
  maxPrice: '',
  page: 1,
};

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: filters.page,
        ...(filters.university !== 'all' && { university: filters.university }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice && { min_price: filters.minPrice }),
        ...(filters.maxPrice && { max_price: filters.maxPrice }),
      };
      const response = await propertiesAPI.getProperties(params);
      setProperties(response.data.properties);
      setTotalPages(response.data.pages);
    } catch {
      setError('Failed to load properties. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }),
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Home className="h-3.5 w-3.5" />
              Browse properties
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              Find accommodation
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
              Compare student accommodation by campus, type, price, reviews, and NSFAS availability.
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or location"
                  className={`${inputClass} pl-9`}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <select
                className={inputClass}
                value={filters.university}
                onChange={(e) => handleFilterChange('university', e.target.value)}
              >
                <option value="all">All universities</option>
                <option value="wits">Wits</option>
                <option value="uj">UJ</option>
              </select>
              <select
                className={inputClass}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All types</option>
                <option value="residence">Residence</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
              <input
                type="number"
                placeholder="Min price"
                className={inputClass}
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max price"
                className={inputClass}
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Clear
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            <button onClick={fetchProperties} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">
              Retry
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
              {loading ? 'Loading properties' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} found`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Page {filters.page} of {totalPages}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="h-4 w-4" />
            Filtered results
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="h-32 animate-pulse bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-9 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {properties.map((property) => {
              const amenities = parseAmenities(property.amenities);
              const reviewCount = property.review_count || 0;
              return (
                <article key={property.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900">
                  <div className="relative h-32 overflow-hidden bg-brand-900 sm:h-36">
                    {property.primary_image_url ? (
                      <img src={property.primary_image_url} alt={property.name} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white/50">Photos coming soon</span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-brand-700 shadow-sm">
                        {property.university}
                      </span>
                      {property.nsfas_accredited && (
                        <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">NSFAS</span>
                      )}
                    </div>
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold capitalize text-white backdrop-blur">
                        {property.property_type}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-950 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                        {property.name}
                      </h3>
                      <div className="flex shrink-0 items-center gap-1 rounded-full bg-gold-50 px-2 py-1 dark:bg-gold-500/10">
                        <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{property.average_rating || 'New'}</span>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center text-slate-500 dark:text-slate-400">
                      <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                      <span className="truncate text-xs">{property.address}</span>
                    </div>

                    <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{property.description}</p>

                    {amenities.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {amenities.slice(0, 2).map((amenity, i) => (
                          <div key={i} className="flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {renderAmenityIcon(amenity)}
                            <span className="ml-1.5 truncate">{amenity}</span>
                          </div>
                        ))}
                        {amenities.length > 2 && (
                          <span className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-400 dark:bg-slate-800/60">+{amenities.length - 2}</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800">
                      <div className="mb-3 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-base font-bold text-brand-600 dark:text-brand-400">
                            R{property.price_min.toLocaleString()} to R{property.price_max.toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">per month</p>
                        </div>
                        <p className="shrink-0 text-[11px] font-semibold text-slate-400">{reviewCount} review{reviewCount === 1 ? '' : 's'}</p>
                      </div>

                      <Link to={`/properties/${property.id}`} className="block rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-700">
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Search className="mx-auto mb-4 h-9 w-9 text-slate-400" />
            <h3 className="text-base font-bold text-slate-950 dark:text-white">No properties found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">Try changing your search, price range, university, or property type.</p>
            <button onClick={() => setFilters(INITIAL_FILTERS)} className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
              Clear filters
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page <= 1}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Page {filters.page} of {totalPages}</span>
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
