"use client";

import { useState } from "react";
import { Button, Input, InputNumber, message, Modal, Result } from "antd";
import { IoPeopleOutline } from "react-icons/io5";
import dayjs from "dayjs";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Ensure this path is correct

interface RoomReserveProps {
  roomData: any;
  bookingDates: {
    from: Date;
    to: Date;
  };
}

export default function RoomReserve({ roomData, bookingDates }: RoomReserveProps) {
  const { isAuthenticated } = useAuth(); // Hook to check login status
  const [numGuests, setNumGuests] = useState(roomData.capacity || 1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const diffDays = dayjs(bookingDates.to).diff(dayjs(bookingDates.from), "day");
  const nights = diffDays > 0 ? diffDays : 1;
  const baseTotal = roomData.price * nights;
  const discountAmount = (roomData.discount || 0) * baseTotal;
  const finalPrice = baseTotal - discountAmount;

  const handleReserve = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/reserves/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hotelID: roomData.hotel_id,
          roomTypeID: roomData.id,
          checkin_date: dayjs(bookingDates.from).format("YYYY-MM-DD"),
          checkout_date: dayjs(bookingDates.to).format("YYYY-MM-DD"),
          num_guests: numGuests,
          final_price: finalPrice,
          special_requests: specialRequests,
        }),
      });

      if (response.ok) {
        setIsModalOpen(true);
      } else {
        const errData = await response.json();
        message.error(errData.message || "Failed to process reservation.");
      }
    } catch (error) {
      console.error("Reservation Error:", error);
      message.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col grow justify-start items-end">
      <div className="w-[400px] h-fit bg-white drop-shadow-[0px_2px_20px_rgba(0,0,0,0.12)] rounded-[30px] p-8 flex flex-col gap-y-6">
        <div>
          <p className="text-[28px] font-black text-slate-900">${roomData.price}<span className="text-[16px] font-medium text-slate-400">/night</span></p>
        </div>

        <div className="grid grid-cols-2 border border-slate-200 rounded-[15px] overflow-hidden">
          <div className="p-3 border-r border-slate-200 flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Check-in</span>
            <span className="text-[14px] font-medium">{dayjs(bookingDates.from).format("DD MMM YYYY")}</span>
          </div>
          <div className="p-3 flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Check-out</span>
            <span className="text-[14px] font-medium">{dayjs(bookingDates.to).format("DD MMM YYYY")}</span>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="flex flex-col gap-y-3">
          <div className="flex justify-between text-slate-600">
            <p>${roomData.price} x {nights} nights</p>
            <p>${baseTotal}</p>
          </div>
          {roomData.discount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <p>Discount ({Math.round(roomData.discount * 100)}%)</p>
              <p>-${discountAmount.toFixed(0)}</p>
            </div>
          )}
          <div className="flex justify-between text-[18px] font-bold text-slate-900 border-t border-slate-100 pt-3">
            <p>Total</p>
            <p>${finalPrice.toFixed(0)}</p>
          </div>
        </div>

        {/* --- AUTH DEPENDENT SECTION --- */}
        {isAuthenticated ? (
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <IoPeopleOutline size={20} />
                <span className="font-semibold">Guests</span>
              </div>
              <InputNumber 
                min={1} 
                max={roomData.capacity} 
                value={numGuests} 
                onChange={(val) => setNumGuests(val || 1)} 
                className="w-[80px]"
              />
            </div>
            
            <div className="flex flex-col gap-y-2">
              <span className="text-sm font-semibold text-slate-700">Special Requests</span>
              <Input.TextArea 
                placeholder="e.g. Early check-in, honeymoon setup..." 
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="rounded-[12px]"
              />
            </div>

            <Button 
              type="primary" 
              size="large" 
              loading={loading}
              onClick={handleReserve}
              className="h-[56px] rounded-[15px] bg-blue-600 hover:!bg-blue-700 text-[18px] font-bold"
              block
            >
              Reserve Now
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
             <Link href="/login" className="w-full">
                <Button 
                  type="primary" 
                  size="large" 
                  className="h-[56px] rounded-[15px] bg-slate-800 hover:!bg-slate-900 text-[18px] font-bold"
                  block
                >
                  Log in to Reserve
                </Button>
             </Link>
             <p className="text-center text-[13px] text-slate-400">Please log in to customize your stay and book.</p>
          </div>
        )}
        {/* --- END AUTH DEPENDENT SECTION --- */}

        <p className="text-center text-[12px] text-slate-400">You won't be charged yet</p>
      </div>

      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        centered
        width={500}
      >
        <Result
          status="success"
          title="Your reservation has been added"
          subTitle={`We've received your request for ${roomData.hotel_name}. You can manage your bookings in your profile.`}
          extra={[
            <Link href="/reserves" key="reserves">
              <Button type="primary" className="rounded-md">
                View your reservations
              </Button>
            </Link>,
            <Link 
              href={`/search?abbreviation=${roomData.hotel_city_abbreviation}`} 
              key="search"
            >
              <Button className="rounded-md mt-2 md:mt-0">
                Check out other rooms in {roomData.hotel_city}
              </Button>
            </Link>,
          ]}
        />
      </Modal>
    </div>
  );
}