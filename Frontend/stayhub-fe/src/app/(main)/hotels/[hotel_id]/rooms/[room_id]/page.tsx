"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Spin, Result, Button } from "antd";
import Link from "next/link";

// Components
import RoomDescription from "@/components/rooms/content/RoomDescription";
import RoomNavbar from "@/components/rooms/content/RoomNavbar";
import RoomAmenities from "@/components/rooms/content/RoomAmenities";
import RoomReserve from "@/components/rooms/RoomReserve";
import RoomReviews from "@/components/rooms/content/RoomReviews";
import Policies from "@/components/content/Policies";
import Location from "@/components/content/Location";
import OtherRoom from "@/components/rooms/OtherRoom";
import Overview from "@/components/content/Overview";
import Calendar from "@/components/content/Calendar";
import RoomTitle from "@/components/rooms/content/RoomTitle";

export default function RoomPage() {
  const sections = ["Overview", "Amenities", "Calendar", "Reviews", "Policies"];
  const { hotel_id, room_id } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDates, setBookingDates] = useState({
    from: new Date(),
    to: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });
  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/rooms/${room_id}`,
        );
        const result = await response.json();

        if (!response.ok || result.message) {
          setError(result.message || "Failed to fetch room details");
          return;
        }

        setData(result);
      } catch (error) {
        console.error("Failed to fetch room data:", error);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    if (room_id) fetchRoomData();
  }, [room_id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spin size="large" description="Loading Room Details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Result
          status="404"
          title="Room Not Found"
          subTitle={error}
          extra={
            <Link href="/search">
              <Button type="primary">Back to Search</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!data) return null;

  // Prop Mapping
  // ... inside RoomPage component, update the roomData mapping:
  const roomData = {
    id: data.room_id,
    name: data.room_type,
    description: data.room_description,
    price: data.price,
    size: data.size,
    capacity: data.capacity,
    previewimages: data.previewimages,
    beds: data.room_beds,
    amenities: data.room_amenities,
    classification: data.hotel_classification,
    // Add these lines:
    hotel_name: data.hotel_name,
    hotel_location: data.hotel_location,
    hotel_city: data.hotel_city,
    hotel_city_abbreviation: data.hotel_city_abbreviation,
    hotel_id: data.hotel_id,
  };

  const hotelData = {
    name: data.hotel_name,
    location: data.hotel_location,
    description: data.hotel_description,
    policies: data.hotel_policies,
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1440px] px-[20px] md:px-[104px] flex flex-col w-full h-fit gap-y-[40px] mb-[100px] font-roboto">
        {/* Title & Actions */}
        <RoomTitle roomData={roomData} />

        {/* Sticky Navbar */}
        <RoomNavbar sections={sections} />

        {/* Hero Gallery */}
        <Overview images={data.previewimages} />

        <div className="flex flex-col lg:flex-row gap-x-10">
          {/* Main Content Column */}
          <div className="flex flex-col w-full lg:w-[1000px] h-fit gap-y-[60px]">
            <div id="overview">
              <RoomDescription roomData={roomData} />
            </div>

            <RoomAmenities roomData={roomData} />

            <div id="calendar">
              <Calendar
                fromDate={bookingDates.from}
                toDate={bookingDates.to}
                onChange={(start: Date | null, end: Date | null) => {
                  setBookingDates({
                    from: start ?? new Date(),
                    to: end ?? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                  });
                }}
              />
            </div>
          </div>

          {/* Sticky Sidebar Column */}
          <div className="hidden lg:block">
            <div className="sticky top-[100px]">
              <RoomReserve roomData={roomData} bookingDates={bookingDates} />
            </div>
          </div>
        </div>

        {/* Review Section */}
        <RoomReviews reviewData={[]} />

        {/* Policies Section */}
        <Policies hotelData={hotelData} />
      </div>

      {/* Footer Suggestions */}
      <OtherRoom
        hotelName={data.hotel_name}
        hotelId={hotel_id || data.hotel_id}
        currentRoomId={room_id || data.room_id}
      />

      {/* Scroll Spacing Helper */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        [id] {
          scroll-margin-top: 100px;
        }
      `}</style>
    </div>
  );
}
