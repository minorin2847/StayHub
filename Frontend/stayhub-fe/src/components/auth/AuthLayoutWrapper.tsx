
import React, { ReactNode } from "react";
import Image from "next/image";
import TagGrid from "./TagGrid";

interface AuthLayoutWrapper {
  children: ReactNode;
  label: ReactNode;
  imageSrc?: string;        
  brandName?: string;       
  subBrand?: string;        
  showTagGrid?: boolean;
}
const AuthLayoutWrapper = ({
  children,
  label,
  imageSrc = "/images/auth-image.png",
  brandName = "Hotel Transylvania",
  subBrand = "Vietnam",
}: AuthLayoutWrapper) => {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-stone-400 to-stone-500 flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex w-1/2 relative ">
          <Image
            src={imageSrc}
            alt="auth-bg"
            width={500}
            height={500}
            className="w-full h-full object-cover opacity-70 brightness-70"
            priority
          />

          <div className="absolute p-10 flex flex-col justify-start text-white drop-shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl shadow-md overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold ">{brandName} </h2>
                <p className="text-sm  mt-1">{subBrand}</p>
              </div>
            </div>

            <h1 className="text-3xl font-bold mt-6 leading-tight ">
              Chào mừng đến với <br /> {label}
            </h1>
            <TagGrid />
          </div>
        </div>

        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayoutWrapper;
