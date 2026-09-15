import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Download, DoorOpen, Layers, Plus, Sparkles, Trash2, UserMinus, Users, BedDouble } from 'lucide-react';
import { adminAPI } from '../services/api';
import { Alert, Badge, Button, ConfirmDialog, EmptyState, Input, PageLoader, Select } from '../components/ui';
import { cn } from '../utils/cn';

const CARD = 'rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900';
const ROOM_TYPE_LABEL = { single: 'Single', double: '2-sharing' };

const RoomCard = ({ room, onDeleteRoom, onVacate, disabled }) => (
  <div className={cn('rounded-2xl border p-4', room.is_full ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800')}>
    <div className="mb-2 flex items-start justify-between gap-2">
      <div>
        <p className="text-lg font-bold text-slate-950 dark:text-white">{room.room_number}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {ROOM_TYPE_LABEL[room.room_type] || room.room_type} · {room.occupied_count}/{room.capacity} occupied
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDeleteRoom(room)}
        disabled={disabled || room.occupied_count > 0}
        title={room.occupied_count > 0 ? 'Vacate occupants before deleting this room' : 'Delete room'}
        aria-label={`Delete room ${room.room_number}`}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
    {room.occupants?.length ? (
      <ul className="space-y-1.5">
        {room.occupants.map((occupant) => (
          <li key={occupant.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-slate-800">
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">{occupant.applicant_name}</span>
            <button type="button" onClick={() => onVacate(room, occupant)} disabled={disabled} className="shrink-0 font-semibold text-red-600 transition-colors hover:text-red-700 disabled:opacity-50 dark:text-red-300">
              Vacate
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-slate-400">Vacant</p>
    )}
    {room.price != null && <p className="mt-2 text-xs font-semibold text-brand-700 dark:text-brand-300">R{room.price.toLocaleString()} / month</p>}
  </div>
);

const PropertyRoomsPage = () => {
  const { id } = useParams();
  const propertyId = Number(id);

  const [property, setProperty] = useState(undefined);
  const [floors, setFloors] = useState([]);
  const [unallocated, setUnallocated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const [floorForm, setFloorForm] = useState({ floor_number: '', label: '' });
  const [roomForm, setRoomForm] = useState({ floor_id: '', room_number: '', room_type: 'single', price: '' });
  const [allocationChoice, setAllocationChoice] = useState({});

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [propertiesResponse, floorsResponse, unallocatedResponse] = await Promise.all([
        adminAPI.getProperties({ per_page: 100, status: 'all' }),
        adminAPI.getFloors(propertyId),
        adminAPI.getUnallocated(propertyId),
      ]);
      setProperty((propertiesResponse.data.properties || []).find((item) => item.id === propertyId) || null);
      setFloors(floorsResponse.data.floors || []);
      setUnallocated(unallocatedResponse.data.unallocated || []);
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to load room data.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  const allRooms = useMemo(() => floors.flatMap((floor) => floor.rooms || []), [floors]);
  const roomsWithSpace = (roomType) => allRooms.filter((room) => room.room_type === roomType && !room.is_full);
  const totals = useMemo(() => ({
    rooms: allRooms.length,
    capacity: allRooms.reduce((sum, room) => sum + (room.capacity || 0), 0),
    occupied: allRooms.reduce((sum, room) => sum + (room.occupied_count || 0), 0),
  }), [allRooms]);

  /** Wraps a mutation with saving state, success/error messaging and a reload. */
  const run = async (action, successText, failureText) => {
    setSaving(true);
    try {
      const result = await action();
      showMessage('success', typeof successText === 'function' ? successText(result) : successText);
      load();
      return true;
    } catch (err) {
      showMessage('error', err.response?.data?.error || failureText);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAddFloor = async (event) => {
    event.preventDefault();
    if (!floorForm.floor_number) return;
    const ok = await run(
      () => adminAPI.createFloor(propertyId, { floor_number: Number(floorForm.floor_number), label: floorForm.label }),
      'Floor added.',
      'Failed to add floor.',
    );
    if (ok) setFloorForm({ floor_number: '', label: '' });
  };

  const handleAddRoom = async (event) => {
    event.preventDefault();
    if (!roomForm.floor_id || !roomForm.room_number) return;
    const ok = await run(
      () => adminAPI.createRoom(propertyId, {
        floor_id: Number(roomForm.floor_id),
        room_number: roomForm.room_number,
        room_type: roomForm.room_type,
        price: roomForm.price || null,
      }),
      `Room ${roomForm.room_number} added.`,
      'Failed to add room.',
    );
    if (ok) setRoomForm((previous) => ({ ...previous, room_number: '', price: '' }));
  };

  const handleAllocate = (applicantRow) => {
    const roomId = allocationChoice[applicantRow.id];
    if (!roomId) return;
    run(
      () => adminAPI.allocateRoom(Number(roomId), applicantRow.id),
      `${applicantRow.applicant_name} allocated.`,
      'Failed to allocate room.',
    );
  };

  const handleAutoAllocate = () => run(
    () => adminAPI.autoAllocate(propertyId),
    (response) => response.data.message || 'Pending applicants allocated.',
    'Failed to auto-allocate.',
  );

  const handleExport = async () => {
    try {
      const response = await adminAPI.exportRoomsCsv(propertyId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(property?.name || 'rooms').replace(/\s+/g, '-').toLowerCase()}-room-allocations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showMessage('error', 'Failed to download spreadsheet.');
    }
  };

  // Destructive actions open a confirmation first; `confirm` holds what to do on approval.
  const askDeleteFloor = (floor) => setConfirm({
    title: `Delete ${floor.label || `Floor ${floor.floor_number}`}?`,
    description: floor.rooms?.length
      ? `This floor has ${floor.rooms.length} room${floor.rooms.length === 1 ? '' : 's'}. All of them will be removed with it.`
      : 'This floor will be removed from the property layout.',
    confirmLabel: 'Delete floor',
    action: () => run(() => adminAPI.deleteFloor(floor.id), 'Floor deleted.', 'Failed to delete floor.'),
  });

  const askDeleteRoom = (room) => setConfirm({
    title: `Delete room ${room.room_number}?`,
    description: 'The room will be removed from the layout. This cannot be undone.',
    confirmLabel: 'Delete room',
    action: () => run(() => adminAPI.deleteRoom(room.id), `Room ${room.room_number} deleted.`, 'Failed to delete room.'),
  });

  const askVacate = (room, occupant) => setConfirm({
    title: `Vacate ${occupant.applicant_name}?`,
    description: `${occupant.applicant_name} will be removed from room ${room.room_number} and return to the unallocated list.`,
    confirmLabel: 'Vacate room',
    action: () => run(() => adminAPI.vacateAllocation(occupant.id), `${occupant.applicant_name} vacated from room ${room.room_number}.`, 'Failed to vacate room.'),
  });

  const runConfirm = async () => {
    if (!confirm) return;
    await confirm.action();
    setConfirm(null);
  };

  if (loading) return <PageLoader label="Loading rooms…" />;

  if (property === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className={CARD}>
          <EmptyState
            icon={Building2}
            title="Property not found"
            description="This property does not exist or is not assigned to you."
            action={<Button to="/admin"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to admin dashboard</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        loading={saving}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <Link to="/admin" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to admin dashboard
        </Link>

        <div className="mb-5 rounded-2xl bg-brand-800 p-6 text-white shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Room management
              </span>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{property?.name}</h1>
              <p className="mt-1 text-sm text-brand-50">{property?.address}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExport} variant="inverse"><Download className="h-4 w-4" aria-hidden="true" />Download spreadsheet</Button>
              <Button onClick={handleAutoAllocate} variant="inverse-outline" disabled={saving || !unallocated.length}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />Auto-allocate pending
              </Button>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-center sm:max-w-md sm:text-left">
            {[
              ['Floors', floors.length],
              ['Rooms', totals.rooms],
              ['Occupancy', totals.capacity ? `${totals.occupied} / ${totals.capacity}` : '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <dd className="text-xl font-bold">{value}</dd>
                <dt className="text-xs text-brand-100">{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {message && <Alert tone={message.type} className="mb-4" onDismiss={() => setMessage(null)}>{message.text}</Alert>}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <form onSubmit={handleAddFloor} className={cn(CARD, 'p-5')}>
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">Add floor</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Floor number" type="number" inputMode="numeric" value={floorForm.floor_number} onChange={(event) => setFloorForm((previous) => ({ ...previous, floor_number: event.target.value }))} placeholder="e.g. 5" required />
              <Input label="Label" optional value={floorForm.label} onChange={(event) => setFloorForm((previous) => ({ ...previous, label: event.target.value }))} placeholder="e.g. Ground" />
            </div>
            <Button type="submit" className="mt-4" disabled={saving || !floorForm.floor_number}><Plus className="h-4 w-4" aria-hidden="true" />Add floor</Button>
          </form>

          <form onSubmit={handleAddRoom} className={cn(CARD, 'p-5')}>
            <div className="mb-4 flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">Add room</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Floor" value={roomForm.floor_id} onChange={(event) => setRoomForm((previous) => ({ ...previous, floor_id: event.target.value }))} required>
                <option value="">Select floor</option>
                {floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.label || `Floor ${floor.floor_number}`}</option>)}
              </Select>
              <Input label="Room number" value={roomForm.room_number} onChange={(event) => setRoomForm((previous) => ({ ...previous, room_number: event.target.value }))} placeholder="e.g. 510" required />
              <Select label="Room type" value={roomForm.room_type} onChange={(event) => setRoomForm((previous) => ({ ...previous, room_type: event.target.value }))}>
                <option value="single">Single</option>
                <option value="double">2-sharing</option>
              </Select>
              <Input label="Monthly price" optional type="number" inputMode="numeric" value={roomForm.price} onChange={(event) => setRoomForm((previous) => ({ ...previous, price: event.target.value }))} placeholder="Rand" />
            </div>
            <Button type="submit" className="mt-4" disabled={saving || !floors.length || !roomForm.floor_id || !roomForm.room_number}><Plus className="h-4 w-4" aria-hidden="true" />Add room</Button>
            {!floors.length && <p className="mt-2 text-xs text-slate-400">Add a floor first.</p>}
          </form>
        </div>

        <section className={cn(CARD, 'mt-5 p-5')} aria-labelledby="unallocated-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold-600 dark:text-gold-300" aria-hidden="true" />
              <h2 id="unallocated-heading" className="text-sm font-bold text-slate-950 dark:text-white">Approved applicants awaiting a room</h2>
            </div>
            <Badge tone={unallocated.length ? 'warning' : 'success'}>{unallocated.length} waiting</Badge>
          </div>
          {!unallocated.length ? (
            <p className="text-sm text-slate-400">No approved applicants are waiting for a room right now.</p>
          ) : (
            <ul className="space-y-2">
              {unallocated.map((row) => {
                const options = roomsWithSpace(row.room_type_preference);
                return (
                  <li key={row.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{row.applicant_name}</p>
                      <p className="truncate text-xs text-slate-400">{row.applicant_email} · Prefers {ROOM_TYPE_LABEL[row.room_type_preference] || row.room_type_preference || 'unspecified'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select aria-label={`Room for ${row.applicant_name}`} value={allocationChoice[row.id] || ''} onChange={(event) => setAllocationChoice((previous) => ({ ...previous, [row.id]: event.target.value }))} wrapperClassName="w-48">
                        <option value="">{options.length ? 'Select room' : 'No rooms with space'}</option>
                        {options.map((room) => <option key={room.id} value={room.id}>{room.room_number} ({room.occupied_count}/{room.capacity})</option>)}
                      </Select>
                      <Button onClick={() => handleAllocate(row)} size="sm" disabled={saving || !allocationChoice[row.id]}>Allocate</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-5 space-y-4">
          {floors.map((floor) => (
            <section key={floor.id} className={cn(CARD, 'p-5')} aria-label={floor.label || `Floor ${floor.floor_number}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">{floor.label || `Floor ${floor.floor_number}`}</h3>
                  <Badge size="sm">{floor.rooms?.length || 0} room{floor.rooms?.length === 1 ? '' : 's'}</Badge>
                </div>
                <Button variant="ghost" size="xs" onClick={() => askDeleteFloor(floor)} disabled={saving} className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-500/10">
                  <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />Remove floor
                </Button>
              </div>
              {floor.rooms?.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {floor.rooms.map((room) => <RoomCard key={room.id} room={room} onDeleteRoom={askDeleteRoom} onVacate={askVacate} disabled={saving} />)}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No rooms on this floor yet.</p>
              )}
            </section>
          ))}
          {!floors.length && (
            <div className={CARD}>
              <EmptyState icon={BedDouble} title="No floors yet" description="Add a floor above to start building this property's room layout." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyRoomsPage;
