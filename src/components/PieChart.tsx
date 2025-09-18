import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui";

interface PieChartProps {
  labels: string[];
  values: number[];
}

interface TooltipProps {
  x: number;
  y: number;
  label: string;
  value: number;
  percentage: number;
}

export const PieChart = ({ labels, values }: PieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipProps | null>(null);
  const total = values.reduce((a, b) => a + b, 0);

  // Calculate the percentage and color for each slice
  const slices = values.map((value, index) => {
    const percentage = (value / total) * 100;
    return {
      percentage,
      label: labels[index],
      value,
      color: `hsl(${index * (360 / values.length)}, 70%, 50%)`,
    };
  });

  // Calculate the SVG paths for each slice
  let currentAngle = 0;
  const paths = slices.map((slice, index) => {
    const angle = (slice.percentage / 100) * 360;
    const x1 = Math.cos((currentAngle * Math.PI) / 180) * 100;
    const y1 = Math.sin((currentAngle * Math.PI) / 180) * 100;
    const x2 = Math.cos(((currentAngle + angle) * Math.PI) / 180) * 100;
    const y2 = Math.sin(((currentAngle + angle) * Math.PI) / 180) * 100;
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    currentAngle += angle;
    
    return { path, ...slice, index };
  });

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Background Waves */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.5 }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={{ position: 'absolute', bottom: 0 }}
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
            className="w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={{ position: 'absolute', bottom: 0, opacity: 0.7 }}
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

      <div className="relative">
        <h3 className="text-lg font-semibold mb-6">Komposisi Pengeluaran</h3>
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="relative w-64 h-64">
          <svg
            viewBox="-100 -100 200 200"
            style={{ transform: "rotate(-90deg)" }}
            className="w-full h-full"
            onMouseLeave={() => {
              setActiveIndex(null);
              setTooltip(null);
            }}
          >
            {paths.map((slice, i) => (
              <motion.path
                key={i}
                d={slice.path}
                fill={slice.color}
                opacity={activeIndex === null || activeIndex === i ? 1 : 0.3}
                onMouseEnter={(e) => {
                  setActiveIndex(i);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2,
                    label: slice.label,
                    value: slice.value,
                    percentage: slice.percentage,
                  });
                }}
                onMouseLeave={() => {
                  setActiveIndex(null);
                  setTooltip(null);
                }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                style={{ transformOrigin: "center", cursor: "pointer" }}
              />
            ))}
          </svg>
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bg-card p-3 rounded-lg shadow-lg text-sm -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                }}
              >
                <div className="font-medium">{tooltip.label}</div>
                <div className="text-muted-foreground">
                  Rp {tooltip.value.toLocaleString()}
                </div>
                <div className="text-xs font-medium mt-1">
                  {tooltip.percentage.toFixed(1)}%
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full md:w-auto">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-3">
            {slices.map((slice, i) => (
              <motion.div
                key={i}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="min-w-0">
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="font-medium truncate">{slice.label}</span>
                    <span className="text-sm font-semibold shrink-0">
                      {slice.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rp {slice.value.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </Card>
  );
};