import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, BadgeCheck, Building2, CheckCircle, ChevronLeft,
  ChevronRight, LayoutDashboard, LogOut, MessageSquare, Pencil,
  Plus, Shield, Star, Trash2, UserCheck, Users, X, XCircle,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/OneApply-Hub-Logo.png';

// ---------------------------------------------------------------------------
// Shared UI primitives
// ---------------------------------------------------------------------------
const Badge = ({ children, color = 'gray' }) => {
  const cls = {
    green:  'bg-green-100  text-green-700',
    amber:  'bg-amber-100  text-amber-700',
    blue:   'bg-blue-100   text-blue-700',
    red:    'bg-red-100    text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    gray:   'bg-gray-100   text-gray-600',
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
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-gray-600">Page {page} of {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
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
          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
      </div>
    );
  }
  return <button onClick={() => setConfirming(true)} className={className}>{children}</button>;
};

// ---------------------------------------------------------------------------
// Modal wrapper
// ---------------------------------------------------------------------------
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Property form (used for both Add and Edit)
// ---------------------------------------------------------------------------
const PROPERTY_TYPES = ['apartment', 'house', 'residence', 'studio', 'other'];
const UNIVERSITIES   = ['wits', 'uj', 'both'];
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
    if (!form.name.trim())         e.name         = 'Required';
    if (!form.address.trim())      e.address      = 'Required';
    if (!form.price_min)           e.price_min    = 'Required';
    if (!form.price_max)           e.price_max    = 'Required';
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

  const F = ({ label, name, type = 'text', children }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children || (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => set(name, e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[name] ? 'border-red-400' : 'border-gray-200'}`}
        />
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Property Name *" name="name" />
        <F label="Address *" name="address" />
        <F label="Type *" name="property_type">
          <select value={form.property_type} onChange={(e) => set('property_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 capitalize">
            {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </F>
        <F label="University *" name="university">
          <select value={form.university} onChange={(e) => set('university', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500">
            {UNIVERSITIES.map((u) => <option key={u} value={u}>{u === 'wits' ? 'Wits University' : u === 'uj' ? 'University of Johannesburg' : 'Both'}</option>)}
          </select>
        </F>
        <F label="Min Price (R) *" name="price_min" type="number" />
        <F label="Max Price (R) *" name="price_max" type="number" />
      </div>

      <F label="Description" name="description">
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 resize-none" />
      </F>

      <F label="Amenities (comma-separated)" name="amenities">
        <input type="text" value={form.amenities} onChange={(e) => set('amenities', e.target.value)}
          placeholder="WiFi, Parking, Laundry, Security..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500" />
      </F>

      <F label="Contact Info" name="contact_info" />

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.nsfas_accredited}
          onChange={(e) => set('nsfas_accredited', e.target.checked)}
          className="w-4 h-4 rounded accent-blue-600" />
        <span className="text-sm font-medium text-gray-700">NSFAS Accredited</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
          {loading ? 'Saving…' : 'Save Property'}
        </button>
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
};

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------
const Overview = ({ stats, onNav }) => {
  if (!stats) return <Spinner />;

  const cards = [
    { label: 'Total Users',        value: stats.total_users,        sub: `${stats.verified_users} verified`,       icon: Users,         color: 'blue',   nav: 'Users'      },
    { label: 'Total Properties',   value: stats.total_properties,   sub: `${stats.approved_properties} approved`,  icon: Building2,     color: 'green',  nav: 'Properties' },
    { label: 'Pending Properties', value: stats.pending_properties, sub: 'awaiting approval',                      icon: AlertCircle,   color: 'amber',  nav: 'Properties' },
    { label: 'Pending Reviews',    value: stats.pending_reviews,    sub: 'awaiting moderation',                    icon: MessageSquare, color: 'purple', nav: 'Reviews'    },
  ];

  const iconCls = {
    blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600', purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ label, value, sub, icon: Icon, color, nav }) => (
          <button key={label} onClick={() => onNav(nav)} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconCls[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Review Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total reviews</span>
              <span className="font-semibold">{stats.total_reviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Approved</span>
              <Badge color="green">{stats.approved_reviews}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending moderation</span>
              <Badge color="amber">{stats.pending_reviews}</Badge>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Property Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total properties</span>
              <span className="font-semibold">{stats.total_properties}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Approved</span>
              <Badge color="green">{stats.approved_properties}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending approval</span>
              <Badge color="amber">{stats.pending_properties}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Properties tab
// ---------------------------------------------------------------------------
const PropertiesTab = ({ onToast }) => {
  const [data, setData]   = useState({ properties: [], total: 0, pages: 1 });
  const [page, setPage]   = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', property? }
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
    try {
      await adminAPI.toggleApproval(id, !cur);
      onToast(`Property ${cur ? 'unapproved' : 'approved'}`, 'success');
      load();
    } catch { onToast('Failed to update property', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteProperty(id);
      onToast('Property deleted', 'success');
      load();
    } catch { onToast('Failed to delete property', 'error'); }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await adminAPI.createProperty(formData);
        onToast('Property added', 'success');
      } else {
        await adminAPI.updateProperty(modal.property.id, formData);
        onToast('Property updated', 'success');
      }
      setModal(null);
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to save property', 'error');
    } finally { setSaving(false); }
  };

  const editInitial = (p) => ({
    name: p.name, address: p.address, property_type: p.property_type,
    university: p.university, price_min: p.price_min, price_max: p.price_max,
    description: p.description || '', contact_info: p.contact_info || '',
    nsfas_accredited: p.nsfas_accredited || false,
    amenities: Array.isArray(p.amenities)
      ? p.amenities.join(', ')
      : (typeof p.amenities === 'string' ? p.amenities : ''),
  });

  return (
    <div>
      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Add New Property' : `Edit: ${modal.property.name}`}
          onClose={() => setModal(null)}
        >
          <PropertyForm
            initial={modal.mode === 'edit' ? editInitial(modal.property) : undefined}
            onSubmit={handleSave}
            onClose={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        {['all', 'approved', 'pending'].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400">{data.total} total</span>
        <button onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">University</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 leading-snug">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.address}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge color={p.university === 'wits' ? 'blue' : p.university === 'uj' ? 'green' : 'gray'}>
                        {p.university?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                      R{p.price_min?.toLocaleString()}–{p.price_max?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {p.approved
                        ? <Badge color="green"><CheckCircle className="w-3 h-3" />Approved</Badge>
                        : <Badge color="amber"><AlertCircle className="w-3 h-3" />Pending</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModal({ mode: 'edit', property: p })}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleApprove(p.id, p.approved)}
                          className={`p-1.5 rounded-lg transition-colors ${p.approved ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={p.approved ? 'Unapprove' : 'Approve'}>
                          {p.approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <ConfirmButton onConfirm={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.properties.length && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No properties found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={page} pages={data.pages} onChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Reviews tab
// ---------------------------------------------------------------------------
const ReviewsTab = ({ onToast }) => {
  const [data, setData]     = useState({ reviews: [], total: 0, pages: 1 });
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReviews({ page, per_page: 20, status });
      setData(res.data);
    } catch { onToast('Failed to load reviews', 'error'); }
    finally { setLoading(false); }
  }, [page, status, onToast]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, approve) => {
    try {
      await adminAPI.approveReview(id, approve);
      onToast(approve ? 'Review approved' : 'Review rejected', 'success');
      load();
    } catch { onToast('Failed to update review', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteReview(id);
      onToast('Review deleted', 'success');
      load();
    } catch { onToast('Failed to delete review', 'error'); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        {['pending', 'approved', 'all'].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400">{data.total} total</span>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Property</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Author</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Preview</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 leading-snug max-w-[150px] truncate">{r.property_name}</p>
                      {r.recommend != null && (
                        <span className={`text-xs ${r.recommend ? 'text-green-600' : 'text-red-500'}`}>
                          {r.recommend ? '✓ Recommends' : '✗ Not recommended'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-700">{r.author}</p>
                      {r.author_email && <p className="text-xs text-gray-400">{r.author_email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{r.overall_rating}</span>
                        <span className="text-gray-400">/5</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 max-w-[220px]">
                      <p className="truncate text-xs">{r.review_text}</p>
                    </td>
                    <td className="px-4 py-3">
                      {r.approved
                        ? <Badge color="green"><CheckCircle className="w-3 h-3" />Approved</Badge>
                        : <Badge color="amber"><AlertCircle className="w-3 h-3" />Pending</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!r.approved && (
                          <button onClick={() => handleApprove(r.id, true)}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Approve review">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.approved && (
                          <button onClick={() => handleApprove(r.id, false)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Unapprove review">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <ConfirmButton onConfirm={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete review">
                          <Trash2 className="w-4 h-4" />
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.reviews.length && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No reviews found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={page} pages={data.pages} onChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Users tab
// ---------------------------------------------------------------------------
const UsersTab = ({ onToast }) => {
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
    try {
      await adminAPI.updateUser(id, { verified: !cur });
      onToast(`User ${cur ? 'unverified' : 'verified'}`, 'success');
      load();
    } catch { onToast('Failed to update user', 'error'); }
  };

  const handleToggleAdmin = async (id, cur) => {
    try {
      await adminAPI.updateUser(id, { is_admin: !cur });
      onToast(`Admin status ${cur ? 'removed' : 'granted'}`, 'success');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      onToast('User deleted', 'success');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        {['all', 'verified', 'unverified'].map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400">{data.total} total</span>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">University</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Verified</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge color={u.university === 'wits' ? 'blue' : 'green'}>{u.university?.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.verified
                        ? <Badge color="green"><BadgeCheck className="w-3 h-3" />Yes</Badge>
                        : <Badge color="amber"><AlertCircle className="w-3 h-3" />No</Badge>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {u.is_admin
                        ? <Badge color="blue"><Shield className="w-3 h-3" />Admin</Badge>
                        : <Badge color="gray">Student</Badge>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleVerify(u.id, u.verified)}
                          className={`p-1.5 rounded-lg transition-colors ${u.verified ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={u.verified ? 'Remove verification' : 'Verify user'}>
                          {u.verified ? <XCircle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        {!u.is_admin && (
                          <>
                            <button onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Grant admin">
                              <Shield className="w-4 h-4" />
                            </button>
                            <ConfirmButton onConfirm={() => handleDelete(u.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete user">
                              <Trash2 className="w-4 h-4" />
                            </ConfirmButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.users.length && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4"><Pagination page={page} pages={data.pages} onChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Nav items definition
// ---------------------------------------------------------------------------
const NAV = [
  { id: 'Overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'Properties',  label: 'Properties',  icon: Building2       },
  { id: 'Reviews',     label: 'Reviews',     icon: MessageSquare   },
  { id: 'Users',       label: 'Users',       icon: Users           },
];

// ---------------------------------------------------------------------------
// Main AdminDashboard
// ---------------------------------------------------------------------------
const AdminDashboard = () => {
  const { user, logout } = useAuth();
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
    // Refresh stats after any action so counts stay current
    loadStats();
  }, [loadStats]);

  const navigate = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const pendingCount = stats
    ? (stats.pending_properties || 0) + (stats.pending_reviews || 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <img src={logoImg} alt="oneApplyHub logo" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">oneApplyHub</p>
            <p className="text-xs text-gray-400">Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {id === 'Reviews' && (stats?.pending_reviews > 0) && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                    {stats.pending_reviews}
                  </span>
                )}
                {id === 'Properties' && (stats?.pending_properties > 0) && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                    {stats.pending_properties}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h1 className="text-lg font-bold text-gray-900">{activeTab}</h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {activeTab === 'Overview'   && 'Platform summary and quick links'}
              {activeTab === 'Properties' && 'Manage and approve accommodation listings'}
              {activeTab === 'Reviews'    && 'Moderate student reviews before publishing'}
              {activeTab === 'Users'      && 'Manage registered students and admins'}
            </p>
          </div>

          {pendingCount > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">{pendingCount} pending</span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          {activeTab === 'Overview'   && <Overview stats={stats} onNav={navigate} />}
          {activeTab === 'Properties' && <PropertiesTab onToast={showToast} />}
          {activeTab === 'Reviews'    && <ReviewsTab onToast={showToast} />}
          {activeTab === 'Users'      && <UsersTab onToast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
