import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FiHome, FiBarChart2, FiLogOut, FiMenu } from "react-icons/fi";

export default function Sidebar({ hidden, setHidden }: { hidden: boolean; setHidden: (v: boolean) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [nama, setNama] = useState("");

  useEffect(() => {
    const fetchNama = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user?.id) {
        const { data: profile } = await supabase.from("profiles").select("nama").eq("id", user.user.id).single();
        setNama(profile?.nama || "");
      }
    };
    fetchNama();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (hidden) {
    return (
      <button
        className="fixed left-4 top-4 z-30 bg-gray-950 text-white px-4 py-3 rounded-lg shadow flex items-center"
        onClick={() => setHidden(false)}
        style={{ fontSize: 28 }}
        title="Show Sidebar"
      >
        <FiMenu size={32} />
      </button>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-gray-950 shadow-lg flex flex-col py-8 px-4 z-20 border-r border-gray-800">
      <button
        className="absolute right-4 top-4 text-gray-400 hover:text-white"
        onClick={() => setHidden(true)}
        title="Hide Sidebar"
        style={{ fontSize: 28 }}
      >
        <FiMenu size={32} />
      </button>
      <h2 className="text-3xl font-bold text-white mb-10 text-center tracking-wide"></h2>
      <nav className="flex flex-col gap-3 mb-auto">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded text-white font-medium hover:bg-gray-800 transition ${pathname === "/" ? "bg-gray-800" : ""}`}
          onClick={() => router.push("/")}
        >
          <FiHome size={20} /> Home
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded text-white font-medium hover:bg-gray-800 transition ${pathname === "/dashboard" ? "bg-gray-800" : ""}`}
          onClick={() => router.push("/dashboard")}
        >
          <FiBarChart2 size={20} /> Dashboard
        </button>
      </nav>
      {nama && (
        <div className="mb-4 text-center text-gray-300 font-semibold text-base">{nama}</div>
      )}
      <button
        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 justify-center transition"
        onClick={handleLogout}
      >
        <FiLogOut size={18} /> Logout
      </button>
    </aside>
  );
}