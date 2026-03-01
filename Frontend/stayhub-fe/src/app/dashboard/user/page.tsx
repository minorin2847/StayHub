"use client";

import UserTable from "@/components/dashboard/UserTable";
import { Account } from "@/types/Account";
import { Employee, EmployeeTableData } from "@/types/Employee";
import { Role } from "@/types/Role";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function ManageUser() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState<string>(searchParams.get('name') ?? '');
    const [start, setStart] = useState<string>(searchParams.get('start') ?? '0');
    const [end, setEnd] = useState<string>(searchParams.get('end') ?? '10');
    const [results, setResults] = useState<EmployeeTableData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const queryHandler = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                        name: query,
                        start: start,
                        end: end
                    }).toString()
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/user?${params}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setResults(data['values'] as EmployeeTableData[]);
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
    }, [query, start, end])
    return (
        <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
            {/* Search Bar Section */}
            <div className="flex items-center gap-4 w-full group">
                <div className="relative flex-grow">
                    <FaMagnifyingGlass 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" 
                        size={18} 
                    />
                    <input
                        className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all placeholder:text-slate-400 text-slate-600" 
                        type="text" 
                        placeholder="Search username, email or ID..."
                        name="query"
                        onChange={e => setQuery(e.target.value)}
                        value={query} 
                    />
                </div>
                <button className="h-12 px-8 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2">
                    Search
                </button>
            </div>
    
            {/* Table Section */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        {/* Spinner đơn giản */}
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium text-sm">Fetching users...</p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-2 duration-500">
                        <UserTable tableData={results} />
                    </div>
                )}
            </div>
        </div>
    );
};