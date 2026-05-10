"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Spin } from "antd";
import { fetchTrips } from "@/services/publicStay";
import { useAuth } from "@/context/AuthContext";
import type { TripItem } from "@/types/PublicStay";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: string) {
  return status.replace(/-/g, " ");
}

export default function TripsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadTrips = async () => {
      try {
        setLoading(true);
        const response = await fetchTrips();
        setTrips(response.trips);
        setError(null);
      } catch (loadError) {
        console.error("Failed to fetch trips:", loadError);
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load your trips.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [authLoading, isAuthenticated]);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[760px] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-950">Sign in to view your trips</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Your reservation history is available after you log in.
        </p>
        <Link
          href="/login?next=%2Ftrips"
          className="mt-8 rounded-2xl bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[760px] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-950">Could not load trips</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{error}</p>
        <Link
          href="/search"
          className="mt-8 rounded-2xl bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white"
        >
          Continue searching
        </Link>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[760px] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-950">No trips yet</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Your confirmed and pending reservations will appear here.
        </p>
        <Link
          href="/search"
          className="mt-8 rounded-2xl bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white"
        >
          Explore hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-10 md:px-10 xl:px-[104px]">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0051cb]">
          Trip History
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Your reservations</h1>
      </div>

      <div className="space-y-6">
        {trips.map((trip) => (
          <section
            key={trip.id}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-950">Reservation #{trip.id}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {trip.totalRooms} room(s) · {formatMoney(trip.totalPrice)}
                </p>
              </div>
              <div className="rounded-full bg-[#f0f6ff] px-4 py-2 text-sm font-semibold text-[#0051cb]">
                {formatStatus(trip.status)}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {trip.rooms.map((room) => (
                <article
                  key={room.reservedRoomId}
                  className="flex gap-4 rounded-[22px] bg-slate-50 p-4"
                >
                  <div className="relative h-[110px] w-[110px] overflow-hidden rounded-[18px] bg-slate-200">
                    <Image
                      src={room.roomImage || room.hotelImage}
                      alt={room.roomTypeName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{room.hotelName}</p>
                    <p className="text-sm text-slate-500">{room.roomTypeName}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {room.checkinDate} - {room.checkoutDate}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Booking: {formatStatus(room.bookingStatus)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Payment: {formatStatus(room.paymentStatus)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatMoney(Number(room.finalPrice))}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
