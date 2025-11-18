// Edit Peran
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const RoleEdit = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();

  const API_BASE = "http://localhost:8000/api";

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");

  const [roleName, setRoleName] = useState("");
  const [slotsRequired, setSlotsRequired] = useState(1);
  const [description, setDescription] = useState("");

  // Helper to get headers with token + admin key
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (process.env.REACT_APP_ADMIN_KEY)
      headers["x-api-key"] = process.env.REACT_APP_ADMIN_KEY;
    return headers;
  };

  // Load events + role data
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1) Load events
        const eventsRes = await axios.get(`${API_BASE}/events`, {
          headers: getAuthHeaders(),
        });
        setEvents(eventsRes.data?.data ?? []);

        // 2) Load role
        const roleRes = await axios.get(`${API_BASE}/roles/detail/${roleId}`, {
          headers: getAuthHeaders(),
        });
        const role = roleRes.data;

        setEventId(role.event_id);
        setRoleName(role.role_name);
        setDescription(role.description || "");
        setSlotsRequired(role.slots_required ?? 1);
      } catch (err) {
        console.error("Load error", err);
        alert("Gagal memuat data peran. Periksa koneksi atau hak akses.");
      }
    };

    loadData();
  }, [roleId, API_BASE]);

  // Update role
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!eventId || !roleName || !slotsRequired) {
      alert("Mohon isi semua field wajib.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/roles/${roleId}`,
        {
          event_id: eventId,
          role_name: roleName,
          description,
          slots_required: Number(slotsRequired),
        },
        { headers: getAuthHeaders() }
      );

      alert("Peran berhasil diperbarui!");
      navigate("/admin/peran");
    } catch (err) {
      console.error("Update gagal", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Anda tidak memiliki izin untuk memperbarui peran ini.");
      } else {
        alert("Gagal memperbarui peran. Cek console untuk detail.");
      }
    }
  };

  // Delete role
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus peran ini?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/roles/${roleId}`, {
        headers: getAuthHeaders(),
      });

      alert("Peran berhasil dihapus.");
      navigate("/admin/peran");
    } catch (err) {
      console.error("Delete gagal", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Anda tidak memiliki izin untuk menghapus peran ini.");
      } else {
        alert("Gagal menghapus peran. Cek console untuk detail.");
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Peran</h1>

      <form className="space-y-5" onSubmit={handleUpdate}>
        {/* Event */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Pilih Acara <span className="text-red-500">*</span>
          </label>
          <select
            className="border p-3 rounded"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            <option value="">-- Pilih Acara --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* Role Name */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Nama Peran <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="border p-3 rounded"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        {/* Slots Required */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Slot Diperlukan <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="border p-3 rounded"
            value={slotsRequired}
            onChange={(e) => setSlotsRequired(Number(e.target.value))}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Deskripsi</label>
          <textarea
            className="border p-3 rounded h-32 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/peran")}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Batal
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600"
            >
              Hapus Peran
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: "#4C68D5" }}
            >
              Perbarui Peran
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RoleEdit;
