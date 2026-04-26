"use client";

import { RoomView, ReviewCategory } from "@/types/Review";
import { User } from "@/types/User";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Empty } from "antd"; // Using Ant Design for the empty state icon

export default function RoomReviews({ reviewData = [] }: {
    reviewData: RoomView[]
}) {
    const [userData, setUserData] = useState<{ [userid: number]: User }>({
        1: {
            id: 1,
            username: "memaybeo",
            name: "Your Mom",
            email: "yourmom@gmail.com",
            avatar: ""
        }
    });
    const [expanded, setExpanded] = useState<boolean>(false);

    const hasReviews = reviewData && reviewData.length > 0;

    const reviewJudgement = (score: number): { name: string, color: string } => {
        if (score <= 0) return { name: "No Ratings", color: "#94a3b8" };
        if (score < 2.0) return { name: "Bad", color: "#f44336" };
        if (score < 3.0) return { name: "Okay", color: "#ff6900" };
        if (score < 4.0) return { name: "Average", color: "#f0b100" };
        if (score < 5.0) return { name: "Good", color: "#00c950" };
        return { name: "Excellent", color: "#2b7fff" };
    }

    const getAverageScore = (categories: ReviewCategory[]): number => {
        if (!categories || categories.length === 0) return 0;
        return categories.map(i => i.rating).reduce((agg, val) => agg + val, 0) / categories.length;
    }

    const getTotalAverageScore = (data: Review[]): number => {
        if (!data || data.length === 0) return 0;
        return data.map(i => getAverageScore(i.rating)).reduce((agg, val) => agg + val, 0) / data.length;
    }

    const getCategoryAverageScore = (data: Review[], category: string): number => {
        if (!data || data.length === 0) return 0;
        const scores = data.map(i => i.rating.find(r => r.category === category)?.rating || 0);
        return scores.reduce((agg, val) => agg + val, 0) / data.length;
    }

    const getRatingPercentage = (data: Review[], rating: number): number => {
        if (!data || data.length === 0) return 0;
        return (data.filter(i => Math.floor(getAverageScore(i.rating)) === rating).length / data.length) * 100;
    }

    const avgScore = getTotalAverageScore(reviewData);

    return (
        <div id="reviews" className="flex flex-col gap-y-[24px] scroll-mt-[100px]">
            <p className="text-[28px] font-semibold">Reviews</p>
            
            {/* Summary Header */}
            <div className="flex h-[40px] w-fit items-center gap-x-[12px]">
                <div className="bg-neutral-100 rounded-l-[15px] rounded-br-[10px] h-full w-[48px] flex justify-center items-center">
                    <p className="font-bold text-[18px]" style={{ color: reviewJudgement(avgScore).color }}>
                        {avgScore > 0 ? avgScore.toFixed(1) : "0.0"}
                    </p>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="font-bold text-[15px] leading-none mb-1" style={{ color: reviewJudgement(avgScore).color }}>
                        {reviewJudgement(avgScore).name}
                    </p>
                    <p className="text-[13px] font-medium text-neutral-400">
                        {hasReviews ? `${reviewData.length} reviews` : "No reviews yet"}
                    </p>
                </div>
            </div>

            {hasReviews ? (
                /* --- RENDER REVIEWS IF DATA EXISTS --- */
                <>
                    <div className="grid grid-cols-6 justify-center items-center w-full h-fit border border-neutral-100 rounded-[20px] px-[16px] py-[24px] bg-white">
                        <div className="border-r border-r-neutral-200 w-full h-full flex flex-col gap-y-[6px] pr-4">
                            <p className="font-semibold text-[14px] text-slate-500 uppercase tracking-wider mb-2">Overall</p>
                            {Array(5).fill(0).map((_, index) => (
                                <div key={index} className="flex h-[12px] items-center gap-x-[8px] w-full">
                                    <p className="font-bold text-[11px] w-2" style={{ color: reviewJudgement(index + 1).color }}>{index + 1}</p>
                                    <div className="bg-neutral-100 h-1.5 w-full rounded-full overflow-hidden">
                                        <div className="h-full transition-all duration-500" style={{ width: `${getRatingPercentage(reviewData, index + 1)}%`, backgroundColor: reviewJudgement(index + 1).color }}></div>
                                    </div>
                                </div>
                            )).reverse()}
                        </div>
                        {reviewData[0].rating.map((obj, index) => (
                            <div key={index} className={`flex flex-col justify-center items-center w-full h-full ${index < reviewData[0].rating.length - 1 && "border-r border-r-neutral-200"}`}>
                                <div className="flex flex-col items-center justify-center gap-y-2">
                                    <div className="p-2 bg-slate-50 rounded-full">
                                        <img src={obj.icon} alt={obj.category} width={20} height={20} className="opacity-70" />
                                    </div>
                                    <p className="font-semibold text-[14px] text-slate-700">{obj.category}</p>
                                    <p className="font-bold text-[16px]" style={{ color: reviewJudgement(getCategoryAverageScore(reviewData, obj.category)).color }}>
                                        {getCategoryAverageScore(reviewData, obj.category).toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full flex flex-col gap-y-[24px]">
                        <div className="grid grid-cols-1 md:grid-cols-3 justify-between gap-[20px]">
                            {(expanded ? reviewData : reviewData.slice(0, 3)).map((obj, index) => (
                                <div key={index} className="flex flex-col border border-neutral-100 p-5 rounded-[24px] bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex h-[53px] gap-x-[16px] mb-4">
                                        <img 
                                            src={userData[obj.userid]?.avatar || `https://ui-avatars.com/api/?name=${userData[obj.userid]?.name || 'User'}&rounded=true&background=random`} 
                                            alt="avatar" width={48} height={48}
                                        />
                                        <div className="flex flex-col grow justify-center">
                                            <p className="font-bold text-[16px] text-slate-800">{userData[obj.userid]?.name || "Verified Guest"}</p>
                                            <p className="text-[14px] text-slate-400">{new Date(obj.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-neutral-100 rounded-l-[12px] rounded-br-[8px] h-[40px] w-[40px] flex justify-center items-center shrink-0">
                                            <p className="font-bold text-[15px]" style={{ color: reviewJudgement(getAverageScore(obj.rating)).color }}>
                                                {getAverageScore(obj.rating).toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[15px] text-slate-600 line-clamp-3 leading-relaxed mb-4">{obj.description}</p>
                                    <Link href={`./review/${obj.id}`} className="mt-auto text-[14px] font-bold text-blue-500 hover:text-blue-700">Read full review</Link>
                                </div>
                            ))}
                        </div>
                        {reviewData.length > 3 && (
                            <button 
                                className="flex w-fit font-bold h-[48px] justify-center items-center px-8 border-2 border-blue-500 rounded-[15px] text-blue-500 hover:bg-blue-500 hover:text-white transition-all" 
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? "Show less" : `Show all ${reviewData.length} reviews`}
                            </button>
                        )}
                    </div>
                </>
            ) : (
                /* --- PLACEHOLDER BOX WHEN NO REVIEWS EXIST --- */
                <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-[32px] py-16 bg-neutral-50/50">
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="flex flex-col gap-y-2 items-center">
                                <p className="text-[20px] font-bold text-slate-400">No reviews available for this room</p>
                                <p className="text-slate-400 text-[14px]">Be the first to share your experience after your stay!</p>
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );
}