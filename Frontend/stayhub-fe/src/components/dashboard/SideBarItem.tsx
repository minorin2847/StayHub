import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";

interface SideBarItemProps {
  label: string;
  icon: React.ElementType;
  isSidebarExpanded: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const SideBarItem = ({
  label,
  icon: Icon,
  isSidebarExpanded,
  children,
  onClick,
  isActive = false,
}: SideBarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!children) {
    return (
      <li className="list-none w-full">
        <button
          onClick={onClick}
          className={`flex items-center w-full p-3 rounded-xl transition-all group ${
            isActive
              ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
              : "hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
          } ${!isSidebarExpanded ? "justify-center" : ""}`}
        >
          <Icon size={22} className="shrink-0" />
          {isSidebarExpanded && (
            <span className="ml-4 text-sm font-semibold whitespace-nowrap">
              {label}
            </span>
          )}
        </button>
      </li>
    );
  }

  return (
    <li className="list-none w-full">
      <button
        type="button"
        className={`flex items-center w-full p-3 rounded-xl transition-all group ${
          isActive
            ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
            : "hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
        } ${!isSidebarExpanded ? "justify-center" : ""}`}
        onClick={() => {
          if (isSidebarExpanded) {
            setIsOpen(!isOpen);
          } else {
            if (onClick) onClick();
          }
        }}
      >
        <Icon size={22} className="shrink-0" />
        {isSidebarExpanded && (
          <>
            <span className="ml-4 text-sm font-semibold whitespace-nowrap flex-1 text-left">
              {label}
            </span>
            <div
              className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-500"}`}
            >
              {isOpen ? (
                <IoIosArrowDown size={18} />
              ) : (
                <IoIosArrowForward size={18} />
              )}
            </div>
          </>
        )}
      </button>
      {isOpen && isSidebarExpanded && (
        <ul className="pl-11 pr-3 mt-1 space-y-1">{children}</ul>
      )}
    </li>
  );
};

export default SideBarItem;
