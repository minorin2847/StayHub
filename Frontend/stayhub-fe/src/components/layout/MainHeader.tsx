"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BiSupport } from "react-icons/bi";
import { FcGlobe } from "react-icons/fc";
import { LuChevronDown, LuLogOut, LuSearch, LuUser } from "react-icons/lu";

export default function MainHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const [languages] = useState([
    { abbr: "en", name: "English" },
    { abbr: "vi", name: "Tiếng Việt" },
    { abbr: "jp", name: "日本語" },
  ]);

  const isHotelsPage = pathname === "/hotels";
  const locParam = searchParams.get("location") || "Anywhere";
  const checkinParam = searchParams.get("checkin");
  const checkoutParam = searchParams.get("checkout");
  const rooms = Number(searchParams.get("rooms") || 1);
  const adults = Number(searchParams.get("adults") || 0);
  const children = Number(searchParams.get("children") || 0);
  const guests = adults + children;
  const roomLabel = rooms === 1 ? "Room" : "Rooms";
  const guestLabel = guests === 1 ? "Guest" : "Guests";

  const datesStr =
    checkinParam && checkoutParam
      ? `${new Date(checkinParam).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })} - ${new Date(checkoutParam).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })}`
      : "Add dates";

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md lg:px-24">
      <div className="flex flex-1 items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center">
            <Image src="/images/logo.png" alt="Stayhub" width={32} height={32} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">StayHub</span>
        </Link>
      </div>

      {isHotelsPage ? (
        <Link
          href={`/${searchParams.toString() ? `hotels?${searchParams.toString()}` : "hotels"}`}
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm transition-shadow hover:shadow-md md:flex"
        >
          <div className="max-w-[160px] truncate border-r border-slate-200 px-4 text-sm font-semibold text-slate-800">
            {locParam}
          </div>
          <div className="border-r border-slate-200 px-4 text-sm font-semibold text-slate-800">
            {datesStr}
          </div>
          <div className="px-4 text-sm font-semibold text-slate-600">
            {guests > 0 ? `${rooms} ${roomLabel}, ${guests} ${guestLabel}` : "Add guests"}
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0051cb] text-white">
            <LuSearch size={18} />
          </div>
        </Link>
      ) : null}

      <div className="flex flex-1 items-center justify-end gap-4 lg:gap-8">
        <div className="group relative py-2">
          <button className="flex items-center gap-1 text-slate-600 transition-colors hover:text-emerald-600">
            <FcGlobe size={24} />
            <LuChevronDown
              size={14}
              className="transition-transform duration-300 group-hover:rotate-180"
            />
          </button>
          <ul className="invisible absolute right-0 top-full mt-1 w-40 origin-top-right rounded-2xl border border-slate-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
            {languages.map((lang) => (
              <li
                key={lang.abbr}
                className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
              >
                {lang.name}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/support" className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-50">
          <BiSupport size={24} />
        </Link>

        {isAuthenticated ? (
          <div className="group relative py-2">
            <button className="flex items-center gap-3 rounded-full border border-slate-100 bg-slate-50 p-1 pr-3 transition-all hover:border-blue-500">
              <div className="h-8 w-8 overflow-hidden rounded-full border border-white">
                <Image
                  unoptimized
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${user?.firstname}+${user?.lastname}&rounded=true&background=random`
                  }
                  alt="Avatar"
                  width={32}
                  height={32}
                />
              </div>
              <LuChevronDown
                size={14}
                className="text-slate-400 transition-transform duration-300 group-hover:rotate-180"
              />
            </button>

            <div className="invisible absolute right-0 top-full mt-1 w-56 rounded-2xl border border-slate-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="mb-1 border-b border-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-slate-800">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="truncate text-[10px] text-slate-400">{user?.email}</p>
              </div>

              <Link
                href="/trips"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
              >
                <LuUser size={16} /> Trips
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <LuLogOut size={16} /> Log out
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login">
            <button className="rounded-xl bg-[#0057FF] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95">
              Login
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
