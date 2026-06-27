import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Mail, MapPin, GraduationCap, Home, Star, Award } from 'lucide-react';
import logoImg from '../../assets/OneHubLogo.png';

const FOOTER_GROUPS = [
  {
    title: 'Platform',
    links: [
      { to: '/properties', label: 'Browse Properties' },
      { to: '/reviews', label: 'Student Reviews' },
      { to: '/bursaries', label: 'Opportunities Hub' },
      { to: '/application', label: 'Apply Now' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Create Account' },
      { to: '/dashboard', label: 'Dashboard' },
    ],
  },
];

const HIGHLIGHTS = [
  { icon: Home, label: 'Verified accommodation' },
  { icon: Star, label: 'Student reviews' },
  { icon: Award, label: 'Bursary opportunities' },
];

const Footer = () => (
  <footer className="relative overflow-hidden bg-slate-950 text-white">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
    </div>

    <div className="relative border-y border-white/10 bg-white/[0.03]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300 mb-2">Student first platform</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Find accommodation, compare reviews, and apply with confidence.</h2>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-xl shadow-blue-950/20"
          >
            Browse properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_0.75fr_0.75fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <img src={logoImg} alt="oneApplyHub logo" className="h-14 w-14 object-contain" />
            <div>
              <p className="text-xl font-black tracking-tight">oneApplyHub</p>
              <p className="text-xs text-slate-400">All Your Options. One Platform.</p>
            </div>
          </Link>
          <p className="max-w-sm text-sm leading-6 text-slate-400">
            A focused platform helping South African students discover verified accommodation, student reviews, and opportunities in one place.
          </p>

          <div className="mt-6 grid gap-2">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 border border-blue-400/10">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">{group.title}</h3>
            <ul className="space-y-3">
              {group.links.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Contact</h3>
          <div className="space-y-3 text-sm text-slate-400">
            <a href="mailto:info@oneapplyhub.co.za" className="flex items-center gap-3 hover:text-white transition-colors">
              <Mail className="h-4 w-4 text-blue-300" />
              info@oneapplyhub.co.za
            </a>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-blue-300" />
              Johannesburg, South Africa
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-3">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
              <p className="text-xs leading-5 text-slate-400">
                Built for Wits and UJ students, with room to expand to more campuses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} oneApplyHub. Made for students, by students.</p>
          <div className="flex items-center gap-5">
            <button className="hover:text-slate-300 transition-colors">Privacy</button>
            <button className="hover:text-slate-300 transition-colors">Terms</button>
            <div className="flex items-center gap-1.5 text-slate-400">
              <GraduationCap className="h-3.5 w-3.5" />
              Student accommodation made simple
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
