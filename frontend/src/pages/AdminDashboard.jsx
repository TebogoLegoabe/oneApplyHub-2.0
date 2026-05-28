import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, BadgeCheck, Building2, CheckCircle, ChevronLeft,
  ChevronRight, ClipboardList, Crown, LayoutDashboard, LogOut,
  MessageSquare, Moon, Pencil, Plus, Shield, Star, Sun,
  Trash2, UserCheck, Users, X, XCircle,
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

// ── Users Tab ─────────────────────────────────────────────────────────────────

const UsersTab = ({ onToast, currentUser }) => {
  const isSuperAdmin = currentUser?.is_super_admin;
  const [data, setData]     = useState({ users: [], total: 0, pages: 1 });
  const [page, setPage]     = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (filter === 'verified')   params.verified = 'true';
      if (filter === 'unverified') params.verified = 'false';
      const res = await adminAPI.getUsers(params);
      setData(res.data);
    } catch { onToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [page, filter, onToast]);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (id, cur) => {
    try { await adminAPI.updateUser(id, { verified: !cur }); onToast(`User ${cur ? 'unverified' : 'verified'}`, 'success'); load(); }
    catch { onToast('Failed to update user', 'error'); }
  };

  const handleToggleAdmin = async (id, cur) => {
    try { await adminAPI.updateUser(id, { is_admin: !cur }); onToast(`Admin status ${cur ? 'removed' : 'granted'}`, 'success'); load(); }
    catch (err) { onToast(err.response?.data?.error || 'Failed to update user', 'error'); }
  };

  const handleToggleSuperAdmin = async (id, cur) => {
    try { await adminAPI.updateUser(id, { is_super_admin: !cur }); onToast(`Super admin ${cur ? 'removed' : 'granted'}`, 'success'); load(); }
    catch (err) { onToast(err.response?.data?.error || 'Failed to update user', 'error'); }
  };

  const handleDelete = async (id) => {
    try { await adminAPI.deleteUser(id); onToast('User deleted', 'success'); load(); }
    catch (err) { onToast(err.response?.data?.error || 'Failed to delete user', 'error'); }
  };

  const filterBtnCls = (f) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
        {['all', 'verified', 'unverified'].map((f) => <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={filterBtnCls(f)}>{f}</button>)}
        <span className="ml-auto text-sm text-gray-400">{data.total} total</span>
      </div>
      {loading ? <Spinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">University</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Verified</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {data.users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const canDelete = !isSelf && (isSuperAdmin || (!u.is_admin && !u.is_super_admin));
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge color={u.university === 'wits' ? 'blue' : 'green'}>{u.university?.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {u.verified ? <Badge color="green"><BadgeCheck className="w-3 h-3" />Yes</Badge>
                                    : <Badge color="amber"><AlertCircle className="w-3 h-3" />No</Badge>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {u.is_super_admin ? <Badge color="purple"><Crown className="w-3 h-3" />Super Admin</Badge>
                          : u.is_admin    ? <Badge color="blue"><Shield className="w-3 h-3" />Admin</Badge>
                                          : <Badge color="gray">Student</Badge>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 dark:text-gray-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Verify/unverify — any admin can do this */}
                          {!isSelf && (
                            <button onClick={() => handleVerify(u.id, u.verified)}
                              className={`p-1.5 rounded-lg transition-colors ${u.verified ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                              title={u.verified ? 'Remove verification' : 'Verify user'}>
                              {u.verified ? <XCircle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          )}
                          {/* Grant/revoke admin — super admin only */}
                          {isSuperAdmin && !isSelf && !u.is_super_admin && (
                            <button onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title={u.is_admin ? 'Revoke admin' : 'Grant admin'}>
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          {/* Grant/revoke super admin — super admin only */}
                          {isSuperAdmin && !isSelf && (
                            <button onClick={() => handleToggleSuperAdmin(u.id, u.is_super_admin)}
                              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title={u.is_super_admin ? 'Revoke super admin' : 'Grant super admin'}>
                              <Crown className="w-4 h-4" />
                            </button>
                          )}
                          {/* Delete — super admin can delete anyone, admin can only delete students */}
                          {canDelete && (
                            <ConfirmButton onConfirm={() => handleDelete(u.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </ConfirmButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!data.users.length && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No users found</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={page} pages={data.pages} onChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};

// ── Applications Tab ──────────────────────────────────────────────────────────

const APP_STATUS = {
  pending:      { label: 'Pending',      color: 'amber'  },
  under_review: { label: 'Under Review', color: 'blue'   },
  approved:     { label: 'Approved',     color: 'green'  },
  rejected:     { label: 'Rejected',     color: 'red'    },
};

const ApplicationsTab = ({ onToast }) => {
  const [data, setData]     = useState({ applications: [], total: 0, pages: 1 });
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes]   = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminAPI.getApplications({ page, per_page: 20, status }); setData(res.data); }
    catch { onToast('Failed to load applications', 'error'); }
    finally { setLoading(false); }
  }, [page, status, onToast]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (app) => { setSelected(app); setNotes(app.admin_notes || ''); setNewStatus(app.status); };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try { await adminAPI.updateApplicationStatus(selected.id, { status: newStatus, admin_notes: notes }); onToast('Application updated', 'success'); setSelected(null); load(); }
    catch (err) { onToast(err.response?.data?.error || 'Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  const filterBtnCls = (s) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`;

  return (
    <div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{selected.first_name} {selected.last_name}</h2>
                <p className="text-xs text-gray-400 font-mono">{selected.reference}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Applicant', selected.applicant_name], ['Email', selected.applicant_email], ['University', selected.university?.toUpperCase()], ['Student No.', selected.student_number],
                  ['Submitted', selected.submitted_at ? new Date(selected.submitted_at).toLocaleDateString('en-ZA') : '—'],
                  ['Last Updated', selected.updated_at ? new Date(selected.updated_at).toLocaleDateString('en-ZA') : '—']].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">{value || '—'}</p>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Update Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Admin Notes (visible to applicant)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Optional message to the student..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">{saving ? 'Saving…' : 'Save Changes'}</button>
              <button onClick={() => setSelected(null)} className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
        {['all', 'pending', 'under_review', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={filterBtnCls(s)}>{s.replace('_', ' ')}</button>
        ))}
        <span className="ml-auto text-sm text-gray-400">{data.total} total</span>
      </div>
      {loading ? <Spinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Applicant</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">Reference</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">University</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">Submitted</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {data.applications.map((app) => {
                  const m = APP_STATUS[app.status] || APP_STATUS.pending;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{app.first_name} {app.last_name}</p>
                        <p className="text-xs text-gray-400">{app.applicant_email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-gray-500 dark:text-gray-400">{app.reference}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge color={app.university === 'wits' ? 'blue' : app.university === 'uj' ? 'green' : 'gray'}>{app.university?.toUpperCase() || '—'}</Badge>
                      </td>
                      <td className="px-4 py-3"><Badge color={m.color}>{m.label}</Badge></td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400 text-xs">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-ZA') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button onClick={() => openDetail(app)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Review</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!data.applications.length && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No applications found</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={page} pages={data.pages} onChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'Overview',     label: 'Overview',     icon: LayoutDashboard },
  { id: 'Properties',   label: 'Properties',   icon: Building2       },
  { id: 'Reviews',      label: 'Reviews',      icon: MessageSquare   },
  { id: 'Users',        label: 'Users',        icon: Users           },
  { id: 'Applications', label: 'Applications', icon: ClipboardList   },
];

// ── Main Component ────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats]         = useState(null);
  const [toast, setToast]         = useState(null);
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

  const navigate = (tab) => { setActiveTab(tab); setSidebarOpen(false); };

  const pendingCount = stats
    ? (stats.pending_properties || 0) + (stats.pending_reviews || 0) + (stats.pending_applications || 0)
    : 0;

  const tabSubtitles = {
    Overview:     'Platform summary and quick links',
    Properties:   'Manage and approve accommodation listings',
    Reviews:      'Moderate student reviews before publishing',
    Users:        'Manage registered students and admins',
    Applications: 'Review and process student accommodation applications',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700/60 z-50 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-700/60">
          <img src={logoImg} alt="oneApplyHub logo" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">oneApplyHub</p>
            <p className="text-xs text-gray-400">Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const pendingBadge =
              id === 'Reviews'      ? stats?.pending_reviews      :
              id === 'Properties'   ? stats?.pending_properties   :
              id === 'Applications' ? stats?.pending_applications : 0;
            return (
              <button key={id} onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-blue-600 text-white shadow-sm'
                         : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.07] hover:text-gray-900 dark:hover:text-white'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {pendingBadge > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                    {pendingBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme + admin info + logout */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700/60 space-y-1">
          <button onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.is_super_admin ? <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.is_super_admin ? 'Super Admin' : 'Admin'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{activeTab}</h1>
            <p className="text-xs text-gray-400 hidden sm:block">{tabSubtitles[activeTab]}</p>
          </div>
          {pendingCount > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{pendingCount} pending</span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          {activeTab === 'Overview'     && <Overview stats={stats} onNav={navigate} />}
          {activeTab === 'Properties'   && <PropertiesTab onToast={showToast} />}
          {activeTab === 'Reviews'      && <ReviewsTab onToast={showToast} />}
          {activeTab === 'Users'        && <UsersTab onToast={showToast} currentUser={user} />}
          {activeTab === 'Applications' && <ApplicationsTab onToast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
