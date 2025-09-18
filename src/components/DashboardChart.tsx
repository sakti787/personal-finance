import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui";

interface ChartData {
  month: string;
  pemasukan: number;
  pengeluaran: number;
}

interface ChartProps {
  data: ChartData[];
  onChartClick?: (month: string, type: "pemasukan" | "pengeluaran") => void;
}

export const DashboardChart = ({ data, onChartClick }: ChartProps) => {
  const [activeBar, setActiveBar] = useState<{ month: string; type: "pemasukan" | "pengeluaran" } | null>(null);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    const max = Math.max(
      ...data.map(d => Math.max(d.pemasukan, d.pengeluaran))
    );
    setMaxValue(max);
  }, [data]);

  const chartHeight = 280;
  const containerWidth = data.length <= 2 ? 300 : 700; // Mengecilkan container width untuk membuat chart lebih rapat
  const barWidth = data.length <= 2 ? 40 : 25; // Mengecilkan lebar bar
  const roundedMax = Math.ceil(maxValue / 10000) * 10000;

  // Memastikan nilai tidak melebihi batas
  const getHeight = (value: number) => {
    const height = (value / roundedMax) * chartHeight;
    return Math.min(height, chartHeight); // Membatasi tinggi maksimal
  };

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="h-[300px]">
        {/* Background Waves */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 0.5 }}
          >
            <svg
              className="w-full h-full absolute inset-0"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M0,160 C320,180 420,0 740,120 C1060,240 1380,80 1440,160 V320 H0 Z"
                fill="rgb(147, 51, 234)"
                animate={{
                  d: [
                    "M0,160 C320,180 420,0 740,120 C1060,240 1380,80 1440,160 V320 H0 Z",
                    "M0,120 C320,140 420,200 740,80 C1060,0 1380,200 1440,120 V320 H0 Z",
                    "M0,160 C320,180 420,0 740,120 C1060,240 1380,80 1440,160 V320 H0 Z"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 10,
                  ease: "easeInOut"
                }}
              />
            </svg>
            <svg
              className="w-full h-full absolute inset-0"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ opacity: 0.7 }}
            >
              <motion.path
                d="M0,200 C300,100 600,300 900,200 C1200,100 1320,200 1440,160 V320 H0 Z"
                fill="rgb(147, 51, 234)"
                animate={{
                  d: [
                    "M0,200 C300,100 600,300 900,200 C1200,100 1320,200 1440,160 V320 H0 Z",
                    "M0,150 C300,250 600,100 900,150 C1200,200 1320,100 1440,200 V320 H0 Z",
                    "M0,200 C300,100 600,300 900,200 C1200,100 1320,200 1440,160 V320 H0 Z"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </svg>
          </motion.div>
        </div>
        
        <div className="w-full h-full flex justify-center relative">
          <div style={{ width: '100%', maxWidth: `${containerWidth}px` }} className="relative">
            {/* Grid lines and Y-axis labels */}
            <div className="absolute left-0 h-full flex flex-col justify-between text-sm text-muted">
              {[...Array(6)].map((_, i) => {
                const value = Math.round((roundedMax * (5 - i)) / 5);
                return (
                  <div key={i} className="flex items-center">
                    <span className="mr-2 w-24 text-right tabular-nums">
                      Rp {value.toLocaleString("id-ID")}
                    </span>
                    <div 
                      className="w-full border-t border-[var(--border)] absolute right-0" 
                      style={{ opacity: i === 5 ? "0.3" : "0.1" }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Bars */}
            <div className="pl-20 h-full flex items-end justify-center">
              <AnimatePresence>
                {data.map((item, index) => (
                  <div
                    key={item.month}
                    className="relative flex flex-col items-center mx-2 first:ml-0 last:mr-0"
                    style={{ width: `${barWidth * 2 + 2}px` }}
                  >
                    <div className="relative flex-1 flex flex-row items-end justify-center gap-1 w-full">
                      {/* Pemasukan Bar */}
                      <motion.div
                        className="relative flex justify-center"
                        initial={{ height: 0 }}
                        animate={{ height: getHeight(item.pemasukan) }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <motion.div
                          className={`rounded-t cursor-pointer transition-colors ${
                            activeBar?.month === item.month && activeBar.type === "pemasukan"
                              ? "opacity-100"
                              : "opacity-80 hover:opacity-90"
                          }`}
                          style={{ 
                            height: "100%",
                            width: `${barWidth}px`,
                            backgroundColor: "var(--success)"
                          }}
                          whileHover={{ scale: 1.05 }}
                          onHoverStart={() => setActiveBar({ month: item.month, type: "pemasukan" })}
                          onHoverEnd={() => setActiveBar(null)}
                          onClick={() => onChartClick?.(item.month, "pemasukan")}
                        />
                      </motion.div>

                      {/* Pengeluaran Bar */}
                      <motion.div
                        className="relative flex justify-center"
                        initial={{ height: 0 }}
                        animate={{ height: getHeight(item.pengeluaran) }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <motion.div
                          className={`rounded-t cursor-pointer transition-colors ${
                            activeBar?.month === item.month && activeBar.type === "pengeluaran"
                              ? "opacity-100"
                              : "opacity-80 hover:opacity-90"
                          }`}
                          style={{ 
                            height: "100%",
                            width: `${barWidth}px`,
                            backgroundColor: "var(--danger)"
                          }}
                          whileHover={{ scale: 1.05 }}
                          onHoverStart={() => setActiveBar({ month: item.month, type: "pengeluaran" })}
                          onHoverEnd={() => setActiveBar(null)}
                          onClick={() => onChartClick?.(item.month, "pengeluaran")}
                        />
                      </motion.div>

                      {/* Tooltip */}
                      <AnimatePresence>
                        {activeBar?.month === item.month && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--card-background)] border border-[var(--border)] rounded-md shadow-lg text-sm whitespace-nowrap z-10"
                          >
                            <p className="font-medium mb-1">{item.month}</p>
                            <div className="space-y-1">
                              <p className="text-[var(--success)] tabular-nums">
                                + Rp {item.pemasukan.toLocaleString("id-ID")}
                              </p>
                              <p className="text-[var(--danger)] tabular-nums">
                                - Rp {item.pengeluaran.toLocaleString("id-ID")}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Month Label */}
                    <div className="mt-2">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--card-background)] shadow-sm whitespace-nowrap">
                        {item.month}
                      </span>
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};