//Tugaskan Peran
import React, { useState, useEffect } from "react";
import {
  fetchEvents,
  fetchEventRoles,
  fetchEventParticipants,
  fetchAllUsers,
  assignRole
} from "../../../api"; 

export default function RoleAssign() {
  const [events, setEvents] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [registeredParticipants, setRegisteredParticipants] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState("");
  const [manualUser, setManualUser] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load events + users
  useEffect(() => {
    fetchEvents().then(setEvents);
    fetchAllUsers().then(setAllUsers);
  }, []);

  // When event selected → load roles + participants
  useEffect(() => {
    if (selectedEvent) {
      fetchEventRoles(selectedEvent).then(setRoles);
      fetchEventParticipants(selectedEvent).then(setRegisteredParticipants);
    } else {
      setRoles([]);
      setRegisteredParticipants([]);
    }
  }, [selectedEvent]);

  const filteredRegistered = registeredParticipants.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const findUserByPhone = () => {
    const found = allUsers.find((u) => u.phone === manualPhone);
    if (found) {
      setManualUser(found.id);
      setMessage(`User ditemukan: ${found.name}`);
    } else {
      setManualUser("");
      setMessage("Nomor tidak ditemukan.");
    }
  };

  const handleAssign = async () => {
    setMessage("");

    if (!selectedEvent) return setMessage("Pilih acara wajib diisi.");
    if (!selectedRole) return setMessage("Pilih peran wajib diisi.");

    const chosenUser = selectedUser || manualUser;
    if (!chosenUser) {
      return setMessage("Pilih peserta terdaftar atau masukkan manual.");
    }

    try {
      setLoading(true);

      await assignRole(selectedRole, {
        pengguna_id: chosenUser,
        acara_id: selectedEvent,
      });

      setMessage("Peran berhasil ditugaskan!");
      setLoading(false);

      setSelectedUser("");
      setManualPhone("");
      setManualUser("");
    } catch (err) {
      console.error(err);
      setMessage("Gagal menugaskan peran.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">

      <h2 className="text-2xl font-semibold">Tugaskan Peran</h2>

      {message && (
        <div className="p-3 rounded bg-yellow-100 text-gray-800">{message}</div>
      )}

      {/* Select Event */}
      <div>
        <label className="block mb-1 font-medium">Pilih Acara *</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">-- pilih acara --</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.judulAcara}</option>
          ))}
        </select>
      </div>

      {/* Select Role */}
      <div>
        <label className="block mb-1 font-medium">Pilih Peran *</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">-- pilih peran --</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.namaPeran}</option>
          ))}
        </select>
      </div>

      {/* Search Bar */}
      <div>
        <label className="block mb-1 font-medium">Cari nama anggota</label>
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Cari peserta..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Registered Participants */}
      <div>
        <h3 className="font-semibold mb-2">Pilih dari peserta terdaftar:</h3>

        {filteredRegistered.length === 0 && (
          <p className="text-gray-500">Tidak ada peserta.</p>
        )}

        <div className="space-y-2">
          {filteredRegistered.map((p) => (
            <label
              key={p.id}
              className="flex items-center gap-3 p-2 border rounded cursor-pointer"
            >
              <input
                type="radio"
                name="selectedUser"
                value={p.id}
                checked={selectedUser === p.id}
                onChange={() => {
                  setSelectedUser(p.id);
                  setManualUser("");
                }}
              />
              <span>{p.name} ({p.phone})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Manual Input */}
      <div className="mt-6 border-t pt-6">
        <h3 className="font-semibold mb-2">Atau masukkan manual:</h3>

        <label className="block mb-1 font-medium">Pilih akun yang ada:</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={manualUser}
          onChange={(e) => {
            setManualUser(e.target.value);
            setSelectedUser("");
          }}
        >
          <option value="">-- pilih akun --</option>
          {allUsers
            .filter((u) => !registeredParticipants.some((r) => r.id === u.id))
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.phone})
              </option>
            ))}
        </select>

        <label className="block mb-1 font-medium">Cari nomor telepon:</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="0812..."
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
          />

          <button
            className="px-3 py-2 rounded bg-gray-300"
            onClick={findUserByPhone}
          >
            Cari
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-4 py-2 rounded bg-gray-300">
          Batal
        </button>

        <button
          className="px-4 py-2 rounded text-white"
          style={{ backgroundColor: "#4C68D5" }}
          onClick={handleAssign}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Tugaskan Peran"}
        </button>
      </div>

    </div>
  );
}
