"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DatePicker, Popover, AutoComplete } from "antd";
import type { Dayjs } from "dayjs";
import { FaPlus, FaMinus } from "react-icons/fa";
import { City } from "@/types/City";

const SearchSection = () => {
  const router = useRouter();

  // --- New State for Cities and AutoComplete ---
  const [cities, setCities] = useState<City[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedAbbreviation, setSelectedAbbreviation] = useState("");

  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [guestsOpen, setGuestsOpen] = useState(false);

  // --- Fetch Cities on Mount ---
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cities`,
        );
        if (response.ok) {
          const data = await response.json();
          setCities(data.map((cityData: any) => cityData as City));
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };

    fetchCities();
  }, []);

  // --- AutoComplete Handlers ---
  const handleSelectCity = (value: string, option: any) => {
    setSelectedAbbreviation(value); // Store the abbreviation
    setSearchValue(option.label); // Display the city name
  };

  const handleChangeSearch = (value: string) => {
    setSearchValue(value);
    // If the user clears or modifies the text, clear the abbreviation until re-selected
    if (!value) {
      setSelectedAbbreviation("");
    }
  };

  const cityOptions = cities.map((city) => ({
    value: city.abbreviation,
    label: city.name,
  }));

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
        <span className="text-[16px] font-medium text-neutral-700">
          Children
        </span>
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

    // Save abbreviation as requested
    if (selectedAbbreviation)
      params.append("abbreviation", selectedAbbreviation);

    if (checkIn) params.append("checkin", checkIn.format("YYYY-MM-DD"));
    if (checkOut) params.append("checkout", checkOut.format("YYYY-MM-DD"));
    params.append("adults", adults.toString());
    params.append("children", children.toString());

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative z-50 mx-auto -mt-22 w-full max-w-[1146px]">
      <div className="flex items-center justify-center min-w-[812px]">
        <div className="absolute z-20 mt-40 w-full flex items-center gap-2 rounded-[28px] border border-gray-100 bg-white px-[16px] pb-[29px] pt-[53px] shadow-2xl">
          {/* --- Updated AutoComplete Location Field --- */}
          <div className="flex-2 w-full border-r border-neutral-200 px-5 py-2 transition focus-within:bg-slate-50 hover:bg-slate-50">
            <p className="text-[18px] font-medium tracking-wider text-neutral-700">
              Location
            </p>
            <AutoComplete
              options={cityOptions}
              value={searchValue}
              onChange={handleChangeSearch}
              onSelect={handleSelectCity}
              placeholder="Where are you going?"
              variant="borderless"
              popupClassName="z-[9999]"
              filterOption={(inputValue, option) =>
                (option?.label ?? "")
                  .toUpperCase()
                  .includes(inputValue.toUpperCase())
              }
              className="w-full text-[16px] p-0"
            />
          </div>

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
