"use client";
import { useRouter } from "next/navigation";

export default function AddHotelPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic: Lấy data từ form -> Gọi API POST /hotels -> Chuyển hướng về trang list
    alert("Đã tạo khách sạn thành công!");
    router.push("/dashboard/hotels");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thêm Tập đoàn Khách sạn mới</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow flex flex-col gap-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên Khách sạn</label>
          <input type="text" className="w-full border rounded p-2" required placeholder="VD: StayHub Grand" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hạng (Classification)</label>
          <select className="w-full border rounded p-2">
            <option value="3">3 Sao</option>
            <option value="4">4 Sao</option>
            <option value="5">5 Sao</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trụ sở / Khu vực</label>
          <input type="text" className="w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chung</label>
          <textarea className="w-full border rounded p-2" rows={4}></textarea>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Tạo Khách sạn</button>
        </div>
      </form>
    </div>
  );
}