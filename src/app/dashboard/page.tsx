"use client";
import { useEffect, useState } from "react";

type Transaction = {
  id?: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  user_id: string;
  type: "Pengeluaran" | "Pemasukan";
};

type Category = {
  id?: string;
  name: string;
  type: "Pengeluaran" | "Pemasukan";
  user_id?: string;
};
import { supabase, getUser } from "@/lib/supabaseClient";
import TransactionForm from "@/components/TransactionForm";
import Sidebar from "@/components/Sidebar";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [summaryMonth, setSummaryMonth] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState("");
  const [nama, setNama] = useState("");

  // Format bulan ke nama
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  function formatMonth(ym: string) {
    const [year, month] = ym.split("-");
    if (!year || !month) return ym;
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  }

  // Format tanggal
  function formatTanggal(tanggal: string) {
    if (!tanggal) return "";
    const [year, month, day] = tanggal.split("-");
    if (!year || !month || !day) return tanggal;
    return `${parseInt(day, 10)} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
  }

  // Filter transaksi
  const filteredTransactions = selectedMonth
    ? transactions.filter((tx) => tx.date?.slice(0, 7) === selectedMonth)
    : transactions;

  // Filter transaksi untuk keterangan saldo
  const summaryTransactions = summaryMonth
    ? transactions.filter((tx) => tx.date?.slice(0, 7) === summaryMonth)
    : transactions;
  const totalKredit = summaryTransactions.filter((tx) => tx.type === "Pemasukan").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalDebit = summaryTransactions.filter((tx) => tx.type === "Pengeluaran").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const sisaSaldo = totalKredit - totalDebit;

  // Grafik: data bulanan
  type MonthlyAgg = { pemasukan: number; pengeluaran: number };
  const monthlyData: Record<string, MonthlyAgg> = {};
  transactions.forEach((tx) => {
    const month = tx.date?.slice(0, 7) || "";
    if (!monthlyData[month]) monthlyData[month] = { pemasukan: 0, pengeluaran: 0 };
    if (tx.type === "Pemasukan") monthlyData[month].pemasukan += Number(tx.amount);
    else monthlyData[month].pengeluaran += Number(tx.amount);
  });
  const months = Object.keys(monthlyData).sort();
  const pemasukanPerBulan = months.map((m) => monthlyData[m].pemasukan);
  const pengeluaranPerBulan = months.map((m) => monthlyData[m].pengeluaran);

  // Grafik: komposisi kategori
  const kategoriData: Record<string, number> = {};
  transactions.forEach((tx) => {
    kategoriData[tx.category] = (kategoriData[tx.category] || 0) + Number(tx.amount);
  });
  const kategoriLabels = Object.keys(kategoriData);
  const kategoriValues = kategoriLabels.map((k) => kategoriData[k]);

  // Grafik: total bulanan
  const totalBulanan = months.map((m) => pemasukanPerBulan[months.indexOf(m)] - pengeluaranPerBulan[months.indexOf(m)]);

  useEffect(() => {
      const checkAuthAndFetch = async () => {
        const user = await getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }
        setLoading(true);
        const { data, error } = await supabase.from("transactions").select("*");
        if (!error && data) setTransactions(data);
        setLoading(false);
      };
      checkAuthAndFetch();
    }, []);

    useEffect(() => {
      const fetchCategories = async () => {
        const { data } = await supabase.from("categories").select("name");
        setCategories(data ? data.map((cat: { name: string }) => cat.name) : []);
      };
      fetchCategories();
    }, []);

    const refreshTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("transactions").select("*");
      if (!error && data) setTransactions(data);
      setLoading(false);
    };

    const handleDelete = async (id: string) => {
      setLoading(true);
      await supabase.from("transactions").delete().eq("id", id);
      await refreshTransactions();
      setLoading(false);
    };

    const handleEdit = async (id: string) => {
      setLoading(true);
      await supabase.from("transactions").update(editData).eq("id", id);
      setEditId(null);
      setEditData({});
      await refreshTransactions();
      setLoading(false);
    };

    useEffect(() => {
      const checkUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (!data?.user?.id) {
          window.location.href = "/login";
        } else {
          setUserId(data.user.id);
          // Ambil nama dari tabel profiles
          const { data: profile } = await supabase.from("profiles").select("nama").eq("id", data.user.id).single();
          setNama(profile?.nama || "");
        }
        setLoadingUser(false);
      };
      checkUser();
    }, []);

    if (loadingUser) return <div className="text-center py-20 text-white">Loading...</div>;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white ${sidebarHidden ? '' : 'pl-60'} flex flex-col min-w-full`}>
      {/* Sidebar */}
      <Sidebar hidden={sidebarHidden} setHidden={setSidebarHidden} />
      {/* Judul Halaman */}
      <div className="w-full flex justify-center items-center pt-8 pb-2">
        <h1 className="text-4xl font-extrabold mb-2 text-center drop-shadow-lg">Dashboard Keuangan</h1>
      </div>
      {/* Penjelasan singkat */}
      <div className="w-full flex justify-center mb-6">
        <p className="text-gray-300 text-center max-w-xl">Pantau pemasukan, pengeluaran, dan saldo Anda dengan grafik serta tabel transaksi yang responsif di semua perangkat.</p>
      </div>
      {/* Konten utama: grid 1 kolom di mobile, 2 kolom di desktop */}
      <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-start px-2 md:px-8">
        <div className="flex-1 flex flex-col gap-6">
          {/* Keterangan Saldo */}
          <div className="bg-gray-950 rounded-xl shadow-lg p-6 mb-2">
            <div className="mb-2 flex flex-col md:flex-row items-center gap-2 justify-center">
              <label className="text-white text-sm">Filter Bulan Saldo:</label>
              <select
                value={summaryMonth}
                onChange={e => setSummaryMonth(e.target.value)}
                className="p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Bulan</option>
                {months.map((m) => (
                  <option key={m} value={m}>{formatMonth(m)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-900 rounded-lg px-6 py-4 text-center shadow">
                <div className="text-sm text-gray-400 mb-1">Sisa Saldo</div>
                <div className="text-2xl font-bold text-green-400">Rp {sisaSaldo.toLocaleString()}</div>
              </div>
              <div className="bg-gray-900 rounded-lg px-6 py-4 text-center shadow">
                <div className="text-sm text-gray-400 mb-1">Kredit (Pemasukan)</div>
                <div className="text-xl font-bold text-green-500">Rp {totalKredit.toLocaleString()}</div>
              </div>
              <div className="bg-gray-900 rounded-lg px-6 py-4 text-center shadow">
                <div className="text-sm text-gray-400 mb-1">Debit (Pengeluaran)</div>
                <div className="text-xl font-bold text-red-500">Rp {totalDebit.toLocaleString()}</div>
              </div>
            </div>
          </div>
          {/* Form Transaksi */}
          <div className="bg-gray-950 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white text-center">Tambah Transaksi</h2>
            <TransactionForm onSuccess={refreshTransactions} />
          </div>
        </div>
        {/* Grafik */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-gray-900 rounded-xl p-4 shadow flex flex-col items-center md:max-w-[350px] md:mx-auto">
            <div className="font-bold mb-2 text-white text-center">Grafik Pemasukan & Pengeluaran per Bulan</div>
            <div className="w-full h-[240px] md:h-[280px]">
              <Line
                data={{
                  labels: months.map(m => formatMonth(m)),
                  datasets: [
                    {
                      label: "Pemasukan",
                      data: pemasukanPerBulan,
                      borderColor: "#22c55e",
                      backgroundColor: "rgba(34,197,94,0.3)",
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: "#22c55e",
                      pointRadius: 5,
                      pointBorderWidth: 2,
                    },
                    {
                      label: "Pengeluaran",
                      data: pengeluaranPerBulan,
                      borderColor: "#ef4444",
                      backgroundColor: "rgba(239,68,68,0.3)",
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: "#ef4444",
                      pointRadius: 5,
                      pointBorderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: "#fff", font: { size: 13, weight: "bold" } },
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: Rp ${context.parsed.y.toLocaleString()}`;
                        }
                      },
                      backgroundColor: "#222",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#22c55e",
                      borderWidth: 1,
                    },
                  },
                  animation: {
                    duration: 1500,
                    easing: "easeOutCubic",
                  },
                  scales: {
                    x: {
                      ticks: { color: "#fff", font: { size: 12 } },
                      grid: { color: "#333" },
                    },
                    y: {
                      ticks: { color: "#fff", font: { size: 12 } },
                      grid: { color: "#333" },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 shadow flex flex-col items-center md:max-w-[350px] md:mx-auto">
            <div className="font-bold mb-2 text-white text-center">Komposisi Kategori</div>
            <div className="w-full h-[240px] md:h-[280px]">
              <Pie
                data={{
                  labels: kategoriLabels,
                  datasets: [
                    {
                      data: kategoriValues,
                      backgroundColor: [
                        "rgba(34,197,94,0.8)",
                        "rgba(239,68,68,0.8)",
                        "rgba(59,130,246,0.8)",
                        "rgba(234,179,8,0.8)",
                        "rgba(162,28,175,0.8)",
                        "rgba(245,158,66,0.8)"
                      ],
                      borderColor: [
                        "#22c55e",
                        "#ef4444",
                        "#3b82f6",
                        "#eab308",
                        "#a21caf",
                        "#f59e42"
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: "#fff", font: { size: 13, weight: "bold" } },
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: Rp ${context.parsed.toLocaleString()}`;
                        }
                      },
                      backgroundColor: "#222",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#22c55e",
                      borderWidth: 1,
                    },
                  },
                  animation: {
                    animateScale: true,
                    duration: 1500,
                    easing: "easeOutCubic",
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 shadow flex flex-col items-center md:max-w-[400px] md:mx-auto">
            <div className="font-bold mb-2 text-white text-center">Perbandingan Pemasukan vs Pengeluaran per Bulan</div>
            <div className="w-full h-[240px] md:h-[280px]">
              <Bar
                data={{
                  labels: months.map(m => formatMonth(m)),
                  datasets: [
                    {
                      label: "Pemasukan",
                      data: pemasukanPerBulan,
                      backgroundColor: (ctx) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
                        gradient.addColorStop(0, "#4ade80");
                        gradient.addColorStop(1, "#22c55e");
                        return gradient;
                      },
                      borderRadius: 8,
                      barPercentage: 0.6,
                      categoryPercentage: 0.5,
                    },
                    {
                      label: "Pengeluaran",
                      data: pengeluaranPerBulan,
                      backgroundColor: (ctx) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
                        gradient.addColorStop(0, "#f87171");
                        gradient.addColorStop(1, "#ef4444");
                        return gradient;
                      },
                      borderRadius: 8,
                      barPercentage: 0.6,
                      categoryPercentage: 0.5,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: "#fff", font: { size: 13, weight: "bold" } },
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: Rp ${context.parsed.y.toLocaleString()}`;
                        }
                      },
                      backgroundColor: "#222",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#22c55e",
                      borderWidth: 1,
                    },
                  },
                  animation: {
                    duration: 1500,
                    easing: "easeOutCubic",
                  },
                  scales: {
                    x: {
                      ticks: { color: "#fff", font: { size: 12 } },
                      grid: { color: "#333" },
                    },
                    y: {
                      ticks: { color: "#fff", font: { size: 12 } },
                      grid: { color: "#333" },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Filter by month dan tabel transaksi */}
      <div className="w-full bg-gray-950 rounded-xl shadow-lg p-4 mt-8 overflow-x-auto">
        <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
          <label className="text-white text-sm">Filter Bulan:</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Bulan</option>
            {months.map((m) => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Deskripsi</th>
              <th className="p-3">Nominal</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-800">
                <td className="p-3">{editId === tx.id ? (
                  <input value={editData.date ?? tx.date} onChange={e => setEditData({ ...editData, date: e.target.value })} className="bg-gray-800 text-white p-1 rounded w-full" />
                ) : formatTanggal(tx.date)}</td>
                <td className="p-3">{editId === tx.id ? (
                  <select
                    value={editData.category ?? tx.category}
                    onChange={e => setEditData({ ...editData, category: e.target.value })}
                    className="bg-gray-800 text-white p-1 rounded w-full"
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : tx.category}</td>
                <td className="p-3">{editId === tx.id ? (
                  <input value={editData.description ?? tx.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="bg-gray-800 text-white p-1 rounded w-full" />
                ) : (tx.description || '-')}</td>
                <td className="p-3">{editId === tx.id ? (
                    <input type="number" value={editData.amount ?? tx.amount} onChange={e => setEditData({ ...editData, amount: Number(e.target.value) })} className="bg-gray-800 text-white p-1 rounded w-full" />
                ) : (
                  <span>
                    Rp {tx.amount}
                    {tx.type === "Pemasukan" ? (
                      <span className="ml-2 px-2 py-1 rounded bg-green-600 text-white text-xs font-bold">Pemasukan</span>
                    ) : (
                      <span className="ml-2 px-2 py-1 rounded bg-red-600 text-white text-xs font-bold">Pengeluaran</span>
                    )}
                  </span>
                )}</td>
                <td className="p-3">
                  {editId === tx.id ? (
                    <>
                        <button className="bg-blue-600 text-white px-2 py-1 rounded mr-2" onClick={() => handleEdit(tx.id ?? "")} disabled={loading}>Simpan</button>
                      <button className="bg-gray-600 text-white px-2 py-1 rounded" onClick={() => { setEditId(null); setEditData({}); }} disabled={loading}>Batal</button>
                    </>
                  ) : (
                    <>
                        <button className="bg-yellow-600 text-white px-2 py-1 rounded mr-2" onClick={() => { setEditId(tx.id ?? ""); setEditData(tx); }} disabled={loading}>Edit</button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(tx.id ?? "")} disabled={loading}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Catatan UI: Penjelasan perbaikan */}
      <div className="w-full flex justify-center mt-8">
        <div className="bg-gray-900 rounded-lg p-4 text-gray-400 text-sm max-w-lg text-center">
          <p>Halaman dashboard telah dirapikan agar responsif di perangkat mobile dan desktop, dengan tata letak grid/flex, card style konsisten, judul section, dan penjelasan singkat.</p>
        </div>
      </div>
    </div>
  );
}
