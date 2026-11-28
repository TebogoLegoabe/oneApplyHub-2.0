import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Award, Briefcase, Building2, Car, CheckCircle2, FileText, Footprints, GraduationCap, ListChecks, MapPin,
  MessageSquare, ScanSearch, Search, Send, ShieldCheck, Star, Users, Wallet,
} from 'lucide-react';
import { propertiesAPI, statsAPI } from '../services/api';
import { CAMPUS_BY_ID, CAMPUS_GROUPS, COLLEGE_CAMPUSES, UNIVERSITY_CAMPUSES } from '../constants/campuses';
import { PHOTOS } from '../constants/photos';
import PropertyCard, { PropertyCardSkeleton } from '../components/property/PropertyCard';
import { Button, Input, PhotoCredit, Select, Skeleton } from '../components/ui';
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
  { icon: Building2, key: 'properties', label: 'Verified properties', format: (value) => `${value}+` },
  { icon: Users, key: 'students', label: 'Registered students', format: (value) => `${value}+` },
  { icon: MessageSquare, key: 'reviews', label: 'Verified reviews', format: (value) => `${value}` },
  { icon: Star, key: 'avg_rating', label: 'Average rating', format: (value) => `${value} / 5` },
];

const STEPS = [
  { icon: ScanSearch, title: 'Search', text: 'Pick your campus or college and see every residence sorted by walking time.' },
  { icon: ListChecks, title: 'Compare', text: 'Read verified reviews, check NSFAS status and shortlist your favourites.' },
  { icon: Send, title: 'Apply', text: 'Submit one application for up to three residences and track each decision.' },
];

const FEATURES = [
  { icon: Footprints, title: 'Know the walk before you sign', text: 'Every listing shows walking, cycling and driving times to all Wits and UJ campuses and the Braamfontein colleges.' },
  { icon: ShieldCheck, title: 'Verified listings', text: 'Our team checks every property before students can apply.' },
  { icon: MessageSquare, title: 'Honest student reviews', text: 'Safety, value, location, cleanliness and management — rated by people who lived there.' },
  { icon: Wallet, title: 'NSFAS-friendly', text: 'Filter to NSFAS-accredited residences in one tap.' },
  { icon: FileText, title: 'One application, three residences', text: 'Enter your details once and track every decision from your dashboard.' },
];

const TRUST_POINTS = ['Wits, UJ & college focused', 'Walking times to campus', 'NSFAS filters', 'Admin-verified reviews'];
const POPULAR = ['wits-main', 'uj-apk', 'uj-dfc', 'rosebank-college'];

const campusLink = (campus) => (campus.university
  ? `/properties?near=${campus.id}&university=${campus.university}&sort=distance`
  : `/properties?near=${campus.id}&sort=distance`);

/** Residences serving a campus (its university's, or all of them for a college), nearest first. */
const campusInsight = (campus, points) => {
  const ranked = points
    .filter((point) => !campus.university || point.university === campus.university || point.university === 'both')
    .map((point) => ({ point, km: haversineKm(point, campus) }))
    .sort((a, b) => a.km - b.km);
  const closest = ranked[0];
  return {
    campus,
    within2km: ranked.filter((item) => item.km <= 2).length,
    closest: closest ? { property: closest.point, ...estimateTravel(closest.km) } : null,
  };
};

const SectionHeading = ({ id, eyebrow, title, description, align = 'left', action }) => (
  <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', align === 'center' && 'items-center text-center sm:flex-col sm:items-center')}>
    <div className={cn(align === 'center' && 'mx-auto max-w-2xl')}>
      {eyebrow && <p className="mb-2 text-sm font-semibold text-brand-700 dark:text-brand-300">{eyebrow}</p>}
      <h2 id={id} className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>}
    </div>
    {action}
  </div>
);

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
      if (campus.university) params.set('university', campus.university);
      params.set('sort', 'distance');
    }
    const query = params.toString();
    navigate(query ? `/properties?${query}` : '/properties');
  };

  return (
    <form onSubmit={handleSearch} className="mt-8 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900" role="search" aria-label="Search accommodation">
      <div className="grid gap-2 sm:grid-cols-[1.2fr_1fr_auto]">
        <Input
          icon={Search}
          type="search"
          aria-label="Search by property name or area"
          placeholder="Residence name or area"
          className="h-12 border-transparent shadow-none hover:border-transparent"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Select icon={GraduationCap} aria-label="Your campus" className="h-12 border-transparent shadow-none hover:border-transparent sm:border-l-slate-200" value={campusId} onChange={(event) => setCampusId(event.target.value)}>
          <option value="">Any campus or college</option>
          {CAMPUS_GROUPS.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {group.campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
            </optgroup>
          ))}
        </Select>
        <Button type="submit" variant="accent" size="xl" className="h-12">
          Find my res
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
};

const HeroPhotos = ({ points }) => {
  const wits = useMemo(() => (points.length ? campusInsight(CAMPUS_BY_ID['wits-main'], points) : null), [points]);
  const photos = [PHOTOS.mandelaBridge, PHOTOS.witsGreatHall, PHOTOS.ujKingsway];
  return (
    <figure className="relative">
      <div className="grid h-80 grid-cols-5 grid-rows-2 gap-3 sm:h-[28rem]">
        <img src={photos[0].src} alt={photos[0].alt} className="col-span-3 row-span-2 h-full w-full rounded-2xl object-cover" />
        <img src={photos[1].src} alt={photos[1].alt} className="col-span-2 h-full w-full rounded-2xl object-cover" />
        <img src={photos[2].src} alt={photos[2].alt} className="col-span-2 h-full w-full rounded-2xl object-cover" />
      </div>
      {wits?.closest && (
        <div className="absolute -bottom-5 left-4 max-w-[17rem] rounded-xl border border-slate-200 bg-white p-3 shadow-float dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Closest to Wits Main</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white">{wits.closest.property.name}</p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Footprints className="h-3.5 w-3.5" aria-hidden="true" />
            {formatMinutes(wits.closest.walkMin)} walk · {formatDistance(wits.closest.straightKm)}
          </p>
        </div>
      )}
      <figcaption className="mt-8 flex flex-wrap justify-end gap-x-3 gap-y-1">
        {photos.map((photo) => <PhotoCredit key={photo.src} photo={photo} tone="plain" />)}
      </figcaption>
    </figure>
  );
};

const Hero = ({ points }) => (
  <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
    <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <div>
        <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Student accommodation in Johannesburg</p>
        <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          Find a res that&apos;s <span className="text-brand-600 dark:text-brand-400">close to campus</span>.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          Compare verified residences near Wits, UJ and Braamfontein colleges, see the walking time to your campus, read honest reviews, and apply to three places in one go.
        </p>

        <HeroSearch />

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Popular:</span>
          {POPULAR.map((id) => {
            const campus = CAMPUS_BY_ID[id];
            return (
              <Link
                key={id}
                to={campusLink(campus)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-600 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-300"
              >
                <MapPin className="h-3 w-3" aria-hidden="true" />Near {campus.short}
              </Link>
            );
          })}
        </div>

        <ul className="mt-8 grid gap-x-6 gap-y-2 sm:grid-cols-2" aria-label="Highlights">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <HeroPhotos points={points} />
    </div>
  </section>
);

/* --------------------------------------------------------------------------- sections */

const GROUP_BAR = { wits: 'bg-brand-600', uj: 'bg-coral-600', college: 'bg-emerald-700' };

const CampusExplorer = ({ points, loading }) => {
  const ref = useReveal();
  const [tab, setTab] = useState('universities');
  const campuses = tab === 'colleges' ? COLLEGE_CAMPUSES : UNIVERSITY_CAMPUSES;
  const insights = useMemo(() => campuses.map((campus) => campusInsight(campus, points)), [campuses, points]);
  return (
    <section className="py-16" aria-labelledby="campus-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="campus-heading"
          eyebrow="How far is it?"
          title="Pick your campus, see what's walkable"
          description="Residences within 2 km of each campus and the closest one on foot, based on real map locations."
          action={(
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" role="group" aria-label="Campus type">
              {[{ id: 'universities', label: 'Universities' }, { id: 'colleges', label: 'Colleges' }].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  aria-pressed={tab === id}
                  className={cn('rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors', tab === id ? 'bg-ink-950 text-white dark:bg-white dark:text-ink-950' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map(({ campus, within2km, closest }) => (
            <li key={campus.id}>
              <Link
                to={campusLink(campus)}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
              >
                <span className={cn('absolute inset-y-0 left-0 w-1', GROUP_BAR[campus.group])} aria-hidden="true" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{campus.area}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">{campus.name}</h3>
                {loading ? (
                  <div className="mt-3 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-40" /></div>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white">{within2km}</span> residence{within2km === 1 ? '' : 's'} within 2 km
                    </p>
                    {closest && (closest.walkMin <= 45 ? (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        <Footprints className="h-3.5 w-3.5" aria-hidden="true" />Closest: {formatMinutes(closest.walkMin)} walk
                      </p>
                    ) : (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Car className="h-3.5 w-3.5" aria-hidden="true" />Closest: {formatMinutes(closest.driveMin)} drive
                      </p>
                    ))}
                  </>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700 dark:text-brand-300">
                  See residences<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const WhyUs = () => {
  const ref = useReveal();
  const photo = PHOTOS.witsLibraryLawns;
  return (
    <section className="py-16" aria-labelledby="why-heading">
      <div ref={ref} className="reveal mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <figure>
          <img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <figcaption className="mt-2 flex justify-end"><PhotoCredit photo={photo} tone="plain" /></figcaption>
        </figure>
        <div>
          <SectionHeading id="why-heading" eyebrow="Why oneApplyHub" title="Everything you need to find home" />
          <ul className="space-y-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
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
  const ctaPhoto = PHOTOS.mandelaBridgeNight;

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
    <div className="bg-white dark:bg-slate-950">
      <Hero points={mapPoints} />

      {/* Stats */}
      <section className="border-b border-slate-200 dark:border-slate-800" aria-label="Platform statistics">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-slate-200 px-4 sm:px-6 md:grid-cols-4 md:divide-x lg:px-8 dark:divide-slate-800">
          {STAT_CONFIGS.map(({ icon: Icon, key, label, format }) => {
            const raw = stats?.[key];
            const value = raw == null ? '—' : format(raw);
            return (
              <div key={key} className="flex items-center gap-3 px-2 py-6 md:px-6">
                <Icon className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none text-slate-950 dark:text-white">
                    {stats ? value : <Skeleton className="inline-block h-6 w-14" />}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <CampusExplorer points={mapPoints} loading={mapLoading} />

      {/* Featured */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/40" aria-labelledby="featured-heading">
        <div ref={featuredRef} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="featured-heading"
            eyebrow="Featured"
            title="Top-rated accommodation"
            description="Verified properties ranked by authentic student reviews."
            action={(
              <Link to="/properties?sort=rating" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
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
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              New listings are being verified. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16" aria-labelledby="steps-heading">
        <div ref={stepsRef} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading id="steps-heading" eyebrow="How it works" title="Three steps to your next home" align="center" />
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex flex-col items-center text-center">
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-white dark:bg-white dark:text-ink-950">{index + 1}</span>
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <WhyUs />
      </div>

      {/* Funding & careers */}
      <section className="pb-16" aria-label="Funding and careers">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                <Wallet className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Fund your studies while you find your res</h2>
                <p className="mt-1.5 max-w-xl text-slate-600 dark:text-slate-400">Bursaries, internships and graduate programmes in one hub, sorted by closing date so you never miss a deadline.</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button to="/bursaries" size="lg"><Award className="h-4 w-4" aria-hidden="true" />Browse bursaries</Button>
              <Button to="/opportunities" variant="secondary" size="lg"><Briefcase className="h-4 w-4" aria-hidden="true" />Internships</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-ink-950 py-20 text-white">
        <img src={ctaPhoto.src} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-ink-950/75" aria-hidden="true" />
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to find your student home?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Join Wits, UJ and college students using oneApplyHub to search, compare, review, and apply with confidence.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/properties" variant="inverse" size="xl">
              Browse properties
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button to="/register" variant="inverse-outline" size="xl">Create free account</Button>
          </div>
        </div>
        <PhotoCredit photo={ctaPhoto} className="absolute bottom-2 right-2" />
      </section>
    </div>
  );
};

export default HomePage;
