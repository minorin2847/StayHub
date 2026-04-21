"use client";
import { useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import { Tag, Space } from "antd";
import { RoomBed, RoomType } from "@/types/Room";
import { Amenity } from "@/types/Amenity";
import { Bed } from "@/types/Bed";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import EditModal from "./components/EditModal";

export type RoomTypeFilterData = {
    name: string | null;           // Text search for room name
    minSize: string | null;         // Numeric range as string for URL/Form compatibility
    maxSize: string | null;
    minCapacity: string | null;     // Guests capacity
    maxCapacity: string | null;
    minPrice: string | null;        // Price range
    maxPrice: string | null;
    minTotalBeds: string | null;    // Aggregate bed count filter
    maxTotalBeds: string | null;
    amenities: Amenity[] | null;     // Array of selected amenity names (Multi-select)
    beds: RoomBed[] | null;          // Array of selected bed names (Multi-select)
    sort: string | null;            // 'name', 'price', 'size', or 'totalBeds'
    order: string | null;           // 'ASC' or 'DESC'
    page: string | null;            // Current pagination index
};

export default function RoomTypeView() {
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<RoomType | null>(null);

    const fetchMasterData = async () => {

        const [resBed, resAme] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/hotels/beds`, { credentials: "include" }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/amenities/hotel-list`, { credentials: "include" })
        ]);

        const bedResponse = await resBed.json();
        setBeds(bedResponse.response.map((i: {bed_name: string; total_qty: number})=>({name: i.bed_name})));

        const ameResponse = await resAme.json();
        setAmenities(ameResponse.response || []);
    };

    return (
        <GenericTableView<RoomType, RoomTypeFilterData>
            resourceName="Room Type"
            searchPlaceholder="Search by room name..."
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/rooms/types`}
            onDataFetched={fetchMasterData}
            loading={loading}
            setLoading={setLoading}
            renderCreateModal={(injected) => (
                <CreateModal {...injected} masterAmenities={amenities} masterBeds={beds} />
            )}
            renderFilterModal={(injected) => (
                <FilterModal {...injected} masterAmenities={amenities} masterBeds={beds} />
            )}
            renderEditModal={(injected) => (
                <EditModal {...injected} masterAmenities={amenities} masterBeds={beds} />
            )}
            tableColumns={[
                {
                    title: "NAME",
                    dataIndex: "name",
                    key: "name",
                    className: "font-bold text-slate-800",
                    render: (name: string) => name
                },
                {
                    title: "SIZE",
                    dataIndex: "size",
                    key: "size",
                    render: (size: number) => `${size} m²`,
                },
                {
                    title: "CAPACITY",
                    dataIndex: "capacity",
                    key: "capacity",
                    render: (cap: number) => <Tag color="blue">{cap} Guests</Tag>,
                },
                {
                    title: "BEDS",
                    dataIndex: "total_beds",
                    key: "total_beds",
                    render: (count: number) => <Tag color="purple">{count} Total Beds</Tag>,
                },
                {
                    title: "PRICE",
                    dataIndex: "base_price",
                    key: "base_price",
                    render: (price: number) => (
                        <span className="text-emerald-600 font-bold">${price.toLocaleString()}</span>
                    ),
                },
            ]}
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            generatedDeletePrompt={(record) => `Delete "${record.name}" and all its associated data?`}
            generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/types/delete/${record.id}`}
        />
    );
}