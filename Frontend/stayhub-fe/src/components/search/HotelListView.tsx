"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Spin, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import HotelFilterSidebar from "./HotelFilterSidebar";
import HotelListCard, { SearchResult } from "./HotelListCard";
import HotelListHeader from "./HotelListHeader";

export default function HotelListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  // Data States
  const [hotels, setHotels] = useState<SearchResult[]>([]);
  const [priceHistogram, setPriceHistogram] = useState<number[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get current page from URL or default to 1
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      try {
        // Fetch using the current URL's search parameters
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search?${searchParams.toString()}`
        );

        if (res.ok) {
          const data = await res.json();
          setHotels(data.response || []);
          setPriceHistogram(data.priceRange || []);
          setHasNext(data.hasNext || false);
        } else {
          console.error("Failed to fetch search results");
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  // Handle Pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1400px] gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">

        {/* Sidebar */}
        <div className="xl:sticky xl:top-24 xl:self-start">
          <HotelFilterSidebar priceHistogram={priceHistogram} />
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <HotelListHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchCount={hotels.length}
            cityName={hotels[0]?.hotel_city || null}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center rounded-[24px] border border-slate-200 bg-white">
              <Spin size="large" />
            </div>
          ) : hotels.length === 0 ? (
            /* Empty State */
            <div className="flex h-[400px] flex-col items-center justify-center rounded-[24px] border border-slate-200 bg-white px-4 text-center">
              <h3 className="text-lg font-bold text-slate-800">No rooms found</h3>
              <p className="mt-2 text-slate-500">Try adjusting your filters or dates to see more availability.</p>
            </div>
          ) : (
            /* Grid / List Results */
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-6"
              }
            >
              {hotels.map((hotel, index) => (
                <HotelListCard
                  key={`${hotel.hotel_name}-${hotel.roomtype_name}-${index}`}
                  hotel={hotel}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Pagination Component (Only shown if we have data) */}
          {!isLoading && hotels.length > 0 && (
            <div className="flex items-center justify-center gap-4 rounded-[24px] border border-slate-200 bg-white px-4 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <Button
                type="default"
                icon={<LeftOutlined />}
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="flex items-center"
              >
                Previous
              </Button>

              <span className="min-w-[80px] text-center text-sm font-semibold text-slate-700">
                Page {currentPage}
              </span>

              <Button
                type="default"
                disabled={!hasNext}
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex items-center"
              >
                Next <RightOutlined className="ml-1 text-[10px]" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}