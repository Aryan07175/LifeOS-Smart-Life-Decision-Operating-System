import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import type { QualityPoint } from '@/api/analytics';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-lg text-xs">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-indigo-600 font-bold mt-0.5">
          {payload[0]?.value?.toFixed(1)}/10 satisfaction
        </p>
        <p className="text-gray-400 mt-0.5">{payload[0]?.payload?.outcomeCount} outcomes</p>
      </div>
    );
  }
  return null;
};

interface SatisfactionTrendProps {
  data: QualityPoint[];
  isLoading: boolean;
}

export function SatisfactionTrend({ data, isLoading }: SatisfactionTrendProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Satisfaction Trend</p>
        <Skeleton className="h-[200px] w-full rounded-2xl" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Satisfaction Trend</p>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">Complete check-ins to see your satisfaction trend.</p>
        </div>
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Satisfaction Trend</p>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="satisfactionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 5, 10]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="avgSatisfaction"
              stroke="#4F46E5"
              strokeWidth={2}
              fill="url(#satisfactionGrad)"
              dot={{ fill: '#4F46E5', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: '#4F46E5', r: 4, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
