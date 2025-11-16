import React, { useState } from "react";
import { createAnnouncement } from "../../../api";
import { useNavigate } from "react-router-dom";

export default function AnnouncementCreation() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    await createAnnouncement(title, body);
    navigate("/admin/pengumuman");
  }

  return (
    <div>
      <h2>Buat Pengumuman</h2>
      <form onSubmit={handleSubmit}>

        <label>Judul</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Isi</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />

        <button type="submit">Simpan</button>
      </form>
    </div>
  );
}
