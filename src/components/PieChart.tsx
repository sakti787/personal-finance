import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { Card } from "@/components/ui";

// Dynamic import untuk ApexCharts agar compatible dengan SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PieChartProps {
  labels: string[];
  values: number[];
}

export const PieChart = ({ labels, values }: PieChartProps) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Jika tidak ada data, tampilkan chart kosong
    if (!labels || !values || labels.length === 0 || values.length === 0) {
      setChartData({
        series: [],
        options: {
          chart: { type: 'pie' as const },
          labels: [],
          noData: { text: 'Belum ada data pengeluaran' }
        }
      });
      return;
    }

    const chartConfig = {
      series: values,
      options: {
        chart: {
          type: 'pie' as const,
          height: 400,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 1800, // Diperpanjang untuk efek dramatis
            animateGradually: {
              enabled: true,
              delay: 200 // Delay antar slice
            },
            dynamicAnimation: {
              enabled: true,
              speed: 1000
            }
          },
          background: 'transparent',
          toolbar: {
            show: false
          }
        },
        labels: labels,
        colors: [
          '#FF6B6B', // Merah soft
          '#4ECDC4', // Teal
          '#45B7D1', // Biru
          '#96CEB4', // Hijau mint
          '#FECA57', // Kuning
          '#FF9FF3', // Pink
          '#54A0FF', // Biru terang
          '#5F27CD', // Ungu
          '#00D2D3', // Cyan
          '#FF9F43', // Oranye
          '#C44569', // Merah tua
          '#26de81'  // Hijau
        ],
        plotOptions: {
          pie: {
            size: 300,
            startAngle: -90, // Mulai dari atas
            endAngle: 270, // Rotasi penuh
            expandOnClick: true, // Expand saat diklik
            donut: {
              size: '60%',
              background: 'transparent',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FF9F43', // Kuning untuk nama kategori
                  offsetY: -10
                },
                value: {
                  show: true,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#059669', // Hijau untuk nilai
                  offsetY: 10,
                  formatter: function (val: string) {
                    return `Rp ${parseInt(val).toLocaleString('id-ID')}`;
                  }
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Total',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#059669',
                  formatter: function (w: any) {
                    const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                    return `Rp ${total.toLocaleString('id-ID')}`;
                  }
                }
              }
            },
            customScale: 1,
            offsetX: 20, // Geser pie chart ke kanan
            offsetY: 0,
            dataLabels: {
              offset: 0,
              minAngleToShowLabel: 10
            },
            // Tambahkan efek hover
            states: {
              hover: {
                filter: {
                  type: 'lighten',
                  value: 0.15
                }
              },
              active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                  type: 'darken',
                  value: 0.35
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '11px',
            fontWeight: 500,
            colors: ['white']
          },
          background: {
            enabled: true,
            foreColor: '',
            padding: 3,
            borderRadius: 2,
            borderWidth: 1,
            borderColor: 'white',
            opacity: 0.7
          },
          dropShadow: {
            enabled: false
          },
          formatter: function (val: number, opts: any) {
            const value = opts.w.config.series[opts.seriesIndex];
            return `${val.toFixed(1)}%`;
          }
        },
        legend: {
          position: 'right' as const,
          horizontalAlign: 'center' as const,
          fontSize: '13px',
          fontWeight: 500,
          offsetX: -80, // Sesuaikan jarak legend dengan pie chart yang bergeser kanan
          offsetY: 0,
          width: 150, // Membatasi lebar legend
          labels: {
            colors: 'white', // Abu-abu gelap untuk legend
            useSeriesColors: false
          },
          markers: {
            width: 10,
            height: 10,
            strokeWidth: 0,
            strokeColor: '#fff',
            radius: 5
          },
          itemMargin: {
            horizontal: 6,
            vertical: 6
          },
          onItemClick: {
            toggleDataSeries: true
          },
          onItemHover: {
            highlightDataSeries: true
          },
          // Tambahkan animasi untuk legend items
          floating: false,
          show: true
        },
        tooltip: {
          enabled: true,
          theme: 'dark',
          style: {
            fontSize: '12px'
          },
          y: {
            formatter: function (val: number) {
              return `Rp ${val.toLocaleString('id-ID')}`;
            }
          },
          custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
            const label = w.globals.labels[seriesIndex];
            const value = series[seriesIndex];
            const total = series.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);

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
                  ${label}
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="color: var(--text-color);">Jumlah: Rp ${value.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span style="color: var(--text-color);">Persentase: ${percentage}%</span>
                </div>
              </div>
            `;
          }
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        fill: {
          opacity: 0.89,
          type: 'solid'
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: {
                height: 350
              },
              plotOptions: {
                pie: {
                  size: 300,
                  offsetX: 0, // Reset offset untuk tablet
                  donut: {
                    size: '50%'
                  }
                }
              },
              legend: {
                position: 'bottom' as const,
                fontSize: '11px',
                offsetX: 0,
                itemMargin: {
                  horizontal: 5,
                  vertical: 3
                }
              }
            }
          },
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 320
              },
              plotOptions: {
                pie: {
                  size: 250,
                  offsetX: 0, // Reset offset untuk mobile
                  donut: {
                    size: '55%'
                  }
                }
              },
              legend: {
                fontSize: '10px'
              },
              dataLabels: {
                style: {
                  fontSize: '11px'
                }
              }
            }
          }
        ],
        noData: {
          text: 'Belum ada data pengeluaran',
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
  }, [labels, values]);

  if (!chartData) {
    return (
      <Card className="p-6 relative overflow-hidden">
        <motion.div 
          className="h-[400px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-muted text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading chart...
          </motion.div>
        </motion.div>
      </Card>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        ease: "easeOut",
        staggerChildren: 0.1
      }}
    >
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

      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h3 
          className="text-lg font-semibold mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Komposisi Pengeluaran
        </motion.h3>
        <motion.div 
          className="w-full h-[330px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1.2, 
            delay: 0.6,
            ease: "easeOut"
          }}
        >
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="donut"
            width="100%"
            height="100%"
          />
        </motion.div>
      </motion.div>
    </Card>
    </motion.div>
  );
};