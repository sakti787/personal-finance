"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, ThemeWrapper, Input, Button } from "@/components/ui";
import { DashboardChart } from "@/components/DashboardChart";
import { PieChart } from "@/components/PieChart";
import BalanceOverview from "@/components/BalanceOverview";
import { supabase, getUser } from "@/lib/supabaseClient";
import TransactionForm from "@/components/TransactionForm";
import Sidebar from "@/components/Sidebar";

type Transaction = {
  id?: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  user_id: string;
  type: "Pengeluaran" | "Pemasukan";
  bukti_url?: string;
};


export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarHidden, setSidebarHidden] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'category' | 'amount' | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  useEffect(() => {
    const storedSidebarState = localStorage.getItem("sidebarHidden");
    if (storedSidebarState !== null) {
      setSidebarHidden(JSON.parse(storedSidebarState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarHidden", JSON.stringify(sidebarHidden));
  }, [sidebarHidden]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  
  // State untuk filter bulan di BalanceOverview dan PieChart
  const getCurrentMonth = () => {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return month;
  };
  const [balanceSelectedMonth, setBalanceSelectedMonth] = useState(getCurrentMonth());
  
  const [loadingUser, setLoadingUser] = useState(true);
  

  const allMonths = [...new Set(transactions.map(tx => tx.date.slice(0, 7)))].sort();

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
  // Urutkan transaksi berdasarkan tanggal terbaru
  const sortedTransactions = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  const filteredTransactions = selectedMonth
    ? sortedTransactions.filter((tx) => tx.date?.slice(0, 7) === selectedMonth)
    : sortedTransactions;

  // Grafik: data bulanan (menggunakan semua transaksi tanpa filter)
  type MonthlyAgg = { pemasukan: number; pengeluaran: number };
  const monthlyDataChart: Record<string, MonthlyAgg> = {};
  sortedTransactions.forEach((tx) => {
    const month = tx.date?.slice(0, 7) || "";
    if (!monthlyDataChart[month]) monthlyDataChart[month] = { pemasukan: 0, pengeluaran: 0 };
    if (tx.type === "Pemasukan") monthlyDataChart[month].pemasukan += Number(tx.amount);
    else monthlyDataChart[month].pengeluaran += Number(tx.amount);
  });
  const chartMonths = Object.keys(monthlyDataChart).sort();
  const chartPemasukanPerBulan = chartMonths.map((m) => monthlyDataChart[m].pemasukan);
  const chartPengeluaranPerBulan = chartMonths.map((m) => monthlyDataChart[m].pengeluaran);

  // Data bulanan untuk tabel (tetap menggunakan filter)
  const monthlyData: Record<string, MonthlyAgg> = {};
  filteredTransactions.forEach((tx) => {
    const month = tx.date?.slice(0, 7) || "";
    if (!monthlyData[month]) monthlyData[month] = { pemasukan: 0, pengeluaran: 0 };
    if (tx.type === "Pemasukan") monthlyData[month].pemasukan += Number(tx.amount);
    else monthlyData[month].pengeluaran += Number(tx.amount);
  });
  const months = Object.keys(monthlyData).sort();
  const pemasukanPerBulan = months.map((m) => monthlyData[m].pemasukan);
  const pengeluaranPerBulan = months.map((m) => monthlyData[m].pengeluaran);

  // Grafik: komposisi kategori (menggunakan filter yang sama dengan BalanceOverview)
  const currentYear = new Date().getFullYear();
  const kategoriData: Record<string, number> = {};
  
  // Filter transaksi berdasarkan balanceSelectedMonth
  const pieChartTransactions = balanceSelectedMonth === "all" 
    ? sortedTransactions.filter((tx) => tx.type === "Pengeluaran")
    : sortedTransactions.filter((tx) => {
        if (tx.type !== "Pengeluaran") return false;
        const transactionMonth = tx.date?.split('-')[1];
        return transactionMonth === balanceSelectedMonth;
      });

  pieChartTransactions.forEach((tx) => {
    kategoriData[tx.category] = (kategoriData[tx.category] || 0) + Number(tx.amount);
  });
  const kategoriLabels = Object.keys(kategoriData);
  const kategoriValues = Object.values(kategoriData);

  

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
        }
        setLoadingUser(false);
      };
      checkUser();
    }, []);

    if (loadingUser) return <div className="text-center py-20 text-white">Loading...</div>;

  return (
    <div className={`${sidebarHidden ? '' : 'pl-60'}`}>
      <Sidebar hidden={sidebarHidden} setHidden={setSidebarHidden} />
      <ThemeWrapper>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Dashboard Keuangan
            </h1>
            <p className="text-muted max-w-xl mx-auto">
              Pantau pemasukan, pengeluaran, dan saldo Anda dengan grafik serta tabel transaksi yang responsif.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Balance Overview */}
              <BalanceOverview 
                selectedMonth={balanceSelectedMonth}
                onMonthChange={setBalanceSelectedMonth}
              />

              {/* Form Transaksi */}
              <Card>
                <h2 className="text-xl font-bold mb-6">Tambah Transaksi</h2>
                <TransactionForm onSuccess={refreshTransactions} />
              </Card>
            </div>

            {/* Grafik */}
            <div className="space-y-8">
              <div className="space-y-8">
                <PieChart labels={kategoriLabels} values={kategoriValues} />
                <DashboardChart
                  data={chartMonths.map((month, index) => ({
                    month: formatMonth(month),
                    pemasukan: chartPemasukanPerBulan[index],
                    pengeluaran: chartPengeluaranPerBulan[index],
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Filter and Table */}
          <Card className="overflow-x-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                >
                  <option value="">Semua Bulan</option>
                  {allMonths.map((m) => (
                    <option key={m} value={m}>{formatMonth(m)}</option>
                  ))}
                </select>
              </div>

              <h2 className="text-xl font-bold m-0">Tabel Transaksi</h2>

              <Button
                variant="secondary"
                onClick={() => {
                  const csvRows = [
                    ["Tanggal", "Kategori", "Deskripsi", "Nominal", "Jenis"],
                    ...filteredTransactions.map(tx => [
                      tx.date,
                      tx.category,
                      tx.description || "",
                      tx.amount,
                      tx.type
                    ])
                  ];
                  const csvContent = csvRows.map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  const now = new Date();
                  const pad = (n: number) => n.toString().padStart(2, "0");
                  const filename = `transaksi-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}.csv`;
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Download CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th 
                      className="py-3 text-left cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => {
                        setSortConfig({
                          key: 'date',
                          direction: sortConfig.key === 'date' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                        });
                      }}
                    >
                      Tanggal {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="py-3 text-left cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => {
                        setSortConfig({
                          key: 'category',
                          direction: sortConfig.key === 'category' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                        });
                      }}
                    >
                      Kategori {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 text-left">Deskripsi</th>
                    <th className="py-3 text-left">Bukti</th>
                    <th 
                      className="py-3 text-left cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => {
                        setSortConfig({
                          key: 'amount',
                          direction: sortConfig.key === 'amount' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                        });
                      }}
                    >
                      Nominal {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredTransactions
                    .sort((a, b) => {
                      if (!sortConfig.key) return 0;
                      
                      let comparison = 0;
                      if (sortConfig.key === 'date') {
                        comparison = a.date.localeCompare(b.date);
                      } else if (sortConfig.key === 'category') {
                        comparison = a.category.localeCompare(b.category);
                      } else if (sortConfig.key === 'amount') {
                        comparison = a.amount - b.amount;
                      }
                      
                      return sortConfig.direction === 'asc' ? comparison : -comparison;
                    })
                    .map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3">
                        {editId === tx.id ? (
                          <Input
                            type="date"
                            value={editData.date ?? tx.date}
                            onChange={e => setEditData({ ...editData, date: e.target.value })}
                          />
                        ) : (
                          formatTanggal(tx.date)
                        )}
                      </td>
                      <td className="py-3">
                        {editId === tx.id ? (
                          <Input
                            as="select"
                            value={editData.category ?? tx.category}
                            onChange={e => setEditData({ ...editData, category: e.target.value })}
                          >
                            <option value="" disabled>Pilih Kategori</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </Input>
                        ) : (
                          tx.category
                        )}
                      </td>
                      <td className="py-3">
                        {editId === tx.id ? (
                          <Input
                            value={editData.description ?? tx.description}
                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                          />
                        ) : (
                          tx.description || "-"
                        )}
                      </td>
                      <td className="py-3">
                        {tx.bukti_url ? (
                          <a href={tx.bukti_url} target="_blank" rel="noopener noreferrer">
                            <Image
                              src={tx.bukti_url}
                              alt="Bukti"
                              width={80}
                              height={48}
                              className="max-h-12 rounded-md border border-[var(--border)] shadow-sm"
                            />
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="py-3">
                        {editId === tx.id ? (
                          <Input
                            type="number"
                            value={editData.amount ?? tx.amount}
                            onChange={e => setEditData({ ...editData, amount: Number(e.target.value) })}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Rp {tx.amount.toLocaleString()}</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tx.type === "Pemasukan"
                                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                                  : "bg-[var(--danger)]/10 text-[var(--danger)]"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          {editId === tx.id ? (
                            <>
                              <Button
                                onClick={() => handleEdit(tx.id ?? "")}
                                disabled={loading}
                              >
                                Simpan
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setEditId(null);
                                  setEditData({});
                                }}
                                disabled={loading}
                              >
                                Batal
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setEditId(tx.id ?? "");
                                  setEditData(tx);
                                }}
                                disabled={loading}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => handleDelete(tx.id ?? "")}
                                disabled={loading}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </ThemeWrapper>
    </div>
  );
}
