"use client";

import { useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";

export type HotelBedTableData = {
    bed_name: string;
    total_qty: number;
};

export type HotelBedFilterData = {
    query: string | null;
    minCount: string | null;
    maxCount: string | null;
    sort: string | null;
    order: string | null;
    page: string | null;
};

// This matches the global bed list returned by getDashboardBeds
export type GlobalBedData = {
    bed_name: string;
    hotel_count: number;
};

export default function ManageHotelBedList() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<HotelBedTableData | null>(null);
    const [hotelBedData, setHotelBedData] = useState<HotelBedTableData[]>([]);
    return (
        <GenericTableView<HotelBedTableData, HotelBedFilterData>
            resourceName="Hotel Bed"
            resourceId="bed_name"
            searchPlaceholder="Search bed type..."
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/hotels/beds`}
            onDataFetched={data => setHotelBedData(data)}
            loading={loading}
            setLoading={setLoading}
            hasEdit={false} // Disables the edit button and modal
            
            renderCreateModal={(injected) => (
                <CreateModal 
                {...injected} 
                hotelBeds={hotelBedData}
                />
            )}
            
            renderFilterModal={(injected) => (
                <FilterModal {...injected} />
            )}

            tableColumns={[
                {
                    title: "BED NAME",
                    dataIndex: "bed_name",
                    key: "bed_name",
                    render: (name: string) => <span className="font-semibold text-slate-700">{name}</span>,
                },
                {
                    title: "TOTAL QUANTITY IN ROOMS",
                    dataIndex: "total_qty",
                    key: "total_qty",
                    render: (qty: number) => <span className="text-slate-500">{qty}</span>,
                }
            ]}

            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            
            generatedDeletePrompt={(record) => `Remove ${record.bed_name} from this hotel?`}
            // Note: Updated to match your DELETE route structure
            generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/beds/hotels/remove/${record.bed_name}`}
        />
    );
}