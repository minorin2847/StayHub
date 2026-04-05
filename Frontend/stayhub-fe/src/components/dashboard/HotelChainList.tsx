'use client';
import React from 'react';
import { LuMoreVertical, LuTrendingUp, LuMapPin } from 'react-icons/lu';

const hotelData = [
    { id: 1, name: "Grand Mercure Hotel", location: "Hanoi, VN", revenue: 125000, status: "Active", growth: "+12.5%" },
    { id: 2, name: "Ocean Breeze Resort", location: "Danang, VN", revenue: 89000, status: "Active", growth: "+8.2%" },
    { id: 3, name: "Sunset Valley Lodge", location: "Dalat, VN", revenue: 45600, status: "Maintenance", growth: "-2.1%" },
    { id: 4, name: "Urban Central Stay", location: "HCMC, VN", revenue: 210000, status: "Active", growth: "+15.0%" },
];

const StatusBadge = ({ status }) => {
    const styles = {
        Active: "bg-lime-100 text-emerald-700",
        Maintenance: "bg-orange-100 text-orange-600",
        Inactive: "bg-slate-100 text-slate-500",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles[status] || styles.Inactive}`}>
            {status}
        </span>
    );
};

export default function HotelChainList() {
    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Danh sách khách sạn</h3>
                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Xem tất cả</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Hotel Information</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {hotelData.map((hotel) => (
                            <tr key={hotel.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{hotel.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">${hotel.revenue.toLocaleString()}</span>
                                        <span className={`text-[10px] font-bold flex items-center gap-1 ${hotel.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            <LuTrendingUp size={10} /> {hotel.growth}
                                        </span>
                                    </div>
                                </td>
                                {/* <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all">
                                        <LuMoreVertical size={18} />
                                    </button>
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}