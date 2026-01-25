"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { IoHeartOutline, IoShareSocialOutline } from "react-icons/io5";

export default function Room() {
    const { hotel_id, room_id } = useParams();
    const [data, setData] = useState({
        name: `Superior Twin Room ${room_id}`,
        location: `Hotel ${hotel_id}, Barcalona, Spain`
    })
    const [section, setSection] = useState("overview");
return (
    <div className="flex flex-col w-full h-[2000px] gap-y-[40px] font-roboto">
        {/* Name, location, save and share button */}
        <div className="flex w-full h-[83px] items-center justify-between py-[8px]">
            <div className="flex flex-col">
                <p className="text-[32px] font-bold">{data.name}</p>
                <p className="text-[18px]">{data.location}</p>
            </div>
            <div className="flex w-[88px] h-full gap-[24px] items-center">
                <IoHeartOutline size={32}/>
                <IoShareSocialOutline size={32} />

            </div>
        </div>
        {/* Navbar */}
        <nav className="gap-[24px] sticky top-0 bg-white z-50 flex font-normal text-[20px] h-[59px] w-full border-b border-b-gray-300">
            <a href={"#overview"} onClick={()=>setSection("overview")} className={`flex h-full items-center ${section==="overview" && "border-b-2 text-blue-500 border-b-blue-500"}`}>
                Overview
            </a>
            <a href={"#amenities"} onClick={()=>setSection("amenities")} className={`flex h-full items-center ${section==="amenities" && "border-b-2 text-blue-500 border-b-blue-500"}`}>
                Amenities
            </a>
            <a href={"#location"} onClick={()=>setSection("location")} className={`flex h-full items-center ${section==="location" && "border-b-2 text-blue-500 border-b-blue-500"}`}>
                Location
            </a>
            <a href={"#calendar"} onClick={()=>setSection("calendar")} className={`flex h-full items-center ${section==="calendar" && "border-b-2 text-blue-500 border-b-blue-500"}`}>
                Calendar
            </a>
            <a href={"#reviews"} onClick={()=>setSection("reviews")} className={`flex h-full items-center ${section==="reviews" && "border-b-2 text-blue-500 border-b-blue-500"}`}>
                Reviews
            </a>
        </nav>
        {/* Overview */}
        <div id="overview" className="flex flex-col h-[623px] border scroll-mt-[63px]">
        </div>
        <div className="flex">
            <div className="flex flex-col w-[1000px] h-fit gap-y-[40px]">
                <div className="flex flex-col border h-[219px]">
                    <p className="text-[28px] font-semibold">Description</p>
                </div>
                
                {/* Amenities */}
                <div id="amenities" className="h-[282px] border scroll-mt-[63px]">
                    <p className="text-[28px] font-semibold">Amenities</p>
                </div>
            </div>
            <div className="flex flex-col grow justify-start items-end">
                <div className="w-[400px] h-[500px] bg-white drop-shadow-[0px_2px_20px_rgba(0,0,0,0.12)] rounded-[30px]"></div>
            </div>
        </div>

    </div>
);
}