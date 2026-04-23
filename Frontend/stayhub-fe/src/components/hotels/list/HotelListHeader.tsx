"use client";

import { useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { MdKeyboardArrowDown } from "react-icons/md";
import { LuLayoutGrid, LuList } from "react-icons/lu";

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "distance", label: "Distance" },
  { value: "top_reviewed", label: "Top Reviewed" },
  { value: "highest_price", label: "Highest Price" },
  { value: "lowest_price", label: "Lowest Price" },
  { value: "star_rating", label: "Star Rating" },
];

type HotelListHeaderProps = {
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
};

export default function HotelListHeader({
  viewMode = "list",
  onViewModeChange,
}: HotelListHeaderProps) {
  const [selectedSort, setSelectedSort] = useState("top_reviewed");

  const optionRender: SelectProps["optionRender"] = (option) => {
    const selected = option.value === selectedSort;

    return (
      <div className="flex items-center justify-between py-1 text-[15px]">
        <span
          className={
            selected ? "font-semibold text-[#0051cb]" : "text-slate-700"
          }
        >
          {String(option.label)}
        </span>
        {selected ? <CheckOutlined className="text-[#0051cb]" /> : null}
      </div>
    );
  };

  const labelRender: SelectProps["labelRender"] = (option) => {
    return (
      <span className="text-[15px] font-semibold text-slate-600">
        Sort by: {String(option.label)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-[24px] leading-tight font-bold tracking-tight text-slate-950 md:text-[26px]">
            Explore 300+ Places in Barcelona
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Select
          value={selectedSort}
          onChange={setSelectedSort}
          options={sortOptions}
          optionRender={optionRender}
          labelRender={labelRender}
          popupMatchSelectWidth={280}
          virtual={false}
          className="w-full max-w-[280px]"
          styles={{
            popup: { root: { borderRadius: 20, padding: 10 } },
          }}
          suffixIcon={
            <MdKeyboardArrowDown size={18} className="text-slate-500" />
          }
        />

        <div className="flex items-center self-start rounded-full border border-slate-300 bg-white p-1 shadow-sm gap-x-1">
          <button
            onClick={() => onViewModeChange?.("list")}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              viewMode === "list"
                ? "border border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <LuList size={18} />
          </button>
          <button
            onClick={() => onViewModeChange?.("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              viewMode === "grid"
                ? "border border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <LuLayoutGrid size={18} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .ant-select-selector {
          min-height: 46px !important;
          border-radius: 16px !important;
          border-color: rgb(203 213 225) !important;
          box-shadow: none !important;
          padding: 0 16px !important;
        }

        .ant-select-selection-item {
          font-size: 15px !important;
          font-weight: 600 !important;
          color: rgb(71 85 105) !important;
          line-height: 44px !important;
        }

        .ant-select-dropdown {
          border-radius: 20px !important;
          padding: 10px !important;
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.12) !important;
        }

        .ant-select-item-option-content {
          overflow: visible !important;
          white-space: normal !important;
        }

        .ant-select-dropdown .rc-virtual-list,
        .ant-select-dropdown .rc-virtual-list-holder {
          max-height: none !important;
          overflow: hidden !important;
        }

        .ant-select-item {
          min-height: 44px !important;
          border-radius: 12px !important;
          padding: 10px 12px !important;
        }

        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background: white !important;
        }

        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: rgb(248 250 252) !important;
        }
      `}</style>
    </div>
  );
}
