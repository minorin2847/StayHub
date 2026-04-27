"use client";

import DealsWeekend from "@/components/home/DealsWeekend";
import HeroSection from "@/components/home/HeroSection";
import HomeGuests from "@/components/home/HomeGuests";
import SearchSection from "@/components/home/SearchSection";
import TopSights from "@/components/home/TopSights";
import TopThings from "@/components/home/TopThings";
import TravelMore from "@/components/home/TravelMore";
import TrendingDestination from "@/components/home/TrendingDestination";

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden bg-white">
      <HeroSection />
      <SearchSection />
      <TrendingDestination />
      <DealsWeekend />
      <TravelMore />
      <TopSights />
      <TopThings />
      <HomeGuests />
    </div>
  );
}
