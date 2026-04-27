"use client";

import { useState, useEffect } from "react";
import { Card, Checkbox, Slider } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// UI Icons
import { MdKeyboardArrowDown } from "react-icons/md";
import { LuMinus, LuPlus } from "react-icons/lu";
import { DynamicIcon } from "@/utils/amenityIconMap";

const FILTER_CATEGORIES = [
  "Price Range",
  "Rooms and Beds",
  "Room Size",
  "Guest Review Score",
  "Property Classification",
  "Amenities",
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

const SIZE_OPTIONS = [
  { label: "Small (≤ 25 m²)", min: 0, max: 25 },
  { label: "Medium (26–40 m²)", min: 26, max: 40 },
  { label: "Large (≥ 41 m²)", min: 41, max: 9999 },
];

type CounterKey = "minAvailableRoom" | "minBedCount";

interface AmenityItem {
  name: string;
  icon: string;
  hotel_count: number;
}

interface AmenityCategory {
  category: string;
  amenities_list: AmenityItem[];
}

interface HotelFilterSidebarProps {
  priceHistogram?: number[];
}

// Helper to extract numeric values from review labels
const parseReviewScore = (label: string) => {
  if (label.includes("<")) return 0;
  return parseFloat(label.match(/\d+\.\d+/)?.[0] || "0");
};

export default function HotelFilterSidebar({ priceHistogram = [] }: HotelFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- States ---
  const [openSections, setOpenSections] = useState<string[]>([
    "Price Range",
    "Rooms and Beds",
    "Room Size",
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([200, 1500]);
  
  const [roomCounts, setRoomCounts] = useState<Record<CounterKey, number>>({ 
    minAvailableRoom: 0, 
    minBedCount: 0 
  });
  
  const [selectedRoomSizes, setSelectedRoomSizes] = useState<string[]>([]);
  const [selectedReviewScores, setSelectedReviewScores] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Fetched Data States
  const [amenityGroups, setAmenityGroups] = useState<AmenityCategory[]>([]);
  const [openAmenityGroups, setOpenAmenityGroups] = useState<string[]>([]);

  // --- Fetch Amenities ---
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/amenities`);
        if (res.ok) {
          const data: AmenityCategory[] = await res.json();
          setAmenityGroups(data);
          setOpenAmenityGroups(data.map((group) => group.category));
        }
      } catch (error) {
        console.error("Failed to fetch amenities", error);
      }
    };
    fetchAmenities();
  }, []);

  // --- Sync State from URL Params ---
  useEffect(() => {
    // Sync Price
    const minP = searchParams.get("minPrice");
    const maxP = searchParams.get("maxPrice");
    setPriceRange([minP ? Number(minP) : 200, maxP ? Number(maxP) : 1500]);

    // Sync Counters
    const minR = searchParams.get("minAvailableRoom");
    const minB = searchParams.get("minBedCount");
    setRoomCounts({
      minAvailableRoom: minR ? Number(minR) : 0,
      minBedCount: minB ? Number(minB) : 0,
    });

    // Sync Room Sizes
    const minS = searchParams.get("minSize");
    const maxS = searchParams.get("maxSize");
    if (minS || maxS) {
      const parsedMin = minS ? Number(minS) : 0;
      const parsedMax = maxS ? Number(maxS) : 9999;
      const matchedSizes = SIZE_OPTIONS.filter(
        (opt) => opt.min >= parsedMin && opt.max <= parsedMax
      ).map((opt) => opt.label);
      setSelectedRoomSizes(matchedSizes);
    } else {
      setSelectedRoomSizes([]);
    }

    // Sync Review Scores
    const minRev = searchParams.get("minReviewScore");
    if (minRev) {
      const parsedRev = Number(minRev);
      const matched = REVIEW_OPTIONS.filter((opt) => parseReviewScore(opt) === parsedRev);
      setSelectedReviewScores(matched);
    } else {
      setSelectedReviewScores([]);
    }

    // Sync Classifications
    const classes = searchParams.getAll("classification");
    setSelectedClassifications(
      classes.map((c) => (Number(c) === 0 ? "No rating" : `${c}-star`))
    );

    // Sync Amenities
    setSelectedAmenities(searchParams.getAll("amenities"));
  }, [searchParams]);

  // --- URL Update Helpers ---
  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const updateUrlMultiple = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== "") params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const updateUrlArray = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    values.forEach((val) => params.append(key, val));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // --- Toggles & Handlers ---
  const toggleSection = (category: string) => {
    setOpenSections((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const toggleAmenityGroup = (title: string) => {
    setOpenAmenityGroups((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const toggleAmenity = (value: string, checked: boolean) => {
    const next = checked
      ? [...selectedAmenities, value]
      : selectedAmenities.filter((item) => item !== value);
    updateUrlArray("amenities", next);
  };

  const updateCounter = (key: CounterKey, delta: number) => {
    const newValue = Math.max(0, roomCounts[key] + delta);
    updateUrl(key, newValue > 0 ? String(newValue) : "");
  };

  const handleRoomSizeChange = (values: string[]) => {
    if (values.length === 0) {
      updateUrlMultiple({ minSize: null, maxSize: null });
      return;
    }
    const selectedObjects = SIZE_OPTIONS.filter((opt) => values.includes(opt.label));
    const minSize = Math.min(...selectedObjects.map((opt) => opt.min));
    const maxSize = Math.max(...selectedObjects.map((opt) => opt.max));

    updateUrlMultiple({
      minSize: minSize > 0 ? String(minSize) : null,
      maxSize: maxSize < 9999 ? String(maxSize) : null, 
    });
  };

  const handleReviewChange = (values: string[]) => {
    if (values.length === 0) {
      updateUrl("minReviewScore", "");
      return;
    }
    const minScore = Math.min(...values.map(parseReviewScore));
    updateUrl("minReviewScore", String(minScore));
  };

  const handleStarChange = (values: string[]) => {
    const classVals = values.map((v) => (v === "No rating" ? "0" : parseInt(v).toString()));
    updateUrlArray("classification", classVals);
  };

  const counterLabel = (value: number) => (value === 0 ? "Any" : String(value));

  const clearAllFilters = () => {
    // Pushing the bare pathname immediately clears all URL search params, 
    // which safely resets our UI state via the useEffect
    router.push(pathname, { scroll: false });
  };

  // --- Render Functions ---
  const renderPriceRange = () => {
    const formatPrice = (value: number, isMax = false) => {
      if (isMax && value >= 1500) return "$ 1,500+";
      return `$ ${value.toLocaleString("en-US")}`;
    };

    const displayBars = (priceHistogram.length === 30 ? priceHistogram : Array(30).fill(0))
      .map(val => Math.max(10, val));

    return (
      <div className="px-4 pb-6">
        <p className="text-[14px] font-medium text-slate-500">
          Nightly prices including fees and taxes
        </p>
        <div className="mt-5">
          <div className="relative h-[88px]">
            <div className="absolute inset-x-3 bottom-[28px] flex items-end gap-[2px]">
              {displayBars.map((height, index) => {
                const position = (index / (displayBars.length - 1)) * 1500;
                const dark = position >= priceRange[0] && position <= priceRange[1];

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
                  updateUrlMultiple({
                    minPrice: String(value[0]),
                    maxPrice: String(value[1])
                  });
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
      { key: "minAvailableRoom", label: "Rooms" },
      { key: "minBedCount", label: "Beds" },
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
                onClick={() => updateCounter(counter.key, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-400 transition hover:text-slate-600"
              >
                <LuMinus size={18} />
              </button>

              <span className="min-w-[28px] text-center text-[16px] font-medium text-slate-700">
                {counterLabel(roomCounts[counter.key])}
              </span>

              <button
                onClick={() => updateCounter(counter.key, 1)}
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
    return (
      <div className="px-4 pb-6">
        <Checkbox.Group
          value={selectedRoomSizes}
          onChange={(values) => handleRoomSizeChange(values as string[])}
          className="flex flex-col gap-4"
        >
          {SIZE_OPTIONS.map((option) => (
            <Checkbox
              key={option.label}
              value={option.label}
              className="text-[16px] font-medium text-slate-700"
            >
              {option.label}
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
          onChange={(values) => handleReviewChange(values as string[])}
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
      if (count === 0) return <span className="text-[15px] text-slate-300">☆☆☆☆☆</span>;
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
          onChange={(values) => handleStarChange(values as string[])}
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
    if (amenityGroups.length === 0) {
      return <div className="px-4 pb-6 text-slate-500 text-sm">Loading amenities...</div>;
    }

    return (
      <div className="space-y-1 px-4 pb-6">
        {amenityGroups.map((group) => {
          const isOpen = openAmenityGroups.includes(group.category);

          return (
            <div key={group.category}>
              <button
                onClick={() => toggleAmenityGroup(group.category)}
                className="flex w-full items-center justify-between py-3 text-left focus:outline-none"
              >
                <span className="text-[14.5px] font-semibold text-slate-800">
                  {group.category}
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
                  {group.amenities_list.map((item) => {
                    const checked = selectedAmenities.includes(item.name);

                    return (
                      <button
                        key={item.name}
                        onClick={() => toggleAmenity(item.name, !checked)}
                        className={`
                          flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 focus:outline-none
                          ${
                            checked
                              ? "border-blue-500 bg-[#f0f6ff] text-[#0051cb]"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                          }
                        `}
                      >
                        <DynamicIcon
                          name={item.icon}
                          size={16}
                          className={checked ? "text-[#0051cb]" : "text-slate-500"}
                        />
                        <span className="whitespace-nowrap">{item.name}</span>
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
      case "Price Range": return renderPriceRange();
      case "Rooms and Beds": return renderRoomsAndBeds();
      case "Room Size": return renderRoomSize();
      case "Guest Review Score": return renderGuestReviewScore();
      case "Property Classification": return renderPropertyClassification();
      case "Amenities": return renderAmenities();
      default: return null;
    }
  };

  return (
    <aside className="space-y-4">
      <Card className="w-full max-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="-m-6">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
            <h3 className="text-[15px] font-bold text-slate-700">Filter by:</h3>
            <button
              onClick={clearAllFilters}
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
                  className={`flex flex-col ${!isLast ? "border-b border-slate-100" : ""}`}
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
      `}</style>
    </aside>
  );
}