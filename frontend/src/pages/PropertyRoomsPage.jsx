import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Download,
  DoorOpen,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  UserMinus,
  Users,
} from 'lucide-react';
import { adminAPI } from '../services/api';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const cardClass = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';

const ROOM_TYPE_LABEL = { single: 'Single', double: '2-sharing' };

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">{label}</label>
    {children}
  </div>
);

const RoomCard = ({ room, onDelete }) => (
  <div className={`rounded-2xl border p-4 ${room.is_full ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800'}`}>
    <div className="mb-2 flex items-start justify-between gap-2">
      <div>
        <p className="text-lg font-bold text-slate-950 dark:text-white">{room.room_number}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{ROOM_TYPE_LABEL[room.room_type] || room.room_type} · {room.occupied_count}/{room.capacity}</p>
      </div>
      <button onClick={() => onDelete(room)} disabled={room.occupied_count > 0} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
    </div>
    {room.occupants?.length ? (
      <div className="space-y-1.5">
        {room.occupants.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-slate-800">
            <span className="truncate font-semibold text-slate-700 dark:text-slate-200">{o.applicant_name}</span>
            <button onClick={() => onDelete(room, o)} className="shrink-0 text-red-500 hover:underline">Vacate</button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-xs text-slate-400">Vacant</p>
    )}
    {room.price != null && <p className="mt-2 text-xs font-bold text-brand-600">R{room.price.toLocaleString()}/month</p>}
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
      const [propsRes, floorsRes, unallocatedRes] = await Promise.all([
        adminAPI.getProperties({ per_page: 100, status: 'all' }),
        adminAPI.getFloors(propertyId),
        adminAPI.getUnallocated(propertyId),
      ]);
      setProperty((propsRes.data.properties || []).find((p) => p.id === propertyId) || null);
      setFloors(floorsRes.data.floors || []);
      setUnallocated(unallocatedRes.data.unallocated || []);
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to load room data.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  const allRooms = useMemo(() => floors.flatMap((f) => f.rooms || []), [floors]);
  const roomsWithSpace = (roomType) => allRooms.filter((r) => r.room_type === roomType && !r.is_full);

  const handleAddFloor = async (event) => {
    event.preventDefault();
    if (!floorForm.floor_number) return;
    setSaving(true);
    try {
      await adminAPI.createFloor(propertyId, { floor_number: Number(floorForm.floor_number), label: floorForm.label });
      setFloorForm({ floor_number: '', label: '' });
      showMessage('success', 'Floor added.');
      load();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to add floor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFloor = async (floor) => {
    setSaving(true);
    try {
      await adminAPI.deleteFloor(floor.id);
      showMessage('success', 'Floor deleted.');
      load();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to delete floor.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRoom = async (event) => {
    event.preventDefault();
    if (!roomForm.floor_id || !roomForm.room_number) return;
    setSaving(true);
    try {
      await adminAPI.createRoom(propertyId, {
        floor_id: Number(roomForm.floor_id), room_number: roomForm.room_number,
        room_type: roomForm.room_type, price: roomForm.price || null,
      });
      setRoomForm({ floor_id: roomForm.floor_id, room_number: '', room_type: 'single', price: '' });
      showMessage('success', 'Room added.');
      load();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to add room.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (room, occupant) => {
    setSaving(true);
    try {
      if (occupant) {
        await adminAPI.vacateAllocation(occupant.id);
        showMessage('success', 'Room vacated.');
      } else {
        await adminAPI.deleteRoom(room.id);
        showMessage('success', 'Room deleted.');
      }
      load();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to update room.');
    } finally {
      setSaving(false);
    }
  };

  const handleAllocate = async (applicantRow) => {
    const roomId = allocationChoice[applicantRow.id];
    if (!roomId) return;
    setSaving(true);
    try {
      await adminAPI.allocateRoom(Number(roomId), applicantRow.id);
      showMessage('success', `${applicantRow.applicant_name} allocated.`);
      load();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to allocate room.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoAllocate = async () => {
    setSaving(true);
    try {
      const res = await adminAPI.autoAllocate(propertyId);
      showMessage('success', res.data.message);
      load();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to auto-allocate.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminAPI.exportRoomsCsv(propertyId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
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

  if (loading) return <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-400 dark:bg-slate-950">Loading rooms...</div>;
  if (property === null) return <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-400 dark:bg-slate-950">Property not found or not accessible.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <Link to="/admin" className="mb-4 inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to admin dashboard
        </Link>

        <div className="mb-5 flex flex-col gap-3 rounded-3xl bg-brand-800 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><Building2 className="h-3.5 w-3.5" /> Room management</div>
            <h1 className="text-2xl font-bold sm:text-3xl">{property?.name}</h1>
            <p className="mt-1 text-sm text-brand-50">{property?.address}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-800 hover:bg-slate-100"><Download className="h-4 w-4" />Download spreadsheet</button>
            <button onClick={handleAutoAllocate} disabled={saving || !unallocated.length} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/25 disabled:opacity-40"><Sparkles className="h-4 w-4" />Auto-allocate pending</button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 flex items-center gap-2 rounded-2xl border p-4 text-sm font-bold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
          <form onSubmit={handleAddFloor} className={`${cardClass} p-5`}>
            <div className="mb-4 flex items-center gap-2"><Layers className="h-4 w-4 text-brand-600" /><h2 className="text-sm font-bold text-slate-950 dark:text-white">Add floor</h2></div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Floor number"><input type="number" value={floorForm.floor_number} onChange={(e) => setFloorForm((p) => ({ ...p, floor_number: e.target.value }))} className={inputClass} placeholder="e.g. 5" /></Field>
              <Field label="Label (optional)"><input value={floorForm.label} onChange={(e) => setFloorForm((p) => ({ ...p, label: e.target.value }))} className={inputClass} placeholder="e.g. Ground" /></Field>
            </div>
            <button type="submit" disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"><Plus className="h-4 w-4" />Add floor</button>
          </form>

          <form onSubmit={handleAddRoom} className={`${cardClass} p-5`}>
            <div className="mb-4 flex items-center gap-2"><DoorOpen className="h-4 w-4 text-brand-600" /><h2 className="text-sm font-bold text-slate-950 dark:text-white">Add room</h2></div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Floor">
                <select value={roomForm.floor_id} onChange={(e) => setRoomForm((p) => ({ ...p, floor_id: e.target.value }))} className={inputClass}>
                  <option value="">Select floor</option>
                  {floors.map((f) => <option key={f.id} value={f.id}>{f.label || `Floor ${f.floor_number}`}</option>)}
                </select>
              </Field>
              <Field label="Room number"><input value={roomForm.room_number} onChange={(e) => setRoomForm((p) => ({ ...p, room_number: e.target.value }))} className={inputClass} placeholder="e.g. 510" /></Field>
              <Field label="Room type">
                <select value={roomForm.room_type} onChange={(e) => setRoomForm((p) => ({ ...p, room_type: e.target.value }))} className={inputClass}>
                  <option value="single">Single</option>
                  <option value="double">2-sharing</option>
                </select>
              </Field>
              <Field label="Price (optional)"><input type="number" value={roomForm.price} onChange={(e) => setRoomForm((p) => ({ ...p, price: e.target.value }))} className={inputClass} placeholder="Monthly rand" /></Field>
            </div>
            <button type="submit" disabled={saving || !floors.length} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"><Plus className="h-4 w-4" />Add room</button>
            {!floors.length && <p className="mt-2 text-xs text-slate-400">Add a floor first.</p>}
          </form>
        </div>

        <div className={`${cardClass} mt-5 p-5`}>
          <div className="mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-gold-600" /><h2 className="text-sm font-bold text-slate-950 dark:text-white">Approved applicants awaiting a room ({unallocated.length})</h2></div>
          {!unallocated.length ? (
            <p className="text-sm text-slate-400">No approved applicants are waiting for a room right now.</p>
          ) : (
            <div className="space-y-2">
              {unallocated.map((row) => {
                const options = roomsWithSpace(row.room_type_preference);
                return (
                  <div key={row.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{row.applicant_name}</p>
                      <p className="text-xs text-slate-400">{row.applicant_email} · Prefers {ROOM_TYPE_LABEL[row.room_type_preference] || row.room_type_preference || 'unspecified'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={allocationChoice[row.id] || ''} onChange={(e) => setAllocationChoice((p) => ({ ...p, [row.id]: e.target.value }))} className={`${inputClass} w-48`}>
                        <option value="">Select room</option>
                        {options.map((r) => <option key={r.id} value={r.id}>{r.room_number} ({r.occupied_count}/{r.capacity})</option>)}
                      </select>
                      <button onClick={() => handleAllocate(row)} disabled={saving || !allocationChoice[row.id]} className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50">Allocate</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 space-y-4">
          {floors.map((floor) => (
            <div key={floor.id} className={`${cardClass} p-5`}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">{floor.label || `Floor ${floor.floor_number}`}</h3>
                <button onClick={() => handleDeleteFloor(floor)} disabled={saving} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:underline disabled:opacity-40"><UserMinus className="h-3.5 w-3.5" />Remove floor</button>
              </div>
              {floor.rooms?.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {floor.rooms.map((room) => <RoomCard key={room.id} room={room} onDelete={handleDeleteRoom} />)}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No rooms on this floor yet.</p>
              )}
            </div>
          ))}
          {!floors.length && <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-800">Add a floor to start building this property's room layout.</div>}
        </div>
      </div>
    </div>
  );
};

export default PropertyRoomsPage;
