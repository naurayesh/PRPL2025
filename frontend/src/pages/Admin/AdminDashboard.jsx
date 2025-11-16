import React, { useEffect, useState } from "react";
import { fetchEvents, deleteEvent} from "../../api";
import EventCard from "../../components/admin/AdminEventCard";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvents();
        if (res.success) {
          const sorted = res.data.sort(
            (a, b) => new Date(a.event_date) - new Date(b.event_date)
          );
          setEvents(sorted);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  
  // ----- SIMPLE DELETE HANDLER -----
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus acara ini?")) return;

    try {
      const res = await deleteEvent(id);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert("Gagal menghapus acara.");
      }
    } catch (err) {
      alert("Gagal menghubungi server.");
    }
  };

  // Derived data for statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e) => new Date(e.event_date) >= new Date()
  );
  const upcomingCount = upcomingEvents.length;

  // TODO: Temporary placeholders
  const totalParticipants = 0;
  const activeRoles = 0;

  const topUpcoming = upcomingEvents.slice(0, 3);

  return (
      <div className="p-6">
        {/* ===== Dashboard Statistics ===== */}
        <section>
          <h3 className="text-xl font-bold text-[#043873] mb-4">Statistik</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Acara", value: totalEvents },
              { label: "Total Peserta", value: totalParticipants },
              { label: "Panitia Aktif", value: activeRoles },
              { label: "Acara Mendatang", value: upcomingCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow p-4 border border-gray-100"
              >
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-[#043873]">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

      {/* ===== Upcoming Events ===== */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#043873]">
            Acara Mendatang
          </h3>

          {/* View all events */}
          <a
            href="/admin/acara"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Lihat Semua Acara →
          </a>
        </div>

        {loading && <p>Memuat acara...</p>}

        {!loading && (
          <div className="flex flex-col gap-4 max-w-3xl">
            {topUpcoming.length > 0 ? (
              topUpcoming.map((event) => (
                <EventCard key={event.id} event={{
                    id: event.id,
                    nama: event.title,
                    tanggal: new Date(event.event_date).toLocaleDateString("id-ID"),
                    jam: new Date(event.event_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                    lokasi: event.location || "Lokasi tidak tersedia",
                    peserta: 0,   // No backend support yet
                    kuota: 0,     // Optional until backend ready
                    status: "Terbuka"
                }} />
              ))
            ) : (
              <p className="text-gray-500">Tidak ada acara mendatang.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}