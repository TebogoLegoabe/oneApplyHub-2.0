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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center space-x-2.5 mb-4">
            <img src={logoImg} alt="oneApplyHub logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">oneApplyHub</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            All Your Options. One Platform.
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>support@oneapplyhub.co.za</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>+27 11 000 0000</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>Johannesburg, South Africa</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-sm mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2">
            {QUICK_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-400 hover:text-white transition-colors text-xs flex items-center group"
                >
                  <ArrowRight className="w-3 h-3 mr-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Universities */}
        <div>
          <h3 className="font-semibold text-sm mb-4 text-white">Supported Universities</h3>
          <ul className="space-y-2 text-xs text-gray-400 mb-4">
            {UNIVERSITIES.map((name) => (
              <li key={name} className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <p className="text-xs text-gray-400 leading-relaxed">
              All properties are verified for student safety and quality standards.
            </p>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold text-sm mb-4 text-white">Stay Updated</h3>
          <p className="text-gray-400 text-xs mb-3">
            Get notified about new properties and bursary opportunities.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} oneApplyHub. Made for students, by students.</p>
          <div className="flex items-center space-x-5 mt-2 md:mt-0">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
            <button className="hover:text-white transition-colors">Contact Us</button>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
