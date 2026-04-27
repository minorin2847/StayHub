"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Radio, Spin, message } from "antd";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchCart,
  fetchReservation,
  payReservation,
  submitCart,
} from "@/services/publicStay";
import type { CartSnapshot, ReservationSnapshot } from "@/types/PublicStay";

const STORAGE_KEY = "stayhub-checkout-guest";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = Number(searchParams.get("reservationId") ?? 0);
  const [messageApi, contextHolder] = message.useMessage();
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [reservation, setReservation] = useState<ReservationSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (reservationId > 0) {
          const response = await fetchReservation(reservationId);
          setReservation(response.reservation);
          setCart(null);
          return;
        }

        const response = await fetchCart();
        setCart(response.cart);
        setReservation(null);
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : "Failed to load payment");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [messageApi, reservationId]);

  const reservationLike = useMemo(() => {
    if (reservation) return reservation;
    if (!cart) return null;
    return {
      id: cart.id,
      totalRooms: cart.totalRooms,
      totalPrice: cart.totalPrice,
      rooms: cart.rooms,
    };
  }, [cart, reservation]);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);

        if (reservationId > 0) {
          const result = await payReservation(reservationId, paymentMethod.toUpperCase());
          router.push(`/confirm?reservationId=${result.reservationId}`);
        return;
      }

      const guestRaw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!guestRaw) {
        router.push("/checkout");
        return;
      }

      const guest = JSON.parse(guestRaw);
      const method =
        paymentMethod === "pay-later"
          ? "PAY-LATER"
          : paymentMethod === "mock"
            ? "MOCK"
            : "CARD";
      const result = await submitCart({
        ...guest,
        method,
      });
      window.sessionStorage.removeItem(STORAGE_KEY);
      router.push(`/confirm?reserveId=${result.reserveID}`);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!reservationLike || reservationLike.rooms.length === 0) {
    return <div className="px-8 py-20 text-center text-slate-500">No active payment request found.</div>;
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-10 md:px-10 xl:px-[104px]">
      {contextHolder}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0051cb]">
          Payment
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          {reservationId > 0 ? "Complete your reservation" : "Choose payment method"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          {reservationId > 0
            ? "Your reservation request is created from the selected room type. After payment, the hotel receptionist still needs to assign the physical room before it becomes a booking."
            : "Your pending reservation will be submitted to the hotel after payment or pay-at-property confirmation."}
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <Radio.Group
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="mb-6 flex flex-col gap-3"
          >
            <Radio value="card">Credit / Debit Card</Radio>
            <Radio value="mock">Mock instant payment</Radio>
            <Radio value="pay-later">Pay at property</Radio>
          </Radio.Group>

          {paymentMethod === "card" ? (
            <div className="grid gap-4">
              <Input
                placeholder="Card number"
                value={paymentInfo.cardNumber}
                onChange={(event) =>
                  setPaymentInfo((current) => ({ ...current, cardNumber: event.target.value }))
                }
                size="large"
              />
              <Input
                placeholder="Card holder name"
                value={paymentInfo.cardName}
                onChange={(event) =>
                  setPaymentInfo((current) => ({ ...current, cardName: event.target.value }))
                }
                size="large"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="MM/YY"
                  value={paymentInfo.expiry}
                  onChange={(event) =>
                    setPaymentInfo((current) => ({ ...current, expiry: event.target.value }))
                  }
                  size="large"
                />
                <Input
                  placeholder="CVV"
                  value={paymentInfo.cvv}
                  onChange={(event) =>
                    setPaymentInfo((current) => ({ ...current, cvv: event.target.value }))
                  }
                  size="large"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-500">
              {reservationId > 0
                ? "For this dev flow, payment moves the reservation into hotel review. Reception still needs to assign a room and approve it before the booking is finalized."
                : "Checkout details are already attached to your pending reservation. This step moves it into hotel review."}
            </div>
          )}
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Booking summary</p>
          <p className="mt-3 text-sm text-slate-500">
            {reservationId > 0 ? `Reservation #${reservationLike.id}` : `${reservationLike.totalRooms} room(s)`}
          </p>

          <div className="mt-5 space-y-4">
            {reservationLike.rooms.map((room) => (
              <div key={room.id} className="flex gap-3 rounded-[20px] bg-slate-50 p-3">
                <div className="relative h-[92px] w-[92px] overflow-hidden rounded-[18px]">
                  <Image
                    src={room.room_image || room.hotel_image}
                    alt={room.room_type_name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{room.hotel_name}</p>
                  <p className="text-sm text-slate-500">{room.room_type_name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {room.checkin_date} - {room.checkout_date}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatMoney(Number(room.final_price))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[20px] bg-[#f0f6ff] p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {formatMoney(reservationLike.totalPrice)}
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            className="mt-6 w-full !h-12 !rounded-2xl !bg-[#0057FF]"
            loading={submitting}
            onClick={handleConfirm}
          >
            {reservationId > 0 ? "Pay and send to hotel review" : "Confirm payment"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
