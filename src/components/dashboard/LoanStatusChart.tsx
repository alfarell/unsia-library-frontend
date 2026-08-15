import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

ChartJS.register(ArcElement, Tooltip, Legend)

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
        data: [chartData.borrowed, chartData.returned, chartData.overdue],
        backgroundColor: ['#0891b2', '#14b8a6', '#f97316'],
        borderColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        borderWidth: 4,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          padding: 20,
          usePointStyle: true,
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
        <Doughnut data={chartDataset} options={options} />
      )}
    </div>
  )
}
