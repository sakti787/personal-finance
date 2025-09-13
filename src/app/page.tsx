"use client";
import TransactionForm from "@/components/TransactionForm";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

function CategoryForm({ onCategoryAdded }: { onCategoryAdded?: () => void }) {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("Pengeluaran");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || "");
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!userId) {
      setError("User belum login");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("categories").insert([{ name: category, user_id: userId, type }]);
    if (error) setError(error.message);
    else {
      setSuccess("Kategori berhasil ditambah!");
      setCategory("");
      setType("Pengeluaran");
      if (onCategoryAdded) onCategoryAdded();
    }
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="bg-gray-950 p-4 rounded-lg shadow w-full max-w-xs mx-auto mt-4">
      <h3 className="text-lg font-bold mb-3 text-white text-center">Tambah Kategori</h3>
      <div className="mb-3">
        <label className="block mb-1 text-sm text-white">Jenis</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Pengeluaran">Pengeluaran</option>
          <option value="Pemasukan">Pemasukan</option>
        </select>
      </div>
      <input
        type="text"
        placeholder="Nama Kategori"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        required
      />
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
      {success && <p className="text-green-500 mb-3 text-sm">{success}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition duration-200"
        disabled={loading}
      >
        {loading ? "Menyimpan..." : "Tambah Kategori"}
      </button>
    </form>
  );
}

function CategoryTable({ refresh }: { refresh: number }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [localRefresh, setLocalRefresh] = useState(0);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || "");
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name, user_id, type");
      setCategories(data || []);
    };
    fetchCategories();
  }, [refresh, localRefresh]);

  const handleDelete = async (id: string) => {
    setLoading(true);
    setEditError("");
    setEditSuccess("");
    if (!userId) {
      setEditError("User belum login");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", userId);
    if (error) setEditError(error.message);
    else {
      setEditSuccess("Kategori berhasil dihapus!");
      const { data } = await supabase.from("categories").select("id, name, user_id, type");
      setCategories(data || []);
    }
    setLoading(false);
    setEditId(null);
    setLocalRefresh((v) => v + 1);
  };

  const handleEdit = async (id: string) => {
    setLoading(true);
    setEditError("");
    setEditSuccess("");
    if (!editName.trim()) {
      setEditError("Nama kategori tidak boleh kosong");
      setLoading(false);
      return;
    }
    if (!userId) {
      setEditError("User belum login");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("categories").update({ name: editName }).eq("id", id).eq("user_id", userId);
    if (error) setEditError(error.message);
    else {
      setEditSuccess("Kategori berhasil diubah!");
      const { data } = await supabase.from("categories").select("id, name, user_id, type");
      setCategories(data || []);
    }
    setLoading(false);
    setEditId(null);
    setLocalRefresh((v) => v + 1);
  };

  return (
    <div className="bg-gray-950 p-4 rounded-lg shadow w-full max-w-xs mx-auto mt-4">
      <h3 className="text-lg font-bold mb-3 text-white text-center">Daftar Kategori</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white">
            <th className="p-2">Nama</th>
            <th className="p-2">Jenis</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="p-2">
                {editId === cat.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-gray-800 text-white p-1 rounded w-full"
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td className="p-2">
                {cat.type}
              </td>
              <td className="p-2 flex gap-2">
                {editId === cat.id ? (
                  <>
                    <button className="bg-blue-600 px-2 py-1 rounded text-white" onClick={() => handleEdit(cat.id)} disabled={loading}>Simpan</button>
                    <button className="bg-gray-600 px-2 py-1 rounded text-white" onClick={() => setEditId(null)} disabled={loading}>Batal</button>
                  </>
                ) : (
                  <>
                    <button className="bg-yellow-600 px-2 py-1 rounded text-white" onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditError(""); setEditSuccess(""); }} disabled={loading}>Edit</button>
                    <button className="bg-red-600 px-2 py-1 rounded text-white" onClick={() => handleDelete(cat.id)} disabled={loading}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editError && <p className="text-red-500 mt-2 text-sm">{editError}</p>}
      {editSuccess && <p className="text-green-500 mt-2 text-sm">{editSuccess}</p>}
    </div>
  );
}

export default function HomePage() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [refreshCategories, setRefreshCategories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user?.id) {
        window.location.href = "/login";
      } else {
        setUserId(data.user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="text-center py-20 text-white">Memuat data...</div>;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white ${sidebarHidden ? '' : 'pl-60'} flex flex-col min-w-full`}>
      {/* Sidebar */}
      <Sidebar hidden={sidebarHidden} setHidden={setSidebarHidden} />
      {/* Judul Halaman */}
      <div className="w-full flex justify-center items-center pt-8 pb-2">
        <h1 className="text-4xl font-extrabold mb-2 text-center drop-shadow-lg">Dashboard Keuangan Pribadi</h1>
      </div>
      {/* Penjelasan singkat */}
      <div className="w-full flex justify-center mb-6">
        <p className="text-gray-300 text-center max-w-xl">Selamat datang di aplikasi keuangan pribadi! Kelola transaksi, kategori, dan pantau keuangan Anda dengan mudah dan aman.</p>
      </div>
      {/* Konten utama: grid 1 kolom di mobile, 2 kolom di desktop */}
      <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-start px-2 md:px-8">
        <div className="flex-1 flex flex-col gap-6">
          {/* Form Transaksi */}
          <div className="bg-gray-950 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white text-center">Tambah Transaksi</h2>
            <TransactionForm refreshCategories={refreshCategories} />
          </div>
          {/* Form Kategori */}
          <div className="bg-gray-950 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white text-center">Tambah Kategori</h2>
            <CategoryForm onCategoryAdded={() => setRefreshCategories((v) => v + 1)} />
          </div>
        </div>
        {/* Tabel Kategori */}
        <div className="flex-1">
          <div className="bg-gray-950 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white text-center">Daftar Kategori</h2>
            <CategoryTable refresh={refreshCategories} />
          </div>
        </div>
      </div>
      {/* Catatan UI: Penjelasan perbaikan */}
      <div className="w-full flex justify-center mt-8">
        <div className="bg-gray-900 rounded-lg p-4 text-gray-400 text-sm max-w-lg text-center">
          <p>Halaman ini telah dirapikan dengan tata letak grid/flex, card style konsisten, judul section, dan penjelasan singkat agar lebih mudah digunakan dan enak dilihat.</p>
        </div>
      </div>
    </div>
  );
}

