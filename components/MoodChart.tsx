
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MoodEntry } from '../types';

interface MoodChartProps {
  data: MoodEntry[];
}

const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  // Process data for chart
  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short' }),
    score: entry.score,
    fullDate: new Date(entry.date).toLocaleDateString()
  }));

  // Take last 7 entries for cleaner view
  const recentData = chartData.slice(-7);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No mood data yet
      </div>
    );
  }

  return (
    // min-w-0 ensures the container has a valid width context in grid layouts, preventing negative width errors
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={recentData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 10]} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            ticks={[2, 4, 6, 8, 10]}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#64748b', fontSize: '12px' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#0d9488"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
