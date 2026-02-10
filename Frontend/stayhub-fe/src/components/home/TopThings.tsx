"use client";

import React, { useEffect, useState } from "react";
import Container from "../ui/Container";
import Image from "next/image";
import { MdOutlineExplore, MdBeachAccess, MdMuseum, MdRestaurant, MdNightlife } from "react-icons/md";
import { BiCameraMovie } from "react-icons/bi";

type Thing = {
  id: number;
  name: string;
  image: string;
  category: string;
};

const tabs = [
  { id: "explore", label: "Explore", icon: <MdOutlineExplore size={20} /> },
  { id: "beach", label: "Beach", icon: <MdBeachAccess size={20} /> },
  { id: "museum", label: "Museum", icon: <MdMuseum size={20} /> },
  { id: "show", label: "Show", icon: <BiCameraMovie size={20} /> },
  { id: "food", label: "Food", icon: <MdRestaurant size={20} /> },
  { id: "nightlife", label: "Night Life", icon: <MdNightlife size={20} /> },
];

const TopThings = () => {
  const [activeTab, setActiveTab] = useState("explore");
  const [items, setItems] = useState<Thing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/things?category=${activeTab}`);
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-neutral-900">
              Top Things to Do in Barcelona
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{scrollbarWidth: 'none'}}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex justify-center items-center gap-2 border   rounded-full py-3 px-4 transition-all duration-300
              ${activeTab === tab.id ? "bg-neutral-900 text-white " : "bg-white text-neutral-900 border-neutral-900 hover:bg-neutral-900 hover:text-white"}
                `}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {isLoading ? (
               Array(6).fill(0).map((_, i) => (
                 <div key={i} className="flex flex-col gap-3">
                    <div className="aspect-square w-full bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-4 bg-gray-200 w-3/4 rounded animate-pulse"></div>
                 </div>
               ))
            ) : items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 group cursor-pointer">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-10">
                None
              </div>
            )}
          </div>

        </div>
      </Container>
    </section>
  );
};

export default TopThings;