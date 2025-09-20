"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

interface BalanceOverviewProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function BalanceOverview({ selectedMonth, onMonthChange }: BalanceOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({
    total: 0,
    income: 0,
    expense: 0
  });

  // Mendapatkan daftar bulan untuk filter
  const months = [
    { value: "all", label: "Semua Bulan" },
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ];

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase
          .from("transactions")
          .select("amount, type, date")
          .eq("user_id", user.id);

        // Filter berdasarkan bulan jika tidak memilih "Semua Bulan"
        if (selectedMonth !== "all") {
          const startDate = `${currentYear}-${selectedMonth}-01`;
          const lastDay = new Date(currentYear, parseInt(selectedMonth), 0).getDate();
          const endDate = `${currentYear}-${selectedMonth}-${lastDay}`;
          
          console.log('Filter date range:', { startDate, endDate });
          
          query = query
            .gte("date", startDate)
            .lte("date", endDate);
        }

        const { data: transactions } = await query;
        
        console.log('Fetched transactions:', transactions);

        if (transactions) {
          const totals = transactions.reduce((acc: { income: number; expense: number }, transaction: { type: string; amount: number; date: string }) => {
            console.log('Processing transaction:', transaction);
            
            // Memastikan transaksi masuk ke bulan yang benar
            if (selectedMonth !== "all") {
              const transactionMonth = transaction.date.split('-')[1]; // Mengambil bulan dari tanggal
              if (transactionMonth !== selectedMonth) {
                console.log('Skipping transaction from different month:', transactionMonth);
                return acc;
              }
            }
            
            if (transaction.type === "Pemasukan") {
              acc.income += transaction.amount;
            } else {
              acc.expense += transaction.amount;
            }
            console.log('Current totals:', acc);
            return acc;
          }, { income: 0, expense: 0 });

          setBalance({
            income: totals.income,
            expense: totals.expense,
            total: totals.income - totals.expense
          });
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedMonth]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center">Memuat data...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter Bulan */}
      <div className="flex justify-center mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-green-500/10">
          <h3 className="text-sm font-medium text-green-400 mb-1">Total Pemasukan</h3>
          <p className="text-xl font-bold text-green-500">{formatRupiah(balance.income)}</p>
        </Card>
        
        <Card className="p-4 bg-red-500/10">
          <h3 className="text-sm font-medium text-red-400 mb-1">Total Pengeluaran</h3>
          <p className="text-xl font-bold text-red-500">{formatRupiah(balance.expense)}</p>
        </Card>
        
        <Card className="p-4 bg-blue-500/10">
          <h3 className="text-sm font-medium text-blue-400 mb-1">Sisa Saldo</h3>
          <p className="text-xl font-bold text-blue-500">{formatRupiah(balance.total)}</p>
        </Card>
      </div>
    </div>
  );
}