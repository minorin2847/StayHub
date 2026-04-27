"use client";

import { useEffect, useState } from "react";
import { Button, Input, Spin, message } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchCart } from "@/services/publicStay";
import type { CartSnapshot } from "@/types/PublicStay";

const STORAGE_KEY = "stayhub-checkout-guest";

export default function CheckoutPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    id_card_number: "",
    address: "",
  });

  useEffect(() => {
    const savedGuest = window.sessionStorage.getItem(STORAGE_KEY);
    if (savedGuest) {
      setForm(JSON.parse(savedGuest));
    }

    const loadCart = async () => {
      try {
        const response = await fetchCart();
        setCart(response.cart);
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : "Failed to load checkout");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [messageApi]);

  const handleContinue = () => {
    if (!form.first_name || !form.last_name || !form.phone) {
      messageApi.error("First name, last name and phone are required.");
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    router.push("/payment");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!cart || cart.rooms.length === 0) {
    return <div className="px-8 py-20 text-center text-slate-500">Your cart is empty.</div>;
  }

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-10 md:px-10 xl:px-[104px]">
      {contextHolder}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0051cb]">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Personal data</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="First name"
              value={form.first_name}
              onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
              size="large"
            />
            <Input
              placeholder="Last name"
              value={form.last_name}
              onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
              size="large"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              size="large"
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              size="large"
            />
          </div>
          <Input
            placeholder="ID / Passport number"
            value={form.id_card_number}
            onChange={(event) =>
              setForm((current) => ({ ...current, id_card_number: event.target.value }))
            }
            size="large"
          />
          <Input.TextArea
            placeholder="Address"
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            autoSize={{ minRows: 4, maxRows: 6 }}
          />
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Your stay</p>
          <div className="mt-5 space-y-4">
            {cart.rooms.map((room) => (
              <div key={room.id} className="flex gap-3 rounded-[20px] bg-slate-50 p-3">
                <div className="relative h-[92px] w-[92px] overflow-hidden rounded-[18px]">
                  <Image src={room.room_image || room.hotel_image} alt={room.room_type_name} fill unoptimized className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{room.hotel_name}</p>
                  <p className="text-sm text-slate-500">{room.room_type_name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {room.checkin_date} - {room.checkout_date}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    ${Number(room.final_price).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[20px] bg-[#f0f6ff] p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              ${cart.totalPrice.toLocaleString("en-US")}
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            className="mt-6 w-full !h-12 !rounded-2xl !bg-[#0057FF]"
            onClick={handleContinue}
          >
            Continue to payment
          </Button>
        </aside>
      </div>
    </div>
  );
}
