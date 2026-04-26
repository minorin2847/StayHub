"use client";
import { Button } from "antd";
import { useState } from "react";
import { CiShare2 } from "react-icons/ci";
import { FaShare, FaStar } from "react-icons/fa";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { MdOutlineLocationOn } from "react-icons/md";
import Link from "next/link";

export default function RoomTitle({ roomData }: { roomData: any }) {
  const [liked, setLiked] = useState(false);
    return (
        <div id="title" className="flex flex-col md:flex-row md:items-end justify-between py-6 border-b border-gray-100">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">{roomData.name}</h1>
                    <div className="flex gap-0.5">
                        {[...Array(roomData.classification || 0)].map((_, i) => (
                            <FaStar key={i} size={14} className="text-yellow-400" />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                    <MdOutlineLocationOn className="text-blue-600" size={18} />
                    <div className="flex flex-wrap items-center gap-1 text-sm font-medium">
                        <Link
                            href={`/hotels/${roomData.hotel_id}`}
                            className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            {roomData.hotel_name}
                        </Link>
                        <span>•</span>
                        <span className="text-gray-500">
                            {roomData.hotel_city || roomData.hotel_location}
                        </span>
                    </div>
                </div>
            </div>

<div className="flex items-center gap-3 mt-1">
        <button 
          onClick={() => setLiked(!liked)} 
          className="group p-2 rounded-full hover:bg-gray-50/50 transition-colors"
        >
            {
                liked ?
                <IoMdHeart className="text-xl text-red-600" />
                :
                <IoMdHeartEmpty className={`text-xl text-gray-700 group-hover:text-red-600`} />
            }
          
        </button>
        <button className="group p-2 rounded-full hover:bg-gray-50/50 transition-colors">
          <CiShare2 className="text-xl text-gray-700 group-hover:text-blue-600" />
        </button>
      </div>
        </div>
    );
}