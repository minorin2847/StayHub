import { Hotel } from "@/types/Hotel";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";

export default function SimilarHotels({ location, otherHotelData }: {
    location: string;
    otherHotelData: Hotel[];
}) {
    return (
        <Carousel className="flex flex-col w-full h-fit mb-[100px] gap-y-[32px] bg-neutral-100/50 px-[104px]"
            opts={{ align: "start" }}>
            <div className="flex justify-between items-center">
                <p className="font-semibold text-[40px]">{`Similar hotels in ${location}`}</p>
                <div className="flex static gap-x-[8px] justify-center items-center">
                    <CarouselPrevious className="static flex w-[40px] h-[40px] translate-0" />
                    <CarouselNext className="static flex w-[40px] h-[40px] translate-0" />
                </div>
            </div>
            <div className="w-full h-[581px]">
                <CarouselContent className="">
                    {otherHotelData.map((obj, index) => (
                        <CarouselItem key={index} className="flex flex-col basis-1/4 gap-y-[16px]">
                            <div className="h-[220px] w-full border border-red-500 rounded-[20px]"></div>
                            <div className="flex flex-col gap-y-[8px] px-[16px] justify-start">
                                <p className="font-semibold text-[20px]">{obj.name}</p>
                                <p className="text-[14px]">{obj.location}</p>
                                <div className="bg-neutral-200 rounded-[10px] px-[8px] py-[16px] w-full h-fit text-[14px]">{obj.description.split(".")[0]}</div>
                                {/* classification or other details could go here */}
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </div>
        </Carousel>
    );
}