import { IoHeartOutline, IoShareSocialOutline } from "react-icons/io5";

export default function RoomName({ name, location }: {
    name: string,
    location: string
}) {
    return (
               <div className="pt-[40px] flex w-full h-[83px] items-center justify-between py-[8px]">
            <div className="flex flex-col">
                <p className="text-[32px] font-bold">{name}</p>
                <p className="text-[18px]">{location}</p>
            </div>
            <div className="flex w-[88px] h-full gap-[24px] items-center">
                <IoHeartOutline size={32}/>
                <IoShareSocialOutline size={32} />
            </div>
        </div> 
    )
}