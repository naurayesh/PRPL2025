import React, { useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

export default function AccountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get("returnTo") || "/admin/kelola-akun";

  const [form, setForm] = useState({
    name: "Nama Peserta",
    phone: "08xxxxxxxxxx",
    email: "peserta@email.com",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Data akun ${id} diperbarui!`);
    navigate(returnTo);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6">
        <Link
          to={returnTo}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          ← Kembali
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#043873] mb-6">Edit Data Akun</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4 max-w-md">
        <div>
          <label className="block font-medium mb-1">Nama Lengkap</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Nomor Telepon</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>

        <button type="submit" className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-800">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
