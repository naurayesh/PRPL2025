import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchEvents } from "../api";
import { FiSearch, FiX } from "react-icons/fi";

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
          setFiltered(sorted); // initial
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  // SEARCH FILTERING
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(events);
      return;
    }

    const lower = searchQuery.toLowerCase();
    const result = events.filter((e) =>
      e.title.toLowerCase().includes(lower)
    );

    setFiltered(result);
  }, [searchQuery, events]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Search Row */}
      <div className="px-8 md:px-20 mt-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#043873]">Acara Mendatang</h2>

        <button
          onClick={() => setSearchVisible(!searchVisible)}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          {searchVisible ? <FiX size={20} /> : <FiSearch size={20} />}
        </button>
      </div>

      {/* Search Bar */}
      {searchVisible && (
        <div className="px-8 md:px-20 mt-4">
          <input
            type="text"
            placeholder="Cari acara…"
            className="w-full p-3 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Events */}
      <section className="px-8 md:px-20 py-12 bg-gray-50">
        {loading && <p>Memuat acara...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-500">
            Tidak ada acara yang cocok dengan pencarian.
          </p>
        )}

        <div className="flex flex-col gap-8">
          {!loading &&
            filtered.map((event) => (
              <div
                key={event.id}
                className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <h4 className="text-xl font-semibold text-blue-800">
                  {event.title}
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  📅{" "}
                  {event.event_date
                    ? new Date(event.event_date).toLocaleString()
                    : "Tanggal belum ditentukan"}{" "}
                  | 📍 {event.location || "Lokasi tidak tersedia"}
                </p>

                <p className="text-gray-700 mt-3 line-clamp-3">
                  {event.description}
                </p>

                <Link
                  to={`/events/${event.id}`}
                  className="inline-block mt-4 text-blue-700 font-semibold hover:underline"
                >
                  Lihat Detail →
                </Link>
              </div>
            ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
