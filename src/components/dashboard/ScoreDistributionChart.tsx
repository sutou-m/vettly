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

export type ScoreDistData = {
  range: string
  count: number
  color: string
}[]

export function ScoreDistributionChart({ data }: { data: ScoreDistData }) {
  const hasData = data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-sm text-[#6B7F7C]">スコアデータがありません</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F6F5" />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 12, fill: '#6B7F7C' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#6B7F7C' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          formatter={(value) => [`${value}人`, '候補者数']}
          contentStyle={{ fontSize: 12, borderColor: '#D0D8D6', borderRadius: 8 }}
          cursor={{ fill: '#F9F8F6' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
