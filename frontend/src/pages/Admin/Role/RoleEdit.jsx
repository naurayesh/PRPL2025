import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const RoleEdit = () => {
  const navigate = useNavigate();
  const { roleId } = useParams(); // from URL: /admin/peran/edit/:roleId

  const API_BASE = process.env.REACT_APP_API_BASE;

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [requiredCount, setRequiredCount] = useState("");
  const [description, setDescription] = useState("");

  // Load events and existing role data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load events
        const eventsRes = await axios.get(`${API_BASE}/events`);
        setEvents(eventsRes.data.data);

        // Load role details
        const roleRes = await axios.get(`${API_BASE}/roles/detail/${roleId}`);
        const role = roleRes.data;

        setEventId(role.event_id);
        setRoleName(role.role_name);
        setDescription(role.description || "");
        setRequiredCount(role.required_count || 1);
      } catch (err) {
        console.error("Failed to load role or events", err);
        alert("Gagal memuat data peran.");
      }
    };

    loadInitialData();
  }, [roleId, API_BASE]);

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!eventId || !roleName || !requiredCount) {
      alert("Mohon isi semua field wajib (yang bertanda bintang ✦)");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/roles/${roleId}`,
        {
          event_id: eventId,
          role_name: roleName,
          required_count: Number(requiredCount),
          description: description,
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_ADMIN_KEY,
          },
        }
      );

      alert("Peran berhasil diperbarui!");
      navigate("/admin/peran");
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Gagal memperbarui peran.");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus peran ini? Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/roles/${roleId}`, {
        headers: { "x-api-key": process.env.REACT_APP_ADMIN_KEY },
      });

      alert("Peran berhasil dihapus.");
      navigate("/admin/peran");
    } catch (err) {
      console.error("Failed to delete role", err);
      alert("Gagal menghapus peran.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Peran</h1>

      <form className="space-y-5" onSubmit={handleUpdate}>
        {/* EVENT DROPDOWN */}
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
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* ROLE NAME */}
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

        {/* REQUIRED COUNT */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Jumlah Diperlukan <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="border p-3 rounded"
            value={requiredCount}
            onChange={(e) => setRequiredCount(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Deskripsi Tugas</label>
          <textarea
            className="border p-3 rounded h-32 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* BUTTONS */}
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