"use client";
import { useParams } from "next/navigation";

export default function HotelDetailBranchesPage() {
  const params = useParams();
  const hotelId = params.id;

  // Gọi API GET /hotels/{hotelId}/branches để lấy list chi nhánh
  const mockBranches = [
    { id: 1, name: "Vinpearl Nha Trang", location: "Nha Trang" },
    { id: 2, name: "Vinpearl Nam Hội An", location: "Quảng Nam" },
    { id: 1, name: "Vinpearl Nha Trang", location: "Nha Trang" },
    { id: 2, name: "Vinpearl Nam Hội An", location: "Quảng Nam" },
    { id: 1, name: "Vinpearl Nha Trang", location: "Nha Trang" },
    { id: 2, name: "Vinpearl Nam Hội An", location: "Quảng Nam" },
    { id: 1, name: "Vinpearl Nha Trang", location: "Nha Trang" },
    { id: 2, name: "Vinpearl Nam Hội An", location: "Quảng Nam" },
    { id: 1, name: "Vinpearl Nha Trang", location: "Nha Trang" },
    { id: 2, name: "Vinpearl Nam Hội An", location: "Quảng Nam" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chi nhánh của Khách sạn #{hotelId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockBranches.map(branch => (
          <div key={branch.id} className="border p-4 rounded-lg bg-white shadow-sm flex justify-between">
            <div>
              <h3 className="font-bold text-lg">{branch.name}</h3>
              <p className="text-gray-500">{branch.location}</p>
            </div>
            {/* Lưu ý: Admin chỉ xem được, quyền Edit/Add branch là của role MANAGE_HOTEL */}
            <button className="text-sm text-blue-500 hover:underline">Xem thống kê</button>
          </div>
        ))}
      </div>
    </div>
  );
}