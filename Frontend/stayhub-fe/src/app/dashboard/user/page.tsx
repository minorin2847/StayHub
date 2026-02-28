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
        <div className="flex flex-col gap-y-[30px] px-[30px]">
            <div className="flex gap-x-[8px] h-fit w-full">
                <input
                    className="flex grow h-full items-center border rounded-[5px] outline-none" 
                    type="text" 
                    placeholder="Search username..."
                    name="query"
                    onChange={e => setQuery(e.target.value)}
                    value={query} 
                />
                <button className="p-[10px] w-fit h-fit rounded-[10px] text-white gap-x-[6px] flex items-center bg-blue-400">
                    <FaMagnifyingGlass size={24} />
                    <p className="font-semibold text-[16px]">Search</p>
                </button>
            </div>
            {
                loading ? 
                    <div className="">Loading...</div>
                : <UserTable tableData={results} />
            }

        </div>
    )
};