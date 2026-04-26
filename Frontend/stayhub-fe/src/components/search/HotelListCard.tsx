"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Carousel } from "antd";
import { FaRegHeart, FaStar, FaUmbrellaBeach } from "react-icons/fa";
import { MdCheck, MdOutlineLocationOn } from "react-icons/md";
import { LuCroissant } from "react-icons/lu";

// 1. Updated Type to match your database view output
export interface SearchResult {
  hotelid: number;
  roomtypeid: number;
  hotel_name: string;
  hotel_classification: number;
  hotel_location: string;
  hotel_city: string | null;
  avg_room_rating: string | number;
  review_count: string | number;
  roomtype_name: string;
  roomtype_size: number;
  roomtype_bed: string;
  total_beds: string | number;
  roomtype_capacity: number;
  roomtype_base_price: number;
  roomtype_images: string[] | null;
  roomtype_amenities: string[];
  room_count: string | number;
  deal_name: string | null;
  deal_starttime: string | null;
  deal_endtime: string | null;
  deal_discount_price: number | null;
  final_price: number;
}

type HotelListCardProps = {
  hotel: SearchResult;
  viewMode?: "list" | "grid";
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

function getRatingLabel(rating: number) {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.0) return "Good";
  if (rating > 0) return "Fair";
  return "No Rating";
}

export default function HotelListCard({
  hotel,
  viewMode = "list",
}: HotelListCardProps) {
  const router = useRouter();

  // Parsing DB values
  const ratingNum = Number(hotel.avg_room_rating);
  const reviewCount = Number(hotel.review_count);
  const roomCount = Number(hotel.room_count);
  const ratingLabel = getRatingLabel(ratingNum);
  
  // Image handling (fallback to placeholder if array is empty/null)
  const images = hotel.roomtype_images?.length 
    ? hotel.roomtype_images 
    : ["/images/Product-card-1.jpg"];

  // Logic for UI conditionals
  const isLowAvailability = roomCount <= 3;
  const hasDiscount = hotel.deal_discount_price !== null && hotel.deal_discount_price > 0;

  // Handle entire card click
  const handleCardClick = () => {
    router.push(`/hotels/${hotel.hotelid}/rooms/${hotel.roomtypeid}`);
  };

  // Dynamically set image wrapper size based on viewMode
  const renderImageCarousel = () => {
    const slideClass = viewMode === "grid" 
      ? "relative h-[220px] w-full" 
      : "relative h-[260px] w-full";

    const imageSizes = viewMode === "grid" 
      ? "(max-width: 768px) 100vw, 33vw" 
      : "(max-width: 768px) 100vw, 260px";

    return (
      <Carousel 
        autoplay 
        autoplaySpeed={4000} 
        dots={true} 
        arrows={false} 
        className="h-full w-full"
      >
        {images.map((img, idx) => (
          <div key={idx} className={slideClass}>
            <Image
              src={img}
              alt={`${hotel.hotel_name} - image ${idx + 1}`}
              fill
              sizes={imageSizes}
              className="object-cover"
            />
          </div>
        ))}
      </Carousel>
    );
  };

  if (viewMode === "grid") {
    return (
      <Card
        onClick={handleCardClick}
        className="cursor-pointer rounded-xl! border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md mb-0 h-full flex flex-col"
        styles={{ body: { padding: 10, flex: 1, display: "flex", flexDirection: "column" } }}
      >
        <div className="flex flex-col gap-4 flex-1">
          {/* Image Section */}
          <div className="relative h-[220px] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {renderImageCarousel()}

            {hotel.deal_name ? (
              <div className="absolute z-10 left-0 top-0 rounded-tl-xl rounded-br-xl bg-[#003499] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                {hotel.deal_name}
              </div>
            ) : null}

            <button 
              onClick={(e) => e.stopPropagation()}
              className="absolute z-10 right-2.5 top-2.5 rounded-full bg-white p-1.5 text-slate-600 shadow transition-colors hover:text-red-500"
            >
              <FaRegHeart size={14} />
            </button>
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/hotels/${hotel.hotelid}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate text-[16px] leading-tight font-bold text-slate-900 hover:text-[#003499]"
              >
                {hotel.hotel_name}
              </Link>
              <div className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-slate-700">
                {hotel.hotel_classification > 0 && (
                  <>
                    {hotel.hotel_classification} <FaStar className="text-yellow-400" size={11} />
                  </>
                )}
              </div>
            </div>

            <div className="mt-1.5 flex items-center gap-1 text-[12.5px] text-slate-500">
              <MdOutlineLocationOn size={15} className="text-[#0051cb] shrink-0" />
              {hotel.hotel_city ? (
                <Link
                  href={`/explore/${hotel.hotel_city}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-[#0051cb] hover:underline truncate"
                >
                  {hotel.hotel_city}
                </Link>
              ) : (
                <span className="truncate">{hotel.hotel_location}</span>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex h-[22px] px-1.5 items-center justify-center rounded-md rounded-tr-none border-blue-50 bg-[#f0f6ff] text-[11px] font-bold text-[#003499]">
                {ratingNum.toFixed(1)}
              </div>
              <div className="text-[11.5px] font-bold text-[#003499]">
                {ratingLabel}
              </div>
              <div className="text-[11.5px] text-slate-400">
                {formatNumber(reviewCount)} reviews
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px] text-slate-600 line-clamp-1">
              <span className="font-bold text-slate-800">{hotel.roomtype_name}</span>
              <span className="text-slate-300">|</span>
              {[
                hotel.roomtype_size ? `${hotel.roomtype_size} m²` : null, 
                hotel.roomtype_bed
              ].filter(Boolean).map((item, idx) => (
                <span key={idx} className="after:ml-1.5 after:content-['•'] last:after:hidden">
                  {item}
                </span>
              ))}
            </div>

            {isLowAvailability ? (
              <div className="mt-1 text-[11px] font-medium text-red-500">
                Only {roomCount} rooms left!
              </div>
            ) : null}

            <div className="mt-auto pt-4 flex items-end justify-between">
              <div>
                {hasDiscount ? (
                  <span className="rounded-full bg-[#dcfce7] px-2 py-1 text-[11px] font-bold text-[#049153]">
                    Save {formatPrice(hotel.deal_discount_price!)}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col items-end text-right">
                <div className="flex items-baseline gap-1.5">
                  {hasDiscount ? (
                    <span className="text-xs font-medium text-slate-400 line-through">
                      {formatPrice(hotel.roomtype_base_price)}
                    </span>
                  ) : null}
                  <span className="text-[17px] font-bold text-slate-900">
                    {formatPrice(hotel.final_price)}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  5 nights, {hotel.roomtype_capacity} guests
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // --- LIST VIEW ---
  return (
    <Card
      onClick={handleCardClick}
      className="cursor-pointer rounded-xl! border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md mb-4!"
      styles={{ body: { padding: 10 } }}
    >
      <div className="flex w-full gap-5 flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative h-[260px] w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 md:w-[260px]">
          {renderImageCarousel()}

          {hotel.deal_name ? (
            <div className="absolute z-10 left-0 top-0 rounded-tl-xl rounded-br-xl bg-[#003499] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              {hotel.deal_name}
            </div>
          ) : null}

          <button 
            onClick={(e) => e.stopPropagation()}
            className="absolute z-10 right-3 top-3 rounded-full bg-white p-2 text-slate-600 shadow transition-colors hover:text-red-500"
          >
            <FaRegHeart size={14} />
          </button>
        </div>

        <div className="flex flex-1 flex-col py-1">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/hotels/${hotel.hotelid}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[22px] leading-tight font-bold text-slate-900 hover:text-[#003499]"
                >
                  {hotel.hotel_name}
                </Link>
                <div className="mt-1 flex gap-0.5 text-sm text-yellow-400 md:mt-0">
                  {Array.from({ length: hotel.hotel_classification }).map((_, index) => (
                    <FaStar key={`star-${index}`} />
                  ))}
                </div>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                <MdOutlineLocationOn size={18} className="text-[#0051cb] shrink-0" />
                {hotel.hotel_city ? (
                  <Link
                    href={`/explore/${hotel.hotel_city}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-[#0051cb] hover:underline truncate"
                  >
                    {hotel.hotel_city}
                  </Link>
                ) : (
                  <span className="truncate">{hotel.hotel_location}</span>
                )}
                {/* <span>•</span>
                <FaUmbrellaBeach size={13} className="text-slate-400" />
                <span>View on Map</span>  */}
              </div>
            </div>

            <div className="ml-4 flex gap-2.5 text-right">
              <div className="mt-0.5 hidden sm:block">
                <div className="text-sm leading-tight font-bold text-[#003499]">
                  {ratingLabel}
                </div>
                <div className="text-xs text-slate-500">
                  {formatNumber(reviewCount)} reviews
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl rounded-tl-none border border-blue-50 bg-[#f0f6ff] text-lg font-bold text-[#003499]">
                {ratingNum.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-slate-700">
                <span className="font-bold text-slate-900">{hotel.roomtype_name}</span>
                <span className="text-slate-300">|</span>
                {[
                  hotel.roomtype_size ? `${hotel.roomtype_size} m²` : null, 
                  hotel.roomtype_bed
                ].filter(Boolean).map((item, idx) => (
                  <span key={idx} className="after:ml-1.5 after:content-['•'] last:after:hidden">
                    {item}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {hotel.roomtype_amenities?.slice(0, 2).map((amenity, index) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    {index === 0 ? (
                      <MdCheck size={16} className="text-slate-400" />
                    ) : (
                      <LuCroissant size={14} className="text-slate-400" />
                    )}
                    {amenity}
                  </div>
                ))}
              </div>

              {isLowAvailability ? (
                <div className="mt-1 text-xs font-medium text-red-500">
                  Only {roomCount} rooms left!
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-end text-right">
              {hasDiscount ? (
                <span className="mb-1.5 rounded-full bg-[#dcfce7] px-2 py-1 text-xs font-bold text-[#049153]">
                  Save {formatPrice(hotel.deal_discount_price!)}
                </span>
              ) : null}
              <div className="flex items-baseline gap-2">
                {hasDiscount ? (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    {formatPrice(hotel.roomtype_base_price)}
                  </span>
                ) : null}
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(hotel.final_price)}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                5 nights, {hotel.roomtype_capacity} guests
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ant-carousel .slick-dots li button {
          height: 6px !important;
          border-radius: 4px !important;
          background: white !important;
          opacity: 0.6;
        }
        .ant-carousel .slick-dots li.slick-active button {
          opacity: 1;
          width: 16px !important;
        }
      `}</style>
    </Card>
  );
}