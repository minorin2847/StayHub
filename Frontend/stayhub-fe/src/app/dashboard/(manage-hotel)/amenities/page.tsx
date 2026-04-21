"use client";
import React, { useState, useEffect } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import { Amenity, AmenityFilterData } from "@/types/Amenity";
import CreateModal from "./components/CreateModal";
import EditModal from "./components/EditModal";
import FilterModal from "./components/FilterModal";
import { BsFillInboxesFill } from "react-icons/bs";
import { FaPassport } from "react-icons/fa";

// 1. Import đúng những icon bạn cần dùng
import {
  FaWifi,
  FaSwimmer,
  FaLeaf,
  FaCoffee,
  FaCar,
  FaTv,
  FaSnowflake,
  FaPaw,
  FaWineBottle,
  FaSmile,
  FaTshirt,
  FaGlassMartiniAlt,
  FaSmokingBan,
  FaUmbrella,
  FaDoorClosed,
  FaSuitcaseRolling,
} from "react-icons/fa";

// 2. Tạo một object để map từ chuỗi (string) sang Component
const ICON_MAP: Record<string, React.ElementType> = {
  FaWifi,
  FaSwimmer,
  FaLeaf,
  FaCoffee,
  FaCar,
  FaTv,
  FaSnowflake,
  FaPaw,
  FaWineBottle,
  FaSmile,
  FaTshirt,
  FaGlassMartiniAlt,
  FaSmokingBan,
  FaUmbrella,
  FaDoorClosed,
  FaSuitcaseRolling,
};

export default function AmenitiesPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<Amenity | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    totalCategories: 0,
    topCategory: "N/A",
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/amenities/stats`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (res.ok) {
        const data = await res.json();
        setStats({
          total: data.total || 0,
          totalCategories: data.totalCategories || 0,
          topCategory: data.topCategory || "N/A",
        });
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu thống kê:", error);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchStats();
    }
  }, [loading]);

  return (
    <div className="flex flex-col w-full">
      <div className="px-[30px] pt-[30px]">
        <h1 className="text-2xl font-bold text-gray-800">Amenities</h1>
        <p className="text-gray-500 mb-6">
          Manage and organize guest facilities and property services.
        </p>

        <div className="grid grid-cols-3 gap-6 mb-[10px]">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex justify-center items-center font-bold text-xl">
              <BsFillInboxesFill />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">
                Total Amenities
              </p>
              <h2 className="text-2xl font-bold text-gray-800">
                {stats.total}
              </h2>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex justify-center items-center font-bold text-xl">
              <FaPassport />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">
                Total Categories
              </p>
              <h2 className="text-2xl font-bold text-gray-800">
                {stats.totalCategories}
              </h2>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex justify-center items-center font-bold text-xl">
              <FaPassport />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Top Category</p>
              <h2 className="text-xl font-bold text-gray-800 truncate max-w-[150px]">
                {stats.topCategory}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <GenericTableView<Amenity, AmenityFilterData>
        resourceName="Amenity"
        searchPlaceholder="Search amenities by name..."
        tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/amenities/hotel-list`}
        loading={loading}
        setLoading={setLoading}
        hasEdit={false}
        renderCreateModal={(injected) => <CreateModal {...injected} />}
        renderFilterModal={(injected) => <FilterModal {...injected} />}
        renderEditModal={(injected) => <EditModal {...injected} />}
        currentRecord={currentRecord}
        setCurrentRecord={setCurrentRecord}
        generatedDeletePrompt={(record) =>
          `Do you want to remove the amenity: ${record.name} from this hotel?`
        }
        generatedDeleteEndpoint={(record) =>
          `${process.env.NEXT_PUBLIC_API_URL}/employee/amenities/remove-from-hotel/${record.name}`
        }
        tableRowKey="name"
        tableColumns={[
          {
            title: "ICON",
            dataIndex: "icon",
            key: "icon",
            render: (iconName: string) => {
              // 3. Sử dụng ICON_MAP để lấy Component tương ứng
              const IconComponent = ICON_MAP[iconName];

              return (
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex justify-center items-center text-lg shadow-sm">
                  {IconComponent ? <IconComponent /> : "✨"}
                </div>
              );
            },
          },
          {
            title: "NAME",
            dataIndex: "name",
            key: "name",
            className: "font-semibold text-slate-800",
            render: (name: string) => name,
          },
          {
            title: "CATEGORY",
            dataIndex: "category",
            key: "category",
            className: "text-slate-500",
            render: (category: string) => category,
          },
        ]}
      />
    </div>
  );
}
