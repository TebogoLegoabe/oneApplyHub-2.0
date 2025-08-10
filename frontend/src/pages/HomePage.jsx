import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';
import { propertiesAPI } from '../services/api';

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await propertiesAPI.getProperties({ per_page: 12});
        setFeaturedProperties(response.data.properties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedUniversity !== 'all') params.append('university', selectedUniversity);
    
    window.location.href = `/properties?${params}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect
            <span className="block text-yellow-300">Student Home</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Discover the best student accommodation near Wits and UJ through honest reviews from fellow students on oneApplyHub
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by property name or area..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                >
                  <option value="all">All Universities</option>
                  <option value="wits">Wits</option>
                  <option value="uj">UJ</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4 font-semibold"
            >
              Search Properties
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Properties Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">2,000+</div>
              <div className="text-gray-600">Student Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Verified Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.2★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Top-rated accommodations loved by Wits and UJ students
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading properties...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {property.university}
                    </div>
                    {property.nsfas_accredited && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        NSFAS
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{property.average_rating || 'New'}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({property.review_count} reviews)
                        </span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        R{property.price_min} - R{property.price_max}
                      </div>
                    </div>
                    
                    <Link
                      to={`/properties/${property.id}`}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold block text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Student Home?
          </h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Join thousands of Wits and UJ students who've found their ideal accommodation through oneApplyHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Browse Properties
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
            >
              Share Your Review
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="font-bold text-xl">oneApplyHub</span>
              </div>
              <p className="text-gray-400">
                Helping students find their perfect home near Wits and UJ universities.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Browse</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/properties" className="hover:text-white transition-colors">All Properties</Link></li>
                <li><Link to="/properties?university=wits" className="hover:text-white transition-colors">Wits Accommodation</Link></li>
                <li><Link to="/properties?university=uj" className="hover:text-white transition-colors">UJ Accommodation</Link></li>
                <li><Link to="/properties?type=residence" className="hover:text-white transition-colors">Student Residences</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors text-left">Help Center</button></li>
                <li><button className="hover:text-white transition-colors text-left">Contact Us</button></li>
                <li><button className="hover:text-white transition-colors text-left">Report Property</button></li>
                <li><button className="hover:text-white transition-colors text-left">Safety Guidelines</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Universities</h3>
              <ul className="space-y-2 text-gray-400">
                <li>University of the Witwatersrand</li>
                <li>University of Johannesburg</li>
              </ul>
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Connect With Us</h4>
                <div className="flex space-x-4">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Facebook</span>
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Twitter</span>
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Instagram</span>
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 oneApplyHub. Made for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
