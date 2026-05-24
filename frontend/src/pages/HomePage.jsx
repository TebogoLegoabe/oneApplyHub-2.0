import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Shield, Users, Home, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { propertiesAPI, statsAPI } from '../services/api';

const useFadeIn = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const STAT_CONFIGS = [
  { icon: Home, key: 'properties', label: 'Verified Properties' },
  { icon: Users, key: 'students', label: 'Happy Students' },
  { icon: CheckCircle, key: 'reviews', label: 'Verified Reviews' },
  { icon: TrendingUp, key: 'avg_rating', label: 'Average Rating' },
];

const FEATURES = [
  {
    icon: Shield,
    color: 'bg-blue-600',
    title: 'Verified Properties',
    description: 'Every property is inspected and verified for quality and student safety.',
  },
  {
    icon: Star,
    color: 'bg-amber-500',
    title: 'Authentic Reviews',
    description: 'Honest reviews from verified students who have lived there.',
  },
  {
    icon: Users,
    color: 'bg-emerald-600',
    title: 'Student Community',
    description: 'A community of students helping each other find the perfect home.',
  },
];

const UNIV_BADGE = {
  wits: 'bg-blue-100 text-blue-800',
  uj: 'bg-teal-100 text-teal-800',
  both: 'bg-purple-100 text-purple-800',
};

const PropertyCard = ({ property }) => {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ opacity: 0, transform: 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col"
    >
      <div className="relative h-36 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <Home className="w-8 h-8 text-white/30" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
          <span className={`${UNIV_BADGE[property.university] || UNIV_BADGE.both} px-2 py-0.5 rounded-full text-xs font-bold`}>
            {property.university?.toUpperCase()}
          </span>
          {property.nsfas_accredited && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">NSFAS</span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="bg-black/40 text-white px-2 py-0.5 rounded-full text-xs font-medium capitalize">
            {property.property_type}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1.5 gap-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-700 transition-colors leading-snug">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="font-bold text-gray-800 text-xs">{property.average_rating || 'New'}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-400 mb-2">
          <MapPin className="w-3 h-3 mr-1 text-blue-400 flex-shrink-0" />
          <span className="text-xs truncate">{property.address}</span>
        </div>

        <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed flex-1">
          {property.description}
        </p>

        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-700 mb-3">
          <div>
            <div className="text-sm font-extrabold text-blue-700">
              R{property.price_min?.toLocaleString()} – R{property.price_max?.toLocaleString()}
            </div>
            <span className="text-gray-400 text-xs">per month</span>
          </div>
          <span className="text-xs text-gray-400">{property.review_count} reviews</span>
        </div>

        <Link
          to={`/properties/${property.id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold text-xs text-center block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const featuredRef = useFadeIn();
  const featuresRef = useFadeIn();

  useEffect(() => {
    propertiesAPI.getProperties({ per_page: 6 })
      .then((r) => setFeaturedProperties(r.data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
    statsAPI.getStats()
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedUniversity !== 'all') params.append('university', selectedUniversity);
    navigate(`/properties?${params}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <section className="relative py-14 md:py-20 text-white overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-16 w-80 h-80 bg-white/5 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-500/20 rounded-full animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <span
              className="inline-block bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ animation: 'fadeDown 0.6s ease forwards' }}
            >
              All Your Options. One Platform.
            </span>
            <h1
              className="text-3xl md:text-5xl font-bold mb-3 leading-tight"
              style={{ animation: 'fadeDown 0.7s ease 0.1s both' }}
            >
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Student Home
              </span>
            </h1>
            <p
              className="text-sm md:text-base text-blue-100 max-w-xl mx-auto leading-relaxed"
              style={{ animation: 'fadeDown 0.7s ease 0.2s both' }}
            >
              Accredited student accommodations near your university, backed by reviews from students.
            </p>
          </div>

          {/* Search Card */}
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 shadow-2xl max-w-2xl mx-auto"
            style={{ animation: 'fadeUp 0.7s ease 0.3s both' }}
          >
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or area..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <select
                className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <option value="all">All Universities</option>
                <option value="wits">Wits University</option>
                <option value="uj">University of Johannesburg</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 group shadow-sm"
              >
                Browse Properties
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <Link
                to="/register"
                className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl transition-all font-semibold text-sm text-center"
              >
                Start Application
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full dark:hidden">
            <path d="M0 30 C360 0 1080 0 1440 30 L1440 30 L0 30 Z" fill="#F9FAFB" />
          </svg>
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full hidden dark:block">
            <path d="M0 30 C360 0 1080 0 1440 30 L1440 30 L0 30 Z" fill="#111827" />
          </svg>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STAT_CONFIGS.map(({ icon: Icon, key, label }) => {
              let value = '—';
              if (stats) {
                const raw = stats[key];
                if (key === 'avg_rating') value = raw != null ? `${raw}★` : '—';
                else if (key === 'reviews') value = raw != null ? `${raw}` : '—';
                else value = raw != null ? `${raw}+` : '—';
              }
              return (
                <div
                  key={label}
                  className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="bg-blue-600 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-blue-700 leading-none">
                      {stats ? value : <span className="inline-block w-10 h-4 bg-gray-200 animate-pulse rounded" />}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10 bg-white dark:bg-gray-900">
        <div
          ref={featuredRef}
          style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
                Featured
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Top-Rated Accommodations</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Verified properties ranked by authentic student reviews.</p>
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm group flex-shrink-0"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-36 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-10 bg-gray-50 dark:bg-gray-900">
        <div
          ref={featuresRef}
          style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
              Why oneApplyHub?
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Everything You Need to Find Home
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
              Safe, affordable accommodation near campus verified for students, by students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, title, description }, i) => (
              <div
                key={title}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex gap-4 items-start group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/5 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Find Your Student Home?</h2>
          <p className="text-sm mb-6 text-blue-100 max-w-lg mx-auto">
            Join thousands of Wits and UJ students who found their ideal accommodation through oneApplyHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/properties"
              className="bg-white text-blue-700 hover:bg-gray-100 px-7 py-2.5 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 group shadow-md"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="border-2 border-white/60 text-white hover:border-white hover:bg-white/10 px-7 py-2.5 rounded-xl transition-all font-semibold text-sm text-center"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
