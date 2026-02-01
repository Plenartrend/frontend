"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState, useEffect } from 'react';

interface DataPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: DataPoint[];
  color?: string;
  yAxisLabel?: string;
  interactive?: boolean;
  useSentimentColors?: boolean; // Use green for positive, red for negative
  yAxisDomain?: [number, number]; // Custom Y-axis domain
}

export function TrendChart({ 
  data, 
  color = "#2563eb", 
  yAxisLabel, 
  interactive = true,
  useSentimentColors = false,
  yAxisDomain
}: TrendChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate if current trend is positive or negative (based on last value)
  const lastValue = data.length > 0 ? data[data.length - 1].value : 0;
  const isPositive = lastValue >= 0;
  
  // Use sentiment colors if enabled
  const lineColor = useSentimentColors 
    ? (isPositive ? '#10b981' : '#ef4444') // green-500 : red-500
    : color;

  return (
    <div
      className={`h-[300px] w-full focus:ring-1 focus:ring-slate-100 focus:outline-none outline-none ${!interactive ? 'pointer-events-none' : ''}`}
      tabIndex={-1}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            minTickGap={30}
            tickFormatter={(dateStr: string) => {
              try {
                const date = new Date(dateStr);
                const month = date.toLocaleDateString('de-DE', { month: 'short' });
                const year = date.getFullYear();
                return `${month} ${year}`;
              } catch {
                return dateStr;
              }
            }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            allowDecimals={true}
            domain={yAxisDomain || [0, 'auto']}
            tickFormatter={(value: number) => {
              // Format to max 2 decimal places, remove trailing zeros
              return Number(value.toFixed(2)).toString();
            }}
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft', 
              fill: '#64748b', 
              fontSize: 12,
              offset: isMobile ? 5 : 10,
              dx: isMobile ? -10 : 0, 
              dy: isMobile ? 10 : 0,
              style: { textAnchor: 'middle' }
            } : undefined}
            width={isMobile ? 35 : 60}
          />
          {/* Add zero reference line for sentiment charts */}
          {useSentimentColors && (
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          )}
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#0f172a' }}
            cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
            formatter={(value?: string | number | (string | number)[]) => {
              if (value === undefined) return ["", "Wert"];
              const numericValue = Array.isArray(value)
                ? Number(value[0])
                : Number(value);
              if (Number.isNaN(numericValue)) {
                return [value, "Wert"];
              }
              return [Math.round(numericValue), "Wert"];
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={lineColor} 
            fill={lineColor} 
            fillOpacity={0.1} 
            strokeWidth={2} 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}