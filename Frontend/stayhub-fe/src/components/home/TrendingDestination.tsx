import React, { useEffect, useState } from "react";
import Container from "../ui/Container";
import Image from "next/image";
import { TiWeatherSnow, TiWeatherSunny } from "react-icons/ti";
import { GiChestnutLeaf, GiFlowerEmblem } from "react-icons/gi";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? (Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="h-[400px] w-full rounded-[20px] bg-gray-200 animate-pulse"
                  ></div>
                )))
            : destinations.length>0 ? (destinations.map((item) => (
                <div
                  key={item.id}
                  className="group relative h-[400px] w-full rounded-[20px] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>

                  <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-gray-300 text-sm">From</span>
                      <span className="text-yellow-400 font-bold text-lg">
                        ${item.price}/night
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))): (
                <p className="col-span-full text-center text-gray-500">Không tìm thấy điểm đến nào.</p>
              )}
        </div>
      </Container>
    </section>
  );
};

export default TrendingDestination;
