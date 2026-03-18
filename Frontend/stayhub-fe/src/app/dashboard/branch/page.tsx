"use client";

import { Branch } from "@/types/Branch";
import { useEffect, useState } from "react";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdLocationCity } from "react-icons/md";

export type BranchListData = Branch & {manager_name: string; manager_email: string; hotel_count: number; revenue: number; status: string}

export default function BranchList() {
    const [data, setData] = useState<BranchListData>();
    const [loading, isLoading] = useState<boolean>(false);
    
    const columns = [
        
    ]
    // useEffect

    return (
        <div className="flex mx-16 my-12 gap-y-[32px]">
            <div className="h-[230px] w-full flex justify-between">
                <div className="h-full flex flex-col w-[300px] border rounded-[12px] bg-white inset-shadow-sm shadow-lg px-[25px] py-[25px] gap-y-[20px]">
                    <div className="flex h-[50px] items-center justify-between">
                        <div className="h-full flex w-[50px] rounded-[8px] bg-blue-100 text-blue-500 justify-center items-center">
                            <MdLocationCity size={40} />
                        </div>
                        <div className="h-full w-fit font-semibold gap-x-[6px] flex items-center text-green-300">
                            <FaArrowTrendUp size={24}/>
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
                            <FaArrowTrendUp size={24}/>
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
                            <FaArrowTrendUp size={24}/>
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
                            <FaArrowTrendUp size={24}/>
                            <p>+2%</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-x-[8px]">
                        <p className="font-semibold text-gray-400 text-2xl">Total Branches</p>
                        <p className="font-extrabold text-[50px]">42</p>
                    </div>
                </div>
            </div>
        </div>
    )
}