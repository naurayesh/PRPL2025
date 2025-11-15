import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnnouncement } from "../../../api";

export default function AnnouncementCreation() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    const res = await createAnnouncement({ title, body });
    console.log("API response:", res);

    if (res?.success) {
      navigate("/admin/pengumuman"); // redirect to list
    } else {
      setError("Gagal membuat pengumuman");
    }
  } catch (err) {
    console.error(err);
    setError("Terjadi kesalahan saat menyimpan pengumuman");
  }
};


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-[#043873] mb-6">
        Buat Pengumuman Baru
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        <div>
          <label className="block font-medium mb-1">Judul Pengumuman</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul..."
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Isi Pengumuman</label>
          <textarea
            className="w-full border p-2 rounded"
            rows="5"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tuliskan isi pengumuman..."
            required
          ></textarea>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <button
          type="submit"
          className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-800"
          style={{ zIndex: 9999, position: "relative" }}
        >
          Unggah Pengumuman
        </button>

      </form>
    </div>
  );
}
