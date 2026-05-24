import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import logoImg from '../../assets/OneHubLogo.png';

const QUICK_LINKS = [
  { to: '/properties', label: 'Browse Properties' },
  { to: '/reviews',    label: 'Student Reviews'  },
  { to: '/bursaries',  label: 'OpportunitiesHub' },
  { to: '/application',label: 'Apply Now'         },
  { to: '/register',   label: 'Create Account'    },
];

const UNIVERSITIES = [
  'University of the Witwatersrand (Wits)',
  'University of Johannesburg (UJ)',
];

const CONTACTS = [
  { href: 'mailto:info@oneapplyhub.co.za', icon: Mail,  label: 'info@oneapplyhub.co.za' },
  { href: 'tel:+27640682586',              icon: Phone, label: '+27 64 068 2586'         },
  { href: 'tel:+27714227470',              icon: Phone, label: '+27 71 422 7470'         },
];

const SectionHeading = ({ children }) => (
  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-6 flex items-center gap-2">
    <span className="inline-block w-4 h-px bg-blue-500" />
    {children}
  </h3>
);

const Footer = () => (
  <>
    {/* ── Section Breaker ── */}
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-900" style={{ height: 80 }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0a1628" />
            <stop offset="50%"  stopColor="#0d2040" />
            <stop offset="100%" stopColor="#0a1628" />
          </linearGradient>
        </defs>
        <path d="M0,0 L1440,0 L1440,80 Q720,18 0,80 Z" fill="url(#bg)" />
      </svg>
      {/* centre pip */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <div className="h-px w-14 bg-blue-500/25" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/70" />
        <div className="h-px w-14 bg-blue-500/25" />
      </div>
    </div>

    {/* ── Footer body ── */}
    <footer className="bg-gradient-to-b from-[#0a1628] to-[#060e1c] text-white">

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-12">

          {/* ── Brand — 4 cols ── */}
          <div className="xl:col-span-4">
            {/* Logo + wordmark */}
            <div className="flex items-center gap-4 mb-5">
              <img
                src={logoImg}
                alt="oneApplyHub"
                className="h-16 w-16 object-contain flex-shrink-0 drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]"
              />
              <div>
                <span className="block font-black text-2xl tracking-tight text-white leading-none">
                  oneApplyHub
                </span>
                <span className="block text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase mt-1">
                  All Your Options. One Platform.
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-7 max-w-xs">
              Connecting South African students with verified accommodation,
              bursaries, and opportunities — all in one place.
            </p>

            {/* Contact items */}
            <div className="space-y-3">
              {CONTACTS.map(({ href, icon: Icon, label }) => (
                <a key={href} href={href}
                  className="flex items-center gap-3 text-slate-400 hover:text-white text-sm transition-colors group">
                  <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/25 group-hover:border-blue-500/30 transition-all">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  {label}
                </a>
              ))}
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                Johannesburg, South Africa
              </div>
            </div>
          </div>

          {/* ── Quick Links — 2 cols ── */}
          <div className="xl:col-span-2 xl:pl-4">
            <SectionHeading>Quick Links</SectionHeading>
            <ul className="space-y-3.5">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}
                    className="flex items-center justify-between text-slate-400 hover:text-white text-sm transition-colors group">
                    {label}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400 flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Universities — 3 cols ── */}
          <div className="xl:col-span-3">
            <SectionHeading>Supported Universities</SectionHeading>
            <ul className="space-y-4 mb-6">
              {UNIVERSITIES.map((name) => (
                <li key={name} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm leading-snug">{name}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-white/6 bg-white/3 px-4 py-3.5">
              <p className="text-xs text-slate-500 leading-relaxed">
                All listed properties are verified for student safety, quality, and affordability.
              </p>
            </div>
          </div>

          {/* ── Newsletter — 3 cols ── */}
          <div className="xl:col-span-3">
            <SectionHeading>Stay Updated</SectionHeading>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              New properties, bursary deadlines, and student opportunities — straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2.5">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-600 transition-all"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-bold px-4 py-3 rounded-xl transition-colors"
              >
                Subscribe
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5
          flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} oneApplyHub. Made for students, by students.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <button className="hover:text-slate-300 transition-colors">Privacy Policy</button>
            <button className="hover:text-slate-300 transition-colors">Terms of Service</button>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  </>
);

export default Footer;
