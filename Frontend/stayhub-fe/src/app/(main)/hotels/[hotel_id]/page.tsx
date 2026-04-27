"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Button, Empty, Result, Spin } from "antd";
import { IoBedOutline, IoPeopleOutline, IoResizeOutline } from "react-icons/io5";
import { FaStar } from "react-icons/fa";

import Overview from "@/components/content/Overview";
import Calendar from "@/components/content/Calendar";
import Policies from "@/components/content/Policies";
import RoomAmenities from "@/components/rooms/content/RoomAmenities";
import { fetchHotelDetail } from "@/services/publicStay";
import type { PublicHotelDetail, PublicRoomType } from "@/types/PublicStay";

function parseDateParam(value: string | null, fallback: Date) {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : fallback;
}

function formatStayDate(value: Date) {
  return dayjs(value).format("YYYY-MM-DD");
}

function summarizeBeds(roomType: PublicRoomType) {
  const totalBeds = roomType.beds.reduce((sum, bed) => sum + bed.count, 0);
  return `${totalBeds} bed${totalBeds === 1 ? "" : "s"}`;
}

function buildRoomDetailHref(
  hotelId: number,
  roomTypeId: number,
  bookingDates: { from: Date; to: Date },
) {
  const params = new URLSearchParams({
    checkin: formatStayDate(bookingDates.from),
    checkout: formatStayDate(bookingDates.to),
  });

  return `/hotels/${hotelId}/rooms/${roomTypeId}?${params.toString()}`;
}

export default function HotelPage() {
  const { hotel_id } = useParams<{ hotel_id: string }>();
  const searchParams = useSearchParams();
  const checkinParam = searchParams.get("checkin");
  const checkoutParam = searchParams.get("checkout");

  const searchAdults = Number(searchParams.get("adults") ?? "");
  const searchChildren = Number(searchParams.get("children") ?? "");

  const [bookingDates, setBookingDates] = useState(() => {
    const fallbackFrom = new Date();
    const fallbackTo = dayjs().add(1, "day").toDate();

    return {
      from: parseDateParam(checkinParam, fallbackFrom),
      to: parseDateParam(checkoutParam, fallbackTo),
    };
  });
  const [data, setData] = useState<PublicHotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fallbackFrom = new Date();
    const fallbackTo = dayjs().add(1, "day").toDate();

    setBookingDates({
      from: parseDateParam(checkinParam, fallbackFrom),
      to: parseDateParam(checkoutParam, fallbackTo),
    });
  }, [checkinParam, checkoutParam]);

  useEffect(() => {
    const hotelId = Number(hotel_id);

    if (Number.isNaN(hotelId) || hotelId <= 0) {
      setError("Invalid hotel id.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchHotelDetail(hotelId, {
          adults: Number.isFinite(searchAdults) && searchAdults > 0 ? searchAdults : undefined,
          children:
            Number.isFinite(searchChildren) && searchChildren >= 0
              ? searchChildren
              : undefined,
          checkin: formatStayDate(bookingDates.from),
          checkout: formatStayDate(bookingDates.to),
        });

        setData(result);
      } catch (fetchError) {
        console.error("Failed to fetch hotel detail:", fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load hotel details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotel_id, searchAdults, searchChildren, bookingDates.from, bookingDates.to]);

  const totalRooms = useMemo(
    () => data?.roomTypes.reduce((sum, roomType) => sum + roomType.totalRoomCount, 0) ?? 0,
    [data],
  );

  const totalAvailableRooms = useMemo(
    () =>
      data?.roomTypes.reduce(
        (sum, roomType) => sum + roomType.availableRoomCount,
        0,
      ) ?? 0,
    [data],
  );

  const lowestPrice = useMemo(() => {
    if (!data?.roomTypes.length) {
      return null;
    }

    return Math.min(...data.roomTypes.map((roomType) => Number(roomType.price)));
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spin size="large" tip="Loading hotel details..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <Result
          status="404"
          title="Hotel not found"
          subTitle={error ?? "We could not load this hotel."}
          extra={
            <Link href="/search">
              <Button type="primary">Back to Search</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-white pb-16">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-5 md:px-[104px]">
        <div
          id="title"
          className="flex flex-col justify-between gap-4 border-b border-slate-100 py-6 md:flex-row md:items-center"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{data.name}</h1>
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: data.classification }).map((_, index) => (
                  <FaStar key={`${data.id}-star-${index}`} size={14} />
                ))}
              </div>
            </div>
            <p className="mt-2 text-[15px] text-slate-500">{data.location}</p>
          </div>

          <div className="flex items-center gap-4 rounded-full bg-slate-50 px-5 py-3 text-sm">
            <span className="font-semibold text-slate-900">
              {Number(data.rating).toFixed(1)}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">
              {data.ratingLabel} · {data.reviewCount} reviews
            </span>
          </div>
        </div>

        <div className="sticky top-0 z-20 mt-2 border-b border-slate-100 bg-white/95 backdrop-blur">
          <div className="flex flex-wrap gap-6 py-4 text-sm font-semibold text-slate-500">
            <a href="#overview" className="hover:text-blue-600">
              Overview
            </a>
            <a href="#rooms" className="hover:text-blue-600">
              Rooms
            </a>
            <a href="#amenities" className="hover:text-blue-600">
              Amenities
            </a>
            <a href="#calendar" className="hover:text-blue-600">
              Calendar
            </a>
            <a href="#policies" className="hover:text-blue-600">
              Policies
            </a>
          </div>
        </div>

        <div className="mt-8">
          <Overview images={data.images} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-12">
            <section id="overview" className="space-y-5 scroll-mt-[120px]">
              <div>
                <p className="text-[28px] font-semibold text-slate-900">Overview</p>
                <p className="mt-4 text-[16px] leading-8 text-slate-600">
                  {data.description || "No description has been added for this hotel yet."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Room types</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {data.roomTypes.length}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">Physical rooms</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{totalRooms}</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Available for selected stay
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {totalAvailableRooms}
                  </p>
                </div>
              </div>
            </section>

            <section id="rooms" className="space-y-6 scroll-mt-[120px]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[28px] font-semibold text-slate-900">Available rooms</p>
                  <p className="mt-2 text-[15px] text-slate-500">
                    Choose a room type to view details and reserve for your selected stay.
                  </p>
                </div>
              </div>

              {data.roomTypes.length === 0 ? (
                <div className="rounded-[32px] border-2 border-dashed border-slate-200 py-12">
                  <Empty description="This hotel does not have any room types yet." />
                </div>
              ) : (
                <div className="grid gap-6 xl:grid-cols-2">
                  {data.roomTypes.map((roomType) => (
                    <article
                      key={roomType.id}
                      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                    >
                      <div
                        className="h-[240px] w-full bg-slate-100 bg-cover bg-center"
                        style={{ backgroundImage: `url(${roomType.image})` }}
                      />

                      <div className="space-y-5 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-[24px] font-bold text-slate-900">
                              {roomType.name}
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                              {roomType.availableRoomCount > 0
                                ? `${roomType.availableRoomCount}/${roomType.totalRoomCount} rooms available`
                                : "Sold out for the selected stay"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">From</p>
                            <p className="text-[28px] font-bold text-slate-900">
                              ${Number(roomType.price).toLocaleString("en-US")}
                            </p>
                            <p className="text-xs text-slate-400">per night</p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <IoPeopleOutline size={18} />
                            <span>{roomType.capacity} guests</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <IoBedOutline size={18} />
                            <span>{summarizeBeds(roomType)}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <IoResizeOutline size={18} />
                            <span>{roomType.size} m2</span>
                          </div>
                        </div>

                        <p className="line-clamp-3 text-[15px] leading-7 text-slate-600">
                          {roomType.description || "No description has been added for this room type yet."}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {roomType.amenities.slice(0, 4).map((amenity) => (
                            <span
                              key={`${roomType.id}-${amenity.name}`}
                              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500"
                            >
                              {amenity.name}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={buildRoomDetailHref(data.id, roomType.id, bookingDates)}
                          className="inline-flex items-center justify-center rounded-[16px] bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          View room details
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section id="amenities" className="scroll-mt-[120px]">
              <RoomAmenities roomData={{ amenities: data.amenities }} />
            </section>

            <section id="calendar" className="scroll-mt-[120px]">
              <Calendar
                fromDate={bookingDates.from}
                toDate={bookingDates.to}
                onChange={(from, to) => {
                  setBookingDates({
                    from: from ?? new Date(),
                    to: to ?? dayjs(from ?? new Date()).add(1, "day").toDate(),
                  });
                }}
              />
            </section>

            <Policies hotelData={{ name: data.name, policies: data.policies }} />
          </div>

          <aside className="h-fit lg:sticky lg:top-[120px]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Your stay
              </p>
              <h2 className="mt-3 text-[28px] font-bold text-slate-900">{data.name}</h2>
              <p className="mt-2 text-[15px] leading-7 text-slate-500">{data.location}</p>

              <div className="mt-6 space-y-3 rounded-[22px] bg-white p-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Check-in</span>
                  <span className="font-semibold text-slate-900">
                    {dayjs(bookingDates.from).format("DD MMM YYYY")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Check-out</span>
                  <span className="font-semibold text-slate-900">
                    {dayjs(bookingDates.to).format("DD MMM YYYY")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Rating</span>
                  <span className="font-semibold text-slate-900">
                    {Number(data.rating).toFixed(1)} · {data.ratingLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Starting price</span>
                  <span className="font-semibold text-slate-900">
                    {lowestPrice !== null
                      ? `$${Number(lowestPrice).toLocaleString("en-US")}/night`
                      : "Unavailable"}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-500">
                Room availability refreshes based on the dates you pick in the calendar.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
