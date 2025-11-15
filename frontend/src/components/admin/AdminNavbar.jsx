import React from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Navbar({ toggleSidebar }) {
  const location = useLocation();
  const path = location.pathname;

  const getPageTitle = () => {
    if (path === "/admin" || path === "/admin/dashboard") return "Dashboard";
    if (path.startsWith("/admin/acara/tambah")) return "Buat Acara";
    if (path.startsWith("/admin/edit-acara")) return "Edit Acara";
    if (path.startsWith("/admin/acara")) return "Acara";
    if (path.startsWith("/admin/kehadiran")) return "Kehadiran";
    if (path.startsWith("/admin/peran")) return "Peran";
    if (path.startsWith("/admin/kelola-akun")) return "Kelola Akun";
    if (path.startsWith("/admin/pengumuman")) return "Pengumuman";
    return "Admin Panel";
  };

  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-blue-800 text-white shadow-md">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-blue-700 transition"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold">{getPageTitle()}</h1>
      </div>
    </nav>
  );
}
