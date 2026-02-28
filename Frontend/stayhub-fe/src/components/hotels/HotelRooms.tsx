import { Room } from "@/types/Room";

export default function HotelRooms({ rooms }: { rooms: Room[] }) {
    return (
        <div id="rooms" className="flex flex-col gap-[24px] border scroll-mt-[63px]">
            <p className="text-[28px] font-semibold">Rooms</p>
            <div className="w-full h-[421px] flex flex-wrap gap-[16px] p-[8px]">
                {rooms.map((r, i) => (
                    <div key={i} className="w-[220px] h-[200px] bg-neutral-200 rounded-[12px] flex items-center justify-center">
                        <p className="text-[14px]">{r.type || `Room ${r.id}`}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}