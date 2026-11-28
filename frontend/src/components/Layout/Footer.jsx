import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin } from 'lucide-react';
import { CAMPUS_BY_ID } from '../../constants/campuses';
import Logo from '../brand/Logo';
import { FacebookIcon, LinkedInIcon } from '../brand/SocialIcons';
import { CampusIcon } from '../property/PropertyBits';

const PLATFORM_LINKS = [
  { to: '/properties', label: 'Find accommodation' },
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

const NEAR_LINKS = ['wits-main', 'wits-education', 'uj-apk', 'uj-dfc', 'rosebank-college', 'cjc-parktown'];

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/profile.php?id=61573343413373', label: 'Facebook', icon: FacebookIcon },
  { href: 'https://www.linkedin.com/company/oneapplyhub/', label: 'LinkedIn', icon: LinkedInIcon },
];

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-sm text-slate-300 transition-colors hover:text-white">{label}</Link>
  </li>
);

const Footer = () => (
  <footer className="bg-ink-950 text-white">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex rounded-lg">
            <Logo tone="light" tagline markClassName="h-10 w-10" />
            <span className="sr-only"> home</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
            Verified student accommodation in and around Braamfontein, honest reviews, walking times to campus and funding opportunities — in one place.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`oneApplyHub on ${label}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-colors hover:border-white/40 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-slate-400">Platform</h2>
          <ul className="space-y-3">{PLATFORM_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}</ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-slate-400">Account</h2>
          <ul className="space-y-3">{ACCOUNT_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}</ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-slate-400">Residences near</h2>
          <ul className="space-y-3">
            {NEAR_LINKS.map((id) => {
              const campus = CAMPUS_BY_ID[id];
              return (
                <li key={id}>
                  <Link to={`/properties?near=${campus.id}&sort=distance`} className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
                    <CampusIcon campus={campus} className="h-3.5 w-3.5 text-slate-400" />{campus.short}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <a href="mailto:info@oneapplyhub.co.za" className="flex items-center gap-2.5 transition-colors hover:text-white">
              <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
              info@oneapplyhub.co.za
            </a>
            <p className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Johannesburg, South Africa
            </p>
          </div>
          <Link to="/register" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-coral-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-700">
            Start your application<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} oneApplyHub. All rights reserved. Map data &copy; OpenStreetMap contributors. Photos from Wikimedia Commons, credited on each image.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/privacy" className="transition-colors hover:text-white">Privacy</Link>
          <Link to="/terms" className="transition-colors hover:text-white">Terms</Link>
          <a href="https://codevmasters.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Made by CodevMasters developers</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
