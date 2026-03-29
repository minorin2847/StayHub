"use client";

import { Branch } from "@/types/Branch";
import { useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import { FaArrowTrendUp} from "react-icons/fa6";
import { MdLocationCity } from "react-icons/md";
import GenericTableView from "@/components/ui/GenericTableView";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";

export type BranchTableData = Branch & { 
    manager_firstname: string | null; 
    manager_lastname: string | null; 
    manager_email: string | null; 
    hotel_count: number | null; 
    revenue: number | null; 
    status: string | null }
export type BranchFilterData = {
    name: string | null;
    hotelCountMin: string | null;
    hotelCountMax: string | null;
    sort: string | null;
    order: string | null;
    page: string | null
}
export default function BranchList() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<BranchTableData | null>(null);

    const columns = [
        {
            title: 'BRANCH ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: number) => (
                <span className="text-gray-500">
                    BR-{String(id).padStart(3, '0')}
                </span>
            ),
        },
        {
            title: 'BRANCH NAME',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-semibold text-gray-900">{text}</span>,
        },
        {
            title: 'LOCATION',
            dataIndex: 'location',
            key: 'location',
            render: (text: string) => <span className="text-gray-700">{text}</span>,
        },
        {
            title: 'REGIONAL MANAGER',
            key: 'manager',
            render: (_: unknown, record: BranchTableData) => (
                <span className="text-gray-900">
                    {record.manager_firstname ? record.manager_firstname + " " + record.manager_lastname : "Unassigned"}
                </span>
            ),
        },
        {
            title: 'EMAIL',
            dataIndex: 'manager_email',
            key: 'manager_email',
            render: (email: string) => <span className="text-gray-500">{email ? email : "Unassigned"}</span>,
        },
        {
            title: 'HOTELS',
            dataIndex: 'hotel_count',
            key: 'hotel_count',
            render: (count: number) => <span className="text-gray-700">{count ? count : 0}</span>,
        },
        {
            title: 'REVENUE',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => (
                <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                    }).format(revenue ? revenue : 0)}
                </span>
            ),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const isActive = status ? status.toUpperCase() === 'ACTIVE' : true;
                return (
                    <span
                        className={`px-3 py-1 text-xs font-bold rounded-full border ${isActive
                                ? 'bg-green-50 text-green-600 border-green-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                    >
                        {status ? status.toUpperCase(): 'ACTIVE'}
                    </span>
                );
            },
        }
    ];

    return (
        <div className="flex flex-col mx-16 my-12 gap-y-[32px]">
            <div className="h-[230px] w-full flex justify-between">
                <div className="h-full flex flex-col w-[300px] border rounded-[12px] bg-white inset-shadow-sm shadow-lg px-[25px] py-[25px] gap-y-[20px]">
                    <div className="flex h-[50px] items-center justify-between">
                        <div className="h-full flex w-[50px] rounded-[8px] bg-blue-100 text-blue-500 justify-center items-center">
                            <MdLocationCity size={40} />
                        </div>
                        <div className="h-full w-fit font-semibold gap-x-[6px] flex items-center text-green-300">
                            <FaArrowTrendUp size={24} />
                            <p>+2%</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-x-[8px]">
                        <p className="font-semibold text-gray-400 text-2xl">Total Branches</p>
                        <p className="font-extrabold text-[50px]">42</p>
                    </div>
                </div>
                <div className="h-full flex flex-col w-[300px] border rounded-[12px] bg-white inset-shadow-sm shadow-lg px-[25px] py-[25px] gap-y-[20px]">
                    <div className="flex h-[50px] items-center justify-between">
                        <div className="h-full flex w-[50px] rounded-[8px] bg-blue-100 text-blue-500 justify-center items-center">
                            <MdLocationCity size={40} />
                        </div>
                        <div className="h-full w-fit font-semibold gap-x-[6px] flex items-center text-green-300">
                            <FaArrowTrendUp size={24} />
                            <p>+2%</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-x-[8px]">
                        <p className="font-semibold text-gray-400 text-2xl">Total Branches</p>
                        <p className="font-extrabold text-[50px]">42</p>
                    </div>
                </div>
                <div className="h-full flex flex-col w-[300px] border rounded-[12px] bg-white inset-shadow-sm shadow-lg px-[25px] py-[25px] gap-y-[20px]">
                    <div className="flex h-[50px] items-center justify-between">
                        <div className="h-full flex w-[50px] rounded-[8px] bg-blue-100 text-blue-500 justify-center items-center">
                            <MdLocationCity size={40} />
                        </div>
                        <div className="h-full w-fit font-semibold gap-x-[6px] flex items-center text-green-300">
                            <FaArrowTrendUp size={24} />
                            <p>+2%</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-x-[8px]">
                        <p className="font-semibold text-gray-400 text-2xl">Total Branches</p>
                        <p className="font-extrabold text-[50px]">42</p>
                    </div>
                </div>
                <div className="h-full flex flex-col w-[300px] border rounded-[12px] bg-white inset-shadow-sm shadow-lg px-[25px] py-[25px] gap-y-[20px]">
                    <div className="flex h-[50px] items-center justify-between">
                        <div className="h-full flex w-[50px] rounded-[8px] bg-blue-100 text-blue-500 justify-center items-center">
                            <MdLocationCity size={40} />
                        </div>
                        <div className="h-full w-fit font-semibold gap-x-[6px] flex items-center text-green-300">
                            <FaArrowTrendUp size={24} />
                            <p>+2%</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-x-[8px]">
                        <p className="font-semibold text-gray-400 text-2xl">Total Branches</p>
                        <p className="font-extrabold text-[50px]">42</p>
                    </div>
                </div>
            </div>


        <GenericTableView<BranchTableData, BranchFilterData>
            resourceName="Branch"
            searchPlaceholder="Search by branch name, location or manager full name..."
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/branches`}
            loading={loading}
            setLoading={setLoading}
            renderCreateModal={(injected) => (
                <CreateModal
                    {...injected}
                />
            )}
            renderFilterModal={(injected) => (
                <FilterModal
                    {...injected}
                />
            )}
            renderEditModal={(injected) => (
                // <EditModal
                //     {...injected}
                //     branches={branches}
                //     hotels={hotels}
                //     roles={roles}
                // />
                <></>
            )}

            tableColumns={columns}

            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}

            generatedDeletePrompt={(record: BranchTableData) => `Do you want to delete ${record.name}?`}
            generatedDeleteEndpoint={(record: BranchTableData) => `${process.env.NEXT_PUBLIC_API_URL}/employee/branches/delete/${record.id}`}
        />
        </div>
    )
}
