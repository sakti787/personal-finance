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
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-950 p-4 rounded-lg shadow w-full max-w-xs mx-auto">
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
      <div className="mb-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="" disabled>Pilih Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <input
          type="text"
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
