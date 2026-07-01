import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  ClipboardList,
  Crown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Shield,
  Sun,
  Trash2,
  UserCog,
  Users,
  XCircle,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/OneHubLogo.png';

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${colors[color]}`}>{children}</span>;
};

const Loading = () => (
  <div className="flex justify-center py-12">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
  </div>
);

const EmptyState = ({ text }) => <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400 dark:border-gray-800">{text}</div>;

const ShellCard = ({ children, className = '' }) => <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>{children}</div>;

const Overview = ({ stats, user, onNav }) => {
  if (!stats) return <Loading />;
  const cards = [
    { label: 'Users', value: stats.total_users, sub: `${stats.verified_users} verified`, icon: Users, tab: 'Users', color: 'blue' },
    { label: 'Properties', value: stats.total_properties, sub: `${stats.approved_properties} approved`, icon: Building2, tab: 'Properties', color: 'green' },
    { label: 'Reviews', value: stats.pending_reviews, sub: 'pending moderation', icon: MessageSquare, tab: 'Reviews', color: 'purple' },
    { label: 'Applications', value: stats.total_applications, sub: `${stats.pending_applications} pending`, icon: ClipboardList, tab: 'Applications', color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, tab, color }) => (
          <button key={label} onClick={() => onNav(tab)} className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color === 'green' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10' : color === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10'}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black text-gray-950 dark:text-white">{value ?? 0}</p>
            <p className="mt-1 text-sm font-bold text-gray-700 dark:text-gray-300">{label}</p>
            <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
          </button>
        ))}
      </div>

      {user?.is_super_admin && (
        <button onClick={() => { window.location.href = '/admin/property-admins'; }} className="w-full rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-left text-white shadow-sm transition hover:shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                <UserCog className="h-3.5 w-3.5" /> Super admin action
              </div>
              <h2 className="text-xl font-black">Create and assign property admins</h2>
              <p className="mt-1 max-w-2xl text-sm text-blue-50">Give each property manager access only to their assigned properties, reviews, and applications.</p>
            </div>
            <span className="rounded-xl bg-white px-4 py-2 text-sm font-black text-blue-700">Open Property Admins</span>
          </div>
        </button>
      )}

      <ShellCard className="p-6">
        <h3 className="mb-4 text-lg font-black text-gray-950 dark:text-white">Current scope</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><p className="text-xs text-gray-400">Role</p><Badge color={user?.is_super_admin ? 'purple' : 'blue'}>{user?.is_super_admin ? 'Super Admin' : 'Managing Admin'}</Badge></div>
          <div><p className="text-xs text-gray-400">Managed properties</p><p className="font-bold text-gray-900 dark:text-white">{user?.is_super_admin ? 'All' : (stats.managed_property_ids?.length || 0)}</p></div>
          <div><p className="text-xs text-gray-400">Applications visible</p><p className="font-bold text-gray-900 dark:text-white">{stats.total_applications}</p></div>
        </div>
      </ShellCard>
    </div>
  );
};

const PropertiesTab = ({ onToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getProperties({ per_page: 100, status: 'all' });
      setItems(res.data.properties || []);
    } catch {
      onToast('Failed to load properties', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);
  useEffect(() => { load(); }, [load]);

  const toggleApproval = async (property) => {
    try {
      await adminAPI.toggleApproval(property.id, !property.approved);
      onToast('Property updated');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update property', 'error');
    }
  };

  if (loading) return <Loading />;
  return (
    <ShellCard className="overflow-hidden">
      <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-black text-gray-950 dark:text-white">Properties</h2></div>
      {!items.length ? <EmptyState text="No properties found." /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500 dark:bg-gray-800/60"><tr><th className="px-4 py-3">Property</th><th className="px-4 py-3">University</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((p) => <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40"><td className="px-4 py-3"><p className="font-bold text-gray-950 dark:text-white">{p.name}</p><p className="text-xs text-gray-400">{p.address}</p></td><td className="px-4 py-3"><Badge>{p.university?.toUpperCase()}</Badge></td><td className="px-4 py-3 text-gray-600 dark:text-gray-300">R{p.price_min?.toLocaleString()} - R{p.price_max?.toLocaleString()}</td><td className="px-4 py-3"><Badge color={p.approved ? 'green' : 'amber'}>{p.approved ? 'Approved' : 'Pending'}</Badge></td><td className="px-4 py-3 text-right"><button onClick={() => toggleApproval(p)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">Toggle approval</button></td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </ShellCard>
  );
};

const ReviewsTab = ({ onToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReviews({ per_page: 100, status: 'all' });
      setItems(res.data.reviews || []);
    } catch {
      onToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);
  useEffect(() => { load(); }, [load]);

  const approve = async (review, approved) => {
    try {
      await adminAPI.approveReview(review.id, approved);
      onToast('Review updated');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update review', 'error');
    }
  };

  const remove = async (review) => {
    try {
      await adminAPI.deleteReview(review.id);
      onToast('Review deleted');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to delete review', 'error');
    }
  };

  if (loading) return <Loading />;
  return (
    <ShellCard className="overflow-hidden">
      <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-black text-gray-950 dark:text-white">Reviews</h2></div>
      {!items.length ? <EmptyState text="No reviews found." /> : <div className="divide-y divide-gray-100 dark:divide-gray-800">{items.map((r) => <div key={r.id} className="p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold text-gray-950 dark:text-white">{r.property_name}</p><p className="text-xs text-gray-400">{r.author_email}</p><p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">{r.review_text}</p></div><div className="flex items-center gap-2"><Badge color={r.approved ? 'green' : 'amber'}>{r.approved ? 'Approved' : 'Pending'}</Badge><button onClick={() => approve(r, !r.approved)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">{r.approved ? 'Unapprove' : 'Approve'}</button><button onClick={() => remove(r)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div>}
    </ShellCard>
  );
};

const UsersTab = ({ currentUser, onToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ per_page: 100 });
      setItems(res.data.users || []);
    } catch {
      onToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);
  useEffect(() => { load(); }, [load]);

  const promote = async (u) => {
    try {
      await adminAPI.updateUser(u.id, { is_admin: !u.is_admin });
      onToast('User role updated');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  if (loading) return <Loading />;
  return (
    <ShellCard className="overflow-hidden">
      <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-black text-gray-950 dark:text-white">Users</h2></div>
      {!items.length ? <EmptyState text="No users found." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500 dark:bg-gray-800/60"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Verified</th><th className="px-4 py-3">Role</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{items.map((u) => <tr key={u.id}><td className="px-4 py-3"><p className="font-bold text-gray-950 dark:text-white">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></td><td className="px-4 py-3"><Badge color={u.verified ? 'green' : 'amber'}>{u.verified ? 'Verified' : 'Unverified'}</Badge></td><td className="px-4 py-3"><Badge color={u.is_super_admin ? 'purple' : u.is_admin ? 'blue' : 'gray'}>{u.is_super_admin ? 'Super Admin' : u.is_admin ? 'Admin' : 'Student'}</Badge></td><td className="px-4 py-3 text-right">{currentUser?.is_super_admin && currentUser?.id !== u.id && !u.is_super_admin && <button onClick={() => promote(u)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">{u.is_admin ? 'Revoke admin' : 'Make admin'}</button>}</td></tr>)}</tbody></table></div>}
    </ShellCard>
  );
};

const ApplicationsTab = ({ onToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getApplications({ per_page: 100, status: 'all' });
      setItems(res.data.applications || []);
    } catch {
      onToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (app, status) => {
    setSaving(app.id);
    try {
      await adminAPI.updateApplicationStatus(app.id, { status, admin_notes: app.admin_notes || '' });
      onToast('Application updated');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update application', 'error');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading />;
  return (
    <ShellCard className="overflow-hidden">
      <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-black text-gray-950 dark:text-white">Applications</h2></div>
      {!items.length ? <EmptyState text="No applications found." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500 dark:bg-gray-800/60"><tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Selected properties</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{items.map((app) => <tr key={app.id}><td className="px-4 py-3"><p className="font-bold text-gray-950 dark:text-white">{app.first_name} {app.last_name}</p><p className="text-xs text-gray-400">{app.applicant_email}</p></td><td className="px-4 py-3"><p className="max-w-xs truncate text-gray-600 dark:text-gray-300">{app.selected_properties?.map((p) => p.name).join(', ') || '—'}</p></td><td className="px-4 py-3"><Badge color={app.status === 'approved' ? 'green' : app.status === 'rejected' ? 'red' : app.status === 'under_review' ? 'blue' : 'amber'}>{app.status?.replace('_', ' ')}</Badge></td><td className="px-4 py-3 text-right"><select disabled={saving === app.id} value={app.status} onChange={(e) => updateStatus(app, e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="pending">Pending</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></td></tr>)}</tbody></table></div>}
    </ShellCard>
  );
};

const NAV = [
  { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'Properties', label: 'Properties', icon: Building2 },
  { id: 'Reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'Users', label: 'Users', icon: Users },
  { id: 'Applications', label: 'Applications', icon: ClipboardList },
  { id: 'PropertyAdmins', label: 'Property Admins', icon: UserCog, superOnly: true, route: '/admin/property-admins' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadStats = useCallback(() => {
    adminAPI.getStats().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
    loadStats();
  }, [loadStats]);

  const navigate = (tab) => {
    const item = NAV.find((nav) => nav.id === tab);
    if (item?.route) {
      window.location.href = item.route;
      return;
    }
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const pendingCount = stats ? (stats.pending_properties || 0) + (stats.pending_reviews || 0) + (stats.pending_applications || 0) : 0;
  const navItems = NAV.filter((item) => !item.superOnly || user?.is_super_admin);
  const subtitles = {
    Overview: 'Platform summary and quick links',
    Properties: 'Manage and approve accommodation listings',
    Reviews: 'Moderate student reviews before publishing',
    Users: 'Manage registered students and admins',
    Applications: 'Review and process student accommodation applications',
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 dark:border-gray-800">
          <img src={logoImg} alt="oneApplyHub logo" className="h-9 w-9 object-contain" />
          <div><p className="text-sm font-black text-gray-950 dark:text-white">oneApplyHub</p><p className="text-xs text-gray-400">Admin Console</p></div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const pendingBadge = id === 'Reviews' ? stats?.pending_reviews : id === 'Properties' ? stats?.pending_properties : id === 'Applications' ? stats?.pending_applications : 0;
            return <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-white'}`}><Icon className="h-4 w-4" /><span className="flex-1 text-left">{label}</span>{pendingBadge > 0 && <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-white/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>{pendingBadge}</span>}</button>;
          })}
        </nav>
        <div className="space-y-1 border-t border-gray-100 px-3 py-3 dark:border-gray-800">
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.07]">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{isDark ? 'Light Mode' : 'Dark Mode'}</button>
          <div className="flex items-center gap-3 px-3 py-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10">{user?.is_super_admin ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-gray-950 dark:text-white">{user?.name || 'Admin'}</p><p className="truncate text-xs text-gray-400">{user?.is_super_admin ? 'Super Admin' : 'Managing Admin'}</p></div></div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden">☰</button>
          <div><h1 className="text-lg font-black text-gray-950 dark:text-white">{activeTab}</h1><p className="hidden text-xs text-gray-400 sm:block">{subtitles[activeTab]}</p></div>
          {pendingCount > 0 && <div className="ml-auto flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300"><AlertCircle className="h-4 w-4" />{pendingCount} pending</div>}
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">
          {activeTab === 'Overview' && <Overview stats={stats} user={user} onNav={navigate} />}
          {activeTab === 'Properties' && <PropertiesTab onToast={showToast} />}
          {activeTab === 'Reviews' && <ReviewsTab onToast={showToast} />}
          {activeTab === 'Users' && <UsersTab currentUser={user} onToast={showToast} />}
          {activeTab === 'Applications' && <ApplicationsTab onToast={showToast} />}
        </main>
      </div>
      {toast && <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{toast.message}</div>}
    </div>
  );
};

export default AdminDashboard;
