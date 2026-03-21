"use client";

import UserTable from "@/components/dashboard/user/UserTable";
import { Account } from "@/types/Account";
import { Employee, EmployeeTableData } from "@/types/Employee";
import { Role } from "@/types/Role";
import { Button, Modal } from "antd";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdFilterList } from "react-icons/md";
import EditModal from "@/components/dashboard/user/EditModal";
import buildQueryParams from "@/utils/BuildQueryParams";

export type UserSearchParams = {
    name: string | null;
    hotelid: string | null;
    branchid: string | null;
    roles: string[];
    salaryMin: string | null;
    salaryMax: string | null;
    sort: string | null;
    order: string | null;
    page: string | null
};
import FormCreate from "./components/FormCreate";

export default function ManageUser() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [query, setQuery] = useState<UserSearchParams>({
        name: searchParams.get('name'),
        hotelid: searchParams.get('hotelid'),
        branchid: searchParams.get('branchid'),
        roles: searchParams.getAll('roles').filter(Boolean),
        salaryMin: searchParams.get('salaryMin'),
        salaryMax: searchParams.get('salaryMax'),
        sort: searchParams.get('sort'),
        order: searchParams.get('order'),
        page: searchParams.get('page')
    }) 
    const [results, setResults] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(false);
    const [isFilterOpened, setIsFilterOpened] = useState<boolean>(false);


    const [open, setOpen] = useState(false)
    const showModal = () => setOpen(true)
    const closeModal = () => setOpen(false)

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        setLoading(true);
        const queryHandler = setTimeout(async () => {
            try {
                const params = buildQueryParams(query).toString()
                router.push(`/dashboard/user?${params}`);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/user?${params}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setResults(data.response as Employee[]);
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
        <div className="flex flex-col gap-y-[30px] px-[30px] pt-[30px]">
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
                    placeholder="Search by username, email or full name..."
                    name="query"
                    onChange={e => setQuery({...query, name: e.target.value})}
                    value={query.name ?? ""} 
                    />
                </div>
                <div className="">
                {/* Create button */}
                <Button onClick={showModal} className="!flex-1 !md:flex-none !flex !items-center !justify-center !gap-2 !h-11 !px-6 !rounded-xl !bg-emerald-600 !text-white !font-bold !text-sm  !shadow-emerald-100" type="primary">
                    <FaPlus size={16} />
                    Create New User
                </Button>
                <FormCreate 
                    open={open} 
                    onClose={closeModal} 
                    onSuccess={(newEmployee) => {
                        setResults([newEmployee, ...results]);
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
                    <EditModal isFilterOpened={isFilterOpened} setIsFilterOpened={setIsFilterOpened}
                    query={query}
                    setQuery={setQuery} />
                }
                </div>

            </div>
            {   
                loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm font-medium">Loading...</p>
                    </div>
                )
                : (
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <UserTable tableData={results} />
                        </div>
            
                        <div className="flex items-center justify-center gap-4 py-2">
                            <button 
                                className={`flex justify-center items-center w-10 h-10 rounded-xl border transition-all ${
                                    hasPrevious 
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
                                    Trang <span className="text-emerald-600">{query.page ?? '1'}</span>
                                </p>
                            </div>
            
                            <button 
                                className={`flex justify-center items-center w-10 h-10 rounded-xl border transition-all ${
                                    hasNext 
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

        </div>
    )
};
