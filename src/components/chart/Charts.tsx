'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const data = [
  { time: '09:00', price: 44800 },
  { time: '10:00', price: 45100 },
  { time: '11:00', price: 44500 },
  { time: '12:00', price: 45500 },
  { time: '13:00', price: 46000 },
  { time: '14:00', price: 46800 },
  { time: '15:00', price: 47500 },
  { time: '16:00', price: 48200 },
]

export const Chart =()=> {
  return (
    <div className="bg-black text-white p-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">BTC/USD</h2>
        <span className="text-yellow-400 text-lg font-semibold">$48,200</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#333" vertical={false} />
          <XAxis dataKey="time" stroke="#888" />
          <YAxis stroke="#888" domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
            labelStyle={{ color: '#aaa' }}
            itemStyle={{ color: '#ffd700' }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#FFD700"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
