'use client';
import {useState, useEffect} from 'react';
import {CiShare2} from 'react-icons/ci';
import { FaStar } from "react-icons/fa";
import { IoMdHeartEmpty } from 'react-icons/io';
import { Room } from '@/types/Room';

export default function RoomTitle({roomData} : {
    roomData: Room;
}){
    const [liked, setLiked] = useState(false);
    return (
        <div id="title" className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border-b border-gray-100">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900" >{roomData.name}</h1>
                    <div className="flex gap-0.5">
                        {[...Array(roomData.classification)].map((_, i) => (
                            <FaStar key={i} size={13} className="fill-yellow-400 text-yellow-400"></FaStar>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
                <button onClick={() => setLiked(!liked)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <IoMdHeartEmpty className={`text-xl ${liked ? "text-red-600" : "text-gray-700"}`}/>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <CiShare2 className="text-xl text-gray-700 hover:text-back"/>
                </button>
            </div>
        </div>
    )
}