import React, { useEffect, useRef, useState } from "react";
import Container from "../ui/Container";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Image from "next/image";
import { AiOutlineHeart } from "react-icons/ai";

type HomeGuests = {
  id: number;
  title: string;
  location: string;
  image:string;
  rating: number;
  review_count: number;
  price_original: number;
};
const HomeGuests = () => {
  const [homeGuests, setHomeGuests] = useState<HomeGuests[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrollable, setIsScrollable] = useState(false);
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      setCanScrollLeft(scrollLeft > 0);
      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;
      setCanScrollRight(!atEnd);

      setIsScrollable(scrollWidth > clientWidth);
    }
  };
  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homeGuests`);
      const data = await res.json();
      setHomeGuests(data);
      setTimeout(checkScrollPosition, 100);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);
  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const container = scrollContainerRef.current;
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        if (!canScrollRight) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }
  };
  return (
    <section className="py-12 mt-[32px]">
      <Container>
        <div className="flex flex-col gap-[32px]">
          <div className="flex justify-between">
            <h2 className="text-3xl font-semibold text-neutral-900">
              Homes Guests Love
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300
                  ${
                    canScrollLeft
                      ? "border-neutral-800 bg-white hover:bg-neutral-100 text-neutral-800 cursor-pointer shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                  }
                `}
              >
                <IoIosArrowBack size={20} />
              </button>
              <button
                onClick={() => handleScroll("right")}
                disabled={!isScrollable}
                className={`
                    w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm bg-white border-neutral-900 text-neutral-900 hover:bg-neutral-100
                    }
                    ${!isScrollable ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300" : ""}
                `}
              >
                <IoIosArrowForward size={20} />
              </button>
            </div>
          </div>
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {homeGuests.length > 0 ? (
              homeGuests.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[280px] w-[280px] bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-[200px] w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white text-gray-700">
                  <AiOutlineHeart size={20} />
                </button>
                  </div>
                  
                  <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-neutral-100 text-[#243F75] px-[4.8px] py-[1px] rounded-full rounded-tr-[0] font-bold text-[14px]">
                        {item.rating}
                      </span>
                      <span className="font-medium text-[#243F75] text-[14px]">Excellent</span>
                      <span className="text-neutral-300 text-xs">{item.review_count} reviews</span>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-[24px] text-neutral-800 line-clamp-1">{item.title}</h3>
                        <p className="text-[20px] font-medium text-neutral-700">{item.location}</p>
                    </div>

                     <div className="mt-2 flex items-center gap-2 justify-end">
                  <div className="text-xs text-neutral-300 text-right">per night</div>
                       <span className="text-xl font-semibold text-neutral-900">${item.price_original}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
                Array(4).fill(0).map((_, i) => (
                    <div key={i} className="min-w-[280px] h-[350px] bg-gray-200 animate-pulse rounded-xl"></div>
                ))
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HomeGuests;
