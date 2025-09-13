import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, DollarSign, GraduationCap, Users, ExternalLink, BookOpen, Award, Clock, CheckCircle, AlertCircle, Heart, Building } from 'lucide-react';

// Move sample data outside component to avoid useEffect dependency warning
const sampleBursaries = [
  {
    id: 1,
    title: "NSFAS Bursary",
    provider: "National Student Financial Aid Scheme",
    type: "Government",
    amount: "Full tuition + accommodation + allowances",
    deadline: "2024-01-31",
    studyLevel: "undergraduate",
    university: "all",
    description: "Comprehensive financial aid for students from poor and working-class families.",
    requirements: ["South African citizen", "Combined household income under R350,000", "First-time entering higher education"],
    applicationUrl: "https://www.nsfas.org.za",
    status: "Open",
    category: "government"
  },
  {
    id: 2,
    title: "Funza Lushaka Bursary",
    provider: "Department of Basic Education",
    type: "Government",
    amount: "Full tuition + accommodation + book allowance",
    deadline: "2024-02-28",
    studyLevel: "undergraduate",
    university: "all",
    description: "For students pursuing teaching qualifications in priority subjects.",
    requirements: ["Teaching qualification in priority subjects", "Commitment to teach for required period", "Academic merit"],
    applicationUrl: "https://www.funzalushaka.doe.gov.za",
    status: "Open",
    category: "government"
  },
  {
    id: 3,
    title: "Discovery Health Bursary",
    provider: "Discovery Health",
    type: "Private",
    amount: "R50,000 - R80,000 per year",
    deadline: "2024-03-15",
    studyLevel: "undergraduate",
    university: "wits",
    description: "For students studying health-related fields with academic excellence.",
    requirements: ["Health sciences field", "Academic average 70%+", "Financial need", "Leadership potential"],
    applicationUrl: "https://www.discovery.co.za/bursaries",
    status: "Open",
    category: "private"
  },
  {
    id: 4,
    title: "Anglo American Bursary",
    provider: "Anglo American",
    type: "Private",
    amount: "Full tuition + living expenses",
    deadline: "2024-04-30",
    studyLevel: "undergraduate",
    university: "wits",
    description: "Engineering and mining-focused bursary with work-back agreement.",
    requirements: ["Engineering or Mining qualification", "Academic excellence", "South African citizen", "Work-back agreement"],
    applicationUrl: "https://www.angloamerican.com/bursaries",
    status: "Open",
    category: "private"
  },
  {
    id: 5,
    title: "Sasol Bursary Programme",
    provider: "Sasol",
    type: "Private",
    amount: "R40,000 - R120,000 per year",
    deadline: "2024-05-31",
    studyLevel: "undergraduate",
    university: "all",
    description: "For students in STEM fields with leadership potential.",
    requirements: ["STEM qualification", "Academic merit", "Leadership skills", "South African citizen"],
    applicationUrl: "https://www.sasol.com/bursaries",
    status: "Open",
    category: "private"
  },
  {
    id: 6,
    title: "Golden Key Honours Society",
    provider: "Golden Key International",
    type: "Merit-based",
    amount: "R15,000 - R25,000",
    deadline: "2024-06-15",
    studyLevel: "undergraduate",
    university: "all",
    description: "Academic excellence bursary for top-performing students.",
    requirements: ["Top 15% academic performance", "Golden Key membership", "Community involvement"],
    applicationUrl: "https://www.goldenkey.org.za",
    status: "Open",
    category: "merit"
  },
  {
    id: 7,
    title: "Mastercard Foundation Scholars",
    provider: "Mastercard Foundation",
    type: "International",
    amount: "Full scholarship + living expenses",
    deadline: "2024-03-31",
    studyLevel: "undergraduate",
    university: "wits",
    description: "Comprehensive scholarship for academically talented students from disadvantaged backgrounds.",
    requirements: ["Academic excellence", "Financial need", "Leadership potential", "African citizen"],
    applicationUrl: "https://mastercardfdnscholars.org",
    status: "Open",
    category: "international"
  },
  {
    id: 8,
    title: "Allan Gray Orbis Foundation",
    provider: "Allan Gray Orbis Foundation",
    type: "Private",
    amount: "Full tuition + mentorship",
    deadline: "2024-07-31",
    studyLevel: "undergraduate",
    university: "all",
    description: "Entrepreneurship-focused bursary with mentorship programme.",
    requirements: ["Entrepreneurial spirit", "Academic potential", "Leadership qualities", "South African citizen"],
    applicationUrl: "https://www.allangrayorbis.org",
    status: "Open",
    category: "private"
  }
];

const BursaryPage = () => {
  const [bursaries, setBursaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    university: 'all',
    studyLevel: 'all',
    search: '',
    deadline: 'all'
  });
  const { isAuthenticated } = useAuth(); // Use actual auth hook

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setBursaries(sampleBursaries);
      setLoading(false);
    }, 1000);
  }, []); // Now no dependency warning

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'closing soon': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'government': return <Building className="w-5 h-5" />;
      case 'private': return <DollarSign className="w-5 h-5" />;
      case 'merit': return <Award className="w-5 h-5" />;
      case 'international': return <Users className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    return {
      formatted: date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      daysLeft: daysLeft,
      isUrgent: daysLeft <= 30 && daysLeft > 0
    };
  };

  const filteredBursaries = bursaries.filter(bursary => {
    if (filters.category !== 'all' && bursary.category !== filters.category) return false;
    if (filters.university !== 'all' && bursary.university !== 'all' && bursary.university !== filters.university) return false;
    if (filters.studyLevel !== 'all' && bursary.studyLevel !== filters.studyLevel) return false;
    if (filters.search && !bursary.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !bursary.provider.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Student Bursaries & Scholarships
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Find financial support for your studies from government, private companies, and international organizations
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{filteredBursaries.length}</div>
            <div className="text-gray-600">Available Bursaries</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {filteredBursaries.filter(b => b.status === 'Open').length}
            </div>
            <div className="text-gray-600">Applications Open</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {filteredBursaries.filter(b => formatDeadline(b.deadline).isUrgent).length}
            </div>
            <div className="text-gray-600">Closing Soon</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">R2M+</div>
            <div className="text-gray-600">Total Value</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bursaries..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="government">Government</option>
                <option value="private">Private</option>
                <option value="merit">Merit-based</option>
                <option value="international">International</option>
              </select>
            </div>

            {/* University Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.university}
                onChange={(e) => handleFilterChange('university', e.target.value)}
              >
                <option value="all">All Universities</option>
                <option value="wits">Wits</option>
                <option value="uj">UJ</option>
              </select>
            </div>

            {/* Study Level Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.studyLevel}
                onChange={(e) => handleFilterChange('studyLevel', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="honours">Honours</option>
                <option value="masters">Masters</option>
                <option value="phd">PhD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Important Notice for Non-authenticated Users */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Apply?</h3>
                <p className="text-blue-800 mb-4">
                  Create an account to save your favorite bursaries, track application deadlines, and get personalized recommendations.
                </p>
                <div className="flex space-x-3">
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    to="/login"
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bursary Cards */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Bursaries ({filteredBursaries.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Showing latest opportunities</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBursaries.length > 0 ? (
            <div className="space-y-6">
              {filteredBursaries.map((bursary) => {
                const deadline = formatDeadline(bursary.deadline);
                
                return (
                  <div key={bursary.id} className="bg-white rounded-lg shadow-sm border-2 border-blue-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(bursary.category)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{bursary.title}</h3>
                          <p className="text-gray-600 mb-2">{bursary.provider}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(bursary.status)}`}>
                              {bursary.status}
                            </span>
                            <span className="text-gray-500">{bursary.type}</span>
                            <span className="font-semibold text-green-600">{bursary.amount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center space-x-1 text-sm ${deadline.isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                          <Clock className="w-4 h-4" />
                          <span>
                            {deadline.daysLeft > 0 ? `${deadline.daysLeft} days left` : 'Deadline passed'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Deadline: {deadline.formatted}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{bursary.description}</p>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Key Requirements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {bursary.requirements.map((req, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {isAuthenticated && (
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">Save</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <a
                          href={bursary.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <span>Apply Now</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bursaries found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters to find more opportunities.
              </p>
              <button
                onClick={() => setFilters({ category: 'all', university: 'all', studyLevel: 'all', search: '', deadline: 'all' })}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Application Tips */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Bursary Application Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Apply Early</h4>
              <p className="text-sm text-gray-600">
                Submit applications well before deadlines. Many bursaries are awarded on a first-come basis.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Academic Excellence</h4>
              <p className="text-sm text-gray-600">
                Maintain good grades and provide certified academic transcripts with your application.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Stand Out</h4>
              <p className="text-sm text-gray-600">
                Highlight leadership experience, community involvement, and unique achievements.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-blue-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Need Help with Applications?</h3>
          <p className="text-blue-100 mb-6">
            Our student support team can help you identify the best bursary opportunities and improve your applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Get Application Help
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BursaryPage;