import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import logoImg from '../../assets/OneHubLogo.png';

const QUICK_LINKS = [
  { to: '/properties', label: 'Browse Properties' },
  { to: '/reviews', label: 'Student Reviews' },
  { to: '/bursaries', label: 'OpportunitiesHub' },
  { to: '/application', label: 'Apply Now' },
  { to: '/register', label: 'Create Account' },
];

const UNIVERSITIES = [
  'University of the Witwatersrand (Wits)',
  'University of Johannesburg (UJ)',
];

const Footer = () => (
  <>
    {/* ── Section Breaker ── */}
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-900" style={{ height: 72 }}>
      <svg viewBox="0 0 1440 72" preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="breakerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#0f2547" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <path d="M0,0 L1440,0 L1440,72 Q720,16 0,72 Z" fill="url(#breakerGrad)" />
      </svg>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <div className="h-px w-12 bg-blue-500/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
        <div className="h-px w-12 bg-blue-500/30" />
      </div>
    </div>

    {/* ── Footer ── */}
    <footer className="bg-gradient-to-b from-[#0f172a] to-[#07101e] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImg} alt="oneApplyHub" className="h-11 w-11 object-contain" />
              <div>
                <span className="block font-extrabold text-xl tracking-tight leading-none">oneApplyHub</span>
                <span className="block text-[10px] text-blue-400 font-semibold tracking-widest uppercase mt-0.5">
                  All Your Options. One Platform.
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Connecting South African students with verified accommodation, bursaries, and opportunities — all in one place.
            </p>
            <div className="space-y-2.5">
              {[
                { href: 'mailto:info@oneapplyhub.co.za', icon: Mail, label: 'info@oneapplyhub.co.za' },
                { href: 'tel:+27640682586', icon: Phone, label: '+27 64 068 2586' },
                { href: 'tel:+27714227470', icon: Phone, label: '+27 71 422 7470' },
              ].map(({ href, icon: Icon, label }) => (
                <a key={href} href={href}
                  className="flex items-center gap-3 text-slate-400 hover:text-white text-sm transition-colors group">
                  <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/20 group-hover:border-blue-500/20 transition-all">
                    <Icon className="w-3 h-3" />
                  </span>
                  {label}
                </a>
              ))}
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3" />
                </span>
                Johannesburg, South Africa
              </div>
            </div>
          </div>

          {/* Navigate */}
          <div className="lg:col-span-3 lg:pl-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5">Navigate</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}
                    className="flex items-center justify-between text-slate-400 hover:text-white text-sm transition-colors group">
                    {label}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Universities */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5">Universities</h3>
            <ul className="space-y-3 mb-5">
              {UNIVERSITIES.map((name) => (
                <li key={name} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-400 text-xs leading-relaxed">{name}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl bg-white/4 border border-white/6 px-3 py-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All properties verified for student safety and quality.
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5">Stay Updated</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              New properties, bursary deadlines, and opportunities — straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-600 transition-all"
              />
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                Subscribe <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} oneApplyHub. Made for students, by students.</p>
          <div className="flex items-center gap-6">
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
