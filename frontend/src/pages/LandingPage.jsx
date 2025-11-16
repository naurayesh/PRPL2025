// src/pages/LandingPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchEvents } from "../api";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]); // top 3 upcoming
  const [recentWithImages, setRecentWithImages] = useState([]); // for hero slider
  const [loading, setLoading] = useState(true);

  // slider state
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef();

  useEffect(() => {
    async function load() {
      try {
        // get all upcoming events (upcoming true)
        const resUpcoming = await fetchEvents({ upcoming: true });
        // get all events (for recent/historic images), we want past events for recent images
        const resAll = await fetchEvents({ upcoming: false });

        if (resUpcoming?.success) {
          const sorted = (resUpcoming.data || []).sort(
            (a, b) => new Date(a.event_date) - new Date(b.event_date)
          );
          // filter out cancelled
          const valid = sorted.filter((e) => !e.is_cancelled);
          setEvents(valid);
          setUpcoming(valid.slice(0, 3)); // top 3 closest
        }

        if (resAll?.success) {
          // recent past events: those whose date is < now, sort desc (most recent first)
          const past = (resAll.data || []).filter(
            (e) => new Date(e.event_date) < new Date()
          );
          const sortedPast = past
            .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
            .slice(0, 6); // keep a few for the slider

          // normalize image urls: look for file_url in event.media if backend provides it
          const normalized = sortedPast.map((e) => {
            // possible shapes: e.media (array of {file_url}), e.media_urls, e.image_url
            const mediaUrls =
              (e.media && e.media.length && e.media.map((m) => m.file_url)) ||
              e.media_urls ||
              (e.image_url ? [e.image_url] : []);
            return {
              ...e,
              sliderImage: mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : null,
            };
          });

          // prefer events that have sliderImage
          const withImage = normalized.filter((e) => e.sliderImage);
          const without = normalized.filter((e) => !e.sliderImage);

          // put those with images first, but allow placeholders
          setRecentWithImages([...withImage, ...without]);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
      setLoading(false);
    }

    load();
  }, []);

  // autoplay every 5s
  useEffect(() => {
    autoplayRef.current = () => {
      setIndex((i) => {
        const next = (i + 1) % Math.max(1, recentWithImages.length || 1);
        return next;
      });
    };
  });

  useEffect(() => {
    const play = () => autoplayRef.current && autoplayRef.current();
    const id = setInterval(play, 5000);
    return () => clearInterval(id);
  }, [recentWithImages.length]);

  function prevSlide() {
    setIndex((i) => (i - 1 + recentWithImages.length) % Math.max(1, recentWithImages.length));
  }
  function nextSlide() {
    setIndex((i) => (i + 1) % Math.max(1, recentWithImages.length));
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* HERO SLIDER */}
      <section className="w-full relative bg-gray-100 mt-6">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#043873] mb-4">Kegiatan Terbaru</h1>

          <div className="relative rounded-lg overflow-hidden shadow-md">
            {/* slider area */}
            {recentWithImages.length === 0 && !loading ? (
              // Placeholder hero
              <div className="h-56 md:h-72 flex items-center justify-center bg-gradient-to-r from-blue-100 to-white">
                <div className="text-center">
                  <p className="text-xl font-semibold">Belum ada foto acara</p>
                  <p className="text-sm text-gray-600">Tambahkan foto acara di halaman admin.</p>
                </div>
              </div>
            ) : (
              <div className="h-56 md:h-72 relative">
                {recentWithImages.map((ev, i) => {
                  // use event sliderImage if exists, otherwise fallback to placeholder image from Unsplash
                  const image =
                    ev.sliderImage ||
                    `https://source.unsplash.com/1600x900/?village,community,landscape,people,festival`;

                  return (
                    <div
                      key={ev.id}
                      className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                    >
                      <img
                        src={image}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute left-6 bottom-6 text-white max-w-lg">
                        <h2 className="text-2xl font-bold">{ev.title}</h2>
                        <p className="text-sm mt-1">
                          {ev.location || "Lokasi tidak tersedia"} —{" "}
                          {new Date(ev.event_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* arrows */}
                <button
                  onClick={prevSlide}
                  aria-label="Prev"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top 3 upcoming and "Semua" link */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#043873]">Acara Mendatang</h2>

          {/* "Semua" clickable blue text (no box) */}
          <Link to="/daftar-acara" className="text-blue-600 hover:underline">
            Semua
          </Link>
        </div>

        {loading ? (
          <p className="mt-4">Memuat acara...</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-4 text-gray-500">Tidak ada acara mendatang.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcoming.map((event) => (
              <article key={event.id} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  📅 {new Date(event.event_date).toLocaleString()} | 📍 {event.location || "—"}
                </p>
                <p className="text-gray-700 mt-3 line-clamp-3">{event.description}</p>
                <Link
                  to={`/daftar-acara/${event.id}`}
                  className="inline-block mt-4 text-blue-700 font-semibold hover:underline"
                >
                  Lihat Detail →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
