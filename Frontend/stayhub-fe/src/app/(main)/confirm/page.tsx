"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const reserveId = searchParams.get("reserveId") ?? searchParams.get("reservationId");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[760px] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-full bg-[#e7f0ff] px-5 py-2 text-sm font-semibold text-[#0051cb]">
        Sent To Hotel Review
      </div>
      <h1 className="mt-6 text-4xl font-bold text-slate-950">
        Reservation request submitted
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-500">
        Your reservation is now in the hotel review flow. Reservation ID:{" "}
        <span className="font-semibold text-slate-900">{reserveId}</span>
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/trips"
          className="rounded-2xl bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white"
        >
          View trips
        </Link>
        <Link
          href="/search"
          className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
        >
          Continue searching
        </Link>
      </div>
    </div>
  );
}
