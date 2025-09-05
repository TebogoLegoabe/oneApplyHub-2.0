import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Wifi, Shield, Car, Users, ArrowRight, Home, SlidersHorizontal } from 'lucide-react';
import { propertiesAPI } from '../services/api';

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    university: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await propertiesAPI.getProperties(filters);
      setProperties(response.data.properties);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Only reset to page 1 when other filters change, not when changing page
      ...(key !== 'page' && { page: 1 })
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'WiFi': <Wifi className="w-4 h-4" />,
      'Security': <Shield className="w-4 h-4" />,
      '24/7 Security': <Shield className="w-4 h-4" />,
      'Parking': <Car className="w-4 h-4" />,
      'Gym': <Users className="w-4 h-4" />
    };
    return iconMap[amenity] || <span className="w-4 h-4 bg-gray-300 rounded-full"></span>;
  };

  const parseAmenities = (amenitiesString) => {
    try {
      return JSON.parse(amenitiesString || '[]');
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
         
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Student Accommodations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover verified properties near Wits and UJ universities. Filter by location, price, amenities, and read authentic student reviews.
          </p>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="flex items-center mb-6">
            <SlidersHorizontal className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Search & Filter Properties</h3>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Enhanced Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property or Location
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-blue-500" />
                  <input
                    type="text"
                    placeholder="Search by name or location..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium bg-white/50 backdrop-blur-sm transition-all duration-300"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              {/* University Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  University
                </label>
                <select
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium bg-white/50 backdrop-blur-sm transition-all duration-300"
                  value={filters.university}
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                >
                  <option value="all">All Universities</option>
                  <option value="wits">Wits University</option>
                  <option value="uj">University of Johannesburg</option>
                </select>
              </div>

              {/* Property Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium bg-white/50 backdrop-blur-sm transition-all duration-300"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="residence">Student Residence</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range (per month)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min price (R)"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium bg-white/50 backdrop-blur-sm transition-all duration-300"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max price (R)"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium bg-white/50 backdrop-blur-sm transition-all duration-300"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg flex items-center justify-center group"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Properties
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {loading ? 'Searching...' : `${properties.length} Properties Available`}
            </h2>
            <p className="text-gray-600">
              {!loading && properties.length > 0 && `Showing results for your search criteria`}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 mt-4 sm:mt-0">
            <Filter className="w-4 h-4" />
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Page {filters.page} of {totalPages}
            </span>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-white/20">
                {/* Enhanced Property Image */}
                <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <span className="text-white font-semibold text-lg relative z-10">Photos Coming Soon</span>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {property.university.toUpperCase()}
                    </span>
                    {property.nsfas_accredited && (
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        NSFAS
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize backdrop-blur-sm">
                      {property.property_type}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1 font-bold text-gray-800">
                        {property.average_rating || 'New'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{property.address}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {property.description}
                  </p>

                  {/* Enhanced Amenities */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {parseAmenities(property.amenities).slice(0, 3).map((amenity, index) => (
                      <div key={index} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium border border-blue-200">
                        {getAmenityIcon(amenity)}
                        <span className="ml-2">{amenity}</span>
                      </div>
                    ))}
                    {parseAmenities(property.amenities).length > 3 && (
                      <span className="text-xs text-gray-500 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
                        +{parseAmenities(property.amenities).length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Enhanced Price and Rating */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        R{property.price_min.toLocaleString()} - R{property.price_max.toLocaleString()}
                      </div>
                      <span className="text-gray-500 text-sm">per month</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {property.review_count} reviews
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/properties/${property.id}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-center block group-hover:shadow-lg flex items-center justify-center"
                  >
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleFilterChange('page', pageNum)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.page === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced No Results */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Properties Found</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We couldn't find any properties matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => setFilters({
                  search: '',
                  university: 'all',
                  type: 'all',
                  minPrice: '',
                  maxPrice: '',
                  page: 1
                })}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default PropertiesPage;