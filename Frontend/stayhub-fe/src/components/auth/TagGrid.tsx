import React from "react";

import { BsFlower2, BsStars } from "react-icons/bs";
import { TbBeach } from "react-icons/tb";
import { MdOutlineRestaurant } from "react-icons/md";

const TagGrid = () => {
  const features = [
    {
      icon: <TbBeach size={28} />,
      title: "Beach",
    },
    {
      icon: <MdOutlineRestaurant size={28} />,
      title: "Food",
    },
    {
      icon: <BsStars size={28} />,
      title: "Night Life",
    },
    {
      icon: <BsFlower2 size={28} />,
      title: "Massage",
    },
  ];

  return (
    <div className=" grid grid-cols-2 gap-4 w-full max-w-fit mt-10 mx-15">
      {features.map((item, index) => (
        <div
          key={index}
          className="w-45 px-4 py-3 bg-white/30 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center rounded-2xl text-white shadow-lg gap-2
                hover:bg-white/20 transition-all duration-300"
        >
          <div className="text-white drop-shadow-md">{item.icon}</div>
          <span className="text-sm font-semibold tracking-wide drop-shadow-sm">
            {item.title}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TagGrid;
