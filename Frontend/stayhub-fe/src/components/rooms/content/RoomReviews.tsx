"use client";

import { Review, ReviewCategory } from "@/types/Review";
import { Room } from "@/types/Room";
import { User } from "@/types/User";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RoomReviews({ reviewData }: {
    reviewData: Review[]
}) {
    const [userData, setUserData] = useState<{[userid: number]: User}>({
        1: {
            id: 1,
            username: "memaybeo",
            name: "Your Mom",
            email: "yourmom@gmail.com",
            avatar: ""
        }
    })
    const [expanded, setExpanded] = useState<boolean>(false);
    const reviewJudgement = (score: number): {name: string, color: string} => {
        if (score > 0 && score < 2.0) return {name: "Bad", color: "#f44336"};
        if (score < 3.0) return {name: "Okay", color: "#ff6900"};
        if (score < 4.0) return {name: "Average", color: "#f0b100"};
        if (score < 5.0) return {name: "Good", color: "#00c950"};
        return {name: "Excellent", color: "#2b7fff"};
    }

    const getAverageScore = (categories: ReviewCategory[]): number => {
        return categories.map(i=>i.rating).reduce((agg, val) => agg + val)/categories.length;
    }
    const getTotalAverageScore = (reviewData: Review[]): number => {
        return reviewData.map(i=>getAverageScore(i.rating)).reduce((agg, val) => agg+val)/reviewData.length;
    }
    const getCategoryAverageScore = (reviewData: Review[], category: string): number => {
        return reviewData.map(i=>i.rating.filter(i=>i.category===category)[0].rating).reduce((agg, val) => agg+val)/reviewData.length;
    }
    const getRatingPercentage = (reviewData: Review[], rating: number): number => {
        return reviewData.filter(i=>Math.floor(getAverageScore(i.rating))===rating).length/reviewData.length*100
    }

    useEffect(() => {
        for (const review of reviewData) {
            console.log(getAverageScore(review.rating));
        }
    }, [])
    return (
        <div id="reviews" className="flex flex-col gap-y-[16px] scroll-mt-[63px]">
            <p className="text-[28px] font-semibold">Reviews</p>
            <div className="flex h-[40px] w-fit items-center gap-x-[6px]">
                <div className="bg-neutral-100 rounded-l-[15px] rounded-br-[10px] h-full w-[40px] flex justify-center items-center">
                    <p className="font-semibold text-[16px]" style={{color: reviewJudgement(getTotalAverageScore(reviewData)).color}}>{getTotalAverageScore(reviewData).toPrecision(2)}</p>
                </div>
                <p className="font-semibold text-[15px]" style={{color: reviewJudgement(getTotalAverageScore(reviewData)).color}}>{reviewJudgement(getTotalAverageScore(reviewData)).name}</p>
                <p className="font-semibold text-[15px] text-neutral-400">{`${reviewData.length} reviews`}</p>
            </div>
            
            
            <div className="grid grid-cols-6 grid-rows-1 justify-center items-center w-full h-[150px] px-[8px] py-[16px]">
                <div className="border-r border-r-neutral-200 w-full h-full flex flex-col gap-y-[4px]">
                    <p className="font-semibold text-[16px]">Overall Rating</p>
                    {
                        Array(5).fill(0).map((_, index) => (
                            <div key={index} className="flex h-[12px] items-center gap-x-[4px] w-2/3">
                                <p className="font-semibold text-[12px]" style={{color: reviewJudgement(index+1).color}}>{index+1}</p>
                                <div className="bg-neutral-200 h-1 w-full">
                                    <div className="h-full" style={{width: `${getRatingPercentage(reviewData, index+1)}%`, backgroundColor: reviewJudgement(index+1).color}}></div>
                                </div>
                            </div>
                        )).reverse()
                    }
                </div>
                {
                    reviewData[0].rating.map((obj, index) => (
                        <div key={index} className={`flex flex-col justify-center items-center w-full h-full ${index < reviewData[0].rating.length - 1 && "border-r border-r-neutral-200"}`}>
                            <div className="flex items-center justify-center px-[16px] py-[12px] gap-x-[8px]">
                                <img src={obj.icon} alt={obj.category} width={24} height={24}/>
                                <p className="font-semibold text-[16px]">{obj.category}</p>
                            </div>
                            <p className="font-semibold text-[16px]" style={{color: reviewJudgement(getCategoryAverageScore(reviewData, obj.category)).color}}>{getCategoryAverageScore(reviewData, obj.category).toPrecision(2)}</p>
                        </div>
                    ))
                }
            </div>

            <div className="w-full flex flex-col gap-y-[24px]">
                <div className="grid grid-cols-3 justify-between gap-x-[16px]">
                    {(expanded ? reviewData : reviewData.slice(0, 3)).map((obj, index) => (
                        <div key={index} className="flex flex-col border border-neutral-100 px-[16px] py-[8px] rounded-[16px]">
                            <div className="flex h-[53px] gap-x-[16px]">
                                <img src={userData[obj.userid].avatar ? userData[obj.userid].avatar : `https://ui-avatars.com/api/?name=${userData[obj.userid].name}&rounded=true&background=random`} alt={userData[obj.userid].name} width={48} height={48}/>
                                <div className="flex flex-col grow">
                                    <p className="font-semibold text-[16px]">{userData[obj.userid].name}</p>
                                    <p className="text-[16px]">{new Date(obj.created_at).toDateString()}</p>
                                </div>
                                <div className="bg-neutral-100 rounded-l-[15px] rounded-br-[10px] h-full w-[53px] flex justify-center items-center">
                                    <p className="font-semibold text-[16px]" style={{color: reviewJudgement(getAverageScore(obj.rating)).color}}>{getAverageScore(obj.rating).toPrecision(2)}</p>
                                </div>
                            </div>
                            <p className="text-[16px] line-clamp-3">{obj.description}</p>
                            <Link href={`./review/${obj.id}`} className="flex w-[108px] h-[32px] ml-auto mt-[8px] justify-center items-center text-neutral-400">Show More</Link>
                        </div>
                    ))}
                </div>
                <button className="flex w-fit font-bold h-[40px] justify-center items-center px-[8px] py-[16px] border-2 border-blue-500 rounded-[10px] text-blue-500 hover:bg-blue-500 hover:text-white " onClick={()=>setExpanded(!expanded)}>{expanded ? "Show less" : `Show all ${reviewData.length} reviews`}</button>
            </div>
        </div>
    )
}