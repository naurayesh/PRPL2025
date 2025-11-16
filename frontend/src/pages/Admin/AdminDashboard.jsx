import React, { useEffect, useState } from "react";
import { fetchEvents } from "../../api";

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

  // Derived data for statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e) => new Date(e.event_date) >= new Date()
  );
  const upcomingCount = upcomingEvents.length;

  // Temporary placeholders
  const totalParticipants = 0;
  const activeRoles = 0;

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
          <h3 className="text-xl font-bold text-[#043873] mb-4">
            Acara Mendatang
          </h3>

          {loading && <p>Memuat acara...</p>}

          {!loading && (
            <div className="flex flex-col gap-4 max-w-3xl">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-4 rounded-lg shadow border border-gray-100 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        📅{" "}
                        {event.event_date
                          ? new Date(event.event_date).toLocaleString()
                          : "Tanggal tidak tersedia"}{" "}
                        | 📍 {event.location || "Lokasi tidak tersedia"}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        Peserta: (belum didukung)
                      </p>
                    </div>

                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
                      Terbuka
                    </span>
                  </div>
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
