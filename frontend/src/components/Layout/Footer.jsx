import { Link } from 'react-router-dom';
import { ArrowRight, Facebook, GraduationCap, Linkedin, Mail, MapPin } from 'lucide-react';
import { CAMPUSES } from '../../constants/campuses';
import { cn } from '../../utils/cn';
import Logo from '../brand/Logo';

const PLATFORM_LINKS = [
  { to: '/properties', label: 'Find accommodation' },
  { to: '/properties?view=map', label: 'Residence map' },
  { to: '/reviews', label: 'Student reviews' },
  { to: '/bursaries', label: 'Bursaries' },
  { to: '/opportunities', label: 'Internships & graduate roles' },
];

const ACCOUNT_LINKS = [
  { to: '/register', label: 'Create account' },
  { to: '/login', label: 'Log in' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/application', label: 'My application' },
];

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/profile.php?id=61573343413373', label: 'Facebook', icon: Facebook },
  { href: 'https://www.linkedin.com/company/oneapplyhub/', label: 'LinkedIn', icon: Linkedin },
];

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-sm text-slate-400 transition-colors hover:text-white">{label}</Link>
  </li>
);

const SocialLink = ({ href, label, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`oneApplyHub on ${label}`}
    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-brand-400/50 hover:bg-brand-500/15 hover:text-white"
  >
    <Icon className="h-4 w-4" />
  </a>
);

const Footer = () => (
  <footer className="relative isolate overflow-hidden bg-ink-950 text-white">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-violet-500 to-coral-500" aria-hidden="true" />
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
    </div>

    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-lg font-bold">Find a res near your campus</p>
          <p className="mt-1 text-sm text-slate-400">Jump straight to residences sorted by distance.</p>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Residences near campus">
          {CAMPUSES.filter((campus) => campus.id !== 'uj-swc').map((campus) => (
            <li key={campus.id}>
              <Link
                to={`/properties?near=${campus.id}&sort=distance`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset transition-colors',
                  campus.university === 'wits'
                    ? 'bg-brand-500/15 text-brand-200 ring-brand-400/30 hover:bg-brand-500/30'
                    : 'bg-coral-500/15 text-coral-200 ring-coral-400/30 hover:bg-coral-500/30',
                )}
              >
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />{campus.short}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
        <div>
          <Link to="/" className="inline-flex rounded-xl">
            <Logo tone="light" tagline markClassName="h-11 w-11" />
            <span className="sr-only"> home</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            Verified student accommodation, honest reviews, walking times to campus and funding opportunities — all in one place.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {SOCIAL_LINKS.map((link) => <SocialLink key={link.label} {...link} />)}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Platform</h2>
          <ul className="space-y-3">{PLATFORM_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}</ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Account</h2>
          <ul className="space-y-3">{ACCOUNT_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}</ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Contact</h2>
          <div className="space-y-3 text-sm text-slate-400">
            <a href="mailto:info@oneapplyhub.co.za" className="flex items-center gap-2.5 transition-colors hover:text-white">
              <Mail className="h-4 w-4 text-brand-300" aria-hidden="true" />
              info@oneapplyhub.co.za
            </a>
            <p className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-coral-400" aria-hidden="true" />
              Johannesburg, South Africa
            </p>
          </div>
          <Link to="/register" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-coral-600 px-4 py-2.5 text-sm font-bold text-white shadow-glow-coral transition-colors hover:bg-coral-700">
            Start your application<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-5">
        <div className="flex flex-col gap-3 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} oneApplyHub. All rights reserved. Map data &copy; OpenStreetMap contributors.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-white">Terms</Link>
            <a href="https://codevmasters.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Made by CodevMasters developers</a>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />Built for students
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
