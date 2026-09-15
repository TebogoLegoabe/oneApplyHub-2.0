import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle, Building2, ClipboardList, Crown, DoorOpen, Eye, ExternalLink, GraduationCap, LayoutDashboard,
  LogOut, Menu, MessageSquare, Moon, Save, Shield, Sun, Trash2, UserCog, Users, X,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/OneHubLogo.png';
import { Badge, Button, ConfirmDialog, EmptyState, Modal, Select, Spinner, StatusBadge, Textarea, useToast } from '../components/ui';
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

const Overview = ({ stats, user, onNav }) => {
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
        <Link to="/admin/property-admins" className="block rounded-2xl bg-brand-800 p-6 text-white shadow-card transition-shadow hover:shadow-card-hover">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

const PropertiesTab = ({ onChanged }) => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <ShellCard className="overflow-hidden">
      <CardTitle title="Properties" description="Approve listings so students can see and apply to them." action={<Badge tone="brand">{items.length} total</Badge>} />
      {!items.length ? (
        <EmptyState icon={Building2} title="No properties found" description="Properties you manage will appear here." />
      ) : (
        <Table columns={[{ label: 'Property' }, { label: 'University' }, { label: 'Price' }, { label: 'Status' }, { label: 'Actions', align: 'right' }]}>
          {items.map((property) => (
            <tr key={property.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td className="px-5 py-3">
                <p className="font-semibold text-slate-950 dark:text-white">{property.name}</p>
                <p className="text-xs text-slate-400">{property.address}</p>
              </td>
              <td className="px-5 py-3"><Badge>{property.university?.toUpperCase()}</Badge></td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600 dark:text-slate-300">R{property.price_min?.toLocaleString()} – R{property.price_max?.toLocaleString()}</td>
              <td className="px-5 py-3"><Badge tone={property.approved ? 'success' : 'warning'}>{property.approved ? 'Approved' : 'Pending'}</Badge></td>
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button to={`/admin/properties/${property.id}/rooms`} variant="ghost" size="sm"><DoorOpen className="h-3.5 w-3.5" aria-hidden="true" />Rooms</Button>
                  <Button onClick={() => toggleApproval(property)} variant={property.approved ? 'ghost' : 'soft'} size="sm">{property.approved ? 'Unapprove' : 'Approve'}</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </ShellCard>
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

  const confirmRoleChange = async () => {
    if (!pendingRole) return;
    setSaving(true);
    try {
      await adminAPI.updateUser(pendingRole.id, { is_admin: !pendingRole.is_admin });
      toast.success(pendingRole.is_admin ? `${pendingRole.name} is no longer an admin.` : `${pendingRole.name} is now an admin.`);
      setPendingRole(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <>
      <ConfirmDialog
        open={Boolean(pendingRole)}
        onClose={() => setPendingRole(null)}
        onConfirm={confirmRoleChange}
        loading={saving}
        tone={pendingRole?.is_admin ? 'danger' : 'primary'}
        title={pendingRole?.is_admin ? 'Revoke admin access?' : 'Grant admin access?'}
        description={pendingRole?.is_admin
          ? `${pendingRole?.name} will lose access to the admin console and any assigned properties.`
          : `${pendingRole?.name} will be able to sign in to the admin console. Assign properties afterwards under Property Admins.`}
        confirmLabel={pendingRole?.is_admin ? 'Revoke access' : 'Make admin'}
      />
      <ShellCard className="overflow-hidden">
        <CardTitle title="Users" description="Registered students and administrators." action={<Badge tone="brand">{items.length} users</Badge>} />
        {!items.length ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <Table columns={[{ label: 'User' }, { label: 'Verified' }, { label: 'Role' }, { label: 'Actions', align: 'right' }]}>
            {items.map((item) => {
              const canChangeRole = currentUser?.is_super_admin && currentUser?.id !== item.id && !item.is_super_admin;
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
                  <td className="px-5 py-3 text-right">
                    {canChangeRole && (
                      <Button onClick={() => setPendingRole(item)} variant={item.is_admin ? 'ghost' : 'soft'} size="sm">{item.is_admin ? 'Revoke admin' : 'Make admin'}</Button>
                    )}
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

  if (loading) return <Loading />;
  return (
    <>
      {selected && <AccommodationReviewModal item={selected} onClose={() => setSelected(null)} onSave={updateStatus} saving={saving} />}
      <ShellCard className="overflow-hidden">
        <CardTitle
          title="Accommodation applications"
          description="Each row is one property's decision — reviewing it never affects other properties the student applied to."
          action={<Badge tone="brand">{items.length} visible</Badge>}
        />
        {!items.length ? (
          <EmptyState icon={ClipboardList} title="No applications yet" description="Applications for your assigned properties will appear here." />
        ) : (
          <Table columns={[{ label: 'Applicant' }, { label: 'Property' }, { label: 'Submitted' }, { label: 'Status' }, { label: 'Review', align: 'right' }]}>
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
                  <Button onClick={() => setSelected(item)} size="sm"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Review</Button>
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

/* ---------------------------------------------------------------------- Shell */

const NAV = [
  { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'Properties', label: 'Properties', icon: Building2 },
  { id: 'Reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'Users', label: 'Users', icon: Users },
  { id: 'Applications', label: 'Applications', icon: ClipboardList },
  { id: 'UniversityApplications', label: 'University applications', icon: GraduationCap, superOnly: true },
  { id: 'PropertyAdmins', label: 'Property admins', icon: UserCog, superOnly: true, route: '/admin/property-admins' },
];

const SUBTITLES = {
  Overview: 'Platform summary and quick links',
  Properties: 'Manage and approve accommodation listings',
  Reviews: 'Moderate student reviews before publishing',
  Users: 'Manage registered students and admins',
  Applications: 'Review applications and record decisions per property',
  UniversityApplications: 'Internal tracking queue for manual university submissions',
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadStats = useCallback(() => {
    adminAPI.getStats().then((response) => setStats(response.data)).catch(() => {});
  }, []);

  // Refresh sidebar counts on mount and whenever a tab reports a change.
  useEffect(() => { loadStats(); }, [loadStats]);

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
  const navItems = NAV.filter((item) => !item.superOnly || user?.is_super_admin);
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
          {activeTab === 'Overview' && <Overview stats={stats} user={user} onNav={goTo} />}
          {activeTab === 'Properties' && <PropertiesTab onChanged={loadStats} />}
          {activeTab === 'Reviews' && <ReviewsTab onChanged={loadStats} />}
          {activeTab === 'Users' && <UsersTab currentUser={user} onChanged={loadStats} />}
          {activeTab === 'Applications' && <ApplicationsTab onChanged={loadStats} />}
          {activeTab === 'UniversityApplications' && <UniversityApplicationsTab onChanged={loadStats} />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
