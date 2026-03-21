"use client";

import UserTable from "@/components/dashboard/UserTable";
import { Account } from "@/types/Account";
import { Employee, EmployeeTableData } from "@/types/Employee";
import { Role } from "@/types/Role";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import Link from "next/link";

export default function ManageBranch() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get("name") ?? "");
  const [page, setPage] = useState<string>(searchParams.get("page") ?? "1");
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
          page: page,
        }).toString();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/branch?${params}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await res.json();
        setResults(data as EmployeeTableData[]);
        setHasPrevious(parseInt(page) > 1);
        setHasNext(data.length == 15);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("An error occured: ", error);
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(queryHandler);
      controller.abort();
    };
  }, [query, page]);
  return (
    <div className="flex flex-col gap-y-[30px] px-[30px] pt-[30px]">
      <div className="flex justify-between gap-x-[8px] h-fit w-full">
        <div className="flex items-center border rounded-5px gap-x-[10px] pl-[5px]">
          <FaMagnifyingGlass size={22} />
          <input
            className="flex w-[300px] outline-none"
            type="text"
            placeholder="Search username..."
            name="query"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </div>
        <div className="">
          <Link
            href="/dashboard/branch/add"
            className="p-[10px] w-fit h-fit rounded-[10px] text-white gap-x-[6px] flex items-center bg-blue-400"
          >
            <FaPlus size={24} />
            <p className="font-semibold text-[16px]">Create</p>
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="">Loading...</div>
      ) : (
        <div className="flex flex-col gap-y-[20px]">
          <UserTable tableData={results} />
          <div className="flex gap-x-[10px] items-center border mx-auto">
            <button
              className={`flex justify-center items-center ${hasPrevious ? "text-blue-500 cursor-pointer" : "text-gray-300/80"} font-light font-roboto text-[20px] w-[30px] border-r`}
              disabled={!hasPrevious}
              onClick={() =>
                setPage(Number(Math.max(parseInt(page) - 1, 1)).toString())
              }
            >
              {"<"}
            </button>
            <p className="select-none text-[16px]">{`Page ${page}`}</p>
            <button
              className={`flex justify-center items-center ${hasNext ? "text-blue-500 cursor-pointer" : "text-gray-300/80"} font-light font-roboto text-[20px] w-[30px] border-l`}
              disabled={!hasNext}
              onClick={() => setPage(Number(parseInt(page) + 1).toString())}
            >
              {">"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
