import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
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
  <footer className="bg-gray-900 text-white">
    {/* Top accent bar */}
    <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <img src={logoImg} alt="oneApplyHub logo" className="h-10 w-10 object-contain" />
            <span className="font-extrabold text-xl tracking-tight text-white">oneApplyHub</span>
          </div>
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">
            All Your Options. One Platform.
          </p>
          <p className="text-gray-500 text-xs leading-relaxed mb-5">
            Connecting South African students with verified accommodation, bursaries, and opportunities — all in one place.
          </p>
          <div className="space-y-2.5 text-xs text-gray-400">
            <a href="mailto:info@oneapplyhub.co.za" className="flex items-center space-x-2 hover:text-blue-400 transition-colors group">
              <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 group-hover:text-blue-400" />
              <span>info@oneapplyhub.co.za</span>
            </a>
            <a href="tel:+27640682586" className="flex items-center space-x-2 hover:text-blue-400 transition-colors group">
              <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 group-hover:text-blue-400" />
              <span>+27 64 068 2586</span>
            </a>
            <a href="tel:+27714227470" className="flex items-center space-x-2 hover:text-blue-400 transition-colors group">
              <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 group-hover:text-blue-400" />
              <span>+27 71 422 7470</span>
            </a>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>Johannesburg, South Africa</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-sm mb-5 text-white tracking-wide">Quick Links</h3>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-400 hover:text-white transition-colors text-xs flex items-center group"
                >
                  <ArrowRight className="w-3 h-3 mr-1.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Universities */}
        <div>
          <h3 className="font-semibold text-sm mb-5 text-white tracking-wide">Supported Universities</h3>
          <ul className="space-y-2.5 text-xs text-gray-400 mb-5">
            {UNIVERSITIES.map((name) => (
              <li key={name} className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
          <div className="p-3.5 bg-gradient-to-br from-gray-800 to-gray-800/60 rounded-xl border border-gray-700/80">
            <p className="text-xs text-gray-400 leading-relaxed">
              All listed properties are verified for student safety, quality, and affordability.
            </p>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold text-sm mb-5 text-white tracking-wide">Stay Updated</h3>
          <p className="text-gray-400 text-xs mb-4 leading-relaxed">
            Get notified about new properties, bursary deadlines, and student opportunities.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2.5">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-blue-500 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder-gray-500 transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-900/30"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-gray-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>&copy; {new Date().getFullYear()} oneApplyHub. Made for students, by students.</p>
          <div className="flex items-center space-x-5">
            <button className="hover:text-gray-300 transition-colors">Privacy Policy</button>
            <button className="hover:text-gray-300 transition-colors">Terms of Service</button>
            <Link to="/login" className="hover:text-gray-300 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
