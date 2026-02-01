import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { useState } from "react";
import { DateRange } from "react-day-picker";


export default function RoomCalendar() {
    const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
        from: new Date(Date.now()),
        to: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    })

    return (
    <div id="calendar" className="flex flex-col gap-[24px] border scroll-mt-[63px]">
        <p className="text-[28px] font-semibold">Calendar</p>
        <div className="w-full h-[421px] border border-red-500">
            {/* <Calendar 
            mode="range"
            defaultMonth={new Date()}
            selected={selectedDate}
            onSelect={setSelectedDate}
            numberOfMonths={2}
            classNames={{
                root: "w-full h-full justify-evenly flex",
                month: "flex flex-col w-full border-blue-500 border",
                day: "w-[48px] gap-[1px]",
            }}
            /> */}
        </div>
    </div>
    )
}