"use client";
import { useEffect, useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import { Tag, Image } from "antd";
import { Service } from "@/types/Service";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import EditModal from "./components/EditModal";


export type ServiceFilterData = {
    name: string | null;
    type: string | null;
    minPrice: string | null;
    maxPrice: string | null;
    sort: string | null;
    order: string | null;
    page: string | null;
};

export default function ServiceView() {
    const [serviceTypes, setServiceTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<Service | null>(null);
    const fetchTypes = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/services/types`, {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();
            setServiceTypes(data);
        };
    return (
        <GenericTableView<Service, ServiceFilterData>
            resourceName="Service"
            searchPlaceholder="Search services by name..."
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/services`}
            onDataFetched={async () => await fetchTypes()}
            loading={loading}
            setLoading={setLoading}
            renderCreateModal={(injected) => (
                <CreateModal {...injected} serviceTypes={serviceTypes} />
            )}
            renderFilterModal={(injected) => (
                <FilterModal {...injected} serviceTypes={serviceTypes} />
            )}
            renderEditModal={(injected) => (
                <EditModal {...injected} serviceTypes={serviceTypes} />
            )}
            tableColumns={[
                {
                    title: "ID",
                    dataIndex: "id",
                    key: "id",
                    className: "font-semibold text-slate-800",
                    render: (id: string) => `S-${id}`
                },
                {
                    title: "NAME",
                    dataIndex: "name",
                    key: "name",
                    className: "font-semibold text-slate-800",
                    render: (text: string) => text,
                },
                {
                    title: "TYPE",
                    dataIndex: "type",
                    key: "type",
                    render: (type: string) => (
                        <Tag color="cyan" className="rounded-full uppercase font-bold">
                            {type}
                        </Tag>
                    ),
                },
                {
                    title: "PRICE",
                    dataIndex: "price",
                    key: "price",
                    render: (price: number) => (
                        <span className="text-emerald-600 font-bold">
                            ${price.toLocaleString()}
                        </span>
                    ),
                },
            ]}
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            generatedDeletePrompt={(record) => `Delete the service "${record.name}"?`}
            generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/services/delete/${record.id}`}
        />
    );
}