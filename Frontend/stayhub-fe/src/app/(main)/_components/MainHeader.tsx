'use client';
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { BiSupport } from "react-icons/bi";
import { FcGlobe } from "react-icons/fc";

type Language = {
    abbr: string;
    name: string;
}

export default function MainHeader() {
    const [languages, setLanguages] = useState<Language[]>([
        {abbr: "en", name:"English"},
        {abbr: "vi", name:"Tiếng Việt"},
        {abbr: "jp", name:"日本語"}
    ])
    const {user, isAuthenticated, logout} = useAuth();

    return (
        <header className="w-screen h-[96px] flex justify-evenly">
            <div className="flex items-center justify-start grow pl-[30px]">
                <Image className="" src="/images/logo.png" alt="Stayhub logo" width={96} height={96} />
            </div>
            <div className="flex justify-end items-center grow pr-[30px] gap-[10px]">
                <div className="flex flex-col relative group">
                    <FcGlobe size={32}/>
                    <ul className="hidden group-hover:block absolute top-full -left-[25px] bg-gray-200 w-[100px]">
                        {languages.map(value => (
                            <li className="flex w-full h-[40px] hover:bg-gray-300 justify-center items-center" key={value.abbr}>{value.name}</li>
                        ))}
                    </ul>
                </div>

                <Link href={"/support"}>
                    <BiSupport size={32} className="text-blue-500"/>
                </Link>
                { isAuthenticated ? 
                <div className="w-[48px] h-1/2 flex flex-col relative group">
                    <Image unoptimized src={user?.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${user.firstname + user.lastname}&rounded=true&background=random`} alt={user?.name || "Avatar"} width={48} height={48}></Image>
                    <ul className="hidden group-hover:block absolute top-full -left-[25px] w-[100px] bg-gray-300">
                        <li>
                            <div onClick={()=> {logout().then(()=>window.location.reload())}} className="flex items-center w-full p-[10px] cursor-pointer hover:bg-gray-400">Log out</div>
                        </li>
                    </ul>
                </div>

                : <Link href={"/login"} className="rounded-full w-[102px] h-[48px] m-[8px]">
                    <button className="w-full h-full bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-700">
                        Login     
                    </button>
                </Link>
                }

            </div>
        </header>
    )
}