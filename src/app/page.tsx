"use client";
import { useState, useEffect } from "react";
import { Card, ThemeWrapper } from "@/components/ui";
import TransactionForm from "@/components/TransactionForm";
import Sidebar from "@/components/Sidebar";
import BalanceOverview from "@/components/BalanceOverview";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [sidebarHidden, setSidebarHidden] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSidebarState = localStorage.getItem("sidebarHidden");
    if (storedSidebarState !== null) {
      setSidebarHidden(JSON.parse(storedSidebarState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarHidden", JSON.stringify(sidebarHidden));
  }, [sidebarHidden]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user?.id) {
        window.location.href = "/login";
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="text-center py-20 text-white">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar hidden={sidebarHidden} setHidden={setSidebarHidden} />
      <ThemeWrapper>
        <div className={`transition-all duration-300 ${sidebarHidden ? "" : "ml-64"}`}>
          <div className="flex flex-col gap-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-extrabold">Dashboard Keuangan Pribadi</h1>
              <p className="text-muted max-w-xl mx-auto">
                Selamat datang di aplikasi keuangan pribadi! Kelola transaksi, kategori, dan pantau keuangan Anda dengan mudah dan aman.
              </p>
            </div>
            
            <BalanceOverview />
            
            <div className="max-w-xl mx-auto p-6 mb-6">
              <TransactionForm />
            </div>
          </div>
        </div>
      </ThemeWrapper>
    </div>
  );
}

