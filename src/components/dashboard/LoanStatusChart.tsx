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
}

export function LoanStatusChart({ theme }: LoanStatusChartProps) {
  const { t } = useTranslation()
  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569'

  const data = {
    labels: [t('chart.borrowed'), t('chart.returned'), t('chart.overdue')],
    datasets: [
      {
        data: [93, 176, 7],
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
      <Doughnut data={data} options={options} />
    </div>
  )
}
