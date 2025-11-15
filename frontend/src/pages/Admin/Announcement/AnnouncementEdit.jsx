import React, { useEffect, useState } from "react";
import { fetchAnnouncement, updateAnnouncement } from "../../../api";
import { useParams, useNavigate } from "react-router-dom";

export default function AnnouncementEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetchAnnouncement(id).then((data) => {
      setTitle(data?.title || "");
      setBody(data?.body || "");
    });
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    await updateAnnouncement(id, title, body);
    navigate("/admin/pengumuman");
  }

  return (
    <div>
      <h2>Edit Pengumuman</h2>
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

        <button type="submit">Update</button>
      </form>
    </div>
  );
}
