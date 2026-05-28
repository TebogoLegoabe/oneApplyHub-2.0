import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Star } from 'lucide-react';
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
    'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm bg-white';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 text-white">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Find Your Accommodation</h1>
          <p className="text-sm text-blue-100 max-w-xl">
            Browse verified student properties near Wits and UJ. Filter by university, type, and price range.
          </p>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-5">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <select
                className={inputClass}
                value={filters.university}
                onChange={(e) => handleFilterChange('university', e.target.value)}
              >
                <option value="all">All Universities</option>
                <option value="wits">Wits</option>
                <option value="uj">UJ</option>
              </select>
              <select
                className={inputClass}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="residence">Residence</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range (per month)</label>
                <div className="flex gap-3">
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
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={fetchProperties} className="text-red-600 hover:text-red-700 font-semibold text-sm ml-4 flex-shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {loading ? 'Loading...' : `${properties.length} properties found`}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            Page {filters.page} of {totalPages}
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => {
              const amenities = parseAmenities(property.amenities);
              return (
                <div
                  key={property.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative">
                    <span className="text-white/80 font-medium text-sm">Photos Coming Soon</span>
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {property.university.toUpperCase()}
                      </span>
                      {property.nsfas_accredited && (
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          NSFAS
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                        {property.property_type}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-700 transition-colors">
                      {property.name}
                    </h3>

                    <div className="flex items-center text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-blue-500" />
                      <span className="text-sm truncate">{property.address}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>

                    {/* Amenities */}
                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {amenities.slice(0, 3).map((amenity, i) => (
                          <div key={i} className="flex items-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs">
                            {renderAmenityIcon(amenity)}
                            <span className="ml-1.5">{amenity}</span>
                          </div>
                        ))}
                        {amenities.length > 3 && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            +{amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price & Rating */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-blue-600">
                          R{property.price_min.toLocaleString()} – R{property.price_max.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm block">per month</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold text-gray-800">{property.average_rating || 'New'}</span>
                        <span className="text-gray-400 ml-1">({property.review_count})</span>
                      </div>
                    </div>

                    <Link
                      to={`/properties/${property.id}`}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page <= 1}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
