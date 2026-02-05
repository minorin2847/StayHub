"use client";

import DealsWeekend from "@/components/home/DealsWeekend";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import TopSights from "@/components/home/TopSights";
import TravelMore from "@/components/home/TravelMore";
import TrendingDestination from "@/components/home/TrendingDestination";

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden bg-white">
      <HeroSection />
      <SearchSection/>
      <TrendingDestination />  
      <DealsWeekend />
      <TravelMore />
      <TopSights/>
    </div>
  );
}
