import Image from "next/image";

import {
  FaSearch,
  FaHotel,
  FaHome,
  FaDoorOpen,
  FaCampground,
} from "react-icons/fa";
import { FaCableCar } from "react-icons/fa6";

const SearchSection = () => {
  return (
    <div className="relative z-50 -mt-22 w-full max-w-[1146px] mx-auto">
      <div className="flex items-center justify-center min-w-[812px]">
        <div className="absolute z-30 flex items-center bg-black/30 backdrop-blur-xl rounded-full gap-2 px-[24px] py-[16px]">
          <button className="flex items-center gap-2 px-[16px] py-2 bg-white text-gray-800 rounded-full font-medium text-[16px] transition">
            <FaHotel size={24} />
            <span>Hotel</span>
          </button>
          <button className="flex items-center gap-2 px-[16px] py-2 text-white hover:bg-white/10 rounded-full font-medium text-[16px] transition">
            <FaHome size={24} />
            <span>House</span>
          </button>
          <button className="flex items-center gap-2 px-[16px] py-2 text-white hover:bg-white/10 rounded-full font-medium text-[16px] transition  ">
            <FaDoorOpen size={24} />
            <span>Guest House</span>
          </button>
          <button className="flex items-center gap-2 px-[16px] py-2 text-white hover:bg-white/10 rounded-full font-medium text-[16px] transition  ">
            <FaCableCar size={24} />
            <span>Cabins</span>
          </button>
          <button className="flex items-center gap-2 px-[16px] py-2 text-white hover:bg-white/10 rounded-full font-medium text-[16px] transition  ">
            <FaCampground size={24} />
            <span>Glamping</span>
          </button>
          <button className="flex items-center gap-2 px-[16px] py-2 text-white hover:bg-white/10 rounded-full font-medium text-[16px] transition  ">
            <Image
              src="/icons/Doms.svg"
              alt="Icon Doms"
              width={24}
              height={24}
            />
            <span>Glamping</span>
          </button>
        </div>

        <div className="absolute z-20 mt-40 bg-white rounded-[28px] shadow-2xl px-[16px] pt-[53px] pb-[29px] flex items-center gap-2 border border-gray-100 w-full">
          <div className="w-full px-5 py-2 border-r border-neutral-200 flex-2">
            <p className="text-[18px] font-medium text-neutral-700 tracking-wider">
              Location
            </p>
            <input
              type="text"
              placeholder="Where are you going?"
              className="w-full text-[16px] text-neutral-600 bg-transparent focus:outline-none placeholder:text-neutral-400"
            />
          </div>
          <div className="w-full px-5 py-2 border-r border-neutral-200 flex-1">
            <p className="text-[18px] font-medium text-neutral-700 tracking-wider">
              Check In
            </p>
            <p className="text-[16px] text-neutral-400 cursor-pointer transition">
              Add Dates
            </p>
          </div>

          <div className="w-full px-5 py-2 border-r border-neutral-200 flex-1">
            <p className="text-[18px] font-medium text-neutral-700 tracking-wider">
              Check Out
            </p>
            <p className="text-[16px] text-neutral-400 cursor-pointer transition">
              Add Dates
            </p>
          </div>

          <div className="w-full lg:flex-[1.5] px-5 py-2 flex-2">
            <p className="text-[18px] font-medium text-neutral-700 tracking-wider">
              Rooms and Guests
            </p>
            <input
              type="text"
              placeholder="1 rooms, 1 adults, 0 children"
              className="w-full text-[16px] text-neutral-600 bg-transparent focus:outline-none placeholder:text-neutral-400"
            />
          </div>

          {/* Search Button */}
          <div className="w-[135px]">
            <button className="w-full bg-[#0057FF] hover:bg-blue-700 text-white px-[6px] py-[16px] h-[56px] rounded-xl flex items-center justify-center gap-[6px] transition-all">
              <Image
                src="/icons/Search.svg"
                alt="Icon Search"
                width={26}
                height={26}
              />
              <span className="text-[20px]">Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
