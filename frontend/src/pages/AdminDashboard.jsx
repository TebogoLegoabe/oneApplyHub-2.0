import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle, Briefcase, Building2, ClipboardList, Crown, DoorOpen, Eye, ExternalLink, GraduationCap, Image as ImageIcon,
  LayoutDashboard, LogOut, Menu, MessageSquare, Moon, Plus, RefreshCw, Save, Shield, Star, Sun, Trash2, Upload, UserCog, Users, X,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/OneHubLogo.png';
import { Badge, Button, ConfirmDialog, EmptyState, Input, Modal, Select, Spinner, StatusBadge, Textarea, useToast } from '../components/ui';
import { cn } from '../utils/cn';

const Loading = () => (
  <div className="flex justify-center py-16" role="status" aria-label="Loading">
    <Spinner size="lg" />
  </div>
);

const ShellCard = ({ children, className = '' }) => (
  <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900', className)}>{children}</div>
);

const CardTitle = ({ title, description, action }) => (
  <div className="flex flex-col gap-2 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-base font-bold text-slate-950 dark:text-white">{title}</h2>
      {description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    {action}
  </div>
);

const Table = ({ columns, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
        <tr>
          {columns.map((column) => (
            <th key={column.label} scope="col" className={cn('px-5 py-3', column.align === 'right' && 'text-right')}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
    </table>
  </div>
);

const fmt = (value) => (value ? new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const show = (value) => (value === null || value === undefined || value === '' ? '—' : value);

const DetailRow = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-950 dark:text-white">{show(value)}</p>
  </div>
);

const DecisionFields = ({ status, setStatus, notes, setNotes, notesLabel, notesPlaceholder }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
    <Select label="Decision status" value={status} onChange={(event) => setStatus(event.target.value)} className="font-semibold">
      <option value="pending">Pending</option>
      <option value="under_review">Under review</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </Select>
    <Textarea label={notesLabel} rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={notesPlaceholder} />
  </div>
);

/* ------------------------------------------------------------------ Overview */

const Overview = ({ stats, user, onNav, onSeedOpportunities, seeding }) => {
  if (!stats) return <Loading />;
  const cards = [
    { label: 'Users', value: stats.total_users, sub: `${stats.verified_users ?? 0} verified`, icon: Users, tab: 'Users', tone: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300' },
    { label: 'Properties', value: stats.total_properties, sub: `${stats.approved_properties ?? 0} approved`, icon: Building2, tab: 'Properties', tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' },
    { label: 'Pending reviews', value: stats.pending_reviews, sub: 'awaiting moderation', icon: MessageSquare, tab: 'Reviews', tone: 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-300' },
    { label: 'Applications', value: stats.total_applications, sub: `${stats.pending_applications ?? 0} pending`, icon: ClipboardList, tab: 'Applications', tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, tab, tone }) => (
          <button
            key={label}
            type="button"
            onClick={() => onNav(tab)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900"
          >
            <span className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl', tone)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{value ?? 0}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
          </button>
        ))}
      </div>

      {user?.is_super_admin && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Link to="/admin/property-admins" className="block rounded-2xl bg-brand-800 p-6 text-white shadow-card transition-shadow hover:shadow-card-hover">
            <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <UserCog className="h-3.5 w-3.5" aria-hidden="true" /> Super admin action
                </span>
                <h2 className="text-xl font-bold">Create and assign property admins</h2>
                <p className="mt-1 max-w-2xl text-sm text-brand-50">Give each property manager access only to their assigned properties, reviews, and applications.</p>
              </div>
              <span className="inline-flex h-10 shrink-0 items-center rounded-xl bg-white px-4 text-sm font-semibold text-brand-800">Open property admins</span>
            </div>
          </Link>
          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-card dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
            <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden="true" /> Super admin action
                </span>
                <h2 className="text-xl font-bold">Reseed opportunities</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-300">Reload internships and graduate programmes from the default data file. Existing entries are replaced.</p>
              </div>
              <Button variant="inverse" onClick={onSeedOpportunities} loading={seeding} className="shrink-0">
                {!seeding && <RefreshCw className="h-4 w-4" aria-hidden="true" />}Reseed
              </Button>
            </div>
          </div>
        </div>
      )}

      <ShellCard className="p-5 sm:p-6">
        <h3 className="mb-4 text-base font-bold text-slate-950 dark:text-white">Your access scope</h3>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-400">Role</dt>
            <dd className="mt-1"><Badge tone={user?.is_super_admin ? 'gold' : 'brand'}>{user?.is_super_admin ? 'Super admin' : 'Managing admin'}</Badge></dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Managed properties</dt>
            <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{user?.is_super_admin ? 'All properties' : (stats.managed_property_ids?.length || 0)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Applications visible</dt>
            <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{stats.total_applications ?? 0}</dd>
          </div>
        </dl>
      </ShellCard>
    </div>
  );
};

/* ----------------------------------------------------------------- Properties */

const MAX_PROPERTY_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const PropertyImagesModal = ({ property, onClose }) => {
  const toast = useToast();
  const [images, setImages] = useState(property.images || []);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);

  const addImage = (added) => {
    setImages((previous) => (added.is_primary ? [added, ...previous.map((image) => ({ ...image, is_primary: false }))] : [...previous, added]));
    setUrl('');
    setCaption('');
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error('Use a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_PROPERTY_IMAGE_BYTES) {
      toast.error('Images must be under 8 MB.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (caption.trim()) formData.append('caption', caption.trim());
      formData.append('is_primary', String(!images.length));
      const response = await adminAPI.uploadPropertyImage(property.id, formData);
      addImage(response.data.image);
      toast.success('Photo uploaded.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload the photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const response = await adminAPI.addPropertyImage(property.id, { image_url: trimmed, caption: caption.trim() || undefined, is_primary: !images.length });
      addImage(response.data.image);
      toast.success('Photo added.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add the photo.');
    } finally {
      setSaving(false);
    }
  };

  const makePrimary = async (image) => {
    setBusyId(image.id);
    try {
      await adminAPI.updatePropertyImage(property.id, image.id, { is_primary: true });
      setImages((previous) => previous.map((item) => ({ ...item, is_primary: item.id === image.id })));
      toast.success('Cover photo updated.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update the photo.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    setBusyId(pendingRemove.id);
    try {
      await adminAPI.deletePropertyImage(property.id, pendingRemove.id);
      setImages((previous) => previous.filter((item) => item.id !== pendingRemove.id));
      toast.success('Photo removed.');
      setPendingRemove(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove the photo.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <ConfirmDialog
        open={Boolean(pendingRemove)}
        onClose={() => setPendingRemove(null)}
        onConfirm={confirmRemove}
        loading={Boolean(pendingRemove) && busyId === pendingRemove?.id}
        title="Remove this photo?"
        description={pendingRemove?.is_primary ? 'This is the cover photo. Students will see the placeholder until you pick another one.' : 'The photo will be removed from the listing.'}
        confirmLabel="Remove photo"
      />
      <Modal open onClose={onClose} size="lg" title={`Photos · ${property.name}`} description="Upload photos and choose one as the cover shown on listings.">
        <div className="mb-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <Input label="Caption" optional value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="e.g. Exterior, Kitchen, Single room" />
          <div className="flex flex-wrap items-center gap-3">
            <input id="property-image-upload" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { handleUpload(event.target.files?.[0]); event.target.value = ''; }} disabled={uploading} />
            <label
              htmlFor="property-image-upload"
              className={cn('inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700', uploading && 'pointer-events-none opacity-50')}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />{uploading ? 'Uploading…' : 'Upload photo'}
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG, or WebP · max 8 MB</p>
          </div>
          <div className="flex items-center gap-2 pt-1" role="separator">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">or paste a URL</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex gap-2">
            <Input type="url" aria-label="Image URL" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" wrapperClassName="flex-1" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddUrl(); } }} />
            <Button variant="secondary" onClick={handleAddUrl} loading={saving} disabled={!url.trim()}>Add</Button>
          </div>
        </div>

        {!images.length ? (
          <EmptyState compact icon={ImageIcon} title="No photos yet" description="The first photo you add becomes the cover photo." />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {images.map((image) => (
              <li key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                  <img src={image.image_url} alt={image.caption || property.name} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  {image.is_primary && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />Cover
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">{image.caption || 'No caption'}</p>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {!image.is_primary && (
                      <button type="button" onClick={() => makePrimary(image)} disabled={busyId === image.id} title="Make cover photo" aria-label="Make cover photo" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-brand-300">
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button type="button" onClick={() => setPendingRemove(image)} disabled={busyId === image.id} title="Remove photo" aria-label="Remove photo" className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
};

const PropertiesTab = ({ onChanged }) => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesFor, setImagesFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getProperties({ per_page: 100, status: 'all' });
      setItems(response.data.properties || []);
    } catch {
      toast.error('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const toggleApproval = async (property) => {
    try {
      await adminAPI.toggleApproval(property.id, !property.approved);
      toast.success(property.approved ? `${property.name} is now hidden from students.` : `${property.name} is now live.`);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update property.');
    }
  };

  if (loading) return <Loading />;
  return (
    <>
      {imagesFor && <PropertyImagesModal property={imagesFor} onClose={() => { setImagesFor(null); load(); }} />}
      <ShellCard className="overflow-hidden">
        <CardTitle title="Properties" description="Approve listings so students can see and apply to them, and manage their photos." action={<Badge tone="brand">{items.length} total</Badge>} />
        {!items.length ? (
          <EmptyState icon={Building2} title="No properties found" description="Properties you manage will appear here." />
        ) : (
          <Table columns={[{ label: 'Property' }, { label: 'University' }, { label: 'Price' }, { label: 'Status' }, { label: 'Actions', align: 'right' }]}>
            {items.map((property) => (
              <tr key={property.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                      {property.primary_image_url ? (
                        <img src={property.primary_image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600"><ImageIcon className="h-4 w-4" aria-hidden="true" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950 dark:text-white">{property.name}</p>
                      <p className="truncate text-xs text-slate-400">{property.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><Badge>{property.university?.toUpperCase()}</Badge></td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-600 dark:text-slate-300">R{property.price_min?.toLocaleString()} – R{property.price_max?.toLocaleString()}</td>
                <td className="px-5 py-3"><Badge tone={property.approved ? 'success' : 'warning'}>{property.approved ? 'Approved' : 'Pending'}</Badge></td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button onClick={() => setImagesFor(property)} variant="ghost" size="sm">
                      <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />Photos{property.images?.length ? ` (${property.images.length})` : ''}
                    </Button>
                    <Button to={`/admin/properties/${property.id}/rooms`} variant="ghost" size="sm"><DoorOpen className="h-3.5 w-3.5" aria-hidden="true" />Rooms</Button>
                    <Button onClick={() => toggleApproval(property)} variant={property.approved ? 'ghost' : 'soft'} size="sm">{property.approved ? 'Unapprove' : 'Approve'}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </ShellCard>
    </>
  );
};

/* -------------------------------------------------------------------- Reviews */

const ReviewsTab = ({ onChanged }) => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getReviews({ per_page: 100, status: 'all' });
      setItems(response.data.reviews || []);
    } catch {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const approve = async (review, approved) => {
    try {
      await adminAPI.approveReview(review.id, approved);
      toast.success(approved ? 'Review published.' : 'Review unpublished.');
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update review.');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminAPI.deleteReview(pendingDelete.id);
      toast.success('Review deleted.');
      setPendingDelete(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete review.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;
  const pendingCount = items.filter((review) => !review.approved).length;

  return (
    <>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this review?"
        description={`The review for ${pendingDelete?.property_name || 'this property'} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete review"
      />
      <ShellCard className="overflow-hidden">
        <CardTitle title="Reviews" description="Moderate student reviews before they appear publicly." action={pendingCount > 0 ? <Badge tone="warning">{pendingCount} awaiting approval</Badge> : <Badge tone="success">All caught up</Badge>} />
        {!items.length ? (
          <EmptyState icon={MessageSquare} title="No reviews found" description="Student reviews for your properties will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((review) => (
              <li key={review.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950 dark:text-white">{review.property_name}</p>
                      <Badge tone={review.approved ? 'success' : 'warning'} size="sm">{review.approved ? 'Published' : 'Pending'}</Badge>
                      {review.overall_rating != null && <Badge tone="gold" size="sm">{review.overall_rating}/5 ★</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{review.author_email} · {fmt(review.created_at)}</p>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{review.review_text}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button onClick={() => approve(review, !review.approved)} variant={review.approved ? 'ghost' : 'soft'} size="sm">{review.approved ? 'Unpublish' : 'Approve'}</Button>
                    <Button onClick={() => setPendingDelete(review)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-500/10" aria-label="Delete review">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ShellCard>
    </>
  );
};

/* ---------------------------------------------------------------------- Users */

const UsersTab = ({ currentUser, onChanged }) => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRole, setPendingRole] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({ per_page: 100 });
      setItems(response.data.users || []);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  // `pendingRole` holds { user, kind } where kind is 'admin' or 'university'.
  const confirmRoleChange = async () => {
    if (!pendingRole) return;
    const { user: target, kind } = pendingRole;
    setSaving(true);
    try {
      if (kind === 'university') {
        const granting = !target.can_manage_university_applications;
        await adminAPI.updateUser(target.id, { can_manage_university_applications: granting });
        toast.success(granting ? `${target.name} can now manage university applications.` : `${target.name} no longer has university applications access.`);
      } else {
        await adminAPI.updateUser(target.id, { is_admin: !target.is_admin });
        toast.success(target.is_admin ? `${target.name} is no longer an admin.` : `${target.name} is now an admin.`);
      }
      setPendingRole(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const dialogCopy = (() => {
    if (!pendingRole) return {};
    const { user: target, kind } = pendingRole;
    if (kind === 'university') {
      return target.can_manage_university_applications
        ? { tone: 'danger', title: 'Revoke university applications access?', description: `${target.name} will no longer be able to view or decide on university applications.`, confirmLabel: 'Revoke access' }
        : { tone: 'primary', title: 'Grant university applications access?', description: `${target.name} will be able to view and decide on all university applications, independent of any property assignment.`, confirmLabel: 'Grant access' };
    }
    return target.is_admin
      ? { tone: 'danger', title: 'Revoke admin access?', description: `${target.name} will lose access to the admin console and any assigned properties.`, confirmLabel: 'Revoke access' }
      : { tone: 'primary', title: 'Grant admin access?', description: `${target.name} will be able to sign in to the admin console. Assign properties afterwards under Property Admins.`, confirmLabel: 'Make admin' };
  })();

  if (loading) return <Loading />;
  return (
    <>
      <ConfirmDialog
        open={Boolean(pendingRole)}
        onClose={() => setPendingRole(null)}
        onConfirm={confirmRoleChange}
        loading={saving}
        tone={dialogCopy.tone}
        title={dialogCopy.title}
        description={dialogCopy.description}
        confirmLabel={dialogCopy.confirmLabel}
      />
      <ShellCard className="overflow-hidden">
        <CardTitle title="Users" description="Registered students and administrators." action={<Badge tone="brand">{items.length} users</Badge>} />
        {!items.length ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <Table columns={[{ label: 'User' }, { label: 'Verified' }, { label: 'Role' }, { label: 'University applications' }, { label: 'Actions', align: 'right' }]}>
            {items.map((item) => {
              const isSuper = currentUser?.is_super_admin;
              const isSelf = currentUser?.id === item.id;
              const canChangeRole = isSuper && !isSelf && !item.is_super_admin;
              const canChangeUniversity = canChangeRole && item.is_admin;
              return (
                <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-950 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </td>
                  <td className="px-5 py-3"><Badge tone={item.verified ? 'success' : 'warning'}>{item.verified ? 'Verified' : 'Unverified'}</Badge></td>
                  <td className="px-5 py-3">
                    <Badge tone={item.is_super_admin ? 'gold' : item.is_admin ? 'brand' : 'neutral'}>{item.is_super_admin ? 'Super admin' : item.is_admin ? 'Admin' : 'Student'}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    {item.is_admin && !item.is_super_admin ? (
                      <Badge tone={item.can_manage_university_applications ? 'success' : 'neutral'}>{item.can_manage_university_applications ? 'Has access' : 'No access'}</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">{item.is_super_admin ? 'Full access' : '—'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canChangeUniversity && (
                        <Button onClick={() => setPendingRole({ user: item, kind: 'university' })} variant="ghost" size="sm">
                          {item.can_manage_university_applications ? 'Revoke uni. access' : 'Grant uni. access'}
                        </Button>
                      )}
                      {canChangeRole && (
                        <Button onClick={() => setPendingRole({ user: item, kind: 'admin' })} variant={item.is_admin ? 'ghost' : 'soft'} size="sm">{item.is_admin ? 'Revoke admin' : 'Make admin'}</Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </ShellCard>
    </>
  );
};

/* --------------------------------------------------- Accommodation applications */

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
        ['Home language', profile?.home_language],
        ['Residential address', profile?.residential_address],
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
    {
      title: 'Next of kin',
      fields: [
        ['Name', profile?.next_of_kin_name],
        ['Relationship', profile?.next_of_kin_relationship],
        ['Phone', profile?.next_of_kin_phone],
        ['Email', profile?.next_of_kin_email],
      ],
    },
  ], [profile, application, item.applicant_email]);

  const documents = [
    ['Student/applicant ID', profile?.has_student_id_document],
    ['Parent/guardian ID', profile?.has_parent_guardian_id_document],
    ['Proof of registration', application?.has_proof_of_registration],
    ['Bank statement', application?.has_bank_statement],
    ['NSFAS letter', application?.has_nsfas_letter],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={`${item.applicant_name} · ${item.property_name}`}
      description={`Submitted ${fmt(application?.submitted_at)} · Your decision only affects this property`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(item, status, notes)} loading={saving === item.id}>
            <Save className="h-4 w-4" aria-hidden="true" />Save decision
          </Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <StatusBadge status={item.status} />
        <Badge>{application?.reference}</Badge>
      </div>

      {siblingProperties.length > 1 && (
        <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/60 dark:bg-brand-500/10">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Also applied to</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">This student selected {siblingProperties.length} properties. Each one decides independently — shown here for context only.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {siblingProperties.map((sibling) => <Badge key={sibling.id} tone={sibling.id === item.id ? 'brand' : 'neutral'}>{sibling.property_name} · {sibling.status?.replace(/_/g, ' ')}</Badge>)}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="mb-3 text-sm font-bold text-slate-950 dark:text-white">{section.title}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.fields.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}
            </div>
          </section>
        ))}

        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Documents</h3>
          <div className="flex flex-wrap gap-2">
            {documents.map(([name, provided]) => <Badge key={name} tone={provided ? 'success' : 'neutral'}>{name}: {provided ? 'Provided' : 'Not provided'}</Badge>)}
          </div>
        </section>

        <DecisionFields
          status={status}
          setStatus={setStatus}
          notes={notes}
          setNotes={setNotes}
          notesLabel="Admin notes / feedback to applicant"
          notesPlaceholder="Missing documents, approval comments, or a rejection reason…"
        />
      </div>
    </Modal>
  );
};

const ApplicationsTab = ({ onChanged }) => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAccommodationApplications({ per_page: 100, status: 'all' });
      setItems(response.data.applications || []);
    } catch {
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (item, status, notes = item.admin_notes || '') => {
    setSaving(item.id);
    try {
      await adminAPI.updateAccommodationApplicationStatus(item.accommodation_application_id, item.property_id, { status, admin_notes: notes });
      toast.success('Application decision saved.');
      setSelected(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update application.');
    } finally {
      setSaving(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setSaving(pendingDelete.id);
    try {
      await adminAPI.deleteAccommodationApplication(pendingDelete.accommodation_application_id, pendingDelete.property_id);
      toast.success('Application deleted.');
      setPendingDelete(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete application.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading />;
  return (
    <>
      {selected && <AccommodationReviewModal item={selected} onClose={() => setSelected(null)} onSave={updateStatus} saving={saving} />}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={Boolean(pendingDelete) && saving === pendingDelete?.id}
        title="Delete this application?"
        description={`${pendingDelete?.applicant_name}'s application for ${pendingDelete?.property_name} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete application"
      />
      <ShellCard className="overflow-hidden">
        <CardTitle
          title="Accommodation applications"
          description="Each row is one property's decision — reviewing it never affects other properties the student applied to."
          action={<Badge tone="brand">{items.length} visible</Badge>}
        />
        {!items.length ? (
          <EmptyState icon={ClipboardList} title="No applications yet" description="Applications for your assigned properties will appear here." />
        ) : (
          <Table columns={[{ label: 'Applicant' }, { label: 'Property' }, { label: 'Submitted' }, { label: 'Status' }, { label: 'Actions', align: 'right' }]}>
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-3">
                  <p className="font-semibold text-slate-950 dark:text-white">{item.applicant_name}</p>
                  <p className="text-xs text-slate-400">{item.applicant_email}</p>
                  <p className="font-mono text-[11px] text-slate-400">{item.application?.reference}</p>
                </td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{item.property_name}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500 dark:text-slate-400">{fmt(item.application?.submitted_at)}</td>
                <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button onClick={() => setSelected(item)} size="sm"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Review</Button>
                    <Button onClick={() => setPendingDelete(item)} variant="ghost" size="icon" disabled={saving === item.id} className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-500/10" aria-label="Delete application">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </ShellCard>
    </>
  );
};

/* ------------------------------------------------------ University applications */

const UniversityReviewModal = ({ application, choiceId, onClose, onSave, saving }) => {
  const choice = (application.choices || []).find((item) => item.id === choiceId);
  const [status, setStatus] = useState(choice?.status || 'pending');
  const [notes, setNotes] = useState(choice?.admin_notes || '');
  const profile = application.applicant_profile;

  const grade11 = (profile?.academic_results || []).filter((result) => result.grade === 'grade_11');
  const grade12June = (profile?.academic_results || []).filter((result) => result.grade === 'grade_12_june');

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={`${application.applicant_name} · ${choice?.university}`}
      description={`Submitted ${fmt(application.submitted_at)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="gold" onClick={() => onSave(application, choiceId, status, notes)} loading={saving === choiceId}>
            <Save className="h-4 w-4" aria-hidden="true" />Save decision
          </Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <StatusBadge status={choice?.status} />
        <Badge>{application.reference}</Badge>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Applicant details</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="First name" value={profile?.first_name} />
            <DetailRow label="Last name" value={profile?.last_name} />
            <DetailRow label="Email" value={application.applicant_email} />
            <DetailRow label="Phone" value={profile?.phone_number} />
            <DetailRow label="ID number" value={profile?.id_number} />
            <DetailRow label="Programme applied for" value={choice?.programme} />
            <DetailRow label="Home language" value={profile?.home_language} />
            <DetailRow label="Residential address" value={profile?.residential_address} />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Next of kin</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailRow label="Name" value={profile?.next_of_kin_name} />
            <DetailRow label="Relationship" value={profile?.next_of_kin_relationship} />
            <DetailRow label="Phone" value={profile?.next_of_kin_phone} />
            <DetailRow label="Email" value={profile?.next_of_kin_email} />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Grade 11 final results</h3>
          {grade11.length ? (
            <div className="flex flex-wrap gap-2">{grade11.map((result) => <Badge key={result.id}>{result.subject}: {result.mark}%</Badge>)}</div>
          ) : <p className="text-sm text-slate-400">No Grade 11 results captured.</p>}
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Grade 12 June results</h3>
          {grade12June.length ? (
            <div className="flex flex-wrap gap-2">{grade12June.map((result) => <Badge key={result.id}>{result.subject}: {result.mark}%</Badge>)}</div>
          ) : <p className="text-sm text-slate-400">No Grade 12 June results captured.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={profile?.has_grade11_results_document ? 'success' : 'neutral'}>Grade 11 slip: {profile?.has_grade11_results_document ? 'Provided' : 'Not provided'}</Badge>
            <Badge tone={profile?.has_grade12_june_results_document ? 'success' : 'neutral'}>Grade 12 June slip: {profile?.has_grade12_june_results_document ? 'Provided' : 'Not provided'}</Badge>
          </div>
        </section>

        <DecisionFields
          status={status}
          setStatus={setStatus}
          notes={notes}
          setNotes={setNotes}
          notesLabel="Admin notes"
          notesPlaceholder="Manual submission progress, missing information, etc."
        />
      </div>
    </Modal>
  );
};

const UniversityApplicationsTab = ({ onChanged }) => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUniversityApplications({ per_page: 100 });
      setItems(response.data.applications || []);
    } catch {
      toast.error('Failed to load university applications.');
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (application, choiceId, status, notes) => {
    setSaving(choiceId);
    try {
      await adminAPI.updateUniversityChoiceStatus(application.id, choiceId, { status, admin_notes: notes });
      toast.success('Application decision saved.');
      setSelected(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update application.');
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
        <CardTitle
          title="University applications"
          description="Internal tracking queue for manually submitting each applicant to the university's own system."
          action={<Badge tone="gold">{rows.length} choices</Badge>}
        />
        {!rows.length ? (
          <EmptyState icon={GraduationCap} title="No university applications yet" />
        ) : (
          <Table columns={[{ label: 'Applicant' }, { label: 'University' }, { label: 'Submitted' }, { label: 'Status' }, { label: 'Review', align: 'right' }]}>
            {rows.map(({ application, choice }) => (
              <tr key={choice.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-3">
                  <p className="font-semibold text-slate-950 dark:text-white">{application.applicant_name}</p>
                  <p className="text-xs text-slate-400">{application.applicant_email}</p>
                  <p className="font-mono text-[11px] text-slate-400">{application.reference}</p>
                </td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{choice.programme ? `${choice.university} — ${choice.programme}` : choice.university}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500 dark:text-slate-400">{fmt(application.submitted_at)}</td>
                <td className="px-5 py-3"><StatusBadge status={choice.status} /></td>
                <td className="px-5 py-3 text-right">
                  <Button onClick={() => setSelected({ application, choice })} variant="gold" size="sm"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Review</Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </ShellCard>
    </>
  );
};

/* -------------------------------------------------------------- Opportunities */

const EMPTY_OPPORTUNITY = {
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
};

const OpportunitiesTab = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_OPPORTUNITY);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setField = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getOpportunitiesAdmin();
      setItems(response.data.opportunities || []);
    } catch {
      toast.error('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.provider.trim() || !form.application_url.trim()) {
      toast.error('Title, provider, and application URL are required.');
      return;
    }
    setSaving(true);
    try {
      await adminAPI.createOpportunity(form);
      toast.success(`${form.title} published.`);
      setForm(EMPTY_OPPORTUNITY);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create the opportunity.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminAPI.deleteOpportunity(pendingDelete.id);
      toast.success('Opportunity deleted.');
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete the opportunity.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this opportunity?"
        description={`${pendingDelete?.title || 'This listing'} will be removed from the Opportunities Hub. This cannot be undone.`}
        confirmLabel="Delete opportunity"
      />

      {showForm && (
        <ShellCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Add an opportunity</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Published immediately to the Opportunities Hub.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Close form"><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Input label="Title" required value={form.title} onChange={setField('title')} placeholder="e.g. Software Engineering Internship" />
            <Input label="Provider" required value={form.provider} onChange={setField('provider')} placeholder="Company or organisation" />
            <Select label="Type" value={form.opportunity_type} onChange={setField('opportunity_type')}>
              <option value="internship">Internship</option>
              <option value="graduate">Graduate programme</option>
            </Select>
            <Input label="Application URL" required type="url" value={form.application_url} onChange={setField('application_url')} placeholder="https://…" />
            <Input label="Location" optional value={form.location} onChange={setField('location')} placeholder="e.g. Johannesburg / Remote" />
            <Input label="Duration" optional value={form.duration} onChange={setField('duration')} placeholder="e.g. 6 months" />
            <Input label="Field" optional value={form.field} onChange={setField('field')} placeholder="e.g. Engineering" />
            <Input label="Salary range" optional value={form.salary_range} onChange={setField('salary_range')} placeholder="e.g. R8 000 – R12 000 / month" />
            <Input label="Deadline" optional type="datetime-local" value={form.deadline} onChange={setField('deadline')} />
            <Select label="Status" value={form.status} onChange={setField('status')}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </Select>
            <Textarea label="Description" optional rows={3} value={form.description} onChange={setField('description')} wrapperClassName="sm:col-span-2" />
            <Textarea label="Requirements" optional rows={3} value={form.requirements} onChange={setField('requirements')} wrapperClassName="sm:col-span-2" />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={saving}><Save className="h-4 w-4" aria-hidden="true" />Publish opportunity</Button>
            </div>
          </form>
        </ShellCard>
      )}

      <ShellCard className="overflow-hidden">
        <CardTitle
          title="Opportunities"
          description="Internships and graduate programmes shown in the Opportunities Hub."
          action={!showForm && <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add opportunity</Button>}
        />
        {!items.length ? (
          <EmptyState icon={Briefcase} title="No opportunities yet" description="Add one above, or reseed the defaults from the Overview tab." />
        ) : (
          <Table columns={[{ label: 'Opportunity' }, { label: 'Type' }, { label: 'Location' }, { label: 'Deadline' }, { label: 'Status' }, { label: 'Actions', align: 'right' }]}>
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-3">
                  <p className="font-semibold text-slate-950 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.provider}</p>
                </td>
                <td className="px-5 py-3"><Badge tone={item.opportunity_type === 'internship' ? 'brand' : 'gold'}>{item.opportunity_type === 'internship' ? 'Internship' : 'Graduate'}</Badge></td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{show(item.location)}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-500 dark:text-slate-400">{fmt(item.deadline)}</td>
                <td className="px-5 py-3"><Badge tone={item.status === 'open' ? 'success' : 'neutral'} className="capitalize">{item.status || 'open'}</Badge></td>
                <td className="px-5 py-3 text-right">
                  <Button onClick={() => setPendingDelete(item)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-500/10" aria-label={`Delete ${item.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </ShellCard>
    </div>
  );
};

/* ---------------------------------------------------------------------- Shell */

const NAV = [
  { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'Properties', label: 'Properties', icon: Building2 },
  { id: 'Reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'Users', label: 'Users', icon: Users },
  { id: 'Applications', label: 'Applications', icon: ClipboardList },
  { id: 'UniversityApplications', label: 'University applications', icon: GraduationCap, requiresUniAccess: true },
  { id: 'Opportunities', label: 'Opportunities', icon: Briefcase, superOnly: true },
  { id: 'PropertyAdmins', label: 'Property admins', icon: UserCog, superOnly: true, route: '/admin/property-admins' },
];

const SUBTITLES = {
  Overview: 'Platform summary and quick links',
  Properties: 'Manage listings, photos, and approvals',
  Reviews: 'Moderate student reviews before publishing',
  Users: 'Manage registered students and admins',
  Applications: 'Review applications and record decisions per property',
  UniversityApplications: 'Internal tracking queue for manual university submissions',
  Opportunities: 'Create and manage internships and graduate programmes',
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [confirmSeed, setConfirmSeed] = useState(false);

  const loadStats = useCallback(() => {
    adminAPI.getStats().then((response) => setStats(response.data)).catch(() => {});
  }, []);

  // Refresh sidebar counts on mount and whenever a tab reports a change.
  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSeedOpportunities = async () => {
    setSeeding(true);
    try {
      await adminAPI.seedOpportunities();
      toast.success('Opportunities reseeded from the default data file.');
      setConfirmSeed(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reseed opportunities.');
    } finally {
      setSeeding(false);
    }
  };

  const goTo = (tab) => {
    const item = NAV.find((navItem) => navItem.id === tab);
    if (item?.route) {
      navigate(item.route);
      return;
    }
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const pendingCount = stats ? (stats.pending_properties || 0) + (stats.pending_reviews || 0) + (stats.pending_applications || 0) : 0;
  // Super admins see everything; managing admins only see the university queue if explicitly granted.
  const navItems = NAV.filter((item) => (!item.superOnly || user?.is_super_admin) && (!item.requiresUniAccess || user?.is_super_admin || user?.can_manage_university_applications));
  const pendingFor = (id) => {
    if (!stats) return 0;
    if (id === 'Reviews') return stats.pending_reviews || 0;
    if (id === 'Properties') return stats.pending_properties || 0;
    if (id === 'Applications') return stats.pending_applications || 0;
    return 0;
  };
  const activeLabel = NAV.find((item) => item.id === activeTab)?.label || activeTab;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ConfirmDialog
        open={confirmSeed}
        onClose={() => setConfirmSeed(false)}
        onConfirm={handleSeedOpportunities}
        loading={seeding}
        tone="primary"
        title="Reseed opportunities?"
        description="Internships and graduate programmes will be reloaded from the default data file. Any opportunities you added manually may be replaced."
        confirmLabel="Reseed now"
      />
      <div
        className={cn('fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden', sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="" className="h-9 w-9 object-contain" />
            <div>
              <p className="text-sm font-bold text-slate-950 dark:text-white">oneApplyHub</p>
              <p className="text-xs text-slate-400">Admin console</p>
            </div>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const pending = pendingFor(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => goTo(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 truncate text-left">{label}</span>
                {pending > 0 && (
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums', active ? 'bg-white/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300')}>{pending}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
          <Link to="/" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.07]">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />View public site
          </Link>
          <button type="button" onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.07]">
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              {user?.is_super_admin ? <Crown className="h-4 w-4" aria-hidden="true" /> : <Shield className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{user?.name || 'Admin'}</p>
              <p className="truncate text-xs text-slate-400">{user?.is_super_admin ? 'Super admin' : 'Managing admin'}</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10">
            <LogOut className="h-4 w-4" aria-hidden="true" />Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-ml-1 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-950 dark:text-white">{activeLabel}</h1>
            <p className="hidden truncate text-xs text-slate-400 sm:block">{SUBTITLES[activeTab]}</p>
          </div>
          {pendingCount > 0 && (
            <div className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {pendingCount} pending
            </div>
          )}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">
          {activeTab === 'Overview' && <Overview stats={stats} user={user} onNav={goTo} onSeedOpportunities={() => setConfirmSeed(true)} seeding={seeding} />}
          {activeTab === 'Properties' && <PropertiesTab onChanged={loadStats} />}
          {activeTab === 'Reviews' && <ReviewsTab onChanged={loadStats} />}
          {activeTab === 'Users' && <UsersTab currentUser={user} onChanged={loadStats} />}
          {activeTab === 'Applications' && <ApplicationsTab onChanged={loadStats} />}
          {activeTab === 'UniversityApplications' && <UniversityApplicationsTab onChanged={loadStats} />}
          {activeTab === 'Opportunities' && <OpportunitiesTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
