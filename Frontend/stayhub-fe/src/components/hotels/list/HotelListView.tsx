"use client";

import { useState } from "react";
import { Pagination } from "antd";
import HotelFilterSidebar from "./HotelFilterSidebar";
import HotelListCard from "./HotelListCard";
import HotelListHeader from "./HotelListHeader";
import { hotelListMockData } from "./hotelListMockData";

export default function HotelListView() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1400px] gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <HotelFilterSidebar />
        </div>

        <div className="space-y-4">
          <HotelListHeader viewMode={viewMode} onViewModeChange={setViewMode} />

          <div
            className={
              viewMode === "grid" ? "grid gap-6 grid-cols-3" : "space-y-7"
            }
          >
            {hotelListMockData.map((hotel) => (
              <HotelListCard key={hotel.id} hotel={hotel} viewMode={viewMode} />
            ))}
          </div>

          <div className="flex justify-center rounded-[24px] border border-slate-200 bg-white px-4 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <Pagination
              defaultCurrent={1}
              total={50}
              pageSize={10}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
