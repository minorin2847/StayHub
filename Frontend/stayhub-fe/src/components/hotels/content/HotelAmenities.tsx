import { Hotel } from "@/types/Hotel"
import { useState } from "react"

export default function RoomAmenities({ hotelData }: {
    hotelData: Hotel
}) {
    const [amenExpand, setAmenExpand] = useState(false);
    return (
    <div id="amenities" className="flex flex-col h-fit w-[563px] gap-[16px] scroll-mt-[63px]">
    <p className="text-[28px] font-semibold">Amenities</p>
    <div className="grid grid-cols-2 gap-x-[101px] gap-y-[16px">
        {(amenExpand ? hotelData.amenities : hotelData.amenities.slice(0, 6)).map((o, i) => (
            <div key={i} className="w-[231px] px-[12px] py-[16px] flex gap-[8px] items-center cursor-default hover:bg-neutral-50">
                <img src={o.icon} alt={o.name} width={24} height={24}/>
                <p className="text-[16px]">{o.name}</p>
            </div>
        ))}
    </div> 
    <button onClick={()=>setAmenExpand(!amenExpand)} className="flex w-fit h-[40px] justify-center items-center px-[8px] py-[16px] border-2 border-blue-500 rounded-[10px] text-blue-500 hover:bg-blue-500 hover:text-white font-semibold">{amenExpand ? "Show less" : `Show all ${hotelData.amenities.length} Amenities`}</button>
    </div>
    )
}