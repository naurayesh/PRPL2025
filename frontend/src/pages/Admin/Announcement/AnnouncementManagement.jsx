import React, { useEffect, useState } from "react";
import { fetchAnnouncements, deleteAnnouncement } from "../../../api";
import { Link } from "react-router-dom";

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements().then(setAnnouncements);
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id);
    setAnnouncements(announcements.filter(a => a.id !== id));
  }

  return (
    <div>
      <h2>Kelola Pengumuman</h2>

      <Link to="/admin/pengumuman/tambah" className="btn">
        Tambah Pengumuman
      </Link>

      <ul>
        {announcements.map((a) => (
          <li key={a.id}>
            <strong>{a.title}</strong>
            <br />
            <Link to={`/admin/pengumuman/edit/${a.id}`}>Edit</Link>
            <button onClick={() => handleDelete(a.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
