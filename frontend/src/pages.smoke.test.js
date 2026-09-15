/* Smoke test: mounts every page with mocked API data and fails on any runtime or console error. */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('./services/api', () => {
  const property = {
    id: 1, name: 'Braam Heights', address: '12 Jorissen St, Braamfontein', description: 'Cosy student residence near campus.',
    university: 'wits', property_type: 'residence', nsfas_accredited: true, price_min: 3500, price_max: 5200,
    average_rating: 4.3, review_count: 12, amenities: JSON.stringify(['WiFi', 'Security', 'Laundry', 'Gym']),
    contact_info: '011 555 0100', website: 'https://braamheights.example.com', created_at: '2026-01-10T10:00:00Z', approved: true,
  };
  const review = {
    id: 7, property_id: 1, property_name: 'Braam Heights', author: 'Thandi N', author_year: '2nd Year', author_university: 'wits',
    overall_rating: 4, review_text: 'Great location, decent management. WiFi could be faster but overall a solid place to live.',
    pros: 'Close to campus', cons: 'Slow WiFi', recommend: true, helpful_count: 3, created_at: '2026-02-01T10:00:00Z', approved: true,
    author_email: 'thandi@example.com',
  };
  const ok = (data) => Promise.resolve({ data });
  return {
    __esModule: true,
    default: {},
    authAPI: { getProfile: () => ok({ user: null }), forgotPassword: () => ok({}), resetPassword: () => ok({}) },
    mfaAPI: { setup: () => ok({ qr_code: '', secret: 'ABC' }), enable: () => ok({ backup_codes: [] }), disable: () => ok({}) },
    statsAPI: { getStats: () => ok({ properties: 24, students: 900, reviews: 120, avg_rating: 4.2 }) },
    bursariesAPI: { getBursaries: () => ok({ bursaries: [{ id: 1, title: 'NSFAS Bursary', provider: 'NSFAS', funder: 'government', field: 'general', amount: 'Full tuition', deadline: '2027-11-30', level: ['undergraduate'], description: 'Comprehensive aid.', requirements: ['SA citizen'], applicationUrl: 'https://www.nsfas.org.za', status: 'Open' }] }) },
    opportunitiesAPI: { getOpportunities: () => ok({ opportunities: [{ id: 5, title: 'Software Intern', provider: 'Acme', opportunity_type: 'internship', location: 'Johannesburg', duration: '6 months', field: 'IT', description: 'Build things.', requirements: 'Final year student', salary_range: 'R8 000 / month', application_url: 'https://acme.example.com', deadline: '2027-03-01', status: 'open' }] }) },
    propertiesAPI: {
      getProperties: () => ok({ properties: [property], total: 1, pages: 1 }),
      getProperty: () => ok({ property }),
    },
    reviewsAPI: {
      getReviews: () => ok({ reviews: [review] }),
      getAllReviews: () => ok({ reviews: [review], total: 1, total_pages: 1 }),
      createReview: () => ok({}),
      markHelpful: () => ok({ helpful_count: 4 }),
      getDashboardStats: () => ok({
        overview: { total_properties: 24, total_reviews: 120, avg_rating: 4.2, recommend_pct: 88 },
        top_properties: [{ name: 'Braam Heights', review_count: 12, avg_rating: 4.3 }],
        rating_distribution: [1, 2, 3, 4, 5].map((n) => ({ label: `${n}★`, count: n * 2 })),
        recent_reviews: [review],
      }),
    },
    applicationsAPI: {
      getProfile: () => ok({ profile: null }),
      getMyAccommodation: () => ok({ application: null }),
      getMyUniversity: () => ok({ application: null }),
    },
    adminAPI: {
      getStats: () => ok({ total_users: 10, verified_users: 8, total_properties: 3, approved_properties: 2, pending_reviews: 1, total_applications: 4, pending_applications: 2, pending_properties: 1 }),
      getProperties: () => ok({ properties: [property] }),
      getReviews: () => ok({ reviews: [review] }),
      getUsers: () => ok({ users: [{ id: 2, name: 'Sam', email: 's@example.com', verified: true, is_admin: false, is_super_admin: false }] }),
      getAccommodationApplications: () => ok({ applications: [] }),
      getUniversityApplications: () => ok({ applications: [] }),
      getPropertyAdmins: () => ok({ assignments: [{ id: 1, admin_user_id: 2, admin_name: 'Sam', admin_email: 's@example.com', property_id: 1, property_name: 'Braam Heights' }] }),
      getFloors: () => ok({ floors: [{ id: 1, floor_number: 1, label: 'Ground', rooms: [{ id: 5, room_number: '101', room_type: 'single', capacity: 1, occupied_count: 0, occupants: [], is_full: false, price: 4000 }] }] }),
      getUnallocated: () => ok({ unallocated: [{ id: 9, applicant_name: 'Lebo', applicant_email: 'l@example.com', room_type_preference: 'single' }] }),
      deleteReview: () => ok({}),
      getOpportunitiesAdmin: () => ok({ opportunities: [{ id: 5, title: 'Software Intern', provider: 'Acme', opportunity_type: 'internship', location: 'Johannesburg', deadline: '2027-03-01', status: 'open' }] }),
      seedOpportunities: () => ok({}),
      deleteOpportunity: () => ok({}),
      deleteAccommodationApplication: () => ok({}),
    },
  };
});

jest.mock('./context/AuthContext', () => {
  const actual = jest.requireActual('react');
  let current = { user: null };
  const useAuth = () => ({
    user: current.user,
    isAuthenticated: Boolean(current.user),
    loading: false,
    login: async () => ({ success: true, user: current.user }),
    logout: () => {},
    register: async () => ({ success: true }),
    sendVerificationCode: async () => ({ success: true }),
    verifyEmail: async () => ({ success: true }),
    verifyMFALogin: async () => ({ success: true }),
    googleLogin: async () => ({ success: true }),
    refreshUser: async () => {},
    changePassword: async () => ({ success: true }),
    updateProfilePicture: async () => ({ success: true }),
  });
  return {
    __esModule: true,
    useAuth,
    AuthProvider: ({ children }) => actual.createElement(actual.Fragment, null, children),
    __setUser: (user) => { current = { user }; },
  };
});

const { __setUser } = require('./context/AuthContext');
const { ThemeProvider } = require('./context/ThemeContext');
const { ToastProvider } = require('./components/ui');

const PAGES = {
  HomePage: require('./pages/HomePage').default,
  PropertiesPage: require('./pages/PropertiesPage').default,
  PropertyDetailPage: require('./pages/PropertyDetailPage').default,
  ReviewsPage: require('./pages/ReviewsPage').default,
  BursaryPage: require('./pages/BursaryPage').default,
  OpportunitiesPage: require('./pages/OpportunitiesPage').default,
  LegalPage: require('./pages/LegalPage').default,
  LoginPage: require('./pages/LoginPage').default,
  RegisterPage: require('./pages/RegisterPage').default,
  ForgotPasswordPage: require('./pages/ForgotPasswordPage').default,
  ResetPasswordPage: require('./pages/ResetPasswordPage').default,
  VerifyEmailPage: require('./pages/VerifyEmailPage').default,
  ForcedPasswordChangePage: require('./pages/ForcedPasswordChangePage').default,
  NotFoundPage: require('./pages/NotFoundPage').default,
  DashboardPage: require('./pages/DashboardPage').default,
  StudentApplicationPage: require('./pages/StudentApplicationPage').default,
  MFASetupPage: require('./pages/MFASetupPage').default,
  CreateReviewPage: require('./pages/CreateReviewPage').default,
  AdminDashboard: require('./pages/AdminDashboard').default,
  PropertyAdminsPage: require('./pages/PropertyAdminsPage').default,
  PropertyRoomsPage: require('./pages/PropertyRoomsPage').default,
};

const Header = require('./components/Layout/Header').default;
const Footer = require('./components/Layout/Footer').default;
const AppSidebar = require('./components/Layout/AppSidebar').default;

const mount = (element, path = '/properties/1') => render(
  <ThemeProvider>
    <ToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/properties/:id" element={element} />
          <Route path="/properties/:id/review" element={element} />
          <Route path="/admin/properties/:id/rooms" element={element} />
          <Route path="*" element={element} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  </ThemeProvider>,
);

beforeAll(() => {
  global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  Object.assign(navigator, { clipboard: { writeText: () => Promise.resolve() } });
});

const noConsoleErrors = () => {
  const errors = [];
  const original = console.error;
  console.error = (...args) => { errors.push(args.join(' ')); };
  return () => { console.error = original; return errors.filter((e) => !e.includes('act(') && !e.includes('ReactDOMTestUtils') && !e.includes('width(0) and height(0)')); };
};

describe('public pages render (signed out)', () => {
  beforeEach(() => __setUser(null));
  test.each(Object.entries(PAGES).filter(([name]) => ['HomePage', 'PropertiesPage', 'PropertyDetailPage', 'ReviewsPage', 'BursaryPage', 'OpportunitiesPage', 'LegalPage', 'LoginPage', 'RegisterPage', 'ForgotPasswordPage', 'ResetPasswordPage', 'VerifyEmailPage', 'NotFoundPage'].includes(name)))('%s', async (name, Page) => {
    const collect = noConsoleErrors();
    mount(<Page type="terms" />, name === 'PropertyDetailPage' ? '/properties/1' : '/');
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(20));
    if (name === 'PropertyDetailPage') await screen.findByText('Braam Heights', { selector: 'h1' });
    if (name === 'PropertiesPage') await screen.findByText(/1 property found/);
    if (name === 'HomePage') await screen.findByText('24+');
    if (name === 'BursaryPage') await screen.findByText('NSFAS Bursary');
    if (name === 'OpportunitiesPage') await screen.findByText('Software Intern');
    expect(collect()).toEqual([]);
  });

  test('Header and Footer', () => {
    const collect = noConsoleErrors();
    mount(<><Header /><Footer /></>, '/');
    expect(screen.getAllByText('oneApplyHub').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByLabelText('Open menu'));
    expect(screen.getByText('Sign up free')).toBeInTheDocument();
    expect(collect()).toEqual([]);
  });
});

describe('authenticated pages render', () => {
  const student = { id: 1, name: 'Thandi Nkosi', email: 't@example.com', verified: true, year_of_study: '2nd Year', faculty: 'Science', mfa_enabled: false };
  beforeEach(() => __setUser(student));

  test.each(['DashboardPage', 'StudentApplicationPage', 'MFASetupPage', 'CreateReviewPage', 'ForcedPasswordChangePage'])('%s', async (name) => {
    const collect = noConsoleErrors();
    const Page = PAGES[name];
    mount(<Page />, name === 'CreateReviewPage' ? '/properties/1/review' : '/');
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(20));
    if (name === 'DashboardPage') await screen.findByText('Welcome back, Thandi');
    if (name === 'StudentApplicationPage') await screen.findByText('Choose application type');
    if (name === 'CreateReviewPage') { await screen.findByText('Our review standard'); fireEvent.click(screen.getByText('I understand')); await screen.findByText('Write a review'); }
    expect(collect()).toEqual([]);
  });

  test('AppSidebar', () => {
    const collect = noConsoleErrors();
    mount(<AppSidebar isOpen onClose={() => {}} />, '/dashboard');
    expect(screen.getByText('Thandi Nkosi')).toBeInTheDocument();
    expect(collect()).toEqual([]);
  });

  test('helpful vote updates the count on PropertyDetailPage', async () => {
    mount(<PAGES.PropertyDetailPage />, '/properties/1');
    const button = await screen.findByRole('button', { name: /Helpful · 3/ });
    fireEvent.click(button);
    await screen.findByRole('button', { name: /Marked helpful · 4/ });
  });
});

describe('admin pages render', () => {
  const admin = { id: 99, name: 'Admin One', email: 'info@oneapplyhub.co.za', verified: true, is_admin: true, is_super_admin: true };
  beforeEach(() => __setUser(admin));

  test.each(['AdminDashboard', 'PropertyAdminsPage', 'PropertyRoomsPage'])('%s', async (name) => {
    const collect = noConsoleErrors();
    const Page = PAGES[name];
    mount(<Page />, name === 'PropertyRoomsPage' ? '/admin/properties/1/rooms' : '/admin');
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(20));
    if (name === 'AdminDashboard') await screen.findByText('Your access scope');
    if (name === 'PropertyRoomsPage') await screen.findByText('101');
    if (name === 'PropertyAdminsPage') await screen.findByText('Current property admins');
    expect(collect()).toEqual([]);
  });

  test('delete review asks for confirmation', async () => {
    mount(<PAGES.AdminDashboard />, '/admin');
    await screen.findByText('Your access scope');
    fireEvent.click(screen.getByRole('button', { name: /^Reviews/ }));
    const trash = await screen.findByLabelText('Delete review');
    fireEvent.click(trash);
    expect(await screen.findByText('Delete this review?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByText('Delete this review?')).not.toBeInTheDocument());
  });
});

describe('admin merged features', () => {
  const admin = { id: 99, name: 'Admin One', email: 'info@oneapplyhub.co.za', verified: true, is_admin: true, is_super_admin: true };
  beforeEach(() => __setUser(admin));

  test('opportunities tab lists items and opens the create form', async () => {
    mount(<PAGES.AdminDashboard />, '/admin');
    await screen.findByText('Your access scope');
    fireEvent.click(screen.getByRole('button', { name: /^Opportunities/ }));
    await screen.findByText('Software Intern');
    fireEvent.click(screen.getByRole('button', { name: /Add opportunity/ }));
    expect(await screen.findByText('Add an opportunity')).toBeInTheDocument();
  });

  test('property photos modal opens from the properties tab', async () => {
    mount(<PAGES.AdminDashboard />, '/admin');
    await screen.findByText('Your access scope');
    fireEvent.click(screen.getByRole('button', { name: /^Properties/ }));
    const photosButton = await screen.findByRole('button', { name: /Photos/ });
    fireEvent.click(photosButton);
    expect(await screen.findByText('Photos · Braam Heights')).toBeInTheDocument();
    expect(screen.getByText('No photos yet')).toBeInTheDocument();
  });
});
