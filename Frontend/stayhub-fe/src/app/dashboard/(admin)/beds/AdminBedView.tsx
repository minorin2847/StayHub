"use client";

import { useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
// Note: Ensure you create these modal components or adjust the imports to match your file structure
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import EditModal from "./components/EditModal";

// Matches the data structure returned by getDashboardBeds
export type GlobalBedData = {
    bed_name: string;
    hotel_count: number; // Indicates how many hotels are currently using this bed type
};

export type GlobalBedFilterData = {
    query: string | null;
    minCount: string | null;
    maxCount: string | null;
    sort: string | null;
    order: string | null;
    page: string | null;
};

export default function ManageGlobalBedList() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<GlobalBedData | null>(null);

    return (
        <GenericTableView<GlobalBedData, GlobalBedFilterData>
            resourceName="Global Bed Type"
            resourceId="bed_name"
            searchPlaceholder="Search global bed types..."
            // Adjust the endpoint path to match where your getDashboardBeds/getBeds route is mounted
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/beds`}
            loading={loading}
            setLoading={setLoading}

            renderCreateModal={(injected) => (
                <CreateModal {...injected} />
            )}
            
            renderEditModal={(injected) => (
                <EditModal {...injected} />
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
                    title: "HOTELS USING",
                    dataIndex: "hotel_count",
                    key: "hotel_count",
                    render: (count: number) => (
                        <span className={`font-medium ${count > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {count} {count === 1 ? 'Hotel' : 'Hotels'}
                        </span>
                    ),
                }
            ]}

            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            
            // Delete configuration matching your `deleteBed` backend controller (`/beds/:name`)
            generatedDeletePrompt={(record) => `Are you sure you want to permanently delete the bed type "${record.bed_name}"?`}
            generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/beds/delete/${record.bed_name}`}
        />
    );
}