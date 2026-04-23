"use client";

import { useState } from "react";
import { Card, Checkbox, Slider, Tag } from "antd";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  LuArmchair,
  LuBath,
  LuBedSingle,
  LuBriefcaseBusiness,
  LuCoffee,
  LuCookingPot,
  LuDumbbell,
  LuFlame,
  LuMapPinned,
  LuMinus,
  LuCircleParking,
  LuPlus,
  LuShirt,
  LuTv,
  LuUtensilsCrossed,
  LuWaves,
  LuWifi,
  LuWind,
} from "react-icons/lu";
import { TbIroningSteam } from "react-icons/tb";
import { PiHairDryerBold } from "react-icons/pi";
import { GiBarbecue, GiSmokeBomb } from "react-icons/gi";
import { TbAlarmSmoke, TbBuildingWarehouse, TbPool } from "react-icons/tb";
import { IoWaterOutline } from "react-icons/io5";
import { RiHotelBedLine } from "react-icons/ri";
import { BiDrink } from "react-icons/bi";
import { FaRegSnowflake } from "react-icons/fa";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const { CheckableTag } = Tag;

const FILTER_CATEGORIES = [
  "Price Range",
  "Rooms and Beds",
  "Room Size",
  "Guest Review Score",
  "Property Classification",
  "Amenities",
  "Booking Options",
  "Payment Options",
  "Property Type",
  "Accessibility Features",
];

const PRICE_BARS = [
  8, 10, 14, 18, 22, 28, 34, 40, 48, 58, 68, 82, 96, 100, 94, 82, 72, 60, 52,
  45, 40, 36, 32, 28, 24, 20, 18, 15, 12, 10,
];

const REVIEW_OPTIONS = [
  "5.0 Excellent",
  "4.0+ Very good",
  "3.0+ Good",
  "2.0+ Fair",
  "< 2.0 Poor",
];

const STAR_OPTIONS = [
  { value: "5-star", label: "5-star", count: 5 },
  { value: "4-star", label: "4-star", count: 4 },
  { value: "3-star", label: "3-star", count: 3 },
  { value: "2-star", label: "2-star", count: 2 },
  { value: "1-star", label: "1-star", count: 1 },
  { value: "No rating", label: "No rating", count: 0 },
];

const AMENITY_GROUPS = [
  {
    title: "Popular",
    defaultOpen: true,
    items: [
      { key: "air-conditioning", label: "Air Conditioning", icon: LuWind },
      { key: "wifi", label: "Wi-Fi", icon: LuWifi },
      { key: "bbq", label: "BBQ Grill", icon: GiBarbecue },
      { key: "washing-machine", label: "Washing machine", icon: LuShirt },
      { key: "tv", label: "TV", icon: LuTv },
      { key: "kitchen", label: "Kitchen", icon: LuCookingPot },
    ],
  },
  {
    title: "Essentials",
    defaultOpen: true,
    items: [
      { key: "radiant-heating", label: "Radiant Heating", icon: FaRegSnowflake },
      { key: "iron", label: "Iron", icon: TbIroningSteam  },
      { key: "hair-dryer", label: "Hair Dryer", icon: PiHairDryerBold },
      {
        key: "workspace",
        label: "Dedicated Workspace",
        icon: LuBriefcaseBusiness,
      },
    ],
  },
  {
    title: "On-site Services",
    defaultOpen: false,
    items: [
      { key: "daily-housekeeping", label: "Daily Housekeeping", icon: LuBath },
      { key: "front-desk", label: "24h Front Desk", icon: TbBuildingWarehouse },
      { key: "airport-shuttle", label: "Airport Shuttle", icon: LuMapPinned },
    ],
  },
  {
    title: "Features",
    defaultOpen: true,
    items: [
      { key: "breakfast", label: "Breakfast Included", icon: LuCoffee },
      { key: "pool", label: "Pool", icon: TbPool },
      { key: "hot-tub", label: "Hot Tub", icon: LuBath },
      { key: "parking", label: "Free Parking", icon: LuCircleParking  },
      { key: "cot", label: "Cot", icon: LuBedSingle },
      { key: "wellness", label: "Wellness", icon: LuArmchair },
      { key: "kingbed", label: "Kingbed", icon: RiHotelBedLine },
      { key: "petrol", label: "Petrol Station", icon: IoWaterOutline },
      { key: "gym", label: "Gym", icon: LuDumbbell },
      { key: "family-room", label: "Family Room", icon: LuBedSingle },
      { key: "bar", label: "Bar", icon: BiDrink },
      { key: "tea-maker", label: "Tea/coffee Maker", icon: LuCoffee },
      { key: "smoking", label: "Smoking Allowed", icon: GiSmokeBomb },
      { key: "fireplace", label: "Indoor Fireplace", icon: LuFlame },
      { key: "restaurant", label: "Restaurant", icon: LuUtensilsCrossed },
    ],
  },
  {
    title: "Location",
    defaultOpen: true,
    items: [
      { key: "private-beach", label: "Private Beach Area", icon: LuWaves },
      { key: "waterfront", label: "Waterfront", icon: IoWaterOutline },
      { key: "balcony", label: "Balcony", icon: TbBuildingWarehouse },
    ],
  },
  {
    title: "Safety",
    defaultOpen: true,
    items: [
      { key: "smoke-alarm", label: "Smoke Alarm", icon: TbAlarmSmoke },
      { key: "carbon-alarm", label: "Carbon monoxide Alarm", icon: TbAlarmSmoke },
    ],
  },
];

type CounterKey = "beds";

export default function HotelFilterSidebar() {
  const [openSections, setOpenSections] = useState<string[]>([
    "Price Range",
    "Rooms and Beds",
    "Room Size",
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([200, 1500]);
  const [roomCounts, setRoomCounts] = useState<Record<CounterKey, number>>({
    beds: 0,
  });
  const [selectedRoomSizes, setSelectedRoomSizes] = useState<string[]>([]);
  const [selectedReviewScores, setSelectedReviewScores] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<
    string[]
  >([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [openAmenityGroups, setOpenAmenityGroups] = useState<string[]>(
    AMENITY_GROUPS.filter((group) => group.defaultOpen).map((group) => group.title),
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // This pushes the new parameters to the URL without a full page reload
    router.push(`${pathname}?${params.toString()}`);
  };
  // UI toggle
  const toggleSection = (category: string) => {
    setOpenSections((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const toggleAmenityGroup = (title: string) => {
    setOpenAmenityGroups((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };


  // Filter toggles
  const toggleAmenity = (value: string, checked: boolean) => {
    const next = checked ? [...selectedAmenities, value] : selectedAmenities.filter((item) => item !== value);
    setSelectedAmenities(next);
    updateUrl("amenities", next.length > 0 ? next.join(",") : "");
  };

  const updateBedsCounter = (key: CounterKey, delta: number) => {
    const newValue = Math.max(0, roomCounts[key] + delta);
    setRoomCounts((prev) => ({
      ...prev,
      [key]: newValue,
    }));
    updateUrl(key, newValue > 0 ? String(newValue) : "");
  };
  const handleRoomSizeChange = (values: string[]) => {
    setSelectedRoomSizes(values);
    updateUrl("sizes", values.length > 0 ? values.join(",") : "");
  };

  const handleReviewChange = (values: string[]) => {
    setSelectedReviewScores(values);
    updateUrl("reviews", values.length > 0 ? values.join(",") : "");
  };

  const handleStarChange = (values: string[]) => {
    setSelectedClassifications(values);
    updateUrl("stars", values.length > 0 ? values.join(",") : "");
  };
  const counterLabel = (value: number) => {
    return value === 0 ? "Any" : String(value);
  };


  const renderPriceRange = () => {
    const formatPrice = (value: number, isMax = false) => {
      if (isMax && value >= 1500) {
        return "$ 1,500+";
      }

      return `$ ${value.toLocaleString("en-US")}`;
    };
    return (
      <div className="px-4 pb-6">
        <p className="text-[14px] font-medium text-slate-500">
          Nightly prices including fees and taxes
        </p>

        <div className="mt-5">
          <div className="relative h-[88px]">
            <div className="absolute inset-x-3 bottom-[28px] flex items-end gap-[2px]">
              {PRICE_BARS.map((height, index) => {
                const position = (index / (PRICE_BARS.length - 1)) * 1500;
                const dark =
                  position >= priceRange[0] && position <= priceRange[1];

                return (
                  <span
                    key={index}
                    className={`w-[6px] rounded-t-full ${
                      dark ? "bg-[#23262f]" : "bg-[#d8dde7]"
                    }`}
                    style={{ height: `${height * 0.42}px` }}
                  />
                );
              })}
            </div>

            <div className="absolute inset-x-0 bottom-0">
              <Slider
                range
                min={0}
                max={1500}
                step={10}
                value={priceRange}
                onChange={(value) => setPriceRange(value as [number, number])}
                onChangeComplete={(value: number[]) => {
                  updateUrl("minPrice", String(value[0]));
                  updateUrl("maxPrice", String(value[1]));
                }}
                tooltip={{ open: false }}
                className="hotel-price-slider"
              />
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <div className="text-center">
              <p className="text-[14px] font-semibold text-slate-400">Minimum</p>
              <div className="mt-2 rounded-[18px] border border-[#94a3b8] px-5 py-2.5 text-[15px] font-semibold text-slate-700">
                {formatPrice(priceRange[0])}
              </div>
            </div>

            <div className="text-center">
              <p className="text-[14px] font-semibold text-slate-400">Maximum</p>
              <div className="mt-2 rounded-[18px] border border-[#94a3b8] px-5 py-2.5 text-[15px] font-semibold text-slate-700">
                {formatPrice(priceRange[1], true)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRoomsAndBeds = () => {
    const counters: { key: CounterKey; label: string }[] = [
      { key: "beds", label: "Beds" },
    ];

    return (
      <div className="space-y-8 px-4 pb-6 pt-1">
        {counters.map((counter) => (
          <div key={counter.key} className="flex items-center justify-between">
            <span className="text-[16px] font-semibold text-slate-700">
              {counter.label}
            </span>

            <div className="flex items-center gap-4">
              <button
                onClick={() => updateBedsCounter(counter.key, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-400 transition hover:text-slate-600"
              >
                <LuMinus size={18} />
              </button>

              <span className="min-w-[28px] text-center text-[16px] font-medium text-slate-700">
                {counterLabel(roomCounts[counter.key])}
              </span>

              <button
                onClick={() => updateBedsCounter(counter.key, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-500 text-slate-700 transition hover:bg-slate-50"
              >
                <LuPlus size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRoomSize = () => {
    const options = [
      "Small (≤ 25 m²)",
      "Medium (26–40 m²)",
      "Large (≥ 41 m²)",
    ];

    return (
      <div className="px-4 pb-6">
        <Checkbox.Group
          value={selectedRoomSizes}
          onChange={(values) => handleRoomSizeChange(values)}
          className="flex flex-col gap-4"
        >
          {options.map((option) => (
            <Checkbox
              key={option}
              value={option}
              className="text-[16px] font-medium text-slate-700"
            >
              {option}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    );
  };


  const renderGuestReviewScore = () => {
    return (
      <div className="px-4 pb-6">
        <Checkbox.Group
          value={selectedReviewScores}
          onChange={(values) => handleReviewChange(values)}
          className="flex flex-col gap-3"
        >
          {REVIEW_OPTIONS.map((option) => (
            <Checkbox
              key={option}
              value={option}
              className="text-[15px] font-medium text-slate-700"
            >
              {option}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    );
  };

  const renderPropertyClassification = () => {
    const renderStars = (count: number) => {
      if (count === 0) {
        return <span className="text-[15px] text-slate-300">☆☆☆☆☆</span>;
      }

      return (
        <span className="text-[15px] tracking-[2px] text-[#f4b400]">
          {"★".repeat(count)}
          <span className="text-slate-300">{"☆".repeat(5 - count)}</span>
        </span>
      );
    };

    return (
      <div className="px-4 pb-6">
        <Checkbox.Group
          value={selectedClassifications}
          onChange={(values) => handleStarChange(values)}
          className="flex flex-col gap-3"
        >
          {STAR_OPTIONS.map((option) => (
            <Checkbox
              key={option.value}
              value={option.value}
              className="text-[15px] font-medium text-slate-700"
            >
              <span className="inline-flex items-center gap-3">
                {renderStars(option.count)}
                <span>{option.label}</span>
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    );
  };

  const renderAmenities = () => {
    return (
      <div className="space-y-1 px-4 pb-6">
        {AMENITY_GROUPS.map((group) => {
          const isOpen = openAmenityGroups.includes(group.title);

          return (
            <div key={group.title}>
              <button
                onClick={() => toggleAmenityGroup(group.title)}
                className="flex w-full items-center justify-between py-3 text-left focus:outline-none"
              >
                <span className="text-[14.5px] font-semibold text-slate-800">
                  {group.title}
                </span>
                <MdKeyboardArrowDown
                  size={20}
                  className={`text-slate-500 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen ? (
                <div className="flex flex-wrap gap-2.5 pb-2 pt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const checked = selectedAmenities.includes(item.key);

                    return (
                      <button
                        key={item.key}
                        onClick={() => toggleAmenity(item.key, !checked)}
                        className={`
                          flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 focus:outline-none
                          ${
                            checked
                              ? "border-blue-500 bg-[#f0f6ff] text-[#0051cb]"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                          }
                        `}
                      >
                        <Icon
                          size={16}
                          className={checked ? "text-[#0051cb]" : "text-slate-500"}
                        />
                        {/* whitespace-nowrap là class quan trọng nhất để giữ form pill không bị vỡ */}
                        <span className="whitespace-nowrap">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSectionContent = (category: string) => {
    switch (category) {
      case "Price Range":
        return renderPriceRange();
      case "Rooms and Beds":
        return renderRoomsAndBeds();
      case "Room Size":
        return renderRoomSize();
      case "Guest Review Score":
        return renderGuestReviewScore();
      case "Property Classification":
        return renderPropertyClassification();
      case "Amenities":
        return renderAmenities();
      default:
        return (
          <div className="px-4 pb-4 text-sm text-slate-500">
            <p>Options for {category} will go here...</p>
          </div>
        );
    }
  };

  const clearAllFilters = () => {
    setPriceRange([200, 1500]);
    setRoomCounts({ beds: 0 });
    setSelectedAmenities([]);
    setSelectedRoomSizes([]);
    setSelectedReviewScores([]);
    setSelectedClassifications([]);
    router.push(pathname, { scroll: false });
  };

  return (
    <aside className="space-y-4">
      {/* <Card className="w-full max-w-[280px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm mb-4!">
        <div className="-m-6">
          <div className="relative h-[220px] overflow-hidden bg-[#f6f6f7]">
            <div className="relative flex h-full items-center justify-center p-5">
              <button className="flex items-center gap-3 rounded-[20px] border-2 border-[#0051ff] bg-white px-7 py-4 text-[17px] font-semibold text-[#0051ff] shadow-sm transition hover:bg-blue-50">
                <LuMapPinned size={24} />
                Show on Map
              </button>
            </div>
          </div>
        </div>
      </Card> */}

      <Card className="w-full max-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="-m-6">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
            <h3 className="text-[15px] font-bold text-slate-700">Filter by:</h3>
            <button
              onClick={() => clearAllFilters()}
              className="text-sm text-slate-400 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-slate-600"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-col bg-white">
            {FILTER_CATEGORIES.map((category, index) => {
              const isOpen = openSections.includes(category);
              const isLast = index === FILTER_CATEGORIES.length - 1;

              return (
                <div
                  key={category}
                  className={`flex flex-col ${
                    !isLast ? "border-b border-slate-100" : ""
                  }`}
                >
                  <button
                    onClick={() => toggleSection(category)}
                    className="group flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-slate-50 focus:outline-none"
                  >
                    <span className="text-[14px] font-semibold text-slate-700 transition-colors group-hover:text-slate-900">
                      {category}
                    </span>

                    <MdKeyboardArrowDown
                      size={20}
                      className={`text-slate-600 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen ? renderSectionContent(category) : null}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <style jsx global>{`
        .ant-checkbox .ant-checkbox-inner {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border-color: rgb(203 213 225);
        }

        .ant-checkbox-wrapper {
          align-items: center;
          margin-inline-start: 0 !important;
        }

        .ant-checkbox + span {
          padding-inline-start: 10px;
          font-size: 14px;
          color: rgb(51 65 85);
        }

 

        .hotel-price-slider {
          margin: 0 !important;
          padding: 0 12px !important;
        }

        .hotel-price-slider .ant-slider-rail {
          height: 2px !important;
          background: #d7dce4 !important;
        }

        .hotel-price-slider .ant-slider-track {
          height: 2px !important;
          background: #23262f !important;
        }

        .hotel-price-slider .ant-slider-handle::after {
          width: 26px !important;
          height: 26px !important;
          inset-block-start: -12px !important;
          inset-inline-start: -12px !important;
          background: white !important;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12) !important;
          border: 1px solid rgb(226 232 240) !important;
        }

        .hotel-price-slider .ant-slider-handle:focus::after,
        .hotel-price-slider .ant-slider-handle:hover::after,
        .hotel-price-slider .ant-slider-handle-dragging::after {
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12) !important;
        }

        .hotel-distance-slider {
          margin: 0 !important;
          padding: 0 !important;
        }

        .hotel-distance-slider .ant-slider-rail {
          height: 2px !important;
          background: #d7dce4 !important;
        }

        .hotel-distance-slider .ant-slider-track {
          height: 2px !important;
          background: #23262f !important;
        }

        .hotel-distance-slider .ant-slider-handle::after {
          width: 16px !important;
          height: 16px !important;
          inset-block-start: -7px !important;
          inset-inline-start: -7px !important;
          background: #23262f !important;
          border: 3px solid white !important;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12) !important;
        }
      `}</style>
    </aside>
  );
}
