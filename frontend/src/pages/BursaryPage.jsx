import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, ExternalLink, BookOpen, Award, Clock,
  CheckCircle, AlertCircle, Building, Cpu, HeartPulse,
  Briefcase, Scale, FlaskConical, HardHat, GraduationCap,
  Landmark, Globe, ChevronDown, ChevronUp,
} from 'lucide-react';

// ─── Field-of-study categories (mirrors SA Bursaries structure) ──────────────
const FIELDS = [
  { value: 'all',           label: 'All Fields',              icon: BookOpen },
  { value: 'engineering',   label: 'Engineering',             icon: HardHat },
  { value: 'it',            label: 'IT & Computer Science',   icon: Cpu },
  { value: 'health',        label: 'Health & Medical',        icon: HeartPulse },
  { value: 'business',      label: 'Business & Finance',      icon: Briefcase },
  { value: 'accounting',    label: 'Accounting',              icon: Landmark },
  { value: 'education',     label: 'Education & Teaching',    icon: GraduationCap },
  { value: 'law',           label: 'Law',                     icon: Scale },
  { value: 'sciences',      label: 'Natural Sciences',        icon: FlaskConical },
  { value: 'general',       label: 'General / All Fields',    icon: Globe },
];

const FIELD_COLORS = {
  engineering: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  it:          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  health:      'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  business:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  accounting:  'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  education:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  law:         'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  sciences:    'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  general:     'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

// ─── Bursary data (real SA opportunities) ────────────────────────────────────
const BURSARIES = [
  // ── General / Government ─────────────────────────────────────────────────
  {
    id: 1,
    title: 'NSFAS Bursary',
    provider: 'National Student Financial Aid Scheme',
    funder: 'government',
    field: 'general',
    amount: 'Full tuition + accommodation + allowances',
    amountValue: 0,
    deadline: '2026-11-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'Comprehensive financial aid for students from poor and working-class families at public universities and TVET colleges.',
    requirements: ['South African citizen', 'Household income ≤ R350 000/yr', 'Enrolled at accredited public institution'],
    applicationUrl: 'https://www.nsfas.org.za',
    status: 'Open',
  },
  {
    id: 2,
    title: 'Funza Lushaka Teaching Bursary',
    provider: 'Department of Basic Education',
    funder: 'government',
    field: 'education',
    amount: 'Full tuition + accommodation + book allowance',
    amountValue: 0,
    deadline: '2026-09-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'For students pursuing a teaching qualification in a priority subject. Recipients must teach in a public school for the same number of years funded.',
    requirements: ['Studying Education at an accredited university', 'Priority subject (Maths, Science, Languages)', 'Agree to teach in public school post-graduation'],
    applicationUrl: 'https://www.funzalushaka.doe.gov.za',
    status: 'Open',
  },
  {
    id: 3,
    title: 'NRF Freestanding Scholarship',
    provider: 'National Research Foundation',
    funder: 'government',
    field: 'sciences',
    amount: 'R90 000 – R180 000 per year',
    amountValue: 135000,
    deadline: '2026-08-31',
    level: ['honours', 'masters', 'phd'],
    university: 'all',
    description: 'Merit-based award for postgraduate students pursuing research in natural and social sciences. Supports full-time study and research output.',
    requirements: ['South African citizen or permanent resident', 'Honours/Masters/PhD enrolment', 'Strong academic record (75%+ average)', 'Research proposal'],
    applicationUrl: 'https://www.nrf.ac.za',
    status: 'Open',
  },

  // ── Engineering ───────────────────────────────────────────────────────────
  {
    id: 4,
    title: 'Eskom Scholarship',
    provider: 'Eskom',
    funder: 'corporate',
    field: 'engineering',
    amount: 'Full tuition + stipend',
    amountValue: 0,
    deadline: '2026-08-31',
    level: ['undergraduate'],
    university: 'all',
    description: 'For students studying Electrical, Mechanical, or Civil Engineering. Includes mentorship and vacation work at Eskom facilities.',
    requirements: ['South African citizen', 'Engineering degree (Electrical, Mechanical, or Civil)', 'Academic average ≥ 60%', 'Financial need'],
    applicationUrl: 'https://www.eskom.co.za/bursaries',
    status: 'Open',
  },
  {
    id: 5,
    title: 'Anglo American Bursary',
    provider: 'Anglo American',
    funder: 'corporate',
    field: 'engineering',
    amount: 'Full tuition + living expenses + stipend',
    amountValue: 0,
    deadline: '2026-07-31',
    level: ['undergraduate'],
    university: 'wits',
    description: 'Engineering and Mining-focused bursary with structured work-back agreement. Includes vacation work exposure from Year 1.',
    requirements: ['Engineering or Mining qualification', 'Academic average ≥ 65%', 'South African citizen', 'Work-back agreement'],
    applicationUrl: 'https://www.angloamerican.com/sustainability/our-people/bursaries',
    status: 'Open',
  },
  {
    id: 6,
    title: 'Sasol Bursary Programme',
    provider: 'Sasol',
    funder: 'corporate',
    field: 'engineering',
    amount: 'R60 000 – R120 000 per year',
    amountValue: 90000,
    deadline: '2026-06-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'For students in Chemical, Mechanical, Electrical Engineering or Chemistry. Includes structured vacation work and mentorship.',
    requirements: ['STEM qualification at accredited university', 'Academic average ≥ 60%', 'Leadership potential', 'South African citizen'],
    applicationUrl: 'https://www.sasol.com/careers/bursaries',
    status: 'Open',
  },
  {
    id: 7,
    title: 'Transnet Bursary',
    provider: 'Transnet SOC',
    funder: 'government',
    field: 'engineering',
    amount: 'Full tuition + R6 000/month stipend',
    amountValue: 0,
    deadline: '2026-09-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'Targets Civil, Electrical, Mechanical, and Industrial Engineering students. Work-back obligation applies after graduation.',
    requirements: ['South African citizen', 'Studying Engineering at a recognised university', 'Academic average ≥ 60%', 'Financial need demonstrated'],
    applicationUrl: 'https://www.transnet.net/careers',
    status: 'Open',
  },
  {
    id: 8,
    title: 'BHP Bursary (South Africa)',
    provider: 'BHP',
    funder: 'corporate',
    field: 'engineering',
    amount: 'Full tuition + R5 000/month living allowance',
    amountValue: 0,
    deadline: '2026-07-31',
    level: ['undergraduate'],
    university: 'wits',
    description: 'Supports Mining, Mechanical, and Electrical Engineering students with structured vacation work and mentoring at BHP operations.',
    requirements: ['Mining, Mechanical, or Electrical Engineering', 'Academic average ≥ 65%', 'South African citizen'],
    applicationUrl: 'https://www.bhp.com/careers/students-and-graduates',
    status: 'Open',
  },

  // ── IT & Computer Science ─────────────────────────────────────────────────
  {
    id: 9,
    title: 'MTN Bursary Programme',
    provider: 'MTN Group',
    funder: 'corporate',
    field: 'it',
    amount: 'Full tuition + R4 500/month stipend',
    amountValue: 0,
    deadline: '2026-09-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'For students in Information Technology, Computer Science, or Telecommunications Engineering. Vacation work available at MTN.',
    requirements: ['IT / CompSci / Telecom Engineering', 'Academic average ≥ 65%', 'South African citizen', 'Leadership qualities'],
    applicationUrl: 'https://www.mtn.com/mtn-bursary/',
    status: 'Open',
  },
  {
    id: 10,
    title: 'Vodacom e-School Bursary',
    provider: 'Vodacom',
    funder: 'corporate',
    field: 'it',
    amount: 'Full tuition + stipend',
    amountValue: 0,
    deadline: '2026-08-31',
    level: ['undergraduate'],
    university: 'all',
    description: 'Supports students in IT, Computer Science, and related fields with a focus on digital innovation and transformation skills.',
    requirements: ['Computer Science / IT / Software Engineering', 'Academic average ≥ 60%', 'South African citizen'],
    applicationUrl: 'https://www.vodacom.co.za/vodacom/about-us/careers',
    status: 'Open',
  },
  {
    id: 11,
    title: 'Standard Bank IT Bursary',
    provider: 'Standard Bank',
    funder: 'corporate',
    field: 'it',
    amount: 'Full tuition + R5 000/month stipend',
    amountValue: 0,
    deadline: '2026-10-31',
    level: ['undergraduate'],
    university: 'all',
    description: 'For Information Systems and Computer Science students who want to work in fintech, data science, or software engineering within banking.',
    requirements: ['IT / Information Systems / Computer Science', 'Academic average ≥ 65%', 'South African citizen', 'Work-back agreement'],
    applicationUrl: 'https://www.standardbank.co.za/careers/students',
    status: 'Open',
  },

  // ── Health & Medical ──────────────────────────────────────────────────────
  {
    id: 12,
    title: 'Department of Health Bursary',
    provider: 'National Department of Health',
    funder: 'government',
    field: 'health',
    amount: 'Full tuition + accommodation + allowances',
    amountValue: 0,
    deadline: '2026-09-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'For students studying Medicine, Nursing, Pharmacy, or Allied Health. Recipients commit to working in the public health sector.',
    requirements: ['South African citizen', 'Health-related degree (Medicine, Nursing, Pharmacy, etc.)', 'Financial need', 'Commitment to public service'],
    applicationUrl: 'https://www.health.gov.za/bursaries',
    status: 'Open',
  },
  {
    id: 13,
    title: 'Discovery Health Bursary',
    provider: 'Discovery Health',
    funder: 'corporate',
    field: 'health',
    amount: 'R50 000 – R80 000 per year',
    amountValue: 65000,
    deadline: '2026-06-30',
    level: ['undergraduate'],
    university: 'wits',
    description: 'For students excelling in health sciences at Wits. Includes mentorship, networking events, and vacation work opportunities.',
    requirements: ['Health Sciences (Medicine, Pharmacy, Physiotherapy, etc.)', 'Academic average ≥ 70%', 'Financial need', 'Leadership potential'],
    applicationUrl: 'https://www.discovery.co.za/corporate/bursaries',
    status: 'Open',
  },
  {
    id: 14,
    title: 'Netcare Bursary (Nursing)',
    provider: 'Netcare',
    funder: 'corporate',
    field: 'health',
    amount: 'Full tuition + uniform + meals',
    amountValue: 0,
    deadline: '2026-10-31',
    level: ['undergraduate'],
    university: 'all',
    description: 'Comprehensive nursing bursary that covers tuition at Netcare Education, with guaranteed employment at Netcare hospitals on completion.',
    requirements: ['Accepted into Netcare Education nursing programme', 'South African citizen', 'Matric with Biology and English'],
    applicationUrl: 'https://www.netcare.co.za/careers/bursaries',
    status: 'Open',
  },

  // ── Business & Finance ────────────────────────────────────────────────────
  {
    id: 15,
    title: 'FirstRand Bursary',
    provider: 'FirstRand Group (FNB, RMB, WesBank)',
    funder: 'corporate',
    field: 'business',
    amount: 'Full tuition + R5 000/month stipend',
    amountValue: 0,
    deadline: '2026-08-31',
    level: ['undergraduate'],
    university: 'all',
    description: 'For students in Commerce, Finance, Economics, or Actuarial Science. Includes structured workplace exposure at FNB, RMB, or WesBank.',
    requirements: ['Commerce / Finance / Actuarial Science', 'Academic average ≥ 65%', 'South African citizen', 'Work-back agreement'],
    applicationUrl: 'https://www.firstrand.co.za/careers/students',
    status: 'Open',
  },
  {
    id: 16,
    title: 'Investec Bursary',
    provider: 'Investec',
    funder: 'corporate',
    field: 'business',
    amount: 'R40 000 – R70 000 per year',
    amountValue: 55000,
    deadline: '2026-07-31',
    level: ['undergraduate'],
    university: 'wits',
    description: 'For high-performing students in Finance, Engineering, or IT at Wits or UCT. Includes structured mentorship and networking events.',
    requirements: ['Finance / Engineering / IT', 'Academic average ≥ 70%', 'South African citizen', 'Demonstrated leadership'],
    applicationUrl: 'https://www.investec.com/en_za/welcome-to-investec/careers/students.html',
    status: 'Open',
  },
  {
    id: 17,
    title: 'Old Mutual Actuarial Bursary',
    provider: 'Old Mutual',
    funder: 'corporate',
    field: 'business',
    amount: 'Full tuition + R4 000/month living allowance',
    amountValue: 0,
    deadline: '2026-09-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'Specifically for Actuarial Science, Statistics, and Mathematics students. Includes vacation work and study support for professional exams.',
    requirements: ['Actuarial Science / Statistics / Mathematics', 'Academic average ≥ 70%', 'South African citizen'],
    applicationUrl: 'https://www.oldmutual.co.za/careers/students',
    status: 'Open',
  },
  {
    id: 18,
    title: 'Mastercard Foundation Scholars',
    provider: 'Mastercard Foundation',
    funder: 'international',
    field: 'business',
    amount: 'Full scholarship + living expenses + laptop',
    amountValue: 0,
    deadline: '2026-03-31',
    level: ['undergraduate', 'masters'],
    university: 'wits',
    description: 'Comprehensive scholarship for academically talented students from disadvantaged backgrounds pursuing leadership-oriented degrees.',
    requirements: ['Academic excellence (top 10%)', 'Financial need', 'Leadership potential', 'African citizen'],
    applicationUrl: 'https://mastercardfdn.org/scholars/',
    status: 'Open',
  },

  // ── Accounting ────────────────────────────────────────────────────────────
  {
    id: 19,
    title: 'SAICA CA(SA) Bursary',
    provider: 'South African Institute of Chartered Accountants',
    funder: 'professional',
    field: 'accounting',
    amount: 'R30 000 – R60 000 per year',
    amountValue: 45000,
    deadline: '2026-09-30',
    level: ['undergraduate', 'honours'],
    university: 'all',
    description: 'For students on the CA(SA) training route at accredited universities. SAICA partners with accounting firms for vacation work placements.',
    requirements: ['Accounting / BCom Accounting degree', 'Academic average ≥ 60%', 'South African citizen', 'Intent to qualify as CA(SA)'],
    applicationUrl: 'https://www.saica.org.za/bursaries',
    status: 'Open',
  },
  {
    id: 20,
    title: 'PwC Bursary',
    provider: 'PricewaterhouseCoopers',
    funder: 'corporate',
    field: 'accounting',
    amount: 'Full tuition + R4 500/month stipend',
    amountValue: 0,
    deadline: '2026-08-31',
    level: ['undergraduate'],
    university: 'all',
    description: 'For Accounting students on the CA(SA) path. Includes vacation clerk positions, article clerk offers, and direct mentorship from PwC partners.',
    requirements: ['BCom Accounting / CTA', 'Academic average ≥ 60%', 'South African citizen'],
    applicationUrl: 'https://www.pwc.co.za/en/careers/students/bursary.html',
    status: 'Open',
  },
  {
    id: 21,
    title: 'Deloitte Bursary',
    provider: 'Deloitte',
    funder: 'corporate',
    field: 'accounting',
    amount: 'Full tuition + R4 000/month stipend',
    amountValue: 0,
    deadline: '2026-08-31',
    level: ['undergraduate'],
    university: 'all',
    description: 'Supports Accounting and IT students in the CA(SA) pipeline or technology track. Vacation work and article clerk placements included.',
    requirements: ['BCom Accounting or Information Systems', 'Academic average ≥ 60%', 'South African citizen', 'Work-back agreement'],
    applicationUrl: 'https://www2.deloitte.com/za/en/pages/careers/articles/bursary.html',
    status: 'Open',
  },
  {
    id: 22,
    title: 'KPMG Bursary',
    provider: 'KPMG South Africa',
    funder: 'corporate',
    field: 'accounting',
    amount: 'Full tuition + study materials',
    amountValue: 0,
    deadline: '2026-09-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'BCom Accounting bursary with vacation clerkship and a pathway to article contracts at KPMG. Mentorship from senior KPMG staff.',
    requirements: ['BCom Accounting on CA(SA) path', 'Academic average ≥ 60%', 'South African citizen'],
    applicationUrl: 'https://home.kpmg/za/en/home/careers/students.html',
    status: 'Open',
  },

  // ── Education ─────────────────────────────────────────────────────────────
  {
    id: 23,
    title: 'Allan Gray Orbis Foundation',
    provider: 'Allan Gray Orbis Foundation',
    funder: 'private',
    field: 'general',
    amount: 'Full tuition + mentorship programme',
    amountValue: 0,
    deadline: '2026-07-31',
    level: ['undergraduate'],
    university: 'all',
    description: 'Entrepreneurship-focused bursary for students with exceptional entrepreneurial mindset. Includes a comprehensive fellowship and business mentorship.',
    requirements: ['Entrepreneurial spirit and demonstrated initiative', 'Academic potential (60%+)', 'Leadership qualities', 'South African citizen'],
    applicationUrl: 'https://www.allangrayorbis.org',
    status: 'Open',
  },

  // ── Law ───────────────────────────────────────────────────────────────────
  {
    id: 24,
    title: 'Legal Aid SA Bursary',
    provider: 'Legal Aid South Africa',
    funder: 'government',
    field: 'law',
    amount: 'Full tuition + monthly stipend',
    amountValue: 0,
    deadline: '2026-09-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'For LLB students committed to public service law. Recipients serve a work-back period at Legal Aid SA offices after qualifying.',
    requirements: ['LLB degree programme', 'Academic average ≥ 60%', 'South African citizen', 'Commitment to public service'],
    applicationUrl: 'https://www.legal-aid.co.za/bursaries/',
    status: 'Open',
  },

  // ── Sciences ──────────────────────────────────────────────────────────────
  {
    id: 25,
    title: 'Sasol Chemistry Bursary',
    provider: 'Sasol',
    funder: 'corporate',
    field: 'sciences',
    amount: 'R55 000 – R100 000 per year',
    amountValue: 77500,
    deadline: '2026-06-30',
    level: ['undergraduate'],
    university: 'all',
    description: 'For Chemistry and Chemical Engineering students with a passion for applied sciences and innovation in the energy sector.',
    requirements: ['Chemistry / Chemical Engineering', 'Academic average ≥ 60%', 'South African citizen', 'Leadership qualities'],
    applicationUrl: 'https://www.sasol.com/careers/bursaries',
    status: 'Open',
  },
  {
    id: 26,
    title: 'Golden Key Merit Scholarship',
    provider: 'Golden Key International Honour Society',
    funder: 'private',
    field: 'general',
    amount: 'R15 000 – R25 000',
    amountValue: 20000,
    deadline: '2026-06-15',
    level: ['undergraduate', 'honours'],
    university: 'all',
    description: 'Academic excellence award for top-performing students. Golden Key membership required — automatically invited if in the top 15% of your class.',
    requirements: ['Top 15% academic performance in your class', 'Active Golden Key member', 'Community involvement and leadership'],
    applicationUrl: 'https://www.goldenkey.org/scholarships/',
    status: 'Open',
  },
];

const INITIAL_FILTERS = { field: 'all', funder: 'all', level: 'all', search: '' };

const daysUntil = (dateStr) => {
  const d = new Date(dateStr);
  return Math.ceil((d - new Date()) / 864e5);
};

const FieldIcon = ({ field, className = 'w-5 h-5' }) => {
  const f = FIELDS.find((x) => x.value === field);
  if (!f) return <BookOpen className={className} />;
  const Icon = f.icon;
  return <Icon className={className} />;
};

const BursaryCard = ({ bursary }) => {
  const [expanded, setExpanded] = useState(false);
  const days = daysUntil(bursary.deadline);
  const isUrgent = days <= 30 && days > 0;
  const expired = days <= 0;
  const fieldLabel = FIELDS.find((f) => f.value === bursary.field)?.label || bursary.field;
  const fieldColor = FIELD_COLORS[bursary.field] || FIELD_COLORS.general;

  const funderBadge = {
    government:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    corporate:     'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    international: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    private:       'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    professional:  'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${fieldColor}`}>
              <FieldIcon field={bursary.field} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 leading-snug">{bursary.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{bursary.provider}</p>
            </div>
          </div>
          {/* Deadline badge */}
          <div className={`flex-shrink-0 text-right text-xs ${expired ? 'text-red-500' : isUrgent ? 'text-red-500 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              <span>{expired ? 'Expired' : isUrgent ? `${days}d left!` : `${days}d left`}</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mt-0.5">{new Date(bursary.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fieldColor}`}>{fieldLabel}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${funderBadge[bursary.funder] || funderBadge.corporate}`}>
            {bursary.funder.charAt(0).toUpperCase() + bursary.funder.slice(1)}
          </span>
          {bursary.level.map((l) => (
            <span key={l} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">{l}</span>
          ))}
          {bursary.university !== 'all' && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">{bursary.university.toUpperCase()}</span>
          )}
        </div>

        {/* Amount */}
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">{bursary.amount}</p>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-3">{bursary.description}</p>

        {/* Requirements toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 hover:underline"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide requirements' : 'View requirements'}
        </button>

        {expanded && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {bursary.requirements.map((req, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />{req}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
          <a
            href={bursary.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Apply Now <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

const BursaryPage = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const handleFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const filtered = useMemo(() => BURSARIES.filter((b) => {
    if (filters.field !== 'all' && b.field !== filters.field) return false;
    if (filters.funder !== 'all' && b.funder !== filters.funder) return false;
    if (filters.level !== 'all' && !b.level.includes(filters.level)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !b.provider.toLowerCase().includes(q) && !b.field.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  const openCount  = filtered.filter((b) => daysUntil(b.deadline) > 0).length;
  const urgentCount = filtered.filter((b) => { const d = daysUntil(b.deadline); return d > 0 && d <= 30; }).length;

  const selectClass = 'px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">SA Bursaries & Scholarships</h1>
          <p className="text-sm text-blue-100 max-w-xl mx-auto">
            Real South African bursaries categorized by field of study — from government grants to corporate sponsorships.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { value: filtered.length,  label: 'Bursaries Found',  color: 'text-blue-600' },
            { value: openCount,         label: 'Open Now',         color: 'text-emerald-600' },
            { value: urgentCount,       label: 'Closing ≤ 30 Days',color: 'text-red-500' },
            { value: BURSARIES.length,  label: 'Total Listed',     color: 'text-purple-600' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-3">
              <div className={`text-xl font-bold leading-none ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Field tabs (SA Bursaries style) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Filter by Field of Study</p>
          <div className="flex flex-wrap gap-2">
            {FIELDS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleFilter('field', value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filters.field === value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bursaries or providers..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilter('search', e.target.value)}
              />
            </div>
            <select className={selectClass} value={filters.funder} onChange={(e) => handleFilter('funder', e.target.value)}>
              <option value="all">All Funders</option>
              <option value="government">Government</option>
              <option value="corporate">Corporate</option>
              <option value="private">Private Foundation</option>
              <option value="professional">Professional Body</option>
              <option value="international">International</option>
            </select>
            <select className={selectClass} value={filters.level} onChange={(e) => handleFilter('level', e.target.value)}>
              <option value="all">All Study Levels</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="honours">Honours</option>
              <option value="masters">Masters</option>
              <option value="phd">PhD</option>
            </select>
          </div>
        </div>

        {/* Auth nudge */}
        {!isAuthenticated && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Track your bursary applications</p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">Create a free account to save bursaries and track deadlines.</p>
              <div className="flex gap-2">
                <Link to="/register" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">Sign Up Free</Link>
                <Link to="/login" className="border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">Login</Link>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {filters.field !== 'all' ? FIELDS.find((f) => f.value === filters.field)?.label : 'All Bursaries'} ({filtered.length})
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Soonest deadline first</span>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-3">
              {[...filtered]
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .map((b) => <BursaryCard key={b.id} bursary={b} />)}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No bursaries found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">Try adjusting your field or filters.</p>
              <button onClick={() => setFilters(INITIAL_FILTERS)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Application Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Award, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', title: 'Apply to Several', text: 'Apply to multiple bursaries simultaneously — many are not mutually exclusive. Cast a wide net.' },
              { icon: GraduationCap, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', title: 'Certified Transcripts Ready', text: 'Have certified copies of your academic record, ID, and proof of registration ready before you start.' },
              { icon: Building, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', title: 'Meet Corporate Deadlines', text: 'Corporate bursaries close in April–September for the following year. Start researching mid-year.' },
            ].map(({ icon: Icon, color, title, text }) => (
              <div key={title} className="flex gap-3 items-start">
                <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">{title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-bold mb-2">Start Your Student Application</h3>
          <p className="text-blue-100 text-sm mb-4">Apply for accommodation while your bursary application is in progress.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/application" className="bg-white text-blue-700 px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-sm">
              Apply for Accommodation
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="border-2 border-white/60 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors font-semibold text-sm">
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BursaryPage;
