// Kelola Peran
import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const RoleManagement = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [roles, setRoles] = useState([]);
  const [participants, setParticipants] = useState([]); // may remain []
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingParticipantsError, setLoadingParticipantsError] = useState(null);

  // Helper: get auth headers (access token + admin key)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (process.env.REACT_APP_ADMIN_KEY)
      headers["x-api-key"] = process.env.REACT_APP_ADMIN_KEY;
    return headers;
  };

  // FETCH EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/events`);
        // backend returns { success: True, data: [...] } -> use res.data.data if exists
        setEvents(res.data?.data ?? res.data ?? []);
      } catch (err) {
        console.error("Failed to load events", err);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

// When an event is selected, fetch roles AND try to fetch participants (safe)
// When an event is selected, fetch roles AND participants safely
// When an event is selected, fetch roles AND participants safely
useEffect(() => {
  if (!selectedEvent) {
    setRoles([]);
    setParticipants([]);
    setLoadingParticipantsError(null);
    return;
  }

  const loadData = async () => {
    let backendRoles = [];
    let participantsData = [];
    let participantError = null;

    try {
      // 1) fetch roles from correct endpoint
      const rolesRes = await axios.get(`${API_BASE}/roles/event/${selectedEvent}`, {
        headers: getAuthHeaders(),
      });
      backendRoles = rolesRes.data ?? rolesRes.data?.data ?? [];

      // 2) fetch participants
      try {
        const pRes = await axios.get(`${API_BASE}/participants/${selectedEvent}`, {
          headers: getAuthHeaders(),
        });
        participantsData = pRes.data ?? pRes.data?.data ?? [];
      } catch (err1) {
        try {
          const pRes2 = await axios.get(`${API_BASE}/events/${selectedEvent}/participants`, {
            headers: getAuthHeaders(),
          });
          participantsData = pRes2.data ?? pRes2.data?.data ?? [];
        } catch (err2) {
          console.warn("Failed to load participants from both endpoints:", err1, err2);
          participantsData = [];
          participantError = err2 || err1;
        }
      }

      // set state
      setRoles(Array.isArray(backendRoles) ? backendRoles : []);
      setParticipants(Array.isArray(participantsData) ? participantsData : []);
      setLoadingParticipantsError(participantError);

    } catch (err) {
      console.error("Failed to load roles or participants", err);
      setRoles([]);
      setParticipants([]);
      setLoadingParticipantsError(err);
    }
  };

  loadData();
}, [selectedEvent]);

  // Merge participants -> role for display (safe even if participants = [])
  const mergedRoles = roles.map((role) => {
    // find a participant assigned to this role (participant.role_id should equal role.id)
    const assigned = participants.find((p) => {
      // participants from different backends might use role_id or roleId naming — tolerate both
      return (p.role_id ?? p.roleId ?? p.roleId) === role.id;
    });

    // assigned_to: try to show a human-friendly name if available, otherwise show user_id
    let assignedTo = null;
    if (assigned) {
      // participant might include a populated user object or a user_id
      if (assigned.user && (assigned.user.full_name || assigned.user.email)) {
        assignedTo = assigned.user.full_name ?? assigned.user.email;
      } else if (assigned.user_full_name) {
        assignedTo = assigned.user_full_name;
      } else {
        assignedTo = assigned.user_id ?? assigned.userId ?? null;
      }
    }

    return {
      ...role,
      assigned_to: assignedTo,
      assigned_participant_id: assigned ? assigned.id : null,
    };
  });

  // Counters
  const totalRoles = mergedRoles.length;
  const filledRoles = mergedRoles.filter((r) => r.assigned_to).length;
  const emptyRoles = totalRoles - filledRoles;

  // Search filter
  const filteredRoles = mergedRoles.filter((role) => {
    if (!searchTerm.trim()) return true;
    const target = (role.assigned_to ?? "").toString().toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  // REMOVE ROLE ASSIGNMENT
  const removeAssignment = async (participantId) => {
    if (!participantId) {
      alert("Peran ini belum memiliki penugasan.");
      return;
    }

    if (!window.confirm("Hapus penugasan dari peran ini?")) return;

    try {
      await axios.put(
        `${API_BASE}/participants/${participantId}/unassign-role`,
        null,
        { headers: getAuthHeaders() }
      );

      // successful — refresh participants list for this event (best practice)
      // attempt same endpoints as before (safe/forgiving)
      try {
        const pRes = await axios.get(`${API_BASE}/participants/${selectedEvent}`, {
          headers: getAuthHeaders(),
        });
        setParticipants(pRes.data ?? pRes.data?.data ?? []);
      } catch (e1) {
        try {
          const pRes2 = await axios.get(`${API_BASE}/events/${selectedEvent}/participants`, {
            headers: getAuthHeaders(),
          });
          setParticipants(pRes2.data ?? pRes2.data?.data ?? []);
        } catch (e2) {
          // can't refresh participants; at least locally update mergedRoles by removing assignment
          setParticipants((prev) => prev.filter((p) => p.id !== participantId));
          console.warn("Could not refresh participants after unassign:", e1, e2);
        }
      }
    } catch (err) {
      console.error("Failed to unassign", err);
      // If CORS or network error, give a helpful message
      if (!err.response) {
        alert(
          "Network/CORS error while trying to unassign. Check backend is running and CORS settings."
        );
      } else if (err.response.status === 401 || err.response.status === 403) {
        alert("Unauthorized — please login as admin.");
      } else {
        alert("Gagal menghapus penugasan. Cek console untuk detail.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Kelola Peran</h1>

      {/* Event selector */}
      <div className="flex items-center gap-4">
        <select
          className="border p-2 rounded w-60"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">Pilih Acara</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate("/admin/peran/tambah")}
        >
          + Peran Baru
        </button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded shadow text-center">
          <p className="text-gray-600">Total Peran</p>
          <p className="text-2xl font-bold">{totalRoles}</p>
        </div>

        <div className="p-4 border rounded shadow text-center bg-green-100">
          <p className="text-gray-600">Peran Terisi</p>
          <p className="text-2xl font-bold text-green-700">{filledRoles}</p>
        </div>

        <div className="p-4 border rounded shadow text-center bg-red-100">
          <p className="text-gray-600">Peran Kosong</p>
          <p className="text-2xl font-bold text-red-700">{emptyRoles}</p>
        </div>
      </div>

      {/* If we had trouble loading participants, show a subtle hint */}
      {loadingParticipantsError && (
        <div className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
          Tidak bisa memuat data peserta (participants). Peran akan tampil tanpa informasi penugasan.
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        className="border p-2 w-full rounded"
        placeholder="Cari nama anggota..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Roles */}
      <div className="space-y-4">
        {filteredRoles.map((role) => (
          <div key={role.id} className="border rounded p-4 shadow bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{role.role_name}</h2>
                <p className="text-gray-600">{role.permissions}</p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/admin/peran/edit/${role.id}`)}>
                  <FiEdit2 className="text-blue-600 text-xl" />
                </button>

                <span className="px-3 py-1 bg-gray-200 rounded text-sm font-semibold">
                  {role.assigned_to ? "1/1" : "0/1"}
                </span>
              </div>
            </div>

            <hr className="my-3" />

            <p className="text-gray-500 text-sm">Ditugaskan kepada:</p>

            {role.assigned_to ? (
              <p className="font-medium mt-1">{role.assigned_to}</p>
            ) : (
              <p className="text-gray-400 italic">Belum ditugaskan</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                className="w-3/4 bg-yellow-500 text-white py-2 rounded"
                onClick={() =>
                  navigate(`/admin/peran/tugaskan/${role.id}`, {
                    state: { eventId: selectedEvent },
                  })
                }
              >
                Ubah Penugasan
              </button>

              <button
                className="w-1/4 bg-red-600 text-white py-2 rounded flex justify-center"
                onClick={() => removeAssignment(role.assigned_participant_id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;
