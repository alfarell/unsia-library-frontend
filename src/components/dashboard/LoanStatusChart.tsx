import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

function calculateYAxisConfig(data: number[]) {
  const maxValue = Math.max(...data, 0)

  if (maxValue < 5) {
    return {
      max: 5,
      stepSize: 1,
      evenOnly: false,
    }
  } else {
    return {
      max: 10,
      stepSize: 2,
      evenOnly: true,
    }
  }
}

type LoanStatusChartProps = {
  theme: 'dark' | 'light'
  data?: { borrowed: number; returned: number; overdue: number }
  loading?: boolean
}

export function LoanStatusChart({
  theme,
  data,
  loading,
}: LoanStatusChartProps) {
  const { t } = useTranslation()
  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569'

  const chartData = {
    borrowed: data?.borrowed ?? 0,
    returned: data?.returned ?? 0,
    overdue: data?.overdue ?? 0,
  }

  const chartDataset = {
    labels: [t('chart.borrowed'), t('chart.returned'), t('chart.overdue')],
    datasets: [
      {
        label: 'Status Peminjaman',
        data: [chartData.borrowed, chartData.returned, chartData.overdue],
        backgroundColor: ['#0891b2', '#14b8a6', '#f97316'],
        borderColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const yAxisConfig = calculateYAxisConfig([
    chartData.borrowed,
    chartData.returned,
    chartData.overdue,
  ])

  const options: ChartOptions<'bar'> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: theme === 'dark' ? '#475569' : '#cbd5e1',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return String(context.parsed.y)
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisConfig.max,
        grid: {
          display: true,
          color: theme === 'dark' ? '#334155' : '#e2e8f0',
        },
        ticks: {
          stepSize: yAxisConfig.stepSize,
          color: textColor,
          font: {
            size: 12,
          },
          callback: (value) => {
            if (
              yAxisConfig.evenOnly &&
              typeof value === 'number' &&
              value % 2 !== 0
            ) {
              return ''
            }
            return String(value)
          },
        },
        title: {
          display: true,
          text: 'Jumlah',
          color: textColor,
          font: {
            size: 13,
            weight: 'bold',
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            size: 12,
          },
        },
      },
    },
  }

  return (
    <div className="h-72">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.loading')}
          </p>
        </div>
      ) : (
        <Bar data={chartDataset} options={options} />
      )}
    </div>
  )
}
