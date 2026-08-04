import { Link } from 'react-router-dom';
import {
  Mail, MapPin, GraduationCap,
  Home, Star, Award, Facebook, Linkedin,
} from 'lucide-react';
import logoImg from '../../assets/OneHubLogo.png';

const PLATFORM_LINKS = [
  { to: '/properties', label: 'Properties' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/bursaries', label: 'Opportunities' },
  { to: '/application', label: 'Applications' },
];

const ACCOUNT_LINKS = [
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Create account' },
  { to: '/dashboard', label: 'Dashboard' },
];

const SERVICE_POINTS = [
  { icon: Home, label: 'Accommodation listings' },
  { icon: Star, label: 'Student reviews' },
  { icon: Award, label: 'Bursary opportunities' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/profile.php?id=61573343413373',
    label: 'Facebook',
    icon: Facebook,
  },
  {
    href: 'https://www.linkedin.com/company/oneapplyhub/',
    label: 'LinkedIn',
    icon: Linkedin,
  },
];

const FooterLink = ({ to, label }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-slate-400 hover:text-white transition-colors"
    >
      {label}
    </Link>
  </li>
);

const SocialLink = ({ href, label, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`oneApplyHub on ${label}`}
    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
  >
    <Icon className="h-4 w-4" />
  </a>
);

const Footer = () => (
  <footer className="relative overflow-hidden bg-slate-950 text-white">
    <div className="absolute inset-x-0 top-0 h-px bg-brand-500/40" />

    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={logoImg} alt="oneApplyHub logo" className="h-11 w-11 object-contain" />
            <div>
              <p className="text-lg font-bold tracking-tight">oneApplyHub</p>
              <p className="text-xs text-slate-500">All Your Options. One Platform.</p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            A student focused platform for finding accommodation, reading reviews, and accessing opportunities from one place.
          </p>

          <div className="mt-5 flex items-center gap-3">
            {SOCIAL_LINKS.map((link) => <SocialLink key={link.label} {...link} />)}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Platform</h3>
          <ul className="space-y-3">
            {PLATFORM_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Account</h3>
          <ul className="space-y-3">
            {ACCOUNT_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Contact</h3>
          <div className="space-y-3 text-sm text-slate-400">
            <a href="mailto:info@oneapplyhub.co.za" className="flex items-center gap-2.5 hover:text-white transition-colors">
              <Mail className="h-4 w-4 text-brand-300" />
              info@oneapplyhub.co.za
            </a>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-brand-300" />
              Johannesburg, South Africa
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            {SERVICE_POINTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-slate-400">
                <Icon className="h-4 w-4 text-slate-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-5">
        <div className="flex flex-col gap-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} oneApplyHub. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 md:hidden">
              {SOCIAL_LINKS.map((link) => <SocialLink key={link.label} {...link} />)}
            </div>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <a href="https://codevmasters.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">Made by CodevMasters developers</a>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <GraduationCap className="h-3.5 w-3.5" />
              Built for students
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
