import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Mail, MapPin, GraduationCap,
  Home, Star, Award, ShieldCheck, Sparkles,
} from 'lucide-react';
import logoImg from '../../assets/OneHubLogo.png';

const PLATFORM_LINKS = [
  { to: '/properties', label: 'Browse Properties' },
  { to: '/reviews', label: 'Student Reviews' },
  { to: '/bursaries', label: 'Opportunities Hub' },
  { to: '/application', label: 'Apply Now' },
];

const ACCOUNT_LINKS = [
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Create Account' },
  { to: '/dashboard', label: 'Dashboard' },
];

const TRUST_ITEMS = [
  { icon: Home, label: 'Verified accommodation' },
  { icon: Star, label: 'Student reviews' },
  { icon: Award, label: 'Opportunities and bursaries' },
];

const CAMPUS_ITEMS = [
  'Wits students',
  'UJ students',
  'NSFAS friendly search',
];

const FooterLink = ({ to, label }) => (
  <li>
    <Link
      to={to}
      className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors" />
      {label}
    </Link>
  </li>
);

const Footer = () => (
  <footer className="relative overflow-hidden bg-[#070d1b] text-white">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-32 left-16 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400" />
    </div>

    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:p-7 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              Student accommodation made simple
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
              Find your next student home with fewer tabs and less stress.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Search verified accommodation, compare student reviews, and apply from one focused platform built for campus life.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-black text-white hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-9 py-10 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <img src={logoImg} alt="oneApplyHub logo" className="h-10 w-10 object-contain" />
            </span>
            <div>
              <p className="text-xl font-black tracking-tight">oneApplyHub</p>
              <p className="text-xs text-slate-500">All Your Options. One Platform.</p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            Helping students find safer accommodation choices, useful reviews, and opportunities without jumping between ten different websites.
          </p>

          <div className="mt-6 grid gap-2 sm:max-w-md sm:grid-cols-1">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-slate-500">Platform</h3>
          <ul className="space-y-3">
            {PLATFORM_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-slate-500">Account</h3>
          <ul className="space-y-3">
            {ACCOUNT_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-slate-500">Contact</h3>
          <div className="space-y-3 text-sm text-slate-400">
            <a href="mailto:info@oneapplyhub.co.za" className="flex items-center gap-3 hover:text-white transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-blue-300 ring-1 ring-white/10">
                <Mail className="h-4 w-4" />
              </span>
              info@oneapplyhub.co.za
            </a>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-blue-300 ring-1 ring-white/10">
                <MapPin className="h-4 w-4" />
              </span>
              Johannesburg, South Africa
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.06] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Built for students
            </div>
            <div className="flex flex-wrap gap-2">
              {CAMPUS_ITEMS.map((item) => (
                <span key={item} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <div className="flex flex-col gap-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} oneApplyHub. Made for students, by students.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button className="hover:text-slate-300 transition-colors">Privacy</button>
            <button className="hover:text-slate-300 transition-colors">Terms</button>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <GraduationCap className="h-3.5 w-3.5" />
              Wits and UJ focused
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified listings
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
