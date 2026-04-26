import { Hotel } from "@/types/Hotel";
import { BsCardChecklist } from "react-icons/bs";
import { 
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling 
} from "react-icons/fa";

const AVAILABLE_ICONS: any = {
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling
};

export default function Policies({ hotelData }: {
    hotelData: Hotel
}) {
    return (
        <div id="policies" className="w-full h-fit flex flex-col gap-y-[32px]">
            <div className="flex flex-col gap-y-[12px]">
                <p className="font-semibold text-[28px]">Policies</p>
                <p className="text-[18px] text-neutral-400">{`${hotelData.name} takes special requests - add in the next step!`}</p>
            </div>
            <div className="flex flex-col border border-neutral-200 rounded-[20px]">
                {
                    hotelData.policies.map((obj, index) => {
                        const IconComponent = AVAILABLE_ICONS[obj.icon] || BsCardChecklist;
                        return (
                            <div key={index} className={`flex px-[24px] py-[18px] w-full gap-x-[270px] items-center ${index+1 < hotelData.policies.length ? "border-b border-b-neutral-200" : ""}`}>
                                <div className="flex gap-x-[8px] w-fit items-center text-slate-700">
                                    <IconComponent size={24} />
                                    <p className="font-semibold text-[24px]">{obj.name}</p>
                                </div>
                                <p className="text-[16px] max-w-2/3">{obj.description}</p>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    )
}