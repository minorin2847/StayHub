"use client";

import { useEffect, useState } from "react";
import { Spin, Empty } from "antd"; // Added Empty for a nice fallback UI
import Link from "next/link";
import { IoBedOutline, IoPersonOutline, IoResizeOutline } from "react-icons/io5";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "../ui/carousel";

interface OtherRoomProps {
  hotelName: string;
  hotelId: number | string;
  currentRoomId: number | string;
}

export default function OtherRoom({ hotelName, hotelId, currentRoomId }: OtherRoomProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hotels/${hotelId}/other-rooms?exclude_id=${currentRoomId}`
        );
        const data = await response.json();
        setRooms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching other rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) fetchRooms();
  }, [hotelId, currentRoomId]);

  const reviewJudgement = (score: number): { name: string; color: string } => {
    const s = Number(score);
    if (s <= 0) return { name: "No reviews", color: "#94a3b8" };
    if (s < 2.0) return { name: "Bad", color: "#f44336" };
    if (s < 3.0) return { name: "Okay", color: "#ff6900" };
    if (s < 4.0) return { name: "Average", color: "#f0b100" };
    if (s < 5.0) return { name: "Good", color: "#00c950" };
    return { name: "Excellent", color: "#2b7fff" };
  };

  return (
    <div className="bg-neutral-100/50 py-16">
      <Carousel opts={{ align: "start" }} className="mx-auto flex w-full max-w-[1440px] flex-col gap-y-8 px-5 md:px-[104px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[32px] font-bold tracking-tight text-slate-900 md:text-[40px]">
            {`Other Rooms in ${hotelName}`}
          </h2>
          {/* Hide navigation if there are no rooms */}
          {!loading && rooms.length > 0 && (
            <div className="flex items-center gap-2">
              <CarouselPrevious className="static h-10 w-10 translate-y-0" />
              <CarouselNext className="static h-10 w-10 translate-y-0" />
            </div>
          )}
        </div>

        <div className="w-full">
          {loading ? (
            <div className="flex h-[300px] w-full items-center justify-center">
              <Spin size="large" description="Loading more options..." />
            </div>
          ) : rooms.length > 0 ? (
              <CarouselContent className="-ml-4">
                {rooms.map((obj) => {
                  const judgement = reviewJudgement(obj.avg_rating);
                  const firstImage = obj.previewimages?.[0] || '/images/Product-card-1.jpg';

                  return (
                    <CarouselItem key={obj.room_id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                      <Link 
                        href={`/hotels/${hotelId}/rooms/${obj.room_id}`} 
                        className="group flex h-full flex-col gap-y-4 rounded-[24px] bg-white p-4 shadow-sm transition-all hover:shadow-md"
                      >
                        <div 
                          className="h-[220px] w-full rounded-[20px] bg-cover bg-center bg-neutral-200" 
                          style={{ backgroundImage: `url(${firstImage})` }}
                        />

                        <div className="flex flex-col gap-y-3 px-1">
                          <p className="truncate text-[20px] font-bold text-slate-900 group-hover:text-blue-600">
                            {obj.type}
                          </p>

                          <div className="flex items-center justify-between text-slate-500">
                            <div className="flex items-center gap-1">
                              <IoBedOutline size={16} />
                              <span className="text-[14px]">
                                {obj.beds?.reduce((acc: number, cur: any) => acc + cur.count, 0) || 0} beds
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IoPersonOutline size={16} />
                              <span className="text-[14px]">{obj.capacity} people</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IoResizeOutline size={16} />
                              <span className="text-[14px]">{obj.size}m²</span>
                            </div>
                          </div>

                          <div className="line-clamp-2 h-10 text-[13px] text-slate-500 leading-snug">
                            {obj.description?.split(".")[0]}.
                          </div>

                          <div className="grid grid-cols-2 gap-y-1 py-1">
                            {obj.amenities?.slice(0, 4).map((amenity: any, i: number) => (
                              <div key={i} className={`flex items-center gap-2 ${i % 2 !== 0 ? 'justify-end' : ''}`}>
                                <div 
                                  className="h-3 w-3 bg-cover bg-center opacity-60" 
                                  style={{ backgroundImage: `url(${amenity.icon})` }}
                                />
                                <span className="truncate text-[11px] text-slate-400">{amenity.name}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                            <div className="flex h-8 w-10 items-center justify-center rounded-l-[12px] rounded-br-[8px] bg-neutral-100">
                              <span className="text-[14px] font-bold" style={{ color: judgement.color }}>
                                {obj.avg_rating > 0 ? Number(obj.avg_rating).toFixed(1) : "-"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold leading-none" style={{ color: judgement.color }}>
                                {judgement.name}
                              </span>
                              <span className="text-[11px] text-neutral-400">
                                {obj.total_reviews} reviews
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-col items-end">
                            {obj.discount > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-600">
                                  {Math.round(obj.discount * 100)}% OFF
                                </span>
                                <span className="text-[13px] text-slate-300 line-through">
                                  ${obj.price}
                                </span>
                              </div>
                            )}
                            <p className="text-[20px] font-black text-blue-600">
                              ${obj.final_price}
                              <span className="text-[13px] font-medium text-slate-400">/night</span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-white/50 py-12">
              <Empty 
                description={
                  <span className="text-[18px] font-medium text-slate-400">
                    No other room in {hotelName}
                  </span>
                } 
              />
            </div>
          )}
        </div>
      </Carousel>
    </div>
  );
}