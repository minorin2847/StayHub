"use client";

import UserTable from "@/components/dashboard/UserTable";
import { Account } from "@/types/Account";
import { Employee, EmployeeTableData } from "@/types/Employee";
import { Role } from "@/types/Role";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function ManageUser() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState<string>(searchParams.get('name') ?? '');
    const [page, setPage] = useState<string>(searchParams.get('page') ?? '1');
    const [results, setResults] = useState<EmployeeTableData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(false);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const queryHandler = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                        name: query,
                        page: page
                    }).toString()
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/user?${params}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setResults(data as EmployeeTableData[]);
                setHasPrevious(parseInt(page) > 1);
                setHasNext(data.length == 15);
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
    }, [query, page])
    return (
        <div className="flex flex-col gap-y-[30px] px-[30px] pt-[30px]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                {/* Searching */}
            <div className="relative w-full group">
                <FaMagnifyingGlass 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" 
                    size={18} 
                />
                <input
                    className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-inner transition-all placeholder:text-slate-400 text-sm font-medium" 
                    type="text" 
                    placeholder="Search by username, email..."
                    name="query"
                    onChange={e => setQuery(e.target.value)}
                    value={query} 
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Create button */}
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100">
                    <FaPlus size={16} />
                    <span>Create New User</span>
                </button>
                {/* filter button */}
                <button className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 4h18M6 12h12M10 20h4"></path></svg>
                </button>
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
                                onClick={() => setPage((Math.max(parseInt(page) - 1, 1)).toString())}
                            >
                                <span className="text-lg font-light">{"<"}</span>
                            </button>
            
                            <div className="px-6 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <p className="select-none text-sm font-bold text-slate-700">
                                    Trang <span className="text-emerald-600">{page}</span>
                                </p>
                            </div>
            
                            <button 
                                className={`flex justify-center items-center w-10 h-10 rounded-xl border transition-all ${
                                    hasNext 
                                    ? "bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 shadow-sm cursor-pointer" 
                                    : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                }`}
                                disabled={!hasNext} 
                                onClick={() => setPage((parseInt(page) + 1).toString())}
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