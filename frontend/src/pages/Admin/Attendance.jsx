import React, { useState } from "react";
import AccountCard from "../../components/AccountCard";

export default function Attendance() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState([
    { id: 1, name: "Ayu Kartika", phone: "08123456789", email: "ayu@email.com", hadir: false },
    { id: 2, name: "Rudi Hartono", phone: "08198765432", email: "rudi@email.com", hadir: true },
    { id: 3, name: "Siti Marlina", phone: "08234567890", email: "siti@email.com", hadir: false },
  ]);

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAttendance = (id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hadir: !p.hadir } : p))
    );
  };

  const deleteParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const totalRegistered = participants.length;
  const totalPresent = participants.filter((p) => p.hadir).length;
  const totalAbsent = totalRegistered - totalPresent;

  return (
    <div className="space-y-6">
      {/* Select Event */}
      <div>
        <label className="block font-semibold text-gray-700 mb-2">Pilih Acara:</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
        >
          <option value="">-- Pilih Acara --</option>
          <option value="Acara 1">Acara 1</option>
          <option value="Acara 2">Acara 2</option>
        </select>
      </div>

      {selectedEvent && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold">Terdaftar</h3>
              <p className="text-2xl font-bold text-gray-800">{totalRegistered}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold">Hadir</h3>
              <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold">Tidak Hadir</h3>
              <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Cari nama peserta..."
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Participant list */}
          <div className="space-y-4">
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((p) => (
                <AccountCard
                  key={p.id}
                  user={p}
                  editPath={`/admin/kehadiran/edit/${p.id}?returnTo=/admin/kehadiran`}
                  showAttendanceButton={true}
                  hadir={p.hadir}
                  onToggleAttendance={() => toggleAttendance(p.id)}
                  onDelete={() => deleteParticipant(p.id)}
                />
              ))
            ) : (
              <p className="text-gray-500">Tidak ada peserta ditemukan.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
