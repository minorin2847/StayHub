"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Spin, message } from "antd";
import { fetchCart, removeCartRoom } from "@/services/publicStay";
import type { CartSnapshot } from "@/types/PublicStay";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await fetchCart();
        setCart(response.cart);
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : "Failed to load reservation cart");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [messageApi]);

  const handleRemove = async (roomId: number) => {
    try {
      setRemovingId(roomId);
      await removeCartRoom(roomId);
      const response = await fetchCart();
      setCart(response.cart);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to remove room");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!cart || cart.rooms.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[760px] flex-col items-center justify-center px-4 py-16 text-center">
        {contextHolder}
        <h1 className="text-3xl font-bold text-slate-950">Your reservation cart is empty</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Select an available room from a hotel detail page and it will appear here before checkout.
        </p>
        <Link
          href="/hotels"
          className="mt-8 rounded-2xl bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white"
        >
          Explore hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-10 md:px-10 xl:px-[104px]">
      {contextHolder}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0051cb]">
          Reservation Cart
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Review your pending stay</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          These rooms are held in your pending reservation. Continue to checkout to submit guest
          details and move the reservation to hotel review.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {cart.rooms.map((room) => (
            <article
              key={room.id}
              className="grid gap-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[220px_minmax(0,1fr)_120px]"
            >
              <div className="relative min-h-[180px] overflow-hidden rounded-[22px]">
                <Image
                  src={room.room_image || room.hotel_image}
                  alt={room.room_type_name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div>
                <p className="text-lg font-semibold text-slate-950">{room.hotel_name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {room.room_type_name}
                  {room.room_name ? ` · ${room.room_name}` : ""}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  {room.checkin_date} - {room.checkout_date}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {room.num_adults} guest(s)
                  {room.num_children > 0 ? `, ${room.num_children} children` : ""}
                </p>
                {room.special_requests ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Request: {room.special_requests}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col items-end justify-between">
                <p className="text-xl font-bold text-slate-950">
                  {formatMoney(Number(room.final_price))}
                </p>
                <Button
                  danger
                  type="text"
                  loading={removingId === room.id}
                  onClick={() => handleRemove(room.id)}
                >
                  Remove
                </Button>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Summary</p>
          <p className="mt-2 text-sm text-slate-500">{cart.totalRooms} room(s) in reservation</p>

          <div className="mt-6 rounded-[20px] bg-[#f0f6ff] p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {formatMoney(cart.totalPrice)}
            </p>
          </div>

          <Link href="/checkout">
            <Button
              type="primary"
              size="large"
              className="mt-6 w-full !h-12 !rounded-2xl !bg-[#0057FF]"
            >
              Continue to checkout
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
