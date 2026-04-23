"use client";

import React, { useEffect, useState } from "react";
import { Badge, Spin, Tag } from "antd";
import { MdOutlineBed, MdOutlinePeople, MdOutlineSquareFoot, MdOutlineCleaningServices } from "react-icons/md";
import { FaDoorOpen, FaDoorClosed } from "react-icons/fa";
import { BsPersonFillCheck } from "react-icons/bs";

type FrontDeskRoom = {
    id: number;
    type: string;
    capacity: number;
    size: number;
    price: number;
    status: "available" | "occupied" | "maintenance" | "cleaning";
    guest_name?: string;
    checkout?: string;
    previewimages?: string[];
};

const STATUS_CONFIG = {
    available: {
        label: "Available",
        color: "bg-emerald-50 border-emerald-200",
        badge: "success" as const,
        icon: <FaDoorOpen className="text-emerald-500" size={18} />,
        tag: "green",
    },
    occupied: {
        label: "Occupied",
        color: "bg-blue-50 border-blue-200",
        badge: "processing" as const,
        icon: <BsPersonFillCheck className="text-blue-500" size={18} />,
        tag: "blue",
    },
    maintenance: {
        label: "Maintenance",
        color: "bg-red-50 border-red-200",
        badge: "error" as const,
        icon: <FaDoorClosed className="text-red-400" size={18} />,
        tag: "red",
    },
    cleaning: {
        label: "Cleaning",
        color: "bg-amber-50 border-amber-200",
        badge: "warning" as const,
        icon: <MdOutlineCleaningServices className="text-amber-500" size={18} />,
        tag: "gold",
    },
};

export default function FrontDeskPage() {
    const [rooms, setRooms] = useState<FrontDeskRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/rooms`,
                    { credentials: "include" }
                );
                const data = await res.json();
                setRooms((data.response || []) as FrontDeskRoom[]);
            } catch {
                setRooms([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const filtered = filterStatus === "all"
        ? rooms
        : rooms.filter(r => r.status === filterStatus);

    const counts = {
        all: rooms.length,
        available: rooms.filter(r => r.status === "available").length,
        occupied: rooms.filter(r => r.status === "occupied").length,
        maintenance: rooms.filter(r => r.status === "maintenance").length,
        cleaning: rooms.filter(r => r.status === "cleaning").length,
    };

    return (
        <div className="flex flex-col gap-y-[30px] px-[30px] pt-[30px]">
            {/* Header */}
            <div className="shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Front Desk</h1>
                <p className="text-slate-500 font-medium">Live room status overview for hotel staff.</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
                {(["all", "available", "occupied", "maintenance", "cleaning"] as const).map((key) => {
                    const cfg = key === "all" ? null : STATUS_CONFIG[key];
                    const isActive = filterStatus === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilterStatus(key)}
                            className={`flex flex-col gap-1 p-4 rounded-2xl border text-left transition-all shadow-sm ${
                                isActive
                                    ? "border-slate-800 bg-slate-800 text-white shadow-md"
                                    : "border-slate-100 bg-white hover:border-slate-300 text-slate-700"
                            }`}
                        >
                            <span className={`text-2xl font-bold ${isActive ? "text-white" : "text-slate-800"}`}>
                                {counts[key]}
                            </span>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                                {key === "all" ? "Total Rooms" : cfg!.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Grid */}
            <div className="flex-1">
                {loading ? (
                    <div className="flex items-center justify-center h-64 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                        <Spin size="large" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[32px] border border-slate-100 shadow-sm gap-3">
                        <FaDoorOpen size={36} className="text-slate-300" />
                        <p className="text-slate-400 font-medium">No rooms found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filtered.map((room) => {
                            const statusKey = (room.status || "available") as keyof typeof STATUS_CONFIG;
                            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.available;
                            return (
                                <div
                                    key={room.id}
                                    className={`relative flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all hover:shadow-md cursor-pointer ${cfg.color}`}
                                >
                                    {/* Room number + status icon */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            #{room.id}
                                        </span>
                                        <Badge status={cfg.badge} />
                                    </div>

                                    {/* Room type */}
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                                            {room.type}
                                        </span>
                                    </div>

                                    {/* Room details */}
                                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MdOutlinePeople size={13} className="text-slate-400" />
                                            {room.capacity} guests
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MdOutlineSquareFoot size={13} className="text-slate-400" />
                                            {room.size} m²
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MdOutlineBed size={13} className="text-slate-400" />
                                            ${room.price}/night
                                        </span>
                                    </div>

                                    {/* Guest name if occupied */}
                                    {room.status === "occupied" && room.guest_name && (
                                        <div className="text-xs text-blue-600 font-semibold truncate">
                                            {room.guest_name}
                                        </div>
                                    )}
                                    {room.status === "occupied" && room.checkout && (
                                        <div className="text-[10px] text-slate-400">
                                            Checkout: {new Date(room.checkout).toLocaleDateString()}
                                        </div>
                                    )}

                                    {/* Status tag */}
                                    <Tag
                                        color={cfg.tag}
                                        className="w-fit rounded-full font-semibold border-none text-xs px-2.5 py-0.5 mt-auto"
                                    >
                                        {cfg.label}
                                    </Tag>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
