"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DatePicker, Popover } from "antd";
import type { Dayjs } from "dayjs";
import dynamic from "next/dynamic";

const MapPickerModal = dynamic(() => import("@/components/ui/MapPickerModal"), {
  ssr: false,
});

import {
  FaSearch,
  FaHotel,
  FaHome,
  FaDoorOpen,
  FaCampground,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { FaCableCar } from "react-icons/fa6";

const SearchSection = () => {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [guestsOpen, setGuestsOpen] = useState(false);

  const guestsContent = (
    <div className="flex w-[280px] flex-col gap-5 p-1">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-medium text-neutral-700">Rooms</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRooms(Math.max(1, rooms - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-black hover:text-black"
          >
            <FaMinus size={12} />
          </button>
          <span className="w-4 text-center font-medium">{rooms}</span>
          <button
            onClick={() => setRooms(rooms + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-black hover:text-black"
          >
            <FaPlus size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[16px] font-medium text-neutral-700">Adults</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdults(Math.max(1, adults - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-black hover:text-black"
          >
            <FaMinus size={12} />
          </button>
          <span className="w-4 text-center font-medium">{adults}</span>
          <button
            onClick={() => setAdults(adults + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-black hover:text-black"
          >
            <FaPlus size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[16px] font-medium text-neutral-700">Children</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setChildren(Math.max(0, children - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-black hover:text-black"
          >
            <FaMinus size={12} />
          </button>
          <span className="w-4 text-center font-medium">{children}</span>
          <button
            onClick={() => setChildren(children + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-black hover:text-black"
          >
            <FaPlus size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (lat) params.append("lat", lat.toString());
    if (lng) params.append("lng", lng.toString());
    if (checkIn) params.append("checkin", checkIn.format("YYYY-MM-DD"));
    if (checkOut) params.append("checkout", checkOut.format("YYYY-MM-DD"));
    // params.append("rooms", rooms.toString());
    params.append("adults", adults.toString());
    params.append("children", children.toString());

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative z-50 mx-auto -mt-22 w-full max-w-[1146px]">
      <div className="flex items-center justify-center min-w-[812px]">
        {/* <div className="absolute z-30 flex items-center bg-black/30 backdrop-blur-xl rounded-full gap-2 px-[24px] py-[16px]">
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
        </div> */}

        <div className="absolute z-20 mt-40 w-full flex items-center gap-2 rounded-[28px] border border-gray-100 bg-white px-[16px] pb-[29px] pt-[53px] shadow-2xl">
          <div 
            className="flex-2 w-full cursor-pointer border-r border-neutral-200 px-5 py-2 hover:bg-slate-50 transition"
            onClick={() => setMapOpen(true)}
          >
            <p className="text-[18px] font-medium tracking-wider text-neutral-700">
              Location
            </p>
            <p className="w-full text-[16px] text-neutral-600 truncate">
              {location || <span className="text-neutral-400">Where are you going?</span>}
            </p>
          </div>

          <MapPickerModal 
            open={mapOpen}
            initialPosition={lat && lng ? { lat, lng } : null}
            onCancel={() => setMapOpen(false)}
            onConfirm={(city, lat, lng) => {
              setLocation(city);
              setLat(lat);
              setLng(lng);
              setMapOpen(false);
            }}
          />

          <div className="flex-1 w-full border-r border-neutral-200 px-5 py-2">
            <p className="text-[18px] font-medium tracking-wider text-neutral-700">
              Check In
            </p>
            <DatePicker
              variant="borderless"
              format="DD MMM"
              placeholder="Add Dates"
              value={checkIn}
              onChange={(date) => setCheckIn(date)}
              className="w-full p-0 text-[16px]"
              popupClassName="z-[9999]"
            />
          </div>

          <div className="flex-1 w-full border-r border-neutral-200 px-5 py-2">
            <p className="text-[18px] font-medium tracking-wider text-neutral-700">
              Check Out
            </p>
            <DatePicker
              variant="borderless"
              format="DD MMM"
              placeholder="Add Dates"
              value={checkOut}
              onChange={(date) => setCheckOut(date)}
              className="w-full p-0 text-[16px]"
              popupClassName="z-[9999]"
            />
          </div>

          <Popover
            content={guestsContent}
            trigger="click"
            open={guestsOpen}
            onOpenChange={setGuestsOpen}
            placement="bottomLeft"
          >
            <div className="flex-2 w-full cursor-pointer px-5 py-2 lg:flex-[1.5]">
              <p className="text-[18px] font-medium tracking-wider text-neutral-700">
                Rooms and Guests
              </p>
              <div className="text-[16px] text-neutral-600">
                {rooms} rooms, {adults} adults, {children} children
              </div>
            </div>
          </Popover>

          {/* Search Button */}
          <div className="w-[135px]">
            <button 
              onClick={handleSearch}
              className="flex h-[56px] w-full items-center justify-center gap-[6px] rounded-xl bg-[#0057FF] px-[6px] py-[16px] text-white transition-all hover:bg-blue-700"
            >
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
