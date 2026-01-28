"use client";

import RoomDescription from "@/components/rooms/content/RoomDescription";
import RoomName from "@/components/rooms/RoomName";
import RoomNavbar from "@/components/rooms/RoomNavbar";
import RoomOverview from "@/components/rooms/content/RoomOverview";
import { Hotel } from "@/types/Hotel";
import { Room } from "@/types/Room";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { IoHeartOutline, IoShareSocialOutline } from "react-icons/io5";
import RoomAmenities from "@/components/rooms/content/RoomAmenities";
import RoomLocation from "@/components/rooms/content/RoomLocation";
import RoomCalendar from "@/components/rooms/content/RoomCalendar";
import RoomReserve from "@/components/rooms/RoomReserve";

export default function RoomPage() {
    const { hotel_id, room_id } = useParams();
    const [roomData, setRoomData] = useState<Room>({
        id: 1,
        hotelid: 1,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sagittis neque vitae turpis tempor, eget facilisis libero tempor. Phasellus nisl velit, porta quis metus eu, laoreet mattis nulla. Curabitur feugiat sapien sit amet ligula tincidunt, in feugiat sapien consequat. Quisque pharetra massa lacus, ut sollicitudin erat dictum at. Aenean ligula risus, pulvinar a eros sed, dictum semper ligula. Nunc porta aliquet mattis. Ut vitae hendrerit orci.",
        price: 69,
        size: 420,
        capacity: 2,
        type: "Superior Twin Room",
        discount: 0,
        previewimages: [],
        beds: [{
            name: 'Single',
            count: 2
        }],
        amenities: Array(10).fill(0).map((_, index) => {
            return {
                name: `Kitchen ${index}`,
                icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBkPSJNMjA4LDMySDQ4QTE2LDE2LDAsMCwwLDMyLDQ4VjIwOGExNiwxNiwwLDAsMCwxNiwxNkgyMDhhMTYsMTYsMCwwLDAsMTYtMTZWNDhBMTYsMTYsMCwwLDAsMjA4LDMyWm0wLDE3Nkg0OFY0OEgyMDhWMjA4Wk03Miw3NkExMiwxMiwwLDEsMSw4NCw4OCwxMiwxMiwwLDAsMSw3Miw3NlptNDQsMGExMiwxMiwwLDEsMSwxMiwxMkExMiwxMiwwLDAsMSwxMTYsNzZabTQ0LDBhMTIsMTIsMCwxLDEsMTIsMTJBMTIsMTIsMCwwLDEsMTYwLDc2Wm0yNCwyOEg3MmE4LDgsMCwwLDAtOCw4djcyYTgsOCwwLDAsMCw4LDhIMTg0YTgsOCwwLDAsMCw4LThWMTEyQTgsOCwwLDAsMCwxODQsMTA0Wm0tOCw3Mkg4MFYxMjBoOTZaIj48L3BhdGg+PC9zdmc+",
                category: "room_services"
            }
        })
    })
    const [hotelData, setHotelData] = useState<Hotel>({
        id: 1,
        name: "Skibidi Hotel",
        classification: 5,
        location: "Barcelona, Spain",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sagittis neque vitae turpis tempor, eget facilisis libero tempor. Phasellus nisl velit, porta quis metus eu, laoreet mattis nulla. Curabitur feugiat sapien sit amet ligula tincidunt, in feugiat sapien consequat. Quisque pharetra massa lacus, ut sollicitudin erat dictum at. Aenean ligula risus, pulvinar a eros sed, dictum semper ligula. Nunc porta aliquet mattis. Ut vitae hendrerit orci.",
        amenities: Array(10).fill(0).map((_, index) => {
            return {
                name: `Kitchen ${index}`,
                icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBkPSJNMjA4LDMySDQ4QTE2LDE2LDAsMCwwLDMyLDQ4VjIwOGExNiwxNiwwLDAsMCwxNiwxNkgyMDhhMTYsMTYsMCwwLDAsMTYtMTZWNDhBMTYsMTYsMCwwLDAsMjA4LDMyWm0wLDE3Nkg0OFY0OEgyMDhWMjA4Wk03Miw3NkExMiwxMiwwLDEsMSw4NCw4OCwxMiwxMiwwLDAsMSw3Miw3NlptNDQsMGExMiwxMiwwLDEsMSwxMiwxMkExMiwxMiwwLDAsMSwxMTYsNzZabTQ0LDBhMTIsMTIsMCwxLDEsMTIsMTJBMTIsMTIsMCwwLDEsMTYwLDc2Wm0yNCwyOEg3MmE4LDgsMCwwLDAtOCw4djcyYTgsOCwwLDAsMCw4LDhIMTg0YTgsOCwwLDAsMCw4LThWMTEyQTgsOCwwLDAsMCwxODQsMTA0Wm0tOCw3Mkg4MFYxMjBoOTZaIj48L3BhdGg+PC9zdmc+",
                category: "room_services"
            }
        }),
        policies: Array(10).fill(0).map((_, index) => {
            return {
                name: `No bobux ${index}`,
                icon: "data:image/svg+xml;base64,PHN2ZyB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB4bWw6c3BhY2U9InByZXNlcnZlIiB2aWV3Qm94PSIwIDAgMTUgMTYuMzUiIGhlaWdodD0iMTYuMzUiIHdpZHRoPSIxNSIgeT0iMHB4IiB4PSIwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiPjxtZXRhZGF0YSBpZD0ibWV0YWRhdGEyNCI+PHJkZjpSREY+PGNjOldvcmsgcmRmOmFib3V0PSIiPjxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz48ZGM6dGl0bGUvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZGVmcyBpZD0iZGVmczIyIi8+CjxzdHlsZSBpZD0ic3R5bGUyIiB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6dXJsKCNTVkdJRF8xXyk7fQoJLnN0MXtmaWxsOiM2MDYxNjI7fQoJLnN0MntmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtmaWxsOiMzOTNCM0Q7fQoJLnN0M3tmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8bGluZWFyR3JhZGllbnQgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxNCwwLDAsMTUuMjcyNSw5ODU1LC02MzEuMjcxMykiIHkyPSI0Mi40ODY1OTkiIHgyPSItNzAzLjIxNDE3IiB5MT0iNDEuNTI1MTAxIiB4MT0iLTcwMy4yMTQxNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJTVkdJRF8xXyI+Cgk8c3RvcCBpZD0ic3RvcDQiIHN0eWxlPSJzdG9wLWNvbG9yOiNDN0I1NkYiIG9mZnNldD0iMCIvPgoJPHN0b3AgaWQ9InN0b3A2IiBzdHlsZT0ic3RvcC1jb2xvcjojQTU4RDUxIiBvZmZzZXQ9IjAuNTg4NSIvPgoJPHN0b3AgaWQ9InN0b3A4IiBzdHlsZT0ic3RvcC1jb2xvcjojRDZCODcxIiBvZmZzZXQ9IjEiLz4KPC9saW5lYXJHcmFkaWVudD4KCgo8cGF0aCBzdHlsZT0iY2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojMzkzYjNkO2ZpbGwtcnVsZTpldmVub2RkIiBpZD0icGF0aDE1IiBkPSJtIDEzLjEsMy4yNzUgYyAwLjksMC41IDEuNCwxLjUgMS40LDIuNSB2IDQuOCBjIDAsMSAtMC41LDIgLTEuNCwyLjUgbCAtNC4xLDIuNCBjIC0wLjksMC41IC0yLDAuNSAtMi45LDAgTCAyLDEzLjA3NSBjIC0xLC0wLjUgLTEuNSwtMS41IC0xLjUsLTIuNSB2IC00LjggYyAwLC0xIDAuNiwtMiAxLjQsLTIuNSBMIDYsMC44NzUgYyAwLjksLTAuNSAyLC0wLjUgMi45LDAgeiBtIC02LjYsLTEuNSAtNCwyLjQgYyAtMC42LDAuMyAtMSwxIC0xLDEuNiB2IDQuNyBjIDAsMC43IDAuNCwxLjQgMSwxLjcgbCA0LDIuNCBjIDAuNiwwLjMgMS4zLDAuMyAxLjksMCBsIDQuMSwtMi40IGMgMC42LC0wLjMgMSwtMSAxLC0xLjcgdiAtNC43IGMgMCwtMC42IC0wLjQsLTEuMyAtMSwtMS42IGwgLTQsLTIuNCBjIC0wLjYsLTAuMyAtMS40LC0wLjMgLTIsMCB6IG0gMiwxLjIgMywxLjcgYyAwLjYsMC40IDEsMS4xIDEsMS44IHYgMy4zIGMgMCwwLjggLTAuNCwxLjQgLTEsMS44IGwgLTMsMS44IGMgLTAuNiwwLjQgLTEuNCwwLjQgLTIuMSwwIGwgLTIuOSwtMS43IGMgLTAuNiwtMC40IC0xLC0xLjEgLTEsLTEuOCB2IC0zLjQgYyAwLC0wLjcgMC40LC0xLjQgMSwtMS44IGwgMywtMS43IGMgMC42LC0wLjMgMS40LC0wLjMgMiwwIHogbSAtMyw3LjIgaCA0IHYgLTQgaCAtNCB6IiBjbGFzcz0ic3QyIi8+CgoKPC9zdmc+",
                description: "No bobux"
            }
        }),
        previewimages: []
    })
return (
    <div className="px-[104px] flex flex-col w-full h-[3000px] gap-y-[40px] font-roboto">
        <RoomName name={roomData.type+roomData.id} location={hotelData.location} />
        <RoomNavbar sections={["Overview", "Amenities", "Location", "Calendar", "Reviews", "Policies"]}/>
        <RoomOverview />
        <div className="flex">
            <div className="flex flex-col w-[1000px] h-fit gap-y-[40px]">
                <RoomDescription roomData={roomData} />
                
                {/* Amenities */}
                <RoomAmenities roomData={roomData} />

                {/* Location */}
                <RoomLocation />

                {/* Calendar */}
                <RoomCalendar />
            </div>

            <RoomReserve />
        </div>

    </div>
);
}