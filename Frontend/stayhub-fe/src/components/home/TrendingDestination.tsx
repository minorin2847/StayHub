import React, { useEffect, useState } from "react";
import Container from "../ui/Container";
import Image from "next/image";
import { TiWeatherSnow, TiWeatherSunny } from "react-icons/ti";
import { GiChestnutLeaf, GiFlowerEmblem } from "react-icons/gi";
import { Carousel } from "antd";

type Destination = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
};
const TrendingDestination = () => {
  console.log("API URLA", process.env.NEXT_PUBLIC_API_URL);
  const [isActive, setIsActive] = useState("spring");

  const tabs = [
    { id: "spring", label: "Spring Picks", icon: <GiFlowerEmblem size={24} /> },
    {
      id: "summer",
      label: "Summer Hotspot",
      icon: <TiWeatherSunny size={24} />,
    },
    {
      id: "autumn",
      label: "Autumn Escape",
      icon: <GiChestnutLeaf size={24} />,
    },
    {
      id: "winter",
      label: "Winter Getaway",
      icon: <TiWeatherSnow size={24} />,
    },
  ];
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/destinations?category=${isActive}`,
        );
        if (!res.ok) {
          throw new Error("Failed to fetch");
        }
        const data = await res.json();
        setDestinations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isActive]);
  return (
    <section className="mt-55">
      <Container>
        <div className="flex justify-center">
          <Image
            src="/icons/Section-feature-header.svg"
            alt="Icon Search"
            width={800}
            height={200}
            className="object-contain"
          />
        </div>

        <div className="flex flex-col gap-5 mt-[64px] mb-8">
          <h1 className="font-semibold text-neutral-900 text-3xl">
            Trending Destinations
          </h1>
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setIsActive(tab.id)}
                className={`flex justify-center items-center gap-2 border   rounded-full py-3 px-4 transition-all duration-300
              ${isActive === tab.id ? "bg-neutral-900 text-white " : "bg-white text-neutral-900 border-neutral-900 hover:bg-neutral-900 hover:text-white"}
                `}
              >
                {tab.icon}
                <h2 className="font-medium text-[16px]">{tab.label}</h2>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-[400px]">
          {loading
            ? (
              <div className="grid grid-cols-4 w-full h-full gap-x-4">
                {
                  Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="w-full h-full rounded-[20px] bg-gray-200 animate-pulse"
                      ></div>
                    ))
                }
              </div>
            )
            : destinations.length > 0 ? (
              <Carousel
                dots={false}
                arrows={false}
                slidesToShow={4}
                slidesToScroll={1}
                autoplay
                autoplaySpeed={4000}
                className="w-full h-full"
              >
                {destinations.map((item) => (
                  /* Thẻ div bọc ngoài này giúp tạo khoảng cách (gap) giữa các slide bằng px-2 (padding ngang) */
                  <div key={item.id} className="px-2">
                    <div className="group relative w-full h-[400px] rounded-[20px] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow">

                      <img
                        src={item.coverimage}
                        alt={item.landmark_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>

                      <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <h3 className="text-2xl font-bold mb-1">{item.landmark_name}</h3>
                        <h3 className="text-md mb-1">{item.city_name}</h3>

                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-gray-300 text-sm">From</span>
                          <span className="text-yellow-400 font-bold text-lg">
                            {/* Định dạng lại giá tiền nếu cần, hoặc giữ nguyên */}
                            ${item.lowest_price}/night
                          </span>
                        </div>

                        <p className="text-gray-300 text-sm line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}
              </Carousel>

            ) : (
              <p className="col-span-full text-center text-gray-500">Không tìm thấy điểm đến nào.</p>
            )}
        </div>
      </Container>
    </section>
  );
};

export default TrendingDestination;
