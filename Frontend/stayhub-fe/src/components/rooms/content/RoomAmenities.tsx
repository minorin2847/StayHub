import { DynamicIcon } from "@/utils/amenityIconMap";
import { useState } from "react";

export default function RoomAmenities({ roomData }: { roomData: any }) {
  const [amenExpand, setAmenExpand] = useState(false);
  const amenities = roomData.amenities || [];

  return (
    <div id="amenities" className="flex flex-col h-fit w-full gap-[16px] scroll-mt-[80px]">
      <p className="text-[28px] font-semibold">Amenities</p>
      <div className="grid grid-cols-2 gap-y-[16px]">
        {(amenExpand ? amenities : amenities.slice(0, 6)).map((o: any, i: number) => (
          <div key={i} className="w-[231px] px-[12px] py-[16px] flex gap-[8px] items-center cursor-default hover:bg-neutral-50">
            {/* Using dynamic icons from your map if available, otherwise img */}
            <DynamicIcon name={o.icon} className="opacity-70" size={24} />
            <p className="text-[16px] text-neutral-700">{o.name}</p>
          </div>
        ))}
      </div>
      {amenities.length > 6 && (
        <button 
          onClick={() => setAmenExpand(!amenExpand)} 
          className="flex w-fit h-[40px] justify-center items-center px-6 border-2 border-blue-500 rounded-[10px] text-blue-500 hover:bg-blue-50 transition-colors font-semibold"
        >
          {amenExpand ? "Show less" : `Show all ${amenities.length} Amenities`}
        </button>
      )}
    </div>
  );
}