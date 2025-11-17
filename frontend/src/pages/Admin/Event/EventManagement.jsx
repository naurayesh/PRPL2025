import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents, deleteEvent } from "../../../api";
import EventCard from "../../../components/admin/AdminEventCard";

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvents();
        if (res.success) {
          setEvents(res.data);
        } else {
          setError("Gagal memuat daftar acara.");
        }
      } catch (err) {
        setError("Tidak dapat mengambil data dari server.");
      }
      setLoading(false);
    }
    load();
  }, []);

  // Handle delete event
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus acara ini?")) return;

    try {
      const res = await deleteEvent(id);
      if (res.success) {
        setEvents(events.filter((e) => e.id !== id));
      } else {
        alert("Gagal menghapus acara.");
      }
    } catch (err) {
      alert("Gagal menghubungi server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#043873]">Kelola Acara</h1>
        <Link
          to="/admin/acara/tambah" 
          className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          + Tambah Acara
        </Link>
      </div>

      {/* Loading State */}
      {loading && <p>Memuat daftar acara...</p>}

      {/* Error State */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Event list */}
      {!loading && !error && (
        <div className="space-y-4">
          {events.length === 0 && (
            <p className="text-gray-600">Belum ada acara.</p>
          )}

          {events.map((event) => {
            const date = new Date(event.event_date);

            return (
              <EventCard
                key={event.id}
                event={{
                  id: event.id,
                  nama: event.title,
                  tanggal: date.toLocaleDateString("id-ID"),
                  jam: date.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  lokasi: event.location,
                  peserta: 0, // no backend yet
                  kuota: 0,   // optional
                  status: "Terbuka",
                }}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
