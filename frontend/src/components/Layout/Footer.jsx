import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';
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
  <footer className="bg-[#0a0f1e] text-white">
    <div className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />


<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <img src={logoImg} alt="oneApplyHub logo" className="h-9 w-9 object-contain" />
            <span className="font-extrabold text-lg tracking-tight text-white">oneApplyHub</span>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed mb-5">
            Connecting South African students with verified accommodation, bursaries, and opportunities — all in one place.
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <a href="mailto:info@oneapplyhub.co.za" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
              <Mail className="w-3.5 h-3.5 text-blue-500/70 group-hover:text-blue-400 flex-shrink-0" />
              info@oneapplyhub.co.za
            </a>
            <a href="tel:+27640682586" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
              <Phone className="w-3.5 h-3.5 text-blue-500/70 group-hover:text-blue-400 flex-shrink-0" />
              +27 64 068 2586
            </a>
            <a href="tel:+27714227470" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
              <Phone className="w-3.5 h-3.5 text-blue-500/70 group-hover:text-blue-400 flex-shrink-0" />
              +27 71 422 7470
            </a>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              Johannesburg, South Africa
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Links</h3>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-500 hover:text-white transition-colors text-xs flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-blue-600/40 group-hover:bg-blue-400 transition-colors flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Universities */}
        <div>
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Supported Universities</h3>
          <ul className="space-y-3 mb-5">
            {UNIVERSITIES.map((name) => (
              <li key={name} className="flex items-start gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 text-xs leading-snug">{name}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              All listed properties are verified for student safety and affordability.
            </p>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Stay Updated</h3>
          <p className="text-gray-500 text-xs mb-4 leading-relaxed">
            Get notified about new properties, bursary deadlines, and student opportunities.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-600 transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-2">
          <p>&copy; {new Date().getFullYear()} oneApplyHub. Made for students, by students.</p>
          <div className="flex items-center space-x-5">
            <button className="hover:text-gray-400 transition-colors">Privacy Policy</button>
            <button className="hover:text-gray-400 transition-colors">Terms of Service</button>
            <Link to="/login" className="hover:text-gray-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
