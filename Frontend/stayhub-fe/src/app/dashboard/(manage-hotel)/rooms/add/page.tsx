import React from "react";

export default function AddRoomPage() {
  return (
    <div className="flex flex-col gap-y-[30px] px-[30px] pt-[30px]">
      <h1 className="text-2xl font-bold">Add New Room</h1>
      <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px] text-gray-500">
        <p className="text-lg">Form to create a room (Manage Branch only).</p>
      </div>
    </div>
  );
}
