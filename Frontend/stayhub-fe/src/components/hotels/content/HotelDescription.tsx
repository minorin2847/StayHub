import {Hotel} from "@/types/Hotel.js";
import { useState } from "react";

export default function HotelDescription({ Hoteldata }: {
    Hoteldata: Hotel
}) {
    const [desExpand, setDesExpand] = useState(false);
    return (
    <div className="flex flex-col h-fit gap-[16px]">
        <p className="text-[28px] font-semibold">Description</p>
        <div className="text-[16px]">
            <p>{`${Hoteldata.rooms} rooms, Arrange over ${Hoteldata.floors} floors`}</p>
            <p className={`${desExpand || "line-clamp-3"}`}>{Hoteldata.description}</p>
        </div>

        <button onClick={()=>setDesExpand(!desExpand)} className="flex w-fit font-bold h-[40px] justify-center items-center px-[8px] py-[16px] border-2 border-blue-500 rounded-[10px] text-blue-500 hover:bg-blue-500 hover:text-white ">{desExpand ? "Show less" : "Show more"}</button>
    </div>
    )
}