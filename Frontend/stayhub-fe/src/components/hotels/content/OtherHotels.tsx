import { Room } from "@/types/Room";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { useState } from "react";
import { IoBedOutline, IoPersonOutline, IoResizeOutline } from "react-icons/io5";
import { Review, ReviewCategory } from "@/types/Review";
import { ImageIcon } from "lucide-react";

export default function OtherHotels({ hotelName, otherRoomData }: {
    hotelName: string;
    otherRoomData: Room[];
}) {
    // Mock review data initialization (6 rooms, 100 reviews each)
    const [reviewData] = useState<Review[][]>(Array(6).fill(0).map((_, roomIndex) => {
        return Array(100).fill(0).map((_, reviewIndex) => ({
            id: reviewIndex,
            userid: 1,
            roomid: roomIndex,
            created_at: Date.now(),
            rating: [
                { category: "Amenities", rating: Math.floor(Math.random() * 5) + 1 },
                { category: "Cleanliness", rating: Math.floor(Math.random() * 5) + 1 },
                { category: "Communication", rating: Math.floor(Math.random() * 5) + 1 },
                { category: "Location", rating: Math.floor(Math.random() * 5) + 1 },
                { category: "Value", rating: Math.floor(Math.random() * 5) + 1 }
            ],
            description: "Lorem ipsum...",
            pros: "Pros",
            cons: "Cons",
            like_count: 3636,
            response: "Response"
        }));
    }));

    const reviewJudgement = (score: number): { name: string, color: string } => {
        if (score === 0) return { name: "No Reviews", color: "#9ca3af" };
        if (score < 2.0) return { name: "Bad", color: "#f44336" };
        if (score < 3.0) return { name: "Okay", color: "#ff6900" };
        if (score < 4.0) return { name: "Average", color: "#f0b100" };
        if (score < 5.0) return { name: "Good", color: "#00c950" };
        return { name: "Excellent", color: "#2b7fff" };
    }

    // ROBUST CALCULATION LOGIC
    const getAverageScore = (categories: ReviewCategory[] = []): number => {
        if (!categories || categories.length === 0) return 0;
        return categories.map(i => i.rating).reduce((agg, val) => agg + val, 0) / categories.length;
    }

    const getTotalAverageScore = (data: Review[] = []): number => {
        if (!data || data.length === 0) return 0;
        const total = data.map(i => getAverageScore(i.rating)).reduce((agg, val) => agg + val, 0);
        return total / data.length;
    }

    return (
        <section className="w-full bg-neutral-100/50 py-16 px-6 md:px-[104px]">
            <Carousel 
                className="flex flex-col gap-y-8"
                opts={{ align: "start" }}
            >
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-3xl md:text-[40px] text-gray-900">
                        Other Rooms in {hotelName}
                    </h2>
                    <div className="flex gap-2">
                        <CarouselPrevious className="static translate-y-0 h-10 w-10 border-neutral-200" />
                        <CarouselNext className="static translate-y-0 h-10 w-10 border-neutral-200" />
                    </div>
                </div>

                {/* Content Grid */}
                <CarouselContent className="-ml-4">
                    {otherRoomData?.map((obj, index) => {
                        const score = getTotalAverageScore(reviewData[index]);
                        const judgement = reviewJudgement(score);
                        const discountedPrice = obj.price * (1 - obj.discount);

                        return (
                            <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                                <div className="flex flex-col gap-y-4 bg-white rounded-[24px] p-4 shadow-sm hover:shadow-md transition-shadow h-full border border-neutral-100">
                                    
                                    {/* Room Image Placeholder */}
                                    <div className="h-[200px] w-full bg-neutral-200 rounded-[20px] overflow-hidden relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                                            <ImageIcon size={40} />
                                        </div>
                                        {obj.discount > 0 && (
                                            <div className="absolute top-3 left-3 bg-green-500 text-white text-[12px] font-bold px-3 py-1 rounded-full">
                                                {Math.round(obj.discount * 100)}% OFF
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Body */}
                                    <div className="flex flex-col gap-y-3">
                                        <h3 className="font-bold text-xl text-gray-900 truncate">
                                            {obj.type} {index + 1}
                                        </h3>

                                        {/* Capacity Icons */}
                                        <div className="flex items-center justify-between text-gray-500 border-b border-neutral-100 pb-3">
                                            <div className="flex items-center gap-1">
                                                <IoBedOutline size={18} />
                                                <span className="text-sm">{obj.beds.reduce((a, b) => a + b.count, 0)} beds</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <IoPersonOutline size={18} />
                                                <span className="text-sm">{obj.capacity} Guests</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <IoResizeOutline size={18} />
                                                <span className="text-sm">{obj.size}m²</span>
                                            </div>
                                        </div>

                                        {/* Description Snippet */}
                                        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                                            {obj.description.split(".")[0]}.
                                        </p>

                                        {/* Rating Section */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <div 
                                                className="rounded-lg px-2 py-1 flex items-center justify-center min-w-[36px]"
                                                style={{ backgroundColor: `${judgement.color}15` }} // 15% opacity background
                                            >
                                                <span className="font-bold text-sm" style={{ color: judgement.color }}>
                                                    {score > 0 ? score.toFixed(1) : "-"}
                                                </span>
                                            </div>
                                            <span className="font-semibold text-sm" style={{ color: judgement.color }}>
                                                {judgement.name}
                                            </span>
                                            <span className="text-xs text-neutral-400">
                                                ({reviewData[index]?.length || 0} reviews)
                                            </span>
                                        </div>

                                        {/* Price Section */}
                                        <div className="flex items-baseline justify-end gap-2 mt-auto pt-2">
                                            {obj.discount > 0 && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ${obj.price}
                                                </span>
                                            )}
                                            <span className="text-xl font-bold text-gray-900">
                                                ${discountedPrice.toFixed(0)}
                                            </span>
                                            <span className="text-sm text-gray-500">/night</span>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
        </section>
    );
}