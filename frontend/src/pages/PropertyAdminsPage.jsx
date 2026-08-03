import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle,
  KeyRound,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const cardClass = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';

const Badge = ({ children, color = 'slate' }) => {
  const classes = {
    blue: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    purple: 'bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${classes[color]}`}>{children}</span>;
};

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">{label}</label>
    {children}
  </div>
);

const PropertyAdminsPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', propertyIds: [] });

  const isSuperAdmin = user?.is_super_admin;

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [usersRes, propsRes, assignmentsRes] = await Promise.all([
        adminAPI.getUsers({ per_page: 100, role: 'admin' }),
        adminAPI.getProperties({ per_page: 100, status: 'all' }),
        adminAPI.getPropertyAdmins(),
      ]);
      setUsers(usersRes.data.users || []);
      setProperties(usersRes.data.properties || propsRes.data.properties || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to load admin assignments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isSuperAdmin) load(); }, [isSuperAdmin]);

  const assignableUsers = useMemo(() => users.filter((item) => !item.is_super_admin), [users]);
  const adminCount = useMemo(() => new Set(assignments.map((item) => item.admin_user_id)).size, [assignments]);
  const coveredProperties = useMemo(() => new Set(assignments.map((item) => item.property_id)).size, [assignments]);

  const groupedAssignments = useMemo(() => {
    const map = new Map();
    assignments.forEach((item) => {
      if (!map.has(item.admin_user_id)) {
        map.set(item.admin_user_id, {
          admin_user_id: item.admin_user_id,
          admin_name: item.admin_name,
          admin_email: item.admin_email,
          properties: [],
        });
      }
      map.get(item.admin_user_id).properties.push(item);
    });
    return Array.from(map.values());
  }, [assignments]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleProperty = (id) => {
    setForm((prev) => {
      const exists = prev.propertyIds.includes(id);
      return { ...prev, propertyIds: exists ? prev.propertyIds.filter((item) => item !== id) : [...prev.propertyIds, id] };
    });
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await adminAPI.createAdminUser({
        name: form.name,
        email: form.email,
        password: form.password,
        property_ids: form.propertyIds,
      });
      setForm({ name: '', email: '', password: '', propertyIds: [] });
      setMessage({ type: 'success', text: 'Admin created and assigned to selected properties.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create admin.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignExisting = async () => {
    if (!selectedUser || !selectedProperty) {
      setMessage({ type: 'error', text: 'Select both a property and an admin.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await adminAPI.assignPropertyAdmin(Number(selectedProperty), Number(selectedUser));
      setSelectedUser('');
      setSelectedProperty('');
      setMessage({ type: 'success', text: 'Admin assigned successfully.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to assign admin.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    setSaving(true);
    setMessage(null);
    try {
      await adminAPI.removePropertyAdmin(id);
      setMessage({ type: 'success', text: 'Assignment removed.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to remove assignment.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Shield className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <h1 className="text-xl font-bold text-slate-950 dark:text-white">Super admin only</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Only the platform super admin can create and assign property admins.</p>
          <Link to="/admin" className="mt-5 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">Back to admin</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <Link to="/admin" className="mb-4 inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-600 shadow-sm hover:bg-brand-50 dark:bg-slate-900 dark:text-brand-400">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to admin dashboard
        </Link>

        <div className="mb-5 overflow-hidden rounded-3xl bg-brand-800 p-6 text-white shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            <UserCog className="h-3.5 w-3.5" /> Super admin workspace
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Managing admins</h1>
              <p className="mt-2 max-w-2xl text-sm text-brand-50">Create admins for each property and control which applications they can see. Admins only manage students who selected one of their assigned properties.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-2xl font-bold">{adminCount}</p><p className="text-xs text-brand-50">Admins</p></div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-2xl font-bold">{coveredProperties}</p><p className="text-xs text-brand-50">Properties</p></div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-2xl font-bold">{assignments.length}</p><p className="text-xs text-brand-50">Assignments</p></div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 flex items-center gap-2 rounded-2xl border p-4 text-sm font-bold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleCreateAdmin} className={`${cardClass} p-5`}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Create property admin</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Set the login details and assign properties immediately.</p>
              </div>
              <Badge color="purple"><KeyRound className="h-3 w-3" /> Login access</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Admin name">
                <input value={form.name} onChange={(event) => set('name', event.target.value)} className={inputClass} placeholder="e.g. Property Manager" />
              </Field>
              <Field label="Admin email">
                <input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} className={inputClass} placeholder="admin@example.com" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Temporary password">
                  <input type="password" value={form.password} onChange={(event) => set('password', event.target.value)} className={inputClass} placeholder="At least 8 characters, letters and numbers" />
                </Field>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Assign properties</p>
                <p className="text-xs text-slate-400">{form.propertyIds.length} selected</p>
              </div>
              <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {properties.map((property) => {
                  const active = form.propertyIds.includes(property.id);
                  return (
                    <button type="button" key={property.id} onClick={() => toggleProperty(property.id)} className={`rounded-2xl border p-3 text-left transition-all ${active ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-700'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-950 dark:text-white">{property.name}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{property.address}</p>
                        </div>
                        {active && <BadgeCheck className="h-5 w-5 shrink-0 text-brand-600" />}
                      </div>
                    </button>
                  );
                })}
                {!properties.length && <p className="col-span-full rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400 dark:border-slate-800">No properties found.</p>}
              </div>
            </div>

            <button type="submit" disabled={saving} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
              <Plus className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Create admin and assign'}
            </button>
          </form>

          <div className={`${cardClass} p-5`}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Assign existing admin</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use this when the account already exists.</p>
            </div>
            <div className="space-y-4">
              <Field label="Property">
                <select value={selectedProperty} onChange={(event) => setSelectedProperty(event.target.value)} className={inputClass}>
                  <option value="">Select property</option>
                  {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
                </select>
              </Field>
              <Field label="Admin user">
                <select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)} className={inputClass}>
                  <option value="">Select admin</option>
                  {assignableUsers.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.email}</option>)}
                </select>
              </Field>
              <button type="button" onClick={handleAssignExisting} disabled={saving} className="inline-flex w-full items-center justify-center rounded-xl border border-brand-200 bg-brand-50 px-5 py-3 text-sm font-bold text-brand-700 hover:bg-brand-100 disabled:opacity-50 dark:border-brand-900 dark:bg-brand-500/10 dark:text-brand-300">
                <Shield className="mr-2 h-4 w-4" /> Assign existing admin
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">What they can manage</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2"><Building2 className="mt-0.5 h-4 w-4 text-brand-500" /> Assigned property details and reviews.</li>
                <li className="flex gap-2"><Users className="mt-0.5 h-4 w-4 text-brand-500" /> Applications where the student selected their property.</li>
                <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 text-brand-500" /> Applicant status updates and admin notes.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`${cardClass} mt-5 overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Current property admins</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review and remove assignments anytime.</p>
            </div>
            <Badge color="blue">{assignments.length} active assignments</Badge>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-400">Loading assignments...</div>
          ) : groupedAssignments.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {groupedAssignments.map((admin) => (
                <div key={admin.admin_user_id} className="p-5">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><UserCog className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{admin.admin_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{admin.admin_email}</p>
                      </div>
                    </div>
                    <Badge color="slate">{admin.properties.length} propert{admin.properties.length === 1 ? 'y' : 'ies'}</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {admin.properties.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{item.property_name}</p>
                          <p className="text-xs text-slate-400">Assignment #{item.id}</p>
                        </div>
                        <button onClick={() => handleRemove(item.id)} disabled={saving} className="inline-flex shrink-0 items-center rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-500/10">
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <UserCog className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No managing admins assigned yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyAdminsPage;
