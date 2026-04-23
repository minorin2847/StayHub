"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "antd";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// CÁCH CHUẨN: Tạo object Icon riêng thay vì sửa prototype global của Leaflet
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MapPickerModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (locationName: string, lat: number, lng: number) => void;
  // BỎ HARDCODE: Cho phép truyền tọa độ trung tâm và vị trí chọn sẵn từ bên ngoài
  defaultCenter?: [number, number]; 
  initialPosition?: { lat: number; lng: number } | null;
};

// Component xử lý sự kiện click trên bản đồ
function LocationMarker({ position, setPosition, fetchAddress }: any) {
  useMapEvents({
    click(e) {
      // Dùng wrap() để đảm bảo longitude luôn nằm trong khoảng [-180, 180] 
      // nếu người dùng cuộn bản đồ theo chiều ngang quá nhiều vòng.
      const wrappedLatLng = e.latlng.wrap();
      setPosition(wrappedLatLng);
      // UX TỐT: Ngay khi click, gọi API lấy địa chỉ luôn để user xem trước
      fetchAddress(wrappedLatLng.lat, wrappedLatLng.lng);
    },
  });

  return position === null ? null : <Marker position={position} icon={customIcon} />;
}

export default function MapPickerModal({
  open,
  onCancel,
  onConfirm,
  defaultCenter = [41.3851, 2.1734], // Mặc định vẫn có thể là Barcelona nếu không truyền
  initialPosition = null,
}: MapPickerModalProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [addressName, setAddressName] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Reset dữ liệu mỗi khi mở lại Modal
  useEffect(() => {
    if (open) {
      if (initialPosition) {
        setPosition(L.latLng(initialPosition.lat, initialPosition.lng));
      } else {
        setPosition(null);
        setAddressName("");
      }
    }
  }, [open, initialPosition]);

  // Hàm Reverse Geocoding gọi NGAY LÚC CLICK
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.suburb ||
        data.address?.county ||
        data.address?.state ||
        data.address?.country ||
        "Unknown Area";
        
      setAddressName(city);
    } catch (error) {
      console.error(error);
      setAddressName("Unknown Area");
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  const handleConfirm = () => {
    if (!position) return;
    onConfirm(addressName || "Selected Location", position.lat, position.lng);
  };

  return (
    <Modal
      title="Select Location on Map"
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      // UX TỐT: Disable nút Confirm nếu chưa chấm bản đồ hoặc đang tải địa chỉ
      okButtonProps={{ disabled: !position || loadingAddress }} 
      okText="Confirm Location"
      width={700}
      destroyOnClose
    >
      {/* Sửa lỗi z-index của Leaflet đè lên modal bằng relative z-0 */}
      <div className="h-[400px] w-full rounded-xl overflow-hidden mt-4 relative z-0 border border-slate-200">
        <MapContainer
          center={initialPosition ? [initialPosition.lat, initialPosition.lng] : defaultCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} fetchAddress={fetchAddress} />
        </MapContainer>
      </div>

      {/* UX TỐT: Hiển thị trạng thái để user biết họ đang chọn cái gì */}
      <div className="mt-4 min-h-[48px] px-2">
        {position ? (
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="text-slate-800 font-semibold text-[15px]">
              {loadingAddress ? "Đang tải vị trí..." : `📍 ${addressName}`}
            </span>
            <span className="text-slate-500 text-[13px]">
              Tọa độ: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic mt-2">
            Vui lòng nhấp vào bản đồ để thả ghim chọn vị trí...
          </p>
        )}
      </div>
    </Modal>
  );
}