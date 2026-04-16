"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "antd";
import { FaRegHeart, FaStar, FaUmbrellaBeach } from "react-icons/fa";
import { MdCheck, MdOutlineLocationOn } from "react-icons/md";
import { LuCroissant } from "react-icons/lu";
import { HotelListItem } from "./hotelListMockData";

type HotelListCardProps = {
  hotel: HotelListItem;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function HotelListCard({ hotel }: HotelListCardProps) {
  return (
    <Card
      className="rounded-[28px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md mb-4!"
      styles={{ body: { padding: 16 } }}
    >
      <div className="flex w-full flex-col gap-5 md:flex-row">
        <div className="relative h-[260px] w-full shrink-0 overflow-hidden rounded-xl md:w-[260px]">
          <Image
            src={hotel.image}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, 260px"
            className="object-cover"
          />

          {hotel.badge ? (
            <div className="absolute left-0 top-0 rounded-tl-xl rounded-br-xl bg-[#003499] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              {hotel.badge}
            </div>
          ) : null}

          <button className="absolute right-3 top-3 rounded-full bg-white p-2 text-slate-600 shadow transition-colors hover:text-red-500">
            <FaRegHeart size={16} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/60 shadow-sm" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/60 shadow-sm" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/60 shadow-sm" />
          </div>
        </div>

        <div className="flex flex-1 flex-col py-1">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/hotels/${hotel.id}`}
                  className="text-[22px] leading-tight font-bold text-slate-900 hover:text-[#003499]"
                >
                  {hotel.name}
                </Link>
                <div className="mt-1 flex gap-0.5 text-sm text-yellow-400 md:mt-0">
                  {Array.from({ length: hotel.stars }).map((_, index) => (
                    <FaStar key={`${hotel.id}-star-${index}`} />
                  ))}
                </div>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                <MdOutlineLocationOn size={18} className="text-[#0051cb]" />
                <span className="cursor-pointer font-medium text-[#0051cb] hover:underline">
                  {hotel.city}
                </span>
                <span>•</span>
                <span>{hotel.distanceToCenter}</span>
                <span>•</span>
                <FaUmbrellaBeach size={13} className="text-slate-400" />
                <span>{hotel.distanceToBeach}</span>
              </div>
            </div>

            <div className="ml-4 flex gap-2.5 text-right">
              <div className="mt-0.5 hidden sm:block">
                <div className="text-sm leading-tight font-bold text-[#003499]">
                  {hotel.ratingLabel}
                </div>
                <div className="text-xs text-slate-500">
                  {formatNumber(hotel.reviews)} reviews
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl rounded-tl-none border border-blue-50 bg-[#f0f6ff] text-lg font-bold text-[#003499]">
                {hotel.rating.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="flex flex-col gap-2.5">
              <div className="text-[13.5px] text-slate-700">
                <span className="font-bold text-slate-900">{hotel.type}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span>{hotel.roomView}</span>
                <span className="mx-1.5">•</span>
                <span>{hotel.bedType}</span>
                <span className="mx-1.5">•</span>
                <span>{hotel.roomSize}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {hotel.benefits.slice(0, 2).map((benefit, index) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    {index === 0 ? (
                      <MdCheck size={16} className="text-slate-400" />
                    ) : (
                      <LuCroissant size={14} className="text-slate-400" />
                    )}
                    {benefit}
                  </div>
                ))}
              </div>

              {hotel.warning ? (
                <div className="mt-1 text-xs font-medium text-red-500">
                  {hotel.warning}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-end text-right">
              {hotel.discount ? (
                <span className="mb-1.5 rounded-full bg-[#dcfce7] px-2 py-1 text-xs font-bold text-[#049153]">
                  {hotel.discount}
                </span>
              ) : null}
              <div className="flex items-baseline gap-2">
                {hotel.originalPrice ? (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    {formatPrice(hotel.originalPrice)}
                  </span>
                ) : null}
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(hotel.price)}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                5 nights, 2 adults
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
