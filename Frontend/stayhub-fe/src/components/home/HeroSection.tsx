import React from "react";

const HeroSection = () => {
  return (
    <section className="relative w-full h-[512px] rounded-b-[22px] overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-[url('/images/banner-header.jpg')] bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"></div>
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 pb-20 top-11.25 ">
        <h1 className="text-[40px] font-bold mb-3 tracking-tight ">
          Your Trip Starts Here
        </h1>
        <p className="text-[28px] font-semibold">
          Find unique stays across hotels, villas, and more.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
