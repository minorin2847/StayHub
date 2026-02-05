"use client";

import UserTable from "@/components/dashboard/UserTable";
import { Account } from "@/types/Account";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ManageUser() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState<string>(searchParams.get('name') ?? '');
    const [start, setStart] = useState<string>(searchParams.get('start') ?? '0');
    const [end, setEnd] = useState<string>(searchParams.get('end') ?? '10');
    const [results, setResults] = useState<Account[]>([]);
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/non-employee?${params}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setResults(data['values'] as Account[]);
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
        <div className="flex flex-col">
            <input 
                type="text" 
                placeholder="Search username..."
                name="query"
                onChange={e => setQuery(e.target.value)}
                value={query} 
            />
            {
                loading ? 
                    <UserTable tableData={results}/>
                : <div className="">Loading...</div>
            }

        </div>
    )
};