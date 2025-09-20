import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { Card } from "@/components/ui";

// Dynamic import untuk ApexCharts agar compatible dengan SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
  const [chartData, setChartData] = useState<any>(null);

  // Format angka menjadi format ringkas (18.5 Jt)
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} Jt`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)} Rb`;
    }
    return value.toString();
  };

  useEffect(() => {
    // Generate semua 12 bulan dalam tahun berjalan
    const currentYear = new Date().getFullYear();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Buat array untuk semua 12 bulan
    const allMonths = monthNames.map(monthName => `${monthName} ${currentYear}`);
    const allPemasukan = new Array(12).fill(0);
    const allPengeluaran = new Array(12).fill(0);

    // Jika ada data transaksi, mapping ke bulan yang sesuai
    if (data && data.length > 0) {
      data.forEach(item => {
        // Cari index bulan berdasarkan nama bulan
        const monthIndex = allMonths.findIndex(month => month === item.month);
        if (monthIndex !== -1) {
          allPemasukan[monthIndex] = item.pemasukan;
          allPengeluaran[monthIndex] = item.pengeluaran;
        }
      });
    }

    const chartConfig = {
      series: [
        {
          name: 'Pemasukan',
          data: allPemasukan,
          type: 'area'
        },
        {
          name: 'Pengeluaran',
          data: allPengeluaran,
          type: 'line'
        }
      ],
      options: {
        chart: {
          type: 'line' as const,
          height: 290, // Kurangi tinggi chart untuk mengurangi gap
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 1500,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 1000
            }
          },
          background: 'transparent',
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
          events: {
            dataPointSelection: (event: any, chartContext: any, config: any) => {
              const month = allMonths[config.dataPointIndex];
              const seriesName = config.w.globals.seriesNames[config.seriesIndex];
              const type = seriesName === 'Pemasukan' ? 'pemasukan' : 'pengeluaran';
              
              // Konversi nama bulan kembali ke format yang dibutuhkan onChartClick
              onChartClick?.(month, type as "pemasukan" | "pengeluaran");
            }
          },
          // Tambah margin untuk memberikan ruang yang cukup
          margin: {
            top: 20,
            right: 30,
            bottom: 50, // Kurangi margin bottom untuk mendekatkan label X
            left: 80    // Ruang lebih untuk label Y yang panjang
          }
        },
        colors: ['#00E396', '#FEB019'],
        stroke: {
          curve: 'smooth' as const,
          width: [0, 3], // Area fill untuk pemasukan, line untuk pengeluaran
          lineCap: 'round' as const
        },
        fill: {
          type: ['gradient', 'solid'],
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.1,
            gradientToColors: ['#00E396'],
            inverseColors: false,
            opacityFrom: 0.3,
            opacityTo: 0.55,
            stops: [0, 100]
          }
        },
        markers: {
          size: [0, 0], // Sembunyikan markers secara default
          hover: {
            size: [6, 6], // Munculkan markers saat hover
            sizeOffset: 2
          },
          colors: ['#00E396', '#FEB019'],
          strokeColors: '',
          strokeWidth: -10,
        },
        xaxis: {
          categories: allMonths,
          labels: {
            style: {
              colors: '#ffffff', // Ubah ke putih explicit
              fontSize: '11px', // Sedikit diperbesar untuk keterbacaan
              fontWeight: 500
            },
            rotate: -45, // Rotasi label agar tidak overlap
            trim: true,
            hideOverlappingLabels: true, // Sembunyikan label yang overlap
            offsetY: 5 // Kurangi jarak dari sumbu (sebelumnya 10)
          },
          axisBorder: {
            show: true, // Tampilkan border untuk kejelasan
            color: '#374151', // Abu-abu yang terlihat
            height: 1
          },
          axisTicks: {
            show: true, // Tampilkan ticks untuk referensi
            color: '#374151', // Abu-abu yang terlihat
            height: 6
          },
          tickPlacement: 'on' // Posisi tick tepat di kategori
        },
        yaxis: {
          labels: {
            formatter: (value: number) => formatCurrency(value),
            style: {
              colors: '#ffffff', // Ubah ke putih explicit
              fontSize: '12px'
            },
            offsetX: 10 // Berikan jarak dari sumbu
          },
          axisBorder: {
            show: true, // Tampilkan border Y axis
            color: '#374151' // Abu-abu yang terlihat
          },
          axisTicks: {
            show: true, // Tampilkan ticks Y axis
            color: '#374151' // Abu-abu yang terlihat
          },
          // Pastikan sumbu Y dimulai dari 0 untuk konsistensi
          min: 0,
          forceNiceScale: true // Gunakan skala yang "nice" (round numbers)
        },
        grid: {
          borderColor: '#374151', // Abu-abu yang terlihat
          strokeDashArray: 3,
          opacity: 0.3, // Sedikit lebih terlihat untuk struktur yang jelas
          xaxis: {
            lines: {
              show: true // Tampilkan grid vertikal
            }
          },
          yaxis: {
            lines: {
              show: true // Tampilkan grid horizontal
            }
          },
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          }
        },
        legend: {
          position: 'top' as const,
          horizontalAlign: 'right' as const,
          offsetY: -5, // Kurangi jarak ke chart
          offsetX: -10,
          labels: {
            colors: '#ffffff' // Ubah ke putih explicit
          },
          markers: {
            width: 12,
            height: 12,
            radius: 6
          },
          itemMargin: {
            horizontal: 15, // Jarak antar item legend
            vertical: 5
          }
        },
        tooltip: {
          shared: true, // Shared tooltip sangat penting
          intersect: false,
          custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
            const month = allMonths[dataPointIndex];
            const pemasukanValue = series[0][dataPointIndex];
            const pengeluaranValue = series[1][dataPointIndex];

            return `
              <div style="
                background: var(--card-background);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                font-family: system-ui;
              ">
                <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-color);">
                  ${month}
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="color: #00E396; margin-right: 8px;">●</span>
                  <span style="color: var(--text-color);">Pemasukan: Rp ${pemasukanValue.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span style="color: #FEB019; margin-right: 8px;">●</span>
                  <span style="color: var(--text-color);">Pengeluaran: Rp ${pengeluaranValue.toLocaleString('id-ID')}</span>
                </div>
              </div>
            `;
          }
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: {
                height: 270, // Kurangi tinggi di mobile untuk mengurangi gap
                margin: {
                  bottom: 60, // Kurangi margin bottom untuk mobile
                  left: 60
                }
              },
              legend: {
                position: 'bottom' as const,
                horizontalAlign: 'center' as const,
                offsetY: 10
              },
              xaxis: {
                labels: {
                  rotate: -90, // Rotasi lebih besar di mobile
                  style: {
                    colors: '#ffffff', // Ubah ke putih explicit
                    fontSize: '10px'
                  },
                  offsetY: 3 // Kurangi offset untuk mobile
                }
              },
              yaxis: {
                labels: {
                  formatter: (value: number) => formatCurrency(value),
                  style: {
                    colors: '#ffffff', // Ubah ke putih explicit
                    fontSize: '11px'
                  }
                }
              }
            }
          },
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 250, // Kurangi lebih untuk mobile kecil
                margin: {
                  bottom: 70, // Kurangi sedikit untuk mobile kecil
                  left: 50
                }
              },
              xaxis: {
                labels: {
                  style: {
                    colors: '#ffffff', // Ubah ke putih explicit
                    fontSize: '9px'
                  }
                }
              },
              yaxis: {
                labels: {
                  formatter: (value: number) => formatCurrency(value),
                  style: {
                    colors: '#ffffff', // Ubah ke putih explicit
                    fontSize: '10px'
                  }
                }
              }
            }
          }
        ],
        noData: {
          text: 'Belum ada data transaksi',
          align: 'center' as const,
          verticalAlign: 'middle' as const,
          offsetX: 0,
          offsetY: 0,
          style: {
            color: 'var(--text-color)',
            fontSize: '14px'
          }
        }
      }
    };

    setChartData(chartConfig);
  }, [data, onChartClick]); // Dependency pada data dan onChartClick

  if (!chartData) {
    return (
      <Card className="p-6 relative overflow-hidden">
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-muted">Loading chart...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="h-[310px]"> {/* Kurangi tinggi kontainer untuk mengurangi gap */}
        {/* Background Waves - Tetap sama seperti sebelumnya */}
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
        
        {/* ApexCharts Chart */}
        <div className="relative z-10 h-full">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="line"
            height="100%"
          />
        </div>
      </div>
    </Card>
  );
};