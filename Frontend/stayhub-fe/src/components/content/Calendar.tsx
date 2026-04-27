"use client";

import React, { useState } from "react";
import { Calendar, ConfigProvider, Button } from "antd";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

dayjs.extend(isBetween);

interface RoomCalendarProps {
  fromDate?: Date;
  toDate?: Date;
  onChange?: (start: Date | null, end: Date | null) => void;
}

export default function RoomCalendar({ fromDate, toDate, onChange }: RoomCalendarProps) {
  const [baseMonth, setBaseMonth] = useState(dayjs().startOf("month"));
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  };

  const handleDateClick = (date: Dayjs) => {
    if (disabledDate(date)) return;

    if (!start || (start && end)) {
      setStart(date);
      setEnd(null);
      if (onChange) onChange(date.toDate(), null);
    } else {
      if (date.isBefore(start)) {
        setStart(date);
        setEnd(null);
        if (onChange) onChange(date.toDate(), null);
      } else {
        setEnd(date);
        if (onChange) onChange(start.toDate(), date.toDate());
      }
    }
  };

  const cellRender = (current: Dayjs) => {
    const isStart = start && current.isSame(start, "day");
    const isEnd = end && current.isSame(end, "day");
    const inRange = start && end && current.isBetween(start, end, "day", "[]");
    const isDisabled = disabledDate(current);

    return (
      <div 
        className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${
          isDisabled ? "cursor-not-allowed" : "cursor-pointer active:scale-95"
        }`}
        onClick={() => handleDateClick(current)}
      >
        <div 
          className={`w-full h-[38px] flex items-center justify-center text-[15px] transition-all duration-500 ease-out ${
            isStart ? "bg-blue-600 text-white rounded-full shadow-md z-10 scale-110" : 
            isEnd ? "bg-blue-600 text-white rounded-full shadow-md z-10 scale-110" : 
            inRange ? "bg-blue-50 text-blue-600" : "text-slate-700"
          }`}
        >
          {current.date()}
        </div>
      </div>
    );
  };

  const navNext = () => setBaseMonth(baseMonth.add(1, "month"));
  const navPrev = () => {
    if (baseMonth.isAfter(dayjs(), "month")) setBaseMonth(baseMonth.subtract(1, "month"));
  };

  const MonthDisplay = ({ value, showLeftNav, showRightNav }: { value: Dayjs, showLeftNav?: boolean, showRightNav?: boolean }) => (
    <div className="w-full">
      <div className="flex items-center justify-between px-2 mb-4">
        {showLeftNav ? (
          <Button type="text" shape="circle" icon={<MdChevronLeft size={24} />} onClick={navPrev} />
        ) : <div className="w-8" />}
        <span className="font-bold text-[18px] text-slate-800">{value.format("MMMM YYYY")}</span>
        {showRightNav ? (
          <Button type="text" shape="circle" icon={<MdChevronRight size={24} />} onClick={navNext} />
        ) : <div className="w-8" />}
      </div>
      <Calendar
        fullscreen={false}
        value={value}
        headerRender={() => null}
        fullCellRender={cellRender}
        disabledDate={disabledDate}
      />
    </div>
  );

  return (
    <div id="calendar" className="flex flex-col gap-6 scroll-mt-[100px]">
      <p className="text-[28px] font-semibold text-slate-900">Calendar</p>
      
      <div className="w-full border border-gray-200 rounded-[32px] p-6 bg-white shadow-sm overflow-hidden">
        <ConfigProvider theme={{ token: { colorPrimary: "#2563eb" } }}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0 items-stretch">
            <div className="pr-8">
              <MonthDisplay value={baseMonth} showLeftNav />
            </div>
            
            <div className="hidden md:block w-[1px] bg-gray-100 self-stretch my-2" />
            
            <div className="pl-8">
              <MonthDisplay value={baseMonth.add(1, "month")} showRightNav />
            </div>
          </div>
        </ConfigProvider>
      </div>

      <style jsx global>{`
        .ant-picker-calendar .ant-picker-cell-disabled {
          background-color: #f8fafc !important;
          opacity: 0.5;
        }
        .ant-picker-calendar { 
          background: transparent !important; 
          width: 100% !important; 
        }
        .ant-picker-panel, .ant-picker-content { 
          width: 100% !important; 
        }
        .ant-picker-content th { 
          color: #94a3b8 !important; 
          font-weight: 600 !important;
          font-size: 13px !important;
          padding-bottom: 12px !important; 
        }
        .ant-picker-cell:before { display: none !important; }
        /* Lowered height for more compact look */
        .ant-picker-cell { 
          padding: 0 !important; 
          height: 42px !important; 
        }
        .ant-picker-body { padding: 0 !important; }
      `}</style>
    </div>
  );
}