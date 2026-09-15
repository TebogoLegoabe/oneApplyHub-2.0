import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Shield, Users, Home, ArrowRight, CheckCircle2, TrendingUp,
  ClipboardCheck, ScanSearch, FileText, BadgeCheck,
} from 'lucide-react';
import { propertiesAPI, statsAPI } from '../services/api';
import { Button, Input, Select, Skeleton } from '../components/ui';
import { cn } from '../utils/cn';

/** Fades an element in the first time it scrolls into view. */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (!('IntersectionObserver' in window)) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.style.opacity = '1';
          element.style.transform = 'none';
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return ref;
};

const REVEAL_STYLE = { opacity: 0, transform: 'translateY(16px)', transition: 'opacity 0.55s ease, transform 0.55s ease' };

const STAT_CONFIGS = [
  { icon: Home, key: 'properties', label: 'Verified properties', format: (value) => `${value}+` },
  { icon: Users, key: 'students', label: 'Registered students', format: (value) => `${value}+` },
  { icon: CheckCircle2, key: 'reviews', label: 'Verified reviews', format: (value) => `${value}` },
  { icon: TrendingUp, key: 'avg_rating', label: 'Average rating', format: (value) => `${value} / 5` },
];

const FEATURES = [
  {
    icon: Shield,
    tone: 'bg-brand-600',
    title: 'Verified listings',
    description: 'Every property is reviewed by our team before students can apply, so you spend less time second-guessing.',
  },
  {
    icon: Star,
    tone: 'bg-gold-500',
    title: 'Honest student reviews',
    description: 'Practical feedback from students on safety, value, location, cleanliness and management.',
  },
  {
    icon: FileText,
    tone: 'bg-emerald-600',
    title: 'One simple application',
    description: 'Enter your details once, choose up to three residences, and track each decision from your dashboard.',
  },
];

const STEPS = [
  { icon: ScanSearch, title: 'Search', text: 'Filter by campus, budget, and NSFAS accreditation.' },
  { icon: ClipboardCheck, title: 'Compare', text: 'Read verified reviews and shortlist your favourites.' },
  { icon: BadgeCheck, title: 'Apply', text: 'Submit one application and track every decision.' },
];

const TRUST_POINTS = ['Wits & UJ focused', 'NSFAS filters', 'Verified reviews', 'Admin moderated'];

const UNIVERSITY_BADGE = {
  wits: 'bg-white text-brand-800',
  uj: 'bg-white text-teal-800',
};

const PropertyCard = ({ property }) => {
  const ref = useReveal();
  const reviewCount = property.review_count || 0;
  return (
    <article
      ref={ref}
      style={REVEAL_STYLE}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_55%)]" aria-hidden="true" />
        <Home className="h-10 w-10 text-white/20" aria-hidden="true" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold uppercase shadow-sm', UNIVERSITY_BADGE[property.university] || 'bg-white text-gold-800')}>
            {property.university}
          </span>
          {property.nsfas_accredited && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">NSFAS</span>
          )}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold capitalize text-white backdrop-blur">
          {property.property_type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-950 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
            {property.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-50 px-2 py-1 text-xs font-bold text-slate-800 ring-1 ring-inset ring-gold-200/70 dark:bg-gold-500/10 dark:text-slate-100 dark:ring-gold-400/20">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" aria-hidden="true" />
            {property.average_rating || 'New'}
          </span>
        </div>

        <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
          <span className="truncate">{property.address}</span>
        </p>

        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{property.description}</p>

        <div className="mb-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div>
            <p className="text-base font-bold text-brand-700 dark:text-brand-300">
              R{property.price_min?.toLocaleString()} – R{property.price_max?.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">per month</p>
          </div>
          <p className="text-xs font-medium text-slate-400">{reviewCount} review{reviewCount === 1 ? '' : 's'}</p>
        </div>

        <Button to={`/properties/${property.id}`} fullWidth>View details</Button>
      </div>
    </article>
  );
};

const PropertyCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <Skeleton className="h-40 rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const featuredRef = useReveal();
  const featuresRef = useReveal();
  const stepsRef = useReveal();

  useEffect(() => {
    propertiesAPI.getProperties({ per_page: 6 })
      .then((response) => setFeaturedProperties(response.data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
    statsAPI.getStats()
      .then((response) => setStats(response.data))
      .catch(() => {});
  }, []);

  const handleSearch = (event) => {
    event?.preventDefault?.();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (selectedUniversity !== 'all') params.set('university', selectedUniversity);
    const query = params.toString();
    navigate(query ? `/properties?${query}` : '/properties');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 py-16 text-white md:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_45%)]" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white animate-fade-down">
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                All Your Options. One Platform.
              </span>
              <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight animate-fade-down [animation-delay:80ms] md:text-6xl">
                Find student accommodation without the stress
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-brand-100 animate-fade-down [animation-delay:160ms] md:text-lg">
                Search verified places near Wits and UJ, compare honest reviews, and submit one application from a single dashboard.
              </p>

              <ul className="mt-7 flex flex-wrap gap-2 animate-fade-down [animation-delay:220ms]" aria-label="Highlights">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-brand-50">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={handleSearch}
              className="rounded-2xl border border-white/20 bg-white p-5 text-slate-900 shadow-2xl shadow-black/30 animate-fade-up [animation-delay:240ms] dark:border-slate-800 dark:bg-slate-900 dark:text-white md:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">Start here</p>
                  <h2 className="mt-0.5 text-xl font-bold">Search accommodation</h2>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Home className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <div className="space-y-3">
                <Input
                  icon={Search}
                  type="search"
                  aria-label="Search by property name or area"
                  placeholder="Search by property name or area"
                  className="py-3"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <Select aria-label="University" className="py-3" value={selectedUniversity} onChange={(event) => setSelectedUniversity(event.target.value)}>
                  <option value="all">All universities</option>
                  <option value="wits">Wits University</option>
                  <option value="uj">University of Johannesburg</option>
                </Select>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button type="submit" size="lg" className="group">
                  Browse properties
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Button>
                <Button to="/register" variant="secondary" size="lg">Start application</Button>
              </div>

              <ol className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                {STEPS.map(({ icon: Icon, title }, index) => (
                  <li key={title} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <span className="text-slate-400 dark:text-slate-500">{index + 1}. </span>{title}
                    </span>
                  </li>
                ))}
              </ol>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 -mt-8 pb-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STAT_CONFIGS.map(({ icon: Icon, key, label, format }) => {
              const raw = stats?.[key];
              const value = raw == null ? '—' : format(raw);
              return (
                <div key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-bold leading-none text-slate-950 dark:text-white">
                      {stats ? value : <Skeleton className="inline-block h-5 w-12" />}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-14">
        <div ref={featuredRef} style={REVEAL_STYLE} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">Featured</p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">Top-rated accommodation</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Verified properties ranked by authentic student reviews.</p>
            </div>
            <Link to="/properties" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)
              : featuredProperties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>

          {!loading && featuredProperties.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              New listings are being verified. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900/60">
        <div ref={stepsRef} style={REVEAL_STYLE} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">How it works</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">Three steps to your next home</h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="relative flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Step {index + 1}</p>
                  <h3 className="mt-0.5 text-base font-bold text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="py-14">
        <div ref={featuresRef} style={REVEAL_STYLE} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">Why oneApplyHub</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">Everything you need to find home</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Safe, affordable accommodation near campus — verified for students, by students.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, tone, title, description }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900">
                <span className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white', tone)}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mb-2 text-base font-bold text-slate-950 dark:text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-brand-900 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)]" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight md:text-4xl">Ready to find your student home?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-100 md:text-base">
            Join Wits and UJ students using oneApplyHub to search, compare, review, and apply with confidence.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/properties" variant="inverse" size="xl" className="group">
              Browse properties
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Button>
            <Button to="/register" variant="inverse-outline" size="xl">Create free account</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
