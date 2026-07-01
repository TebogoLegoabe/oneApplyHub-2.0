import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, BadgeCheck, Building2, CheckCircle, ChevronLeft,
  ChevronRight, ClipboardList, Crown, LayoutDashboard, LogOut,
  MessageSquare, Moon, Pencil, Plus, Shield, Star, Sun,
  Trash2, UserCheck, UserCog, Users, X, XCircle,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/OneHubLogo.png';

// ── Shared UI ────────────────────────────────────────────────────────────────

const Badge = ({ children, color = 'gray' }) => {
  const cls = {
    green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    red:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    gray:   'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls[color]}`}>
      {children}
    </span>
  );
};

const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const ConfirmButton = ({ onConfirm, children, className = '' }) => {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => { onConfirm(); setConfirming(false); }}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Confirm
        </button>
        <button onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
          Cancel
        </button>
      </div>
    );
  }
  return <button onClick={() => setConfirming(true)} className={className}>{children}</button>;
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
    </div>
  </div>
);

// ── Property Form ─────────────────────────────────────────────────────────────

const PROPERTY_TYPES = ['apartment', 'house', 'residence', 'studio', 'other'];
const UNIVERSITIES = ['wits', 'uj', 'both'];
const DEFAULT_PROPERTY = {
  name: '', address: '', property_type: 'apartment', university: 'wits',
  price_min: '', price_max: '', description: '', amenities: '',
  contact_info: '', nsfas_accredited: false,
};

const PropertyForm = ({ initial = DEFAULT_PROPERTY, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState({ ...DEFAULT_PROPERTY, ...initial });
  const [errors, setErrors] = useState({});
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name      = 'Required';
    if (!form.address.trim()) e.address   = 'Required';
    if (!form.price_min)      e.price_min = 'Required';
    if (!form.price_max)      e.price_max = 'Required';
    if (Number(form.price_min) > Number(form.price_max)) e.price_max = 'Must be ≥ min';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    const amenities = form.amenities
      ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean)
      : [];
    onSubmit({ ...form, amenities, price_min: Number(form.price_min), price_max: Number(form.price_max) });
  };

  const inputCls = (name) =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${errors[name] ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`;

  const F = ({ label, name, type = 'text', children }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children || <input type={type} value={form[name]} onChange={(e) => set(name, e.target.value)} className={inputCls(name)} />}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Property Name *" name="name" />
        <F label="Address *" name="address" />
        <F label="Type *" name="property_type">
          <select value={form.property_type} onChange={(e) => set('property_type', e.target.value)} className={inputCls('property_type')}>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </F>
        <F label="University *" name="university">
          <select value={form.university} onChange={(e) => set('university', e.target.value)} className={inputCls('university')}>
            {UNIVERSITIES.map((u) => <option key={u} value={u}>{u === 'wits' ? 'Wits University' : u === 'uj' ? 'UJ' : 'Both'}</option>)}
          </select>
        </F>
        <F label="Min Price (R) *" name="price_min" type="number" />
        <F label="Max Price (R) *" name="price_max" type="number" />
      </div>
      <F label="Description" name="description">
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
          className={`${inputCls('description')} resize-none`} />
      </F>
      <F label="Amenities (comma-separated)" name="amenities">
        <input type="text" value={form.amenities} onChange={(e) => set('amenities', e.target.value)}
          placeholder="WiFi, Parking, Laundry, Security..."
          className={inputCls('amenities')} />
      </F>
      <F label="Contact Info" name="contact_info" />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.nsfas_accredited} onChange={(e) => set('nsfas_accredited', e.target.checked)}
          className="w-4 h-4 rounded accent-blue-600" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NSFAS Accredited</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
          {loading ? 'Saving…' : 'Save Property'}
        </button>
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
};

// ── Overview ─────────────────────────────────────────────────────────────────

const Overview = ({ stats, onNav }) => {
  if (!stats) return <Spinner />;

  const cards = [
    { label: 'Total Users',    value: stats.total_users,       sub: `${stats.verified_users} verified`,    icon: Users,         color: 'blue',   nav: 'Users'        },
    { label: 'Total Properties', value: stats.total_properties, sub: `${stats.approved_properties} approved`, icon: Building2,   color: 'green',  nav: 'Properties'   },
    { label: 'Pending Reviews', value: stats.pending_reviews,  sub: 'awaiting moderation',                  icon: MessageSquare, color: 'purple', nav: 'Reviews'      },
    { label: 'Applications',   value: stats.total_applications, sub: `${stats.pending_applications} pending`, icon: ClipboardList, color: 'amber', nav: 'Applications' },
  ];

  const iconCls = {
    blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green:  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber:  'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ label, value, sub, icon: Icon, color, nav }) => (
          <button key={label} onClick={() => onNav(nav)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconCls[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value ?? 'N/A'}</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
          </button>
        ))}
      </div>

      {stats.scope === 'super_admin' && (
        <button onClick={() => { window.location.href = '/admin/property-admins'; }}
          className="w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-left text-white shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                <UserCog className="h-3.5 w-3.5" /> Super admin action
              </div>
              <h3 className="text-xl font-black">Create and assign property admins</h3>
              <p className="mt-1 max-w-2xl text-sm text-blue-50">Give each property manager access only to their assigned properties, reviews, and applications.</p>
            </div>
            <span className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-black text-blue-700">Open Property Admins</span>
          </div>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Review Stats</h3>
          <div className="space-y-3">
            {[['Total reviews', stats.total_reviews], ['Approved', stats.approved_reviews, 'green'], ['Pending moderation', stats.pending_reviews, 'amber']].map(([label, val, color]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                {color ? <Badge color={color}>{val}</Badge> : <span className="font-semibold text-gray-900 dark:text-white">{val}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Property Stats</h3>
          <div className="space-y-3">
            {[['Total properties', stats.total_properties], ['Approved', stats.approved_properties, 'green'], ['Pending approval', stats.pending_properties, 'amber']].map(([label, val, color]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                {color ? <Badge color={color}>{val}</Badge> : <span className="font-semibold text-gray-900 dark:text-white">{val}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Properties Tab ────────────────────────────────────────────────────────────

const PropertiesTab = ({ onToast }) => {
  const [data, setData]   = useState({ properties: [], total: 0, pages: 1 });
  const [page, setPage]   = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getProperties({ page, per_page: 20, status });
      setData(res.data);
    } catch { onToast('Failed to load properties', 'error'); }
    finally { setLoading(false); }
  }, [page, status, onToast]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, cur) => {
    try { await adminAPI.toggleApproval(id, !cur); onToast(`Property ${cur ? 'unapproved' : 'approved'}`, 'success'); load(); }
    catch { onToast('Failed to update property', 'error'); }
  };

  const handleDelete = async (id) => {
    try { await adminAPI.deleteProperty(id); onToast('Property deleted', 'success'); load(); }
    catch { onToast('Failed to delete property', 'error'); }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await adminAPI.createProperty(formData); onToast('Property added', 'success'); }
      else { await adminAPI.updateProperty(modal.property.id, formData); onToast('Property updated', 'success'); }
      setModal(null); load();
    } catch (err) { onToast(err.response?.data?.error || 'Failed to save property', 'error'); }
    finally { setSaving(false); }
  };

  const editInitial = (p) => ({
    name: p.name, address: p.address, property_type: p.property_type,
    university: p.university, price_min: p.price_min, price_max: p.price_max,
    description: p.description || '', contact_info: p.contact_info || '',
    nsfas_accredited: p.nsfas_accredited || false,
    amenities: Array.isArray(p.amenities) ? p.amenities.join(', ') : (typeof p.amenities === 'string' ? p.amenities : ''),
  });

  const filterBtnCls = (s) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`;

  return (
    <div>
      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add New Property' : `Edit: ${modal.property.name}`} onClose={() => setModal(null)}>
          <PropertyForm initial={modal.mode === 'edit' ? editInitial(modal.property) : undefined} onSubmit={handleSave} onClose={() => setModal(null)} loading={saving} />
        </Modal>
      )}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
        {['all', 'approved', 'pending'].map((s) => <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={filterBtnCls(s)}>{s}</button>)}
        <span className="ml-auto text-sm text-gray-400">{data.total} total</span>
        <button onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>
      {loading ? <Spinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">University</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {data.properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white leading-snug">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.address}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge color={p.university === 'wits' ? 'blue' : p.university === 'uj' ? 'green' : 'gray'}>{p.university?.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-400">
                      R{p.price_min?.toLocaleString()}–{p.price_max?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {p.approved ? <Badge color="green"><CheckCircle className="w-3 h-3" />Approved</Badge>
                                  : <Badge color="amber"><AlertCircle className="w-3 h-3" />Pending</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModal({ mode: 'edit', property: p })}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleApprove(p.id, p.approved)}
                          className={`p-1.5 rounded-lg transition-colors ${p.approved ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                          {p.approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <ConfirmButton onConfirm={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.properties.length && <tr><td colSpan={5} className="text-center py-10 text-gray-400">No properties found</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={page} pages={data.pages} onChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};

// ── Reviews Tab ───────────────────────────────────────────────────────────────

const ReviewsTab = ({ onToast }) => {
  const [data, setData]     = useState({ reviews: [], total: 0, pages: 1 });
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminAPI.getReviews({ page, per_page: 20, status }); setData(res.data); }
    catch { onToast('Failed to load reviews', 'error'); }
    finally { setLoading(false); }
  }, [page, status, onToast]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, approve) => {
    try { await adminAPI.approveReview(id, approve); onToast(approve ? 'Review approved' : 'Review rejected', 'success'); load(); }
    catch { onToast('Failed to update review', 'error'); }
  };

  const handleDelete = async (id) => {
    try { await adminAPI.deleteReview(id); onToast('Review deleted', 'success'); load(); }
    catch { onToast('Failed to delete review', 'error'); }
  };

  const filterBtnCls = (s) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
        {['pending', 'approved', 'all'].map((s) => <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={filterBtnCls(s)}>{s}</button>)}
        <span className="ml-auto text-sm text-gray-400">{data.total} total</span>
      </div>
      {loading ? <Spinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Property</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">Author</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">Preview</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {data.reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white max-w-[150px] truncate">{r.property_name}</p>
                      {r.recommend != null && (
                        <span className={`text-xs ${r.recommend ? 'text-green-600' : 'text-red-500'}`}>{r.recommend ? '✓ Recommends' : '✗ Not recommended'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-700 dark:text-gray-300">{r.author}</p>
                      {r.author_email && <p className="text-xs text-gray-400">{r.author_email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">{r.overall_rating}</span>
                        <span className="text-gray-400">/5</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 dark:text-gray-400 max-w-[220px]">
                      <p className="truncate text-xs">{r.review_text}</p>
                    </td>
                    <td className="px-4 py-3">
                      {r.approved ? <Badge color="green"><CheckCircle className="w-3 h-3" />Approved</Badge>
                                  : <Badge color="amber"><AlertCircle className="w-3 h-3" />Pending</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!r.approved && <button onClick={() => handleApprove(r.id, true)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"><CheckCircle className="w-4 h-4" /></button>}
                        {r.approved  && <button onClick={() => handleApprove(r.id, false)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"><XCircle className="w-4 h-4" /></button>}
                        <ConfirmButton onConfirm={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.reviews.length && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No reviews found</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={page} pages={data.pages} onChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};

// NOTE: Rest of the file is unchanged from this point in the existing component.
