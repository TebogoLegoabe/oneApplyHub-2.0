import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Award, BadgeCheck, Briefcase, Car, CheckCircle2, ClipboardCheck, FileText, Footprints, GraduationCap, Home,
  Map as MapIcon, MapPin, ScanSearch, Search, ShieldCheck, Star, TrendingUp, Users, Wallet,
} from 'lucide-react';
import { propertiesAPI, statsAPI } from '../services/api';
import { CAMPUSES, CAMPUS_BY_ID } from '../constants/campuses';
import { MapFrame, PropertiesMap } from '../components/map';
import PropertyCard, { PropertyCardSkeleton } from '../components/property/PropertyCard';
import { Button, Input, Select, Skeleton } from '../components/ui';
import { cn } from '../utils/cn';
import { estimateTravel, formatDistance, formatMinutes, haversineKm, hasCoords } from '../utils/geo';

/**
 * Fades a section in the first time it scrolls into view. Content is visible by
 * default: only sections that start below the fold are hidden (after mount), so
 * nothing stays invisible without JavaScript, when printing, or for crawlers.
 */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return undefined;
    if (element.getBoundingClientRect().top < window.innerHeight) return undefined;
    element.classList.add('reveal-hidden');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.remove('reveal-hidden');
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.classList.remove('reveal-hidden');
    };
  }, []);
  return ref;
};

const STAT_CONFIGS = [
  { icon: Home, key: 'properties', label: 'Verified properties', format: (value) => `${value}+`, tone: 'from-brand-500 to-brand-700' },
  { icon: Users, key: 'students', label: 'Registered students', format: (value) => `${value}+`, tone: 'from-coral-500 to-coral-700' },
  { icon: CheckCircle2, key: 'reviews', label: 'Verified reviews', format: (value) => `${value}`, tone: 'from-violet-500 to-violet-700' },
  { icon: TrendingUp, key: 'avg_rating', label: 'Average rating', format: (value) => `${value} / 5`, tone: 'from-emerald-500 to-teal-700' },
];

const STEPS = [
  { icon: ScanSearch, title: 'Search', text: 'Pick your campus and see every residence sorted by walking time.', tone: 'bg-brand-600', ring: 'ring-brand-200 dark:ring-brand-500/30' },
  { icon: ClipboardCheck, title: 'Compare', text: 'Read verified reviews, check NSFAS status and shortlist favourites.', tone: 'bg-violet-600', ring: 'ring-violet-200 dark:ring-violet-500/30' },
  { icon: BadgeCheck, title: 'Apply', text: 'Submit one application for up to three residences and track decisions.', tone: 'bg-coral-600', ring: 'ring-coral-200 dark:ring-coral-500/30' },
];

const TRUST_POINTS = ['Wits & UJ focused', 'Walking times to campus', 'NSFAS filters', 'Admin-verified reviews'];

const POPULAR_CAMPUSES = ['wits-main', 'uj-apk', 'uj-dfc', 'wits-education'];

const campusLink = (campus) => `/properties?near=${campus.id}&university=${campus.university}&sort=distance`;

/** Residences that serve a campus's university, ranked by distance from it. */
const campusInsight = (campus, points) => {
  const ranked = points
    .filter((point) => point.university === campus.university || point.university === 'both')
    .map((point) => ({ point, km: haversineKm(point, campus) }))
    .sort((a, b) => a.km - b.km);
  const closest = ranked[0];
  return {
    campus,
    within2km: ranked.filter((item) => item.km <= 2).length,
    closest: closest ? { property: closest.point, ...estimateTravel(closest.km) } : null,
  };
};

/* --------------------------------------------------------------------------- hero */

const HeroSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [campusId, setCampusId] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    const campus = CAMPUS_BY_ID[campusId];
    if (campus) {
      params.set('near', campus.id);
      params.set('university', campus.university);
      params.set('sort', 'distance');
    }
    const query = params.toString();
    navigate(query ? `/properties?${query}` : '/properties');
  };

  return (
    <form onSubmit={handleSearch} className="rounded-3xl border border-white/15 bg-white p-3 text-slate-900 shadow-float dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-4" role="search" aria-label="Search accommodation">
      <div className="grid gap-2 sm:grid-cols-[1.3fr_1fr_auto]">
        <Input
          icon={Search}
          type="search"
          aria-label="Search by property name or area"
          placeholder="Residence name or area"
          className="h-12 border-transparent bg-slate-50 shadow-none dark:bg-slate-800"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Select icon={GraduationCap} aria-label="Your campus" className="h-12 border-transparent bg-slate-50 shadow-none dark:bg-slate-800" value={campusId} onChange={(event) => setCampusId(event.target.value)}>
          <option value="">Any campus</option>
          <optgroup label="Wits">
            {CAMPUSES.filter((campus) => campus.university === 'wits').map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
          </optgroup>
          <optgroup label="UJ">
            {CAMPUSES.filter((campus) => campus.university === 'uj').map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
          </optgroup>
        </Select>
        <Button type="submit" variant="accent" size="xl" className="h-12 group">
          Find my res
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
};

const HeroVisual = ({ points, loading }) => {
  const wits = useMemo(() => (points.length ? campusInsight(CAMPUS_BY_ID['wits-main'], points) : null), [points]);
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-500/40 via-violet-500/30 to-coral-500/40 blur-2xl" aria-hidden="true" />
      <div className="group relative h-72 overflow-hidden rounded-4xl border border-white/15 bg-ink-900 shadow-float sm:h-96 lg:h-[30rem]">
        {/* Click target sits *behind* the pass-through map so the OSM attribution link stays usable. */}
        <Link to="/properties?view=map" className="absolute inset-0" tabIndex={-1} aria-hidden="true" />
        <MapFrame className="h-full w-full">
          <PropertiesMap properties={points} loading={loading} interactive={false} showLegend={false} className="pointer-events-none h-full w-full" label="Preview map of residences near Wits and UJ" />
        </MapFrame>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" aria-hidden="true" />
        <span className="pointer-events-none absolute left-4 top-4 z-[500] inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink-950 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-500" />
          </span>
          {loading ? 'Loading residences…' : `${points.length} residences on the map`}
        </span>
        <Link
          to="/properties?view=map"
          className="absolute bottom-8 right-4 z-[500] inline-flex items-center gap-1.5 rounded-xl bg-coral-600 px-3.5 py-2 text-sm font-bold text-white shadow-glow-coral transition-all hover:bg-coral-700 group-hover:translate-x-0.5"
        >
          <MapIcon className="h-4 w-4" aria-hidden="true" />Explore the map
        </Link>
      </div>

      {wits?.closest && (
        <div className="absolute -bottom-6 left-4 z-[500] hidden max-w-[17rem] animate-float rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-float dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Closest to Wits Main</p>
          <p className="mt-0.5 truncate text-sm font-bold">{wits.closest.property.name}</p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-bold text-lime-900 dark:bg-lime-400/15 dark:text-lime-200">
            <Footprints className="h-3.5 w-3.5" aria-hidden="true" />
            {formatMinutes(wits.closest.walkMin)} walk · {formatDistance(wits.closest.straightKm)}
          </p>
        </div>
      )}
    </div>
  );
};

const Hero = ({ points, mapLoading }) => (
  <section className="relative isolate overflow-hidden bg-ink-950 pb-20 pt-12 text-white md:pb-28 md:pt-16">
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="bg-dots absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-600/40 blur-3xl" />
      <div className="absolute right-0 top-0 h-[24rem] w-[24rem] rounded-full bg-violet-600/30 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-[22rem] w-[22rem] rounded-full bg-coral-500/25 blur-3xl" />
    </div>

    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white animate-fade-down">
            <GraduationCap className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
            Built for Wits &amp; UJ students
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight animate-fade-down [animation-delay:80ms] sm:text-5xl md:text-6xl">
            Find a res that&apos;s{' '}
            <span className="text-gradient animate-gradient-x">close to campus.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 animate-fade-down [animation-delay:160ms] md:text-lg">
            Compare verified residences near Wits and UJ, see the walking time to your campus, read honest reviews, and apply to three places in one go.
          </p>

          <div className="mt-8 animate-fade-up [animation-delay:220ms]">
            <HeroSearch />
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-white/60">Popular:</span>
              {POPULAR_CAMPUSES.map((id) => {
                const campus = CAMPUS_BY_ID[id];
                return (
                  <Link
                    key={id}
                    to={campusLink(campus)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-bold ring-1 ring-inset transition-colors',
                      campus.university === 'wits' ? 'bg-brand-500/15 text-brand-100 ring-brand-300/30 hover:bg-brand-500/30' : 'bg-coral-500/15 text-coral-100 ring-coral-300/30 hover:bg-coral-500/30',
                    )}
                  >
                    <MapPin className="h-3 w-3" aria-hidden="true" />Near {campus.short}
                  </Link>
                );
              })}
            </div>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 animate-fade-down [animation-delay:280ms]" aria-label="Highlights">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80">
                <CheckCircle2 className="h-4 w-4 text-lime-300" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up [animation-delay:200ms]">
          <HeroVisual points={points} loading={mapLoading} />
        </div>
      </div>
    </div>
  </section>
);

/* --------------------------------------------------------------------------- sections */

const SectionHeading = ({ id, eyebrow, title, description, tone = 'text-brand-700 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-300', align = 'left', action }) => (
  <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', align === 'center' && 'items-center text-center sm:flex-col sm:items-center')}>
    <div className={cn(align === 'center' && 'mx-auto max-w-2xl')}>
      <p className={cn('mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider', tone)}>{eyebrow}</p>
      <h2 id={id} className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white md:text-4xl">{title}</h2>
      {description && <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 md:text-base">{description}</p>}
    </div>
    {action}
  </div>
);

const CampusExplorer = ({ points, loading }) => {
  const ref = useReveal();
  const insights = useMemo(() => CAMPUSES.map((campus) => campusInsight(campus, points)), [points]);
  return (
    <section className="py-16" aria-labelledby="campus-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
            id="campus-heading"
            eyebrow="How far is it?"
            tone="bg-lime-100 text-lime-800 dark:bg-lime-400/10 dark:text-lime-300"
            title="Pick your campus, see what's walkable"
            description="Residences within 2 km of each campus and the closest one on foot — based on real map locations."
          />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map(({ campus, within2km, closest }) => {
            const wits = campus.university === 'wits';
            return (
              <li key={campus.id}>
                <Link
                  to={campusLink(campus)}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className={cn('absolute inset-x-0 top-0 h-1.5', wits ? 'bg-gradient-to-r from-brand-500 to-ink-700' : 'bg-gradient-to-r from-coral-400 to-coral-700')} aria-hidden="true" />
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm', wits ? 'bg-brand-600' : 'bg-coral-600')}>
                      <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{campus.area}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-950 dark:text-white">{campus.name}</h3>
                  {loading ? (
                    <div className="mt-3 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-6 w-40" /></div>
                  ) : (
                    <>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">{within2km}</span> residence{within2km === 1 ? '' : 's'} within 2 km
                      </p>
                      {closest && (closest.walkMin <= 45 ? (
                        <p className={cn('mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', closest.walkMin <= 15 ? 'bg-lime-100 text-lime-900 dark:bg-lime-400/15 dark:text-lime-200' : 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200')}>
                          <Footprints className="h-3.5 w-3.5" aria-hidden="true" />Closest: {formatMinutes(closest.walkMin)} walk
                        </p>
                      ) : (
                        <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-coral-100 px-2.5 py-1 text-xs font-bold text-coral-800 dark:bg-coral-500/15 dark:text-coral-200">
                          <Car className="h-3.5 w-3.5" aria-hidden="true" />Closest: {formatMinutes(closest.driveMin)} drive
                        </p>
                      ))}
                    </>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-brand-700 dark:text-brand-300">
                    See residences<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              to="/properties?view=map"
              className="group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-brand-700 to-ink-900 p-5 text-white shadow-glow-violet transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="bg-dots absolute inset-0 opacity-50" aria-hidden="true" />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><MapIcon className="h-5 w-5" aria-hidden="true" /></span>
              <div className="relative">
                <h3 className="font-display text-xl font-bold">Explore the full map</h3>
                <p className="mt-1 text-sm text-white/75">Every residence and campus, with price pins.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-gold-300">
                  Open map<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
};

const BENTO = [
  { icon: ShieldCheck, title: 'Verified listings', text: 'Our team checks every property before students can apply.', tone: 'from-brand-500 to-brand-700', span: '' },
  { icon: Star, title: 'Honest student reviews', text: 'Safety, value, location, cleanliness and management — rated by residents.', tone: 'from-gold-400 to-orange-600', span: '' },
  { icon: Wallet, title: 'NSFAS-friendly', text: 'Filter to NSFAS-accredited residences in one tap.', tone: 'from-lime-400 to-emerald-600', span: '' },
  { icon: FileText, title: 'One application, three residences', text: 'Enter your details once, choose up to three places, and track each decision from your dashboard.', tone: 'from-violet-500 to-fuchsia-600', span: 'lg:col-span-2' },
];

const Bento = () => {
  const ref = useReveal();
  return (
    <section className="py-16" aria-labelledby="bento-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading id="bento-heading" eyebrow="Why oneApplyHub" tone="bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" title="Everything you need to find home" align="center" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white shadow-float md:col-span-2 lg:row-span-2">
            <div className="bg-dots absolute inset-0 opacity-50" aria-hidden="true" />
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-lime-400/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-ink-950"><Footprints className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="mt-5 font-display text-2xl font-bold md:text-3xl">Know the walk before you sign</h3>
              <p className="mt-2 max-w-lg text-white/70">
                Every residence shows the walking time to your campus. Open any listing to compare all seven Wits and UJ campuses and draw the real walking route on the map.
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {[
                  { label: 'Easy walk', range: '≤ 15 min', tone: 'bg-lime-300 text-ink-950' },
                  { label: 'Manageable', range: '16–30 min', tone: 'bg-amber-300 text-ink-950' },
                  { label: 'Take a ride', range: '30+ min', tone: 'bg-coral-400 text-ink-950' },
                ].map(({ label, range, tone }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold', tone)}>{range}</span>
                    <p className="mt-2 text-sm font-semibold text-white/85">{label}</p>
                  </div>
                ))}
              </div>
              <Button to="/properties?view=map" variant="gold" className="mt-6">Try it on the map<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
            </div>
          </div>
          {BENTO.map(({ icon: Icon, title, text, tone, span, to }) => {
            const body = (
              <>
                <span className={cn('inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm', tone)}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
                {to && <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-coral-600 dark:text-coral-400">Browse opportunities<ArrowRight className="h-4 w-4" aria-hidden="true" /></span>}
              </>
            );
            const className = cn('rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900', span);
            return to ? <Link key={title} to={to} className={cn(className, 'block')}>{body}</Link> : <div key={title} className={className}>{body}</div>;
          })}
        </div>
      </div>
    </section>
  );
};

/* --------------------------------------------------------------------------- page */

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  const featuredRef = useReveal();
  const stepsRef = useReveal();

  useEffect(() => {
    propertiesAPI.getProperties({ per_page: 6, sort: 'rating' })
      .then((response) => setFeaturedProperties(response.data.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    statsAPI.getStats()
      .then((response) => setStats(response.data))
      .catch(() => {});
    propertiesAPI.getPropertyMap()
      .then((response) => setMapPoints((response.data.properties || []).filter(hasCoords)))
      .catch(() => {})
      .finally(() => setMapLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <Hero points={mapPoints} mapLoading={mapLoading} />

      {/* Stats */}
      <section className="relative z-10 -mt-10" aria-label="Platform statistics">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-float dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
            {STAT_CONFIGS.map(({ icon: Icon, key, label, format, tone }) => {
              const raw = stats?.[key];
              const value = raw == null ? '—' : format(raw);
              return (
                <div key={key} className="flex items-center gap-3 rounded-2xl px-3 py-3">
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm', tone)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-2xl font-extrabold leading-none text-slate-950 dark:text-white">
                      {stats ? value : <Skeleton className="inline-block h-6 w-14" />}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CampusExplorer points={mapPoints} loading={mapLoading} />

      {/* Featured */}
      <section className="border-y border-slate-200/70 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/40" aria-labelledby="featured-heading">
        <div ref={featuredRef} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
              id="featured-heading"
              eyebrow="Featured"
              tone="bg-gold-100 text-gold-800 dark:bg-gold-500/10 dark:text-gold-300"
              title="Top-rated accommodation"
              description="Verified properties ranked by authentic student reviews."
              action={(
                <Link to="/properties?sort=rating" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
                  View all
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              )}
            />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)
              : featuredProperties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>

          {!loading && featuredProperties.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              New listings are being verified. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16" aria-labelledby="steps-heading">
        <div ref={stepsRef} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading id="steps-heading" eyebrow="How it works" tone="bg-coral-100 text-coral-700 dark:bg-coral-500/10 dark:text-coral-300" title="Three steps to your next home" align="center" />
          <ol className="relative grid gap-6 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-slate-200 dark:border-slate-700 md:block" aria-hidden="true" />
            {STEPS.map(({ icon: Icon, title, text, tone, ring }, index) => (
              <li key={title} className="relative flex flex-col items-center text-center">
                <span className={cn('relative flex h-16 w-16 items-center justify-center rounded-3xl text-white shadow-lg ring-8', tone, ring)}>
                  <Icon className="h-7 w-7" aria-hidden="true" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white font-display text-sm font-extrabold text-ink-950 shadow ring-1 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-slate-700">{index + 1}</span>
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Bento />

      {/* Opportunities */}
      <section className="pb-16" aria-label="Funding and careers">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative isolate grid gap-6 overflow-hidden rounded-4xl bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 p-8 text-white shadow-float md:grid-cols-[1.4fr_1fr] md:items-center md:p-10">
            <div className="bg-dots absolute inset-0 -z-10 opacity-50" aria-hidden="true" />
            <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-lime-300/30 blur-3xl" aria-hidden="true" />
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider"><Wallet className="h-3.5 w-3.5" aria-hidden="true" />Funding &amp; careers</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Fund your studies while you find your res</h2>
              <p className="mt-2 max-w-xl text-white/80">Bursaries, internships and graduate programmes in one hub — sorted by closing date so you never miss a deadline.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row md:justify-end">
              <Button to="/bursaries" variant="inverse" size="lg"><Award className="h-4 w-4" aria-hidden="true" />Browse bursaries</Button>
              <Button to="/opportunities" variant="inverse-outline" size="lg"><Briefcase className="h-4 w-4" aria-hidden="true" />Internships</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-gradient-to-r from-brand-700 via-violet-700 to-coral-700 bg-[length:200%_auto] py-16 text-white animate-gradient-x">
        <div className="bg-dots absolute inset-0 -z-10 opacity-40" aria-hidden="true" />
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Ready to find your student home?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 md:text-base">
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
