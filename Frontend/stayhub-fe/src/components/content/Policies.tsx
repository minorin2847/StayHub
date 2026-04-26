"use client";

import { Hotel } from "@/types/Hotel";
import { BsCardChecklist } from "react-icons/bs";
import { 
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling 
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi"; // Added for the empty state icon

const AVAILABLE_ICONS: any = {
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling
};

export default function Policies({ hotelData }: {
    hotelData: any
}) {
    const hasPolicies = hotelData.policies && hotelData.policies.length > 0;

    return (
        <div id="policies" className="w-full h-fit flex flex-col gap-y-[32px] scroll-mt-[100px]">
            <div className="flex flex-col gap-y-[12px]">
                <p className="font-semibold text-[28px]">Policies</p>
                <p className="text-[18px] text-neutral-400">
                    {hasPolicies 
                        ? `${hotelData.name} takes special requests - add in the next step!` 
                        : "Everything is set for your stay."
                    }
                </p>
            </div>

            <div className="flex flex-col border border-neutral-200 rounded-[20px] bg-white overflow-hidden">
                {hasPolicies ? (
                    hotelData.policies.map((obj, index) => {
                        const IconComponent = AVAILABLE_ICONS[obj.icon] || BsCardChecklist;
                        return (
                            <div 
                                key={index} 
                                className={`flex px-[24px] py-[24px] w-full gap-x-[100px] lg:gap-x-[270px] items-start lg:items-center ${
                                    index + 1 < hotelData.policies.length ? "border-b border-b-neutral-200" : ""
                                }`}
                            >
                                <div className="flex gap-x-[12px] w-[200px] shrink-0 items-center text-slate-700">
                                    <IconComponent size={24} className="text-blue-600" />
                                    <p className="font-semibold text-[20px] lg:text-[24px]">{obj.name}</p>
                                </div>
                                <p className="text-[16px] text-slate-600 leading-relaxed">
                                    {obj.description}
                                </p>
                            </div>
                        );
                    })
                ) : (
                    /* --- EMPTY STATE --- */
                    <div className="flex flex-col items-center justify-center py-16 px-6 gap-y-4">
                        <div className="p-4 bg-green-50 rounded-full text-green-500">
                            <HiOutlineSparkles size={40} />
                        </div>
                        <p className="text-[20px] font-medium text-slate-700 text-center">
                            {`No special policies in ${hotelData.name} - you're good to go!`}
                        </p>
                        <p className="text-slate-400 text-sm">Standard hotel rules apply.</p>
                    </div>
                )}
            </div>
        </div>
    );
}