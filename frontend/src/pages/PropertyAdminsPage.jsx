import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Shield, Trash2, UserCog } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const selectClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const PropertyAdminsPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isSuperAdmin = user?.is_super_admin;

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [usersRes, propsRes, assignmentsRes] = await Promise.all([
        adminAPI.getUsers({ per_page: 100 }),
        adminAPI.getProperties({ per_page: 100, status: 'all' }),
        adminAPI.getPropertyAdmins(),
      ]);
      setUsers(usersRes.data.users || []);
      setProperties(propsRes.data.properties || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to load admin assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isSuperAdmin) load(); }, [isSuperAdmin]);

  const assignableUsers = useMemo(() => users.filter((item) => !item.is_super_admin), [users]);

  const handleAssign = async () => {
    if (!selectedUser || !selectedProperty) return setMessage('Select both a property and a user.');
    setSaving(true);
    setMessage('');
    try {
      await adminAPI.assignPropertyAdmin(Number(selectedProperty), Number(selectedUser));
      setSelectedUser('');
      setSelectedProperty('');
      setMessage('Managing admin assigned successfully.');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to assign managing admin.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    setSaving(true);
    setMessage('');
    try {
      await adminAPI.removePropertyAdmin(id);
      setMessage('Assignment removed.');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to remove assignment.');
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950"><div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><Shield className="mx-auto mb-3 h-10 w-10 text-slate-400" /><h1 className="text-xl font-black text-slate-950 dark:text-white">Super admin only</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Only the platform super admin can assign managing admins.</p><Link to="/admin" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white">Back to admin</Link></div></div>;
  }

  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 lg:px-6"><Link to="/admin" className="mb-4 inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-600 shadow-sm hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-400"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back to admin dashboard</Link><div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"><UserCog className="h-3.5 w-3.5" />Super admin</div><h1 className="text-2xl font-black text-slate-950 dark:text-white">Managing admins</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Assign property managers to residences. They will only see applicants linked to their assigned properties.</p></div>{message && <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-300">{message}</div>}<div className="mb-4 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1fr_auto]"><select value={selectedProperty} onChange={(event) => setSelectedProperty(event.target.value)} className={selectClass}><option value="">Select property</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select><select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)} className={selectClass}><option value="">Select managing admin</option>{assignableUsers.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.email}</option>)}</select><button onClick={handleAssign} disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Assign'}</button></div><div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="border-b border-slate-100 p-4 dark:border-slate-800"><h2 className="text-sm font-black text-slate-950 dark:text-white">Current assignments</h2></div>{loading ? <div className="p-8 text-center text-sm text-slate-400">Loading assignments...</div> : assignments.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{assignments.map((item) => <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10"><Building2 className="h-5 w-5" /></div><div><p className="text-sm font-black text-slate-950 dark:text-white">{item.property_name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.admin_name} · {item.admin_email}</p></div></div><button onClick={() => handleRemove(item.id)} disabled={saving} className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-500/10"><Trash2 className="mr-1.5 h-3.5 w-3.5" />Remove</button></div>)}</div> : <div className="p-8 text-center text-sm text-slate-400">No managing admins assigned yet.</div>}</div></div></div>;
};

export default PropertyAdminsPage;
