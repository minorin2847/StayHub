"use client";

import { Carousel } from "antd";

interface OverviewProps {
  images?: string[];
}

export default function Overview({ images = [] }: OverviewProps) {
  const displayImages = images && images.length > 0 
    ? images 
    : ["/images/Product-card-1.jpg"];

  return (
    <div id="overview" className="h-[623px] w-full overflow-hidden rounded-[20px] bg-slate-200">
      <Carousel
        autoplay
        autoplaySpeed={4000}
        dots={true}
        arrows={false}
        infinite
        className="h-full w-full"
      >
        {displayImages.map((img, index) => (
          <div key={index} className="h-[623px] w-full">
            <div 
              className="h-full w-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${img}')` }}
              role="img"
              aria-label={`Room slide ${index + 1}`}
            />
          </div>
        ))}
      </Carousel>

      <style jsx global>{`
        .ant-carousel .slick-dots li button {
          height: 6px !important;
          border-radius: 4px !important;
          background: white !important;
          opacity: 0.6;
        }
        .ant-carousel .slick-dots li.slick-active button {
          opacity: 1;
          width: 24px !important;
          background: white !important;
        }
        .ant-carousel .slick-dots-bottom {
          bottom: 24px !important;
        }
      `}</style>
    </div>
  );
}