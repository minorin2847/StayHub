'use client';
import {useState} from 'react';

export default function HotelNavBar({sections} : {
    sections: string[]; 
}) {
    const [activeTab, setActiveTab] = useState<string>("Overview"); 
    return(
        <div className="w-full mx-auto px-4 py-4 text-gray-900 font-san">
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-8 items-left"> 
                    {sections.map((tab) => {
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm hover:border-blue-400 border-b ${(activeTab == tab ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-05 after:bg-blue-600" : "text-gray-500 hover:text-gray-700 mask-b-to-blue-200-")}`}
                                >
                                {tab}
                            </button>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}