import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Shield, Users, Home, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { propertiesAPI } from '../services/api';

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await propertiesAPI.getProperties({ per_page: 6});
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
      <section className="relative py-20 md:py-32 text-white overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/2 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-block bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                🏠 Bringing Comfort to Every Doorstep
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Student Home
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Bringing comfort to every doorstep. Discover verified student accommodations near your university with reviews from real students.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-5xl mx-auto backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by property name or area..."
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <select 
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                  >
                    <option value="all">All Universities</option>
                    <option value="wits">Wits University</option>
                    <option value="uj">University of Johannesburg</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button 
                  onClick={handleSearch}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg flex items-center justify-center group"
                >
                  Browse Properties
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/register"
                  className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-lg text-center"
                >
                  Start Application
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-700 mb-2 counter" data-target="500">500+</div>
              <div className="text-gray-600 font-medium">Verified Properties</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-700 mb-2">2,000+</div>
              <div className="text-gray-600 font-medium">Happy Students</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-700 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Verified Reviews</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-700 mb-2">4.8★</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Featured Properties
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Top-Rated Student Accommodations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover premium accommodations loved by Wits and UJ students, verified through authentic reviews
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative">
                    <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <span className="text-white font-semibold text-lg relative z-10">Coming Soon</span>
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          {property.university.toUpperCase()}
                        </span>
                        {property.nsfas_accredited && (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            NSFAS
                          </span>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                          {property.property_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {property.name}
                      </h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
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
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-center block group-hover:shadow-lg"
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
              className="inline-flex items-center bg-white text-blue-700 border-2 border-blue-700 px-8 py-4 rounded-xl hover:bg-blue-700 hover:text-white transition-all duration-300 font-semibold text-lg group"
            >
              View All Properties
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Why Choose oneApplyHub?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Bringing Comfort to Every Doorstep
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're dedicated to helping students find safe, comfortable, and affordable accommodation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Properties</h3>
              <p className="text-gray-600 leading-relaxed">
                Every property is verified and inspected to ensure quality and safety standards for student living.
              </p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Authentic Reviews</h3>
              <p className="text-gray-600 leading-relaxed">
                Read honest reviews from verified students who have lived in these accommodations.
              </p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Student Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a community of students helping each other find the perfect home away from home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Find Your Perfect Student Home?
          </h2>
          <p className="text-xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of Wits and UJ students who've found their ideal accommodation through oneApplyHub
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/properties"
              className="bg-white text-blue-700 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold text-lg flex items-center group"
            >
              Browse Properties
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-700 transition-all duration-300 font-semibold text-lg"
            >
              Share Your Review
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <span className="font-bold text-2xl">oneApplyHub</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Bringing comfort to every doorstep. Helping students find their perfect home near Wits and UJ universities.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                  <span className="sr-only">Facebook</span>
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                </button>
                <button className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                  <span className="sr-only">Twitter</span>
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                </button>
                <button className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                  <span className="sr-only">Instagram</span>
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Browse</h3>
              <ul className="space-y-3">
                <li><Link to="/properties" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  All Properties
                </Link></li>
                <li><Link to="/properties?university=wits" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Wits Accommodation
                </Link></li>
                <li><Link to="/properties?university=uj" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  UJ Accommodation
                </Link></li>
                <li><Link to="/properties?type=residence" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Student Residences
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3">
                <li><button className="text-gray-400 hover:text-white transition-colors duration-300 text-left flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Help Center
                </button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors duration-300 text-left flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Contact Us
                </button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors duration-300 text-left flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Report Property
                </button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors duration-300 text-left flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Safety Guidelines
                </button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Universities</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  University of the Witwatersrand
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  University of Johannesburg
                </li>
              </ul>
              
              <div className="mt-8">
                <h4 className="font-semibold mb-4 text-white">Newsletter</h4>
                <p className="text-gray-400 text-sm mb-4">Get updates on new properties and tips for student life.</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="bg-gray-800 text-white px-4 py-2 rounded-l-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 oneApplyHub. Made for students, by students. Bringing comfort to every doorstep.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;