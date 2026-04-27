"use client";

import { useState } from "react";
import { Button, Input, InputNumber, message, Modal, Result } from "antd";
import { IoPeopleOutline } from "react-icons/io5";
import dayjs from "dayjs";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { addRoomToCart } from "@/services/publicStay";

interface RoomReserveProps {
  roomData: any;
  bookingDates: {
    from: Date;
    to: Date;
  };
}

export default function RoomReserve({ roomData, bookingDates }: RoomReserveProps) {
  const { isAuthenticated } = useAuth();
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
      await addRoomToCart({
        hotelID: roomData.hotel_id,
        roomTypeID: roomData.id,
        checkin_date: dayjs(bookingDates.from).format("YYYY-MM-DD"),
        checkout_date: dayjs(bookingDates.to).format("YYYY-MM-DD"),
        num_adults: numGuests,
        num_children: 0,
        final_price: finalPrice,
        special_requests: specialRequests,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Reservation Error:", error);
      message.error(error instanceof Error ? error.message : "Failed to process reservation.");
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
              disabled={roomData.availableRoomCount === 0}
              onClick={handleReserve}
              className="h-[56px] rounded-[15px] bg-blue-600 hover:!bg-blue-700 text-[18px] font-bold"
              block
            >
              {roomData.availableRoomCount === 0 ? "Sold out for these dates" : "Reserve Now"}
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

        <p className="text-center text-[12px] text-slate-400">
          {roomData.availableRoomCount > 0
            ? "Your room will be added to the pending reservation cart first."
            : "This room type is currently unavailable for the selected stay."}
        </p>
      </div>

      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        centered
        width={700}
      >
        <Result
          status="success"
          title="Room added to your reservation cart"
          subTitle={`Your stay at ${roomData.hotel_name} is added to the reservation cart.`}
          extra={[
            <Link href={`/search?abbreviation=${roomData.hotel_city_abbreviation}`} key="explore">
              <Button type="primary" className="rounded-md">
                Exploring more rooms in {roomData.hotel_city}
              </Button>
            </Link>,
            <Link href="/cart" key="cart">
              <Button className="rounded-md mt-2 md:mt-0">
                Review reservation cart
              </Button>
            </Link>,
          ]}
        />
      </Modal>
    </div>
  );
}
