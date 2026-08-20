import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle,
  ClipboardList,
  Crown,
  Eye,
  GraduationCap,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Plus,
  Save,
  Shield,
  Star,
  Sun,
  Trash2,
  UserCog,
  Users,
  X,
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
    blue: 'bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
    purple: 'bg-gold-100 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${colors[color]}`}>{children}</span>;
};

const Loading = () => (
  <div className="flex justify-center py-12">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
  </div>
);

const EmptyState = ({ text }) => <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400 dark:border-gray-800">{text}</div>;
const ShellCard = ({ children, className = '' }) => <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>{children}</div>;

const statusColor = (status) => status === 'approved' ? 'green' : status === 'rejected' ? 'red' : status === 'under_review' ? 'blue' : 'amber';
const fmt = (value) => value ? new Date(value).toLocaleDateString('en-ZA') : 'N/A';
const show = (value) => value || 'N/A';

const DetailRow = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950/60">
    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-1 break-words text-sm font-bold text-gray-950 dark:text-white">{show(value)}</p>
  </div>
);

const Overview = ({ stats, user, onNav, onSeedOpportunities, seedingOpportunities }) => {
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
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color === 'green' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : color === 'purple' ? 'bg-gold-100 text-gold-600 dark:bg-gold-500/10' : color === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10' : 'bg-brand-100 text-brand-600 dark:bg-brand-500/10'}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-gray-950 dark:text-white">{value ?? 0}</p>
            <p className="mt-1 text-sm font-bold text-gray-700 dark:text-gray-300">{label}</p>
            <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
          </button>
        ))}
      </div>

      {user?.is_super_admin && (
        <div className="space-y-4">
          <button onClick={() => { window.location.href = '/admin/property-admins'; }} className="w-full rounded-2xl bg-brand-800 p-6 text-left text-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  <UserCog className="h-3.5 w-3.5" /> Super admin action
                </div>
                <h2 className="text-xl font-bold">Create and assign property admins</h2>
                <p className="mt-1 max-w-2xl text-sm text-brand-50">Give each property manager access only to their assigned properties, reviews, and applications.</p>
              </div>
              <span className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-700">Open Property Admins</span>
            </div>
          </button>
          <button onClick={onSeedOpportunities} disabled={seedingOpportunities} className="w-full rounded-2xl bg-amber-700 p-6 text-left text-white shadow-sm transition-shadow hover:shadow-md disabled:opacity-60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  <Briefcase className="h-3.5 w-3.5" /> Super admin action
                </div>
                <h2 className="text-xl font-bold">Reseed opportunities</h2>
                <p className="mt-1 max-w-2xl text-sm text-amber-50">Reload internships and graduate programs from the default data file.</p>
              </div>
              <span className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-amber-700">{seedingOpportunities ? 'Seeding...' : 'Reseed'}</span>
            </div>
          </button>
        </div>
      )}

      <ShellCard className="p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-950 dark:text-white">Current scope</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><p className="text-xs text-gray-400">Role</p><Badge color={user?.is_super_admin ? 'purple' : 'blue'}>{user?.is_super_admin ? 'Super Admin' : 'Managing Admin'}</Badge></div>
          <div><p className="text-xs text-gray-400">Managed properties</p><p className="font-bold text-gray-900 dark:text-white">{user?.is_super_admin ? 'All' : (stats.managed_property_ids?.length || 0)}</p></div>
          <div><p className="text-xs text-gray-400">Applications visible</p><p className="font-bold text-gray-900 dark:text-white">{stats.total_applications}</p></div>
        </div>
      </ShellCard>
    </div>
  );
};

const MAX_PROPERTY_IMAGE_BYTES = 8 * 1024 * 1024;

const PropertyImagesModal = ({ property, onClose, onToast }) => {
  const [images, setImages] = useState(property.images || []);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const addUploadedImage = (added) => {
    setImages((prev) => (added.is_primary ? [added, ...prev.map((img) => ({ ...img, is_primary: false }))] : [...prev, added]));
    setUrl('');
    setCaption('');
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      onToast('Use JPG, PNG, or WebP.', 'error');
      return;
    }
    if (file.size > MAX_PROPERTY_IMAGE_BYTES) {
      onToast('Image must be under 8 MB.', 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (caption.trim()) formData.append('caption', caption.trim());
      formData.append('is_primary', String(!images.length));
      const res = await adminAPI.uploadPropertyImage(property.id, formData);
      addUploadedImage(res.data.image);
      onToast('Image uploaded');
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const addImage = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await adminAPI.addPropertyImage(property.id, { image_url: trimmed, caption: caption.trim() || undefined, is_primary: !images.length });
      addUploadedImage(res.data.image);
      onToast('Image added');
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to add image', 'error');
    } finally {
      setSaving(false);
    }
  };

  const makePrimary = async (image) => {
    setBusyId(image.id);
    try {
      await adminAPI.updatePropertyImage(property.id, image.id, { is_primary: true });
      setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === image.id })));
      onToast('Primary photo updated');
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update image', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const removeImage = async (image) => {
    setBusyId(image.id);
    try {
      await adminAPI.deletePropertyImage(property.id, image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      onToast('Image removed');
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to remove image', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-950 dark:text-white">Photos: {property.name}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload a photo and mark one as the primary (cover) photo.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="mb-5 space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">Caption (optional)</label>
              <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Exterior, Kitchen, Room" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-950 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
            <input id="property-image-upload" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
            <label htmlFor="property-image-upload" className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50" aria-disabled={uploading}>
              <Plus className="h-4 w-4" />{uploading ? 'Uploading...' : 'Upload photo'}
            </label>
            <p className="text-[11px] text-gray-400">JPG, PNG, or WebP. Maximum size 8 MB.</p>

            <div className="flex items-center gap-2 pt-1">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <span className="text-[11px] font-bold uppercase text-gray-400">Or paste a URL</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="flex gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-950 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              <button onClick={addImage} disabled={saving || !url.trim()} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">{saving ? 'Adding...' : 'Add'}</button>
            </div>
          </div>

          {!images.length ? <EmptyState text="No photos added yet." /> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {images.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                    <img src={image.image_url} alt={image.caption || property.name} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    {image.is_primary && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-1 text-[10px] font-bold text-white"><Star className="h-3 w-3 fill-current" />Primary</span>}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5">
                    <p className="min-w-0 truncate text-xs text-gray-500 dark:text-gray-400">{image.caption || 'No caption'}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      {!image.is_primary && <button onClick={() => makePrimary(image)} disabled={busyId === image.id} title="Make primary" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600 disabled:opacity-50 dark:hover:bg-gray-800"><Star className="h-3.5 w-3.5" /></button>}
                      <button onClick={() => removeImage(image)} disabled={busyId === image.id} title="Remove" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PropertiesTab = ({ onToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesFor, setImagesFor] = useState(null);
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
    <>
      {imagesFor && <PropertyImagesModal property={imagesFor} onToast={onToast} onClose={() => { setImagesFor(null); load(); }} />}
      <ShellCard className="overflow-hidden">
        <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-bold text-gray-950 dark:text-white">Properties</h2></div>
        {!items.length ? <EmptyState text="No properties found." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500 dark:bg-gray-800/60"><tr><th className="px-4 py-3">Property</th><th className="px-4 py-3">University</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          {p.primary_image_url ? <img src={p.primary_image_url} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600"><Image className="h-4 w-4" /></div>}
                        </div>
                        <div><p className="font-bold text-gray-950 dark:text-white">{p.name}</p><p className="text-xs text-gray-400">{p.address}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge>{p.university?.toUpperCase()}</Badge></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">R{p.price_min?.toLocaleString()} to R{p.price_max?.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge color={p.approved ? 'green' : 'amber'}>{p.approved ? 'Approved' : 'Pending'}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setImagesFor(p)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10"><Image className="h-3.5 w-3.5" />Photos{p.images?.length ? ` (${p.images.length})` : ''}</button>
                        <a href={`/admin/properties/${p.id}/rooms`} className="rounded-lg px-3 py-1.5 text-xs font-bold text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-500/10">Manage rooms</a>
                        <button onClick={() => toggleApproval(p)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10">Toggle approval</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ShellCard>
    </>
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
      <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-bold text-gray-950 dark:text-white">Reviews</h2></div>
      {!items.length ? <EmptyState text="No reviews found." /> : <div className="divide-y divide-gray-100 dark:divide-gray-800">{items.map((r) => <div key={r.id} className="p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold text-gray-950 dark:text-white">{r.property_name}</p><p className="text-xs text-gray-400">{r.author_email}</p><p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">{r.review_text}</p></div><div className="flex items-center gap-2"><Badge color={r.approved ? 'green' : 'amber'}>{r.approved ? 'Approved' : 'Pending'}</Badge><button onClick={() => approve(r, !r.approved)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10">{r.approved ? 'Unapprove' : 'Approve'}</button><button onClick={() => remove(r)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div>}
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

  const toggleUniversityAccess = async (u) => {
    try {
      await adminAPI.updateUser(u.id, { can_manage_university_applications: !u.can_manage_university_applications });
      onToast('University applications access updated');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  if (loading) return <Loading />;
  return (
    <ShellCard className="overflow-hidden">
      <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-bold text-gray-950 dark:text-white">Users</h2></div>
      {!items.length ? <EmptyState text="No users found." /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500 dark:bg-gray-800/60"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Verified</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Uni. applications</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3"><p className="font-bold text-gray-950 dark:text-white">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></td>
                  <td className="px-4 py-3"><Badge color={u.verified ? 'green' : 'amber'}>{u.verified ? 'Verified' : 'Unverified'}</Badge></td>
                  <td className="px-4 py-3"><Badge color={u.is_super_admin ? 'purple' : u.is_admin ? 'blue' : 'gray'}>{u.is_super_admin ? 'Super Admin' : u.is_admin ? 'Admin' : 'Student'}</Badge></td>
                  <td className="px-4 py-3"><Badge color={u.can_manage_university_applications ? 'green' : 'gray'}>{u.can_manage_university_applications ? 'Access' : 'No access'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {currentUser?.is_super_admin && currentUser?.id !== u.id && u.is_admin && !u.is_super_admin && (
                        <button onClick={() => toggleUniversityAccess(u)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-500/10">{u.can_manage_university_applications ? 'Revoke uni. access' : 'Grant uni. access'}</button>
                      )}
                      {currentUser?.is_super_admin && currentUser?.id !== u.id && !u.is_super_admin && (
                        <button onClick={() => promote(u)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10">{u.is_admin ? 'Revoke admin' : 'Make admin'}</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ShellCard>
  );
};

const AccommodationReviewModal = ({ item, onClose, onSave, saving }) => {
  const [status, setStatus] = useState(item.status || 'pending');
  const [notes, setNotes] = useState(item.admin_notes || '');
  const profile = item.applicant_profile;
  const application = item.application;
  const siblingProperties = application?.properties || [];

  const sections = useMemo(() => [
    {
      title: 'Applicant details',
      fields: [
        ['First name', profile?.first_name],
        ['Last name', profile?.last_name],
        ['Email', item.applicant_email],
        ['Phone', profile?.phone_number],
        ['ID number', profile?.id_number],
        ['Nationality', profile?.nationality],
      ],
    },
    {
      title: 'Studies and funding',
      fields: [
        ['Student number', profile?.student_number],
        ['Faculty', profile?.faculty],
        ['Year of study', profile?.year_of_study],
        ['Degree programme', profile?.degree_program],
        ['Financial aid', profile?.financial_aid],
        ['NSFAS applicant', profile?.nsfas_applicant ? 'Yes' : 'No'],
      ],
    },
    {
      title: 'Accommodation preferences',
      fields: [
        ['Room type', application?.room_type],
        ['Special requirements', application?.special_requirements],
      ],
    },
    {
      title: 'Parent / guardian',
      fields: [
        ['Name', profile?.parent_guardian_name],
        ['ID number', profile?.parent_guardian_id_number],
        ['Phone', profile?.parent_guardian_phone],
        ['Email', profile?.parent_guardian_email],
      ],
    },
  ], [profile, application, item.applicant_email]);

  const documentBadges = [
    ['Student/applicant ID', profile?.has_student_id_document],
    ['Parent/guardian ID', profile?.has_parent_guardian_id_document],
    ['Proof of registration', application?.has_proof_of_registration],
    ['Bank statement', application?.has_bank_statement],
    ['NSFAS letter', application?.has_nsfas_letter],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge color={statusColor(item.status)}>{item.status?.replace('_', ' ') || 'pending'}</Badge>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-300">{application?.reference}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">Review for {item.property_name}: {item.applicant_name}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Submitted {fmt(application?.submitted_at)} · Your decision only affects this property</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {siblingProperties.length > 1 && (
            <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/60 dark:bg-brand-500/10">
              <p className="text-sm font-bold text-gray-950 dark:text-white">Also applied to</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">This student selected {siblingProperties.length} properties. Each one reviews and decides independently. Shown here for context only.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {siblingProperties.map((p) => <Badge key={p.id} color={p.id === item.id ? 'blue' : 'gray'}>{p.property_name} · {p.status}</Badge>)}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-sm font-bold text-gray-950 dark:text-white">{section.title}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.fields.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}
                </div>
              </div>
            ))}

            <div>
              <h3 className="mb-3 text-sm font-bold text-gray-950 dark:text-white">Documents</h3>
              <div className="flex flex-wrap gap-2">
                {documentBadges.map(([name, provided]) => <Badge key={name} color={provided ? 'green' : 'gray'}>{name}: {provided ? 'Provided' : 'Not provided'}</Badge>)}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">Decision status</label>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-950 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white">
                  <option value="pending">Pending</option>
                  <option value="under_review">Under review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">Admin notes / feedback to applicant</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Add notes about missing documents, approval comments, or rejection reason..." className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-950 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
          <button onClick={() => onSave(item, status, notes)} disabled={saving === item.id} className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" />{saving === item.id ? 'Saving...' : 'Save review decision'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationsTab = ({ onToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAccommodationApplications({ per_page: 100, status: 'all' });
      setItems(res.data.applications || []);
    } catch {
      onToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (item, status, notes = item.admin_notes || '') => {
    setSaving(item.id);
    try {
      await adminAPI.updateAccommodationApplicationStatus(item.accommodation_application_id, item.property_id, { status, admin_notes: notes });
      onToast('Application reviewed and updated');
      setSelected(null);
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update application', 'error');
    } finally {
      setSaving(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.applicant_name}'s application for ${item.property_name}? This cannot be undone.`)) return;
    setSaving(item.id);
    try {
      await adminAPI.deleteAccommodationApplication(item.accommodation_application_id, item.property_id);
      onToast('Application deleted');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to delete application', 'error');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading />;
  return (
    <>
      {selected && <AccommodationReviewModal item={selected} onClose={() => setSelected(null)} onSave={updateStatus} saving={saving} />}
      <ShellCard className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-950 dark:text-white">Accommodation Applications</h2>
            <p className="mt-1 text-xs text-gray-400">Each row is one property's decision. Reviewing it never affects other properties the student applied to.</p>
          </div>
          <Badge color="blue">{items.length} visible</Badge>
        </div>
        {!items.length ? <EmptyState text="No applications found for your assigned properties." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500 dark:bg-gray-800/60">
                <tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Property</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3"><p className="font-bold text-gray-950 dark:text-white">{item.applicant_name}</p><p className="text-xs text-gray-400">{item.applicant_email}</p><p className="text-[11px] font-mono text-gray-400">{item.application?.reference}</p></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.property_name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{fmt(item.application?.submitted_at)}</td>
                    <td className="px-4 py-3"><Badge color={statusColor(item.status)}>{item.status?.replace('_', ' ') || 'pending'}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelected(item)} className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"><Eye className="mr-1.5 h-3.5 w-3.5" />Review</button>
                        <button onClick={() => remove(item)} disabled={saving === item.id} title="Delete application" className="inline-flex items-center rounded-xl px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ShellCard>
    </>
  );
};

const UniversityReviewModal = ({ application, choiceId, onClose, onSave, saving }) => {
  const choice = (application.choices || []).find((c) => c.id === choiceId);
  const [status, setStatus] = useState(choice?.status || 'pending');
  const [notes, setNotes] = useState(choice?.admin_notes || '');
  const profile = application.applicant_profile;

  const grade11 = (profile?.academic_results || []).filter((r) => r.grade === 'grade_11');
  const grade12June = (profile?.academic_results || []).filter((r) => r.grade === 'grade_12_june');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge color={statusColor(choice?.status)}>{choice?.status?.replace('_', ' ') || 'pending'}</Badge>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-300">{application.reference}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">Review for {choice?.university}: {application.applicant_name}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Submitted {fmt(application.submitted_at)}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <div>
              <h3 className="mb-3 text-sm font-bold text-gray-950 dark:text-white">Applicant details</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow label="First name" value={profile?.first_name} />
                <DetailRow label="Last name" value={profile?.last_name} />
                <DetailRow label="Email" value={application.applicant_email} />
                <DetailRow label="Phone" value={profile?.phone_number} />
                <DetailRow label="ID number" value={profile?.id_number} />
                <DetailRow label="Programme applied for" value={choice?.programme} />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-gray-950 dark:text-white">Grade 11 final results</h3>
              {grade11.length ? <div className="flex flex-wrap gap-2">{grade11.map((r) => <Badge key={r.id} color="gray">{r.subject}: {r.mark}%</Badge>)}</div> : <EmptyState text="No Grade 11 results captured." />}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold text-gray-950 dark:text-white">Grade 12 June results</h3>
              {grade12June.length ? <div className="flex flex-wrap gap-2">{grade12June.map((r) => <Badge key={r.id} color="gray">{r.subject}: {r.mark}%</Badge>)}</div> : <EmptyState text="No Grade 12 June results captured." />}
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge color={profile?.has_grade11_results_document ? 'green' : 'gray'}>Grade 11 slip: {profile?.has_grade11_results_document ? 'Provided' : 'Not provided'}</Badge>
                <Badge color={profile?.has_grade12_june_results_document ? 'green' : 'gray'}>Grade 12 June slip: {profile?.has_grade12_june_results_document ? 'Provided' : 'Not provided'}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">Decision status</label>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-950 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white">
                  <option value="pending">Pending</option>
                  <option value="under_review">Under review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">Admin notes</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Notes about manual submission progress, missing info, etc..." className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-950 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
          <button onClick={() => onSave(application, choiceId, status, notes)} disabled={saving === choiceId} className="inline-flex items-center justify-center rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-gold-700 disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" />{saving === choiceId ? 'Saving...' : 'Save review decision'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UniversityApplicationsTab = ({ onToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUniversityApplications({ per_page: 100 });
      setItems(res.data.applications || []);
    } catch {
      onToast('Failed to load university applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (application, choiceId, status, notes) => {
    setSaving(choiceId);
    try {
      await adminAPI.updateUniversityChoiceStatus(application.id, choiceId, { status, admin_notes: notes });
      onToast('Application reviewed and updated');
      setSelected(null);
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to update application', 'error');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading />;
  const rows = items.flatMap((application) => (application.choices || []).map((choice) => ({ application, choice })));
  return (
    <>
      {selected && <UniversityReviewModal application={selected.application} choiceId={selected.choice.id} onClose={() => setSelected(null)} onSave={updateStatus} saving={saving} />}
      <ShellCard className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-950 dark:text-white">University Applications</h2>
            <p className="mt-1 text-xs text-gray-400">Internal tracking queue for manually submitting each applicant to the university's own system.</p>
          </div>
          <Badge color="purple">{rows.length} choices</Badge>
        </div>
        {!rows.length ? <EmptyState text="No university applications submitted yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500 dark:bg-gray-800/60">
                <tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">University</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Review</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map(({ application, choice }) => (
                  <tr key={choice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3"><p className="font-bold text-gray-950 dark:text-white">{application.applicant_name}</p><p className="text-xs text-gray-400">{application.applicant_email}</p><p className="text-[11px] font-mono text-gray-400">{application.reference}</p></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{choice.programme ? `${choice.university} (${choice.programme})` : choice.university}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{fmt(application.submitted_at)}</td>
                    <td className="px-4 py-3"><Badge color={statusColor(choice.status)}>{choice.status?.replace('_', ' ') || 'pending'}</Badge></td>
                    <td className="px-4 py-3 text-right"><button onClick={() => setSelected({ application, choice })} className="inline-flex items-center rounded-xl bg-gold-600 px-4 py-2 text-xs font-bold text-white hover:bg-gold-700"><Eye className="mr-1.5 h-3.5 w-3.5" />Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ShellCard>
    </>
  );
};

const OpportunitiesTab = ({ onToast }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    opportunity_type: 'internship',
    location: '',
    duration: '',
    field: '',
    description: '',
    requirements: '',
    salary_range: '',
    application_url: '',
    deadline: '',
    status: 'open',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOpportunitiesAdmin();
      setOpportunities(res.data.opportunities || []);
    } catch {
      onToast('Failed to load opportunities', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.provider.trim()) {
      onToast('Title and provider are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await adminAPI.createOpportunity(formData);
      onToast('Opportunity created successfully');
      setFormData({
        title: '',
        provider: '',
        opportunity_type: 'internship',
        location: '',
        duration: '',
        field: '',
        description: '',
        requirements: '',
        salary_range: '',
        application_url: '',
        deadline: '',
        status: 'open',
      });
      setShowForm(false);
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to create opportunity', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      await adminAPI.deleteOpportunity(id);
      onToast('Opportunity deleted');
      load();
    } catch (err) {
      onToast(err.response?.data?.error || 'Failed to delete opportunity', 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      {showForm && (
        <ShellCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-950 dark:text-white">Create new opportunity</h2>
            <button onClick={() => setShowForm(false)} className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Title*" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" required />
            <input type="text" placeholder="Provider*" value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" required />
            <select value={formData.opportunity_type} onChange={(e) => setFormData({...formData, opportunity_type: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900">
              <option value="internship">Internship</option>
              <option value="graduate">Graduate Program</option>
            </select>
            <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" />
            <input type="text" placeholder="Duration (e.g., 6 months)" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" />
            <input type="text" placeholder="Field" value={formData.field} onChange={(e) => setFormData({...formData, field: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" />
            <input type="text" placeholder="Salary range" value={formData.salary_range} onChange={(e) => setFormData({...formData, salary_range: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" />
            <input type="url" placeholder="Application URL" value={formData.application_url} onChange={(e) => setFormData({...formData, application_url: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" />
            <input type="datetime-local" placeholder="Deadline" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="sm:col-span-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" rows="3" />
            <textarea placeholder="Requirements" value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} className="sm:col-span-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900" rows="3" />
            <button type="submit" disabled={saving} className="sm:col-span-2 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white hover:bg-brand-700 disabled:opacity-60"><Save className="mr-1.5 inline h-4 w-4" />{saving ? 'Creating...' : 'Create opportunity'}</button>
          </form>
        </ShellCard>
      )}
      <ShellCard className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-950 dark:text-white">Opportunities</h2>
            <p className="mt-1 text-xs text-gray-400">Manage internships and graduate programs</p>
          </div>
          {!showForm && <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"><Plus className="h-3.5 w-3.5" />Add opportunity</button>}
        </div>
        {!opportunities.length ? <EmptyState text="No opportunities yet. Create one to get started." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500 dark:bg-gray-800/60">
                <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Deadline</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3"><p className="font-bold text-gray-950 dark:text-white">{opp.title}</p></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{opp.provider}</td>
                    <td className="px-4 py-3"><Badge color={opp.opportunity_type === 'internship' ? 'blue' : 'purple'}>{opp.opportunity_type}</Badge></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{fmt(opp.deadline)}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(opp.id)} className="inline-flex items-center rounded-xl bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ShellCard>
    </div>
  );
};

const NAV = [
  { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'Properties', label: 'Properties', icon: Building2 },
  { id: 'Reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'Users', label: 'Users', icon: Users },
  { id: 'Applications', label: 'Applications', icon: ClipboardList },
  { id: 'UniversityApplications', label: 'University Applications', icon: GraduationCap, requiresUniAccess: true },
  { id: 'Opportunities', label: 'Opportunities', icon: Briefcase, superOnly: true },
  { id: 'PropertyAdmins', label: 'Property Admins', icon: UserCog, superOnly: true, route: '/admin/property-admins' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seedingOpportunities, setSeedingOpportunities] = useState(false);

  const loadStats = useCallback(() => {
    adminAPI.getStats().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const handleSeedOpportunities = useCallback(async () => {
    setSeedingOpportunities(true);
    try {
      await adminAPI.seedOpportunities();
      setToast({ message: 'Opportunities reseeded successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to reseed opportunities', type: 'error' });
    } finally {
      setSeedingOpportunities(false);
    }
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
  const navItems = NAV.filter((item) => (!item.superOnly || user?.is_super_admin) && (!item.requiresUniAccess || user?.can_manage_university_applications));
  const subtitles = {
    Overview: 'Platform summary and quick links',
    Properties: 'Manage and approve accommodation listings',
    Reviews: 'Moderate student reviews before publishing',
    Users: 'Manage registered students and admins',
    Applications: 'Review full student application details and process decisions',
    UniversityApplications: 'Internal tracking queue for manual university submissions',
    Opportunities: 'Create and manage internships and graduate programs',
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 dark:border-gray-800">
          <img src={logoImg} alt="oneApplyHub logo" className="h-9 w-9 object-contain" />
          <div><p className="text-sm font-bold text-gray-950 dark:text-white">oneApplyHub</p><p className="text-xs text-gray-400">Admin Console</p></div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const pendingBadge = id === 'Reviews' ? stats?.pending_reviews : id === 'Properties' ? stats?.pending_properties : id === 'Applications' ? stats?.pending_applications : 0;
            return <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${active ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-white'}`}><Icon className="h-4 w-4" /><span className="flex-1 text-left">{label}</span>{pendingBadge > 0 && <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-white/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>{pendingBadge}</span>}</button>;
          })}
        </nav>
        <div className="space-y-1 border-t border-gray-100 px-3 py-3 dark:border-gray-800">
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.07]">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{isDark ? 'Light Mode' : 'Dark Mode'}</button>
          <div className="flex items-center gap-3 px-3 py-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/10">{user?.is_super_admin ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-gray-950 dark:text-white">{user?.name || 'Admin'}</p><p className="truncate text-xs text-gray-400">{user?.is_super_admin ? 'Super Admin' : 'Managing Admin'}</p></div></div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden">☰</button>
          <div><h1 className="text-lg font-bold text-gray-950 dark:text-white">{activeTab}</h1><p className="hidden text-xs text-gray-400 sm:block">{subtitles[activeTab]}</p></div>
          {pendingCount > 0 && <div className="ml-auto flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300"><AlertCircle className="h-4 w-4" />{pendingCount} pending</div>}
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">
          {activeTab === 'Overview' && <Overview stats={stats} user={user} onNav={navigate} onSeedOpportunities={handleSeedOpportunities} seedingOpportunities={seedingOpportunities} />}
          {activeTab === 'Properties' && <PropertiesTab onToast={showToast} />}
          {activeTab === 'Reviews' && <ReviewsTab onToast={showToast} />}
          {activeTab === 'Users' && <UsersTab currentUser={user} onToast={showToast} />}
          {activeTab === 'Applications' && <ApplicationsTab onToast={showToast} />}
          {activeTab === 'UniversityApplications' && <UniversityApplicationsTab onToast={showToast} />}
          {activeTab === 'Opportunities' && <OpportunitiesTab onToast={showToast} />}
        </main>
      </div>
      {toast && <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{toast.message}</div>}
    </div>
  );
};

export default AdminDashboard;
