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
    description: 'Every listing is reviewed before students apply, so you spend less time guessing.',
  },
  {
    icon: Star,
    color: 'bg-amber-500',
    title: 'Authentic Reviews',
    description: 'Read practical feedback from students on safety, value, location, and management.',
  },
  {
    icon: Users,
    color: 'bg-emerald-600',
    title: 'Simple Applications',
    description: 'Apply once, keep your reference number, and track your accommodation progress.',
  },
];

const TRUST_POINTS = ['Wits and UJ focused', 'NSFAS filters', 'Verified reviews', 'Admin moderated'];

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
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
    >
      <div className="relative h-40 bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
        <Home className="w-10 h-10 text-white/35" />
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          <span className={`${UNIV_BADGE[property.university] || UNIV_BADGE.both} px-2.5 py-1 rounded-full text-xs font-bold`}>
            {property.university?.toUpperCase()}
          </span>
          {property.nsfas_accredited && (
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">NSFAS</span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-black/40 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-medium capitalize">
            {property.property_type}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2 gap-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-700 transition-colors leading-snug">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-bold text-gray-800 text-xs">{property.average_rating || 'New'}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-500 flex-shrink-0" />
          <span className="text-xs truncate">{property.address}</span>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
          {property.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mb-4">
          <div>
            <div className="text-base font-extrabold text-blue-700 dark:text-blue-400">
              R{property.price_min?.toLocaleString()} to R{property.price_max?.toLocaleString()}
            </div>
            <span className="text-gray-400 text-xs">per month</span>
          </div>
          <span className="text-xs text-gray-400">{property.review_count} reviews</span>
        </div>

        <Link
          to={`/properties/${property.id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-colors font-semibold text-sm text-center block"
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
      <section className="relative py-16 md:py-24 text-white overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-800">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute top-1/4 right-0 w-[32rem] h-[32rem] bg-violet-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%)]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div>
              <span
                className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-4 py-2 rounded-full text-xs font-semibold mb-5 backdrop-blur"
                style={{ animation: 'fadeDown 0.6s ease forwards' }}
              >
                <Shield className="w-3.5 h-3.5" />
                All Your Options. One Platform.
              </span>
              <h1
                className="text-4xl md:text-6xl font-black mb-5 leading-tight tracking-tight"
                style={{ animation: 'fadeDown 0.7s ease 0.1s both' }}
              >
                Find student accommodation without the stress
              </h1>
              <p
                className="text-base md:text-lg text-blue-100 max-w-2xl leading-relaxed"
                style={{ animation: 'fadeDown 0.7s ease 0.2s both' }}
              >
                Search verified places near Wits and UJ, compare reviews, and start your application from one clean dashboard.
              </p>

              <div className="flex flex-wrap gap-2 mt-6" style={{ animation: 'fadeDown 0.7s ease 0.25s both' }}>
                {TRUST_POINTS.map((point) => (
                  <span key={point} className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-full text-xs font-medium text-blue-50 backdrop-blur">
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white rounded-3xl p-5 md:p-6 shadow-2xl border border-white/30 backdrop-blur" style={{ animation: 'fadeUp 0.7s ease 0.3s both' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Start here</p>
                  <h2 className="text-xl font-extrabold">Search accommodation</h2>
                </div>
                <div className="w-11 h-11 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by property name or area"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <select
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                >
                  <option value="all">All Universities</option>
                  <option value="wits">Wits University</option>
                  <option value="uj">University of Johannesburg</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-5 py-3 rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 group shadow-sm"
                >
                  Browse Properties
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <Link
                  to="/register"
                  className="border-2 border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-2xl transition-all font-bold text-sm text-center"
                >
                  Start Application
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-3">
                  <p className="text-lg font-black text-blue-700 dark:text-blue-300">1</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Search</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3">
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">2</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Compare</p>
                </div>
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-3">
                  <p className="text-lg font-black text-amber-700 dark:text-amber-300">3</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Apply</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full dark:hidden">
            <path d="M0 30 C360 0 1080 0 1440 30 L1440 30 L0 30 Z" fill="#F9FAFB" />
          </svg>
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full hidden dark:block">
            <path d="M0 30 C360 0 1080 0 1440 30 L1440 30 L0 30 Z" fill="#111827" />
          </svg>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STAT_CONFIGS.map(({ icon: Icon, key, label }) => {
              let value = 'N/A';
              if (stats) {
                const raw = stats[key];
                if (key === 'avg_rating') value = raw != null ? `${raw}★` : 'N/A';
                else if (key === 'reviews') value = raw != null ? `${raw}` : 'N/A';
                else value = raw != null ? `${raw}+` : 'N/A';
              }
              return (
                <div
                  key={label}
                  className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 flex items-center gap-3 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-blue-700 dark:text-blue-400 leading-none">
                      {stats ? value : <span className="inline-block w-10 h-4 bg-gray-200 animate-pulse rounded" />}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-gray-900">
        <div
          ref={featuredRef}
          style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-end justify-between mb-7 gap-4">
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
                Featured
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Top Rated Accommodations</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div
          ref={featuresRef}
          style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
              Why oneApplyHub?
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">
              Everything You Need to Find Home
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-sm">
              Safe, affordable accommodation near campus, verified for students, by students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, description }, i) => (
              <div
                key={title}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300 mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-blue-600 via-indigo-700 to-violet-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/5 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-2xl md:text-4xl font-black mb-3">Ready to Find Your Student Home?</h2>
          <p className="text-sm md:text-base mb-7 text-blue-100 max-w-xl mx-auto">
            Join Wits and UJ students using oneApplyHub to search, compare, review, and apply with more confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/properties"
              className="bg-white text-blue-700 hover:bg-gray-100 px-7 py-3 rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 group shadow-md"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="border-2 border-white/60 text-white hover:border-white hover:bg-white/10 px-7 py-3 rounded-2xl transition-all font-bold text-sm text-center"
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
