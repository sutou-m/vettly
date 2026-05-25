'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export type StatusChartData = {
  status: string
  label: string
  count: number
}[]

const STATUS_COLORS: Record<string, string> = {
  screening: '#00A896',
  reviewing: '#3B82F6',
  interview: '#D97706',
  offered: '#16A34A',
  rejected: '#DC2626',
  withdrawn: '#94A3B8',
}

export function StatusBarChart({ data }: { data: StatusChartData }) {
  const hasData = data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-sm text-[#6B7F7C]">候補者データがありません</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F4F6F5" />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#6B7F7C' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={76}
          tick={{ fontSize: 12, fill: '#1C2B35' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [`${value}人`, '候補者数']}
          contentStyle={{ fontSize: 12, borderColor: '#D0D8D6', borderRadius: 8 }}
          cursor={{ fill: '#F9F8F6' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#6B7F7C'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
