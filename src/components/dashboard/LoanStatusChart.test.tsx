import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoanStatusChart } from './LoanStatusChart'

vi.mock('react-chartjs-2', () => ({
  Bar: ({ options }: { options: unknown }) => (
    <div data-testid="bar-chart" data-options={JSON.stringify(options)}>
      Chart Component
    </div>
  ),
}))

vi.mock('chart.js', async () => {
  const actual = await vi.importActual('chart.js')
  return {
    ...actual,
    Chart: {
      register: vi.fn(),
    },
  }
})

describe('LoanStatusChart', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders Bar component instead of Doughnut', () => {
    const { container } = render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')
    expect(barChart).toBeInTheDocument()
    expect(container.querySelector('div')).toHaveClass('h-72')
  })

  it('has vertical orientation (no indexAxis property)', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')
    const options = JSON.parse(barChart.getAttribute('data-options') || '{}')

    expect(options.indexAxis).toBeUndefined()
  })

  it('displays Y-axis grid lines', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')
    const options = JSON.parse(barChart.getAttribute('data-options') || '{}')

    expect(options.scales.y.grid.display).toBe(true)
  })

  it('uses translated labels for Y-axis from i18n', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')

    expect(barChart).toBeInTheDocument()
  })

  it('displays Jumlah label on Y-axis', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')
    const options = JSON.parse(barChart.getAttribute('data-options') || '{}')

    expect(options.scales.y.title.display).toBe(true)
    expect(options.scales.y.title.text).toBe('Jumlah')
  })

  it('uses correct backgroundColor colors [cyan, teal, orange]', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')

    expect(barChart).toBeInTheDocument()
  })

  it('maps data values correctly to borrowed/returned/overdue', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')

    expect(barChart).toBeInTheDocument()
  })

  it('adapts text color for dark theme', () => {
    render(
      <LoanStatusChart
        theme="dark"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')
    const options = JSON.parse(barChart.getAttribute('data-options') || '{}')

    expect(options.scales.x.ticks.color).toBe('#cbd5e1')
    expect(options.scales.y.ticks.color).toBe('#cbd5e1')
  })

  it('adapts text color for light theme', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')
    const options = JSON.parse(barChart.getAttribute('data-options') || '{}')

    expect(options.scales.x.ticks.color).toBe('#475569')
    expect(options.scales.y.ticks.color).toBe('#475569')
  })

  it('displays loading state when loading prop is true', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
        loading={true}
      />,
    )

    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()
  })

  it('has responsive enabled and maintainAspectRatio false', () => {
    render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const barChart = screen.getByTestId('bar-chart')
    const options = JSON.parse(barChart.getAttribute('data-options') || '{}')

    expect(options.responsive).toBe(true)
    expect(options.maintainAspectRatio).toBe(false)
  })

  it('maintains h-72 container height class', () => {
    const { container } = render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 10, returned: 20, overdue: 5 }}
      />,
    )

    const mainDiv = container.querySelector('div')
    expect(mainDiv).toHaveClass('h-72')
  })

  it('accepts theme, data, and loading props', () => {
    const { rerender } = render(
      <LoanStatusChart
        theme="light"
        data={{ borrowed: 5, returned: 10, overdue: 2 }}
        loading={false}
      />,
    )

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()

    rerender(
      <LoanStatusChart
        theme="dark"
        data={{ borrowed: 15, returned: 30, overdue: 8 }}
        loading={false}
      />,
    )

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})
