import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Shield, Users, Home, ArrowRight, CheckCircle, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import { propertiesAPI, statsAPI } from '../services/api';

const useFadeIn = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const STAT_CONFIGS = [
  { icon: Home,        key: 'properties', label: 'Verified Properties', color: 'text-blue-600' },
  { icon: Users,       key: 'students',   label: 'Happy Students',       color: 'text-indigo-600' },
  { icon: CheckCircle, key: 'reviews',    label: 'Verified Reviews',     color: 'text-emerald-600' },
  { icon: TrendingUp,  key: 'avg_rating', label: 'Average Rating',       color: 'text-amber-500' },
];

const FEATURES = [
  {
    icon: Shield,
    accent: 'bg-blue-600',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'Verified Properties',
    description: 'Every listing is inspected and confirmed safe before students ever see it.',
  },
  {
    icon: Star,
    accent: 'bg-amber-500',
    light: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'Authentic Reviews',
    description: 'Real feedback from verified students who actually lived there — no fake reviews.',
  },
  {
    icon: Users,
    accent: 'bg-emerald-600',
    light: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'Student Community',
    description: 'Thousands of Wits and UJ students helping each other find the best home.',
  },
];

const UNIV_COLORS = {
  wits: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  uj:   'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
};

const PropertyCard = ({ property }) => {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-40 bg-gradient-to-br from-slate-700 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent" />
        <Home className="absolute inset-0 m-auto w-10 h-10 text-white/20" />
        <div className="absolute top-3 left-3 flex gap-1.5 z-10 flex-wrap">
          <span className={`${UNIV_COLORS[property.university] || 'bg-purple-100 text-purple-800'} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide`}>
            {property.university}
          </span>
          {property.nsfas_accredited && (
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">NSFAS</span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-medium capitalize">
            {property.property_type}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 fill-amber-900" />
          <span className="text-[10px] font-bold">{property.average_rating || 'New'}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1 leading-snug">
          {property.name}
        </h3>
        <div className="flex items-center text-gray-400 mb-2.5">
          <MapPin className="w-3 h-3 mr-1 text-blue-400 flex-shrink-0" />
          <span className="text-xs truncate">{property.address}</span>
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed flex-1">
          {property.description}
        </p>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-base font-extrabold text-gray-900 dark:text-white">
              R{property.price_min?.toLocaleString()} <span className="text-gray-400 font-normal text-xs">– R{property.price_max?.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">per month</span>
          </div>
          <span className="text-[10px] text-gray-400">{property.review_count} reviews</span>
        </div>
        <Link
          to={`/properties/${property.id}`}
          className="w-full flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-600 text-white dark:text-slate-900 dark:hover:text-white py-2.5 rounded-xl transition-all duration-200 font-semibold text-xs group/btn"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
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
  const ctaRef      = useFadeIn();

  useEffect(() => {
    propertiesAPI.getProperties({ per_page: 6 })
      .then((r) => setFeaturedProperties(r.data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
    statsAPI.getStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedUniversity !== 'all') params.append('university', selectedUniversity);
    navigate(`/properties?${params}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center text-white overflow-hidden bg-[#070d1a]">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#070d1a] to-[#060b18]" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 px-4 py-2 rounded-full text-xs font-semibold text-blue-300 mb-8 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              South Africa's Student Platform
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              Find Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
                Perfect Home.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10">
              Verified student accommodation near Wits and UJ — with real reviews, bursary listings, and a one-step application.
            </p>

            {/* Search */}
            <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or area…"
                    className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <select
                  className="px-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all appearance-none"
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                >
                  <option value="all" className="bg-slate-900">All Universities</option>
                  <option value="wits" className="bg-slate-900">Wits University</option>
                  <option value="uj" className="bg-slate-900">Univ. of Johannesburg</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 group transition-colors"
                >
                  Browse Properties
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <Link to="/register"
                  className="flex-1 border border-white/15 hover:border-white/30 hover:bg-white/5 text-white px-6 py-3 rounded-xl font-semibold text-sm text-center transition-all">
                  Start Application
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full dark:hidden">
            <path d="M0 60 C480 20 960 20 1440 60 L1440 60 L0 60 Z" fill="#ffffff" />
          </svg>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full hidden dark:block">
            <path d="M0 60 C480 20 960 20 1440 60 L1440 60 L0 60 Z" fill="#111827" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white dark:bg-gray-900 py-10 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-gray-100 dark:divide-gray-800">
            {STAT_CONFIGS.map(({ icon: Icon, key, label, color }) => {
              let value = '—';
              if (stats) {
                const raw = stats[key];
                if (key === 'avg_rating') value = raw != null ? `${raw}★` : '—';
                else value = raw != null ? `${raw}+` : '—';
              }
              return (
                <div key={label} className="flex flex-col items-center text-center px-6 py-4">
                  <Icon className={`w-5 h-5 ${color} mb-2`} />
                  <div className={`text-3xl font-black ${color} leading-none mb-1`}>
                    {stats ? value : <span className="inline-block w-12 h-7 bg-gray-100 animate-pulse rounded" />}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div
          ref={featuredRef}
          style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Featured</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                Top-Rated<br className="hidden sm:block" /> Accommodations
              </h2>
              <p className="text-gray-400 mt-2 text-sm max-w-sm">
                Ranked by authentic student reviews — no sponsored listings.
              </p>
            </div>
            <Link to="/properties"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 group border border-gray-200 dark:border-gray-700 hover:border-blue-300 px-4 py-2 rounded-xl transition-all">
              View all
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-100 dark:bg-gray-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
              View all properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div
          ref={featuresRef}
          style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-xl mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Why oneApplyHub?</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              Built for students.<br />Not landlords.
            </h2>
            <p className="text-gray-400 mt-3 text-sm leading-relaxed">
              We verify every listing, every review, and every bursary — so you can make decisions with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, accent, light, title, description }, i) => (
              <div
                key={title}
                className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-gray-100/80 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className={`w-11 h-11 ${accent} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
                <div className={`absolute bottom-0 left-6 right-6 h-0.5 ${accent} opacity-0 group-hover:opacity-100 rounded-full transition-opacity`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        ref={ctaRef}
        style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] rounded-3xl px-8 py-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Get Started</p>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                Ready to Find<br />Your Student Home?
              </h2>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                Join thousands of Wits and UJ students who found their perfect accommodation through oneApplyHub.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/properties"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-blue-50 px-7 py-3.5 rounded-xl font-bold text-sm transition-colors group">
                  Browse Properties
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};

export default HomePage;
