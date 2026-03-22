"use client";

import { Branch } from "@/types/Branch";
import { Button, Table } from "antd";
import { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import { FaArrowTrendUp, FaMagnifyingGlass } from "react-icons/fa6";
import { MdFilterList, MdLocationCity } from "react-icons/md";
import FormCreate from "./components/FormCreate";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import buildQueryParams from "@/utils/BuildQueryParams";
import BranchFilterSortModal from "@/components/dashboard/branch/BranchFilterModal";

export type BranchListData = Branch & { 
    manager_firstname: string | null; 
    manager_lastname: string | null; 
    manager_email: string | null; 
    hotel_count: number | null; 
    revenue: number | null; 
    status: string | null }
export type BranchListQuery = {
    name: string | null;
    hotelCountMin: string | null;
    hotelCountMax: string | null;
    sort: string | null;
    order: string | null;
    page: string | null
}
export default function BranchList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState<BranchListData[]>([]);
    const [query, setQuery] = useState<BranchListQuery>({
        name: searchParams.get('name'),
        hotelCountMin: searchParams.get('hotelCountMin'),
        hotelCountMax: searchParams.get('hotelCountMax'),
        sort: searchParams.get('sort'),
        order: searchParams.get('order'),
        page: searchParams.get('page')
    });
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isFilterOpened, setIsFilterOpened] = useState<boolean>(false);
    const [open, setOpen] = useState(false)
    const showModal = () => setOpen(true)
    const closeModal = () => setOpen(false)
    
    const columns = [
        {
            title: 'BRANCH ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => (
                <span className="text-gray-500">
                    BR-{String(id).padStart(3, '0')}
                </span>
            ),
        },
        {
            title: 'BRANCH NAME',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-semibold text-gray-900">{text}</span>,
        },
        {
            title: 'LOCATION',
            dataIndex: 'location',
            key: 'location',
            render: (text) => <span className="text-gray-700">{text}</span>,
        },
        {
            title: 'REGIONAL MANAGER',
            key: 'manager',
            render: (_, record) => (
                <span className="text-gray-900">
                    {record.manager_firstname ? record.manager_firstname + " " + record.manager_lastname : "Unassigned"}
                </span>
            ),
        },
        {
            title: 'EMAIL',
            dataIndex: 'manager_email',
            key: 'manager_email',
            render: (email) => <span className="text-gray-500">{email ? email : "Unassigned"}</span>,
        },
        {
            title: 'HOTELS',
            dataIndex: 'hotel_count',
            key: 'hotel_count',
            render: (count) => <span className="text-gray-700">{count ? count : 0}</span>,
        },
        {
            title: 'REVENUE',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue) => (
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
            render: (status) => {
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
        },
        {
            title: 'ACTIONS',
            key: 'actions',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <button
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-colors"
                        onClick={() => console.log('Edit', record.id)}
                    >
                        <FaPen size={20} />
                    </button>
                    <button
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                        onClick={() => console.log('Delete', record.id)}
                    >
                        <FaTrash size={20} />
                    </button>
                </div>
            ),
        },
    ];
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        setLoading(true);
        const queryHandler = setTimeout(async () => {
            try {
                const params = buildQueryParams(query).toString()
                router.push(`/dashboard/branches?${params}`);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/branches?${params}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setData(data.response as BranchListData[]);
                setHasPrevious(parseInt(query.page ?? '1') > 1);
                setHasNext(data.hasNext);
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error("An error occured: ", error);
                }
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        }, 500);

        return () => {
            clearTimeout(queryHandler);
            controller.abort();
        }
    }, [query])

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


            <div className="flex justify-between items-center gap-4 w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                {/* Searching */}
            <div className="flex grow group items-center gap-x-4 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-inner transition-all">
                <FaMagnifyingGlass 
                    className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" 
                    size={18} 
                />
                <input
                    className="outline-none text-m font-medium placeholder:text-slate-400 transition-all group-focus-within:border-emerald-500 w-full" 
                    type="text" 
                    placeholder="Search by name, location or manager full name..."
                    name="query"
                    onChange={e => setQuery({...query, name: e.target.value})}
                    value={query.name ?? ""} 
                    />
            </div>
                <div className="flex items-center gap-x-3">
                {/* Create button */}
                <Button onClick={showModal} className="!flex-1 !md:flex-none !flex !items-center !justify-center !gap-2 !h-11 !px-6 !rounded-xl !bg-emerald-600 !text-white !font-bold !text-sm  !shadow-emerald-100" type="primary">
                    <FaPlus size={16} />
                    Create New Branch
                </Button>
                <FormCreate 
                    open={open} 
                    onClose={closeModal} 
                    onSuccess={(newBranch) => {
                        setData([newBranch, ...data]);
                    }}
                />
                 {/* filter button */}
                <Button 
                size="large" 
                shape="default" 
                icon={<MdFilterList size={25} className="text-blue-600"/>}
                className="!text-emerald-600 hover:!border-emerald-600 !flex !justify-center !items-center"
                onClick={()=>{setIsFilterOpened(true)}}
                />

                {
                    <BranchFilterSortModal
                    isFilterOpened={isFilterOpened} setIsFilterOpened={setIsFilterOpened}
                    query={query}
                    setQuery={setQuery} />
                }
                </div>

            </div>
            {/* Main Table */}
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="middle"
                bordered={false}
            />

            <div className="flex items-center justify-center gap-4 py-2">
                <button
                    className={`flex justify-center items-center w-10 h-10 rounded-xl border transition-all ${hasPrevious
                            ? "bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 shadow-sm cursor-pointer"
                            : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        }`}
                    disabled={!hasPrevious}
                    onClick={() => setQuery({...query, page: (Math.max(parseInt(query.page ?? '1') - 1, 1)).toString()})}
                >
                    <span className="text-lg font-light">{"<"}</span>
                </button>

                <div className="px-6 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <p className="select-none text-sm font-bold text-slate-700">
                        Trang <span className="text-emerald-600">{query.page ?? "1"}</span>
                    </p>
                </div>

                <button
                    className={`flex justify-center items-center w-10 h-10 rounded-xl border transition-all ${hasNext
                            ? "bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 shadow-sm cursor-pointer"
                            : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        }`}
                    disabled={!hasNext}
                    onClick={() => setQuery({...query, page: (parseInt(query.page ?? '1') + 1).toString()})}
                >
                    <span className="text-lg font-light">{">"}</span>
                </button>
            </div>
        </div>
    )
}
