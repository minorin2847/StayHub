"use client";
import { useRouter } from "next/navigation";

export default function AddRoomPage() {
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Đã tạo phòng thành công!");
    router.push("/dashboard/rooms");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thêm Phòng Mới</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow flex flex-col gap-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại Phòng (Type)</label>
          <input type="text" className="w-full border rounded p-2" required placeholder="VD: Superior Twin Room" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá (Price)</label>
            <input type="number" className="w-full border rounded p-2" required placeholder="VD: 150" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (Capacity)</label>
            <input type="number" className="w-full border rounded p-2" required placeholder="VD: 2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m2)</label>
            <input type="number" className="w-full border rounded p-2" required placeholder="VD: 30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
            <input type="number" className="w-full border rounded p-2" defaultValue="0" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả Phòng</label>
          <textarea className="w-full border rounded p-2" rows={4} placeholder="Nhập mô tả cho căn phòng..."></textarea>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tạo Phòng</button>
        </div>
      </form>
    </div>
  );
}
