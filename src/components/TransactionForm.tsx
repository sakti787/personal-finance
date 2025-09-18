"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/imageCompress";

export default function TransactionForm({ refreshCategories, onSuccess }: { refreshCategories?: number; onSuccess?: () => void }) {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bukti, setBukti] = useState<File|null>(null);
  const [buktiUrl, setBuktiUrl] = useState<string>("");
  type Category = {
    id?: string;
    name: string;
    type: "Pengeluaran" | "Pemasukan";
    user_id?: string;
  };
  const [categories, setCategories] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [type, setType] = useState("Pengeluaran");
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const handleDeleteCategory = async (categoryName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Yakin ingin menghapus kategori "${categoryName}"?`)) {
      setDeletingCategory(categoryName);
      try {
        const { error } = await supabase
          .from("categories")
          .delete()
          .match({ name: categoryName, type, user_id: userId });
        
        if (error) throw error;
        
        // Refresh categories
        const { data } = await supabase.from("categories").select("name, type");
        const updatedCategories = data ? data
          .filter((cat: Category) => cat.type === type)
          .map((cat: Category) => cat.name) : [];
        setCategories(updatedCategories);
        
        // Reset selection if deleted category was selected
        if (category === categoryName) {
          setCategory("");
        }
        
        setSuccess("Kategori berhasil dihapus!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus kategori");
      }
      setDeletingCategory(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setAddingCategory(true);
    try {
      if (!userId) {
        throw new Error("User belum login");
      }
      const { error } = await supabase.from("categories").insert([
        { name: newCategory.trim(), type, user_id: userId }
      ]);
      if (error) throw error;
      // Refresh categories dan select kategori baru
      const { data } = await supabase.from("categories").select("name, type");
      setCategories(data ? data.filter((cat: Category) => cat.type === type).map((cat: Category) => cat.name) : []);
      setCategory(newCategory.trim());
      setNewCategory(""); // Clear input
      setSuccess("Kategori berhasil ditambahkan!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan kategori");
    }
    setAddingCategory(false);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("name, type");
      setCategories(data ? data.filter((cat: Category) => cat.type === type).map((cat: Category) => cat.name) : []);
    };
    fetchCategories();
  }, [refreshCategories, type]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || "");
    };
    getUser();
  }, []);

  const formatRupiah = (value: string) => {
    const num = value.replace(/[^\d]/g, "");
    if (!num) return "";
    return "Rp. " + num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    let uploadedUrl = "";
    try {
      if (bukti) {
        // Kompres gambar
        const compressed = await compressImage(bukti);
        // Upload ke Cloudinary
        const formData = new FormData();
        formData.append("file", compressed);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrl = data.secure_url;
          setBuktiUrl(uploadedUrl);
        } else {
          throw new Error("Gagal upload ke Cloudinary");
        }
      }
      if (!userId) {
        setError("User belum login");
        setLoading(false);
        return;
      }
      const { error } = await supabase.from("transactions").insert([
        { date, category, amount: Number(amount), description, user_id: userId, type, bukti_url: uploadedUrl },
      ]);
      if (error) setError(error.message);
      else {
        setDate("");
        setCategory("");
        setAmount("");
        setDescription("");
        setType("Pengeluaran");
        setBukti(null);
        setBuktiUrl("");
        setSuccess("Transaksi berhasil ditambahkan!");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      let message = "Terjadi kesalahan saat upload bukti";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-950 p-4 rounded-lg shadow w-full max-w-xs mx-auto relative overflow-hidden">
      {/* Background Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.15]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ transform: 'translateY(20%)' }}
        >
          <path
            d="M0,192 C320,256 420,128 740,192 C1060,256 1380,128 1440,160 V320 H0 Z"
            fill="rgb(147, 51, 234)"
            style={{
              animation: 'wave 25s ease-in-out infinite'
            }}
          />
        </svg>
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.1]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ transform: 'translateY(25%)' }}
        >
          <path
            d="M0,150 C320,210 420,90 740,150 C1060,210 1380,90 1440,120 V320 H0 Z"
            fill="rgb(147, 51, 234)"
            style={{
              animation: 'wave 30s ease-in-out infinite'
            }}
          />
        </svg>
      </div>
      
      <div className="mb-3">
        <label className="block mb-4 font-bold text-xl text-white text-center">Tambah Transaksi</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Pengeluaran">Pengeluaran</option>
          <option value="Pemasukan">Pemasukan</option>
        </select>
      </div>
      <div className="mb-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="space-y-2 mb-3">
        {/* Kategori dropdown dan daftar kategori */}
        <div className="grid grid-cols-[1fr,auto] gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {/* Tombol hapus hanya muncul jika ada kategori yang dipilih */}
          {category && (
            <button
              type="button"
              onClick={(e) => handleDeleteCategory(category, e)}
              disabled={deletingCategory === category}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingCategory === category ? "..." : "Hapus"}
            </button>
          )}
        </div>
        
        {/* Form tambah kategori baru */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah kategori baru..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={addingCategory || !newCategory.trim()}
            className="px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {addingCategory ? "..." : "Tambah"}
          </button>
        </div>
      </div>
      <div className="mb-3">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Nominal"
          value={formatRupiah(amount)}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Deskripsi (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-3">
        <label className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center cursor-pointer">
          <span>{bukti ? bukti.name : "Upload Bukti (opsional)"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              if (e.target.files && e.target.files[0]) setBukti(e.target.files[0]);
            }}
            className="hidden"
          />
        </label>
        {buktiUrl && (
          <Image src={buktiUrl} alt="Bukti" width={128} height={128} className="mt-2 max-h-32 rounded" />
        )}
      </div>
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
      {success && <p className="text-green-500 mb-3 text-sm">{success}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition duration-200"
        disabled={loading}
      >
        {loading ? "Menyimpan..." : "Tambah"}
      </button>
    </form>
  );
}
