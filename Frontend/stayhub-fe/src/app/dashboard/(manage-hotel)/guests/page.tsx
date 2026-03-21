import React from "react";

export default function GuestsPage() {
  return (
    <div className="flex flex-col gap-y-[30px] px-[30px] pt-[30px]">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold">Manage Guests</h1>
      </div>
      <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px] text-gray-500">
        <p className="text-lg">This page will list all Guests.</p>
      </div>
    </div>
  );
}
