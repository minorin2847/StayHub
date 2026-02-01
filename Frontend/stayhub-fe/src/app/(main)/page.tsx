"use client";

import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import TrendingDestination from "@/components/home/TrendingDestination";

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden bg-white">
      <HeroSection />
      <SearchSection/>
      <TrendingDestination />  
    </div>
  );
}
