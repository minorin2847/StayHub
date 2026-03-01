'use client';
import React, {useState, useEffect} from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell 
  } from 'recharts';

const data = [
  { day: '12 Jun', bookings: 65 },
  { day: '13 Jun', bookings: 45 },
  { day: '14 Jun', bookings: 85 },
  { day: '15 Jun', bookings: 30 },
  { day: '16 Jun', bookings: 90 },
  { day: '17 Jun', bookings: 70 },
  { day: '18 Jun', bookings: 55 },
];

const ReservationChart = () => {
    // Tránh lỗi Hydration trong Next.js
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    if (!isMounted) return <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-[32px]" />;
    return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Reservations</h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Last 7 Days</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#eef9c3]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Booked</span>
          </div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 11}}
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            />
            <Bar 
              dataKey="bookings" 
              fill="#eef9c3" 
              radius={[6, 6, 0, 0]} // Bo góc trên của cột
              barSize={32}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  className="hover:fill-[#d4e87d] transition-all duration-300 cursor-pointer" 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReservationChart;