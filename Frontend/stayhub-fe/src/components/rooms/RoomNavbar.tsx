import { useLayoutEffect, useRef, useState } from "react";

export default function RoomNavbar({ sections }: {
    sections: string[]
}) {
    const toggleVisible = (name: string) => {
        setVisible(name);
    }
    const [visible, setVisible] = useState<string>(sections[0].toLowerCase())
    return (
        <nav className="gap-[24px] sticky top-0 bg-white z-50 flex font-normal text-[20px] h-[59px] w-full border-b border-b-gray-300">
        {
            sections.map((item, index) => (
                <a key={index} onClick={()=> toggleVisible(item.toLowerCase())} href={`#${item.toLowerCase()}`} className={`flex h-full items-center ${visible===item.toLowerCase() ? "border-b-2 text-blue-500 border-b-blue-500" : "text-neutral-500 hover:text-neutral-600 hover:border-b-2 hover:border-b-neutral-600"}`}>
                    {item}
                </a>
            ))
        }  
        </nav>
    )
}