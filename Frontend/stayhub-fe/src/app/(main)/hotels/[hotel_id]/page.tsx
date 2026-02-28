"use client";

import { useState } from 'react';
import RoomName from "@/components/rooms/RoomName";
import RoomNavbar from "@/components/rooms/RoomNavbar";
import RoomOverview from "@/components/rooms/content/RoomOverview";
import RoomReviews from "@/components/rooms/content/RoomReviews";
import HotelPolicies from "@/components/hotels/HotelPolicies";
import HotelDescription from "@/components/hotels/HotelDescription";
import HotelAmenities from "@/components/hotels/HotelAmenities";
import HotelRooms from "@/components/hotels/HotelRooms";
import SimilarHotels from "@/components/hotels/SimilarHotels";
import RoomReserve from "@/components/rooms/RoomReserve";
import { Hotel } from "@/types/Hotel";
import { Room } from "@/types/Room";
import { Review } from "@/types/Review";
import { useParams } from "next/navigation";

export default function HotelPage() {
    const { hotel_id } = useParams();

    const [hotelData, setHotelData] = useState<Hotel>({
        id: 1,
        name: "Skibidi Hotel",
        classification: 5,
        location: "Barcelona, Spain",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sagittis neque vitae turpis tempor, eget facilisis libero tempor. Phasellus nisl velit, porta quis metus eu, laoreet mattis nulla. Curabitur feugiat sapien sit amet ligula tincidunt, in feugiat sapien consequat. Quisque pharetra massa lacus, ut sollicitudin erat dictum at. Aenean ligula risus, pulvinar a eros sed, dictum semper ligula. Nunc porta aliquet mattis. Ut vitae hendrerit orci.",
        amenities: Array(10).fill(0).map((_, index) => {
            return {
                name: `Kitchen ${index}`,
                icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBkPSJNMjA4LDMySDQ4QTE2LDE2LDAsMCwwLDMyLDQ4VjIwOGExNiwxNiwwLDAsMCwxNiwxNkgyMDhhMTYsMTYsMCwwLDAsMTYtMTZWNDhBMTYsMTYsMCwwLDAsMjA4LDMyWm0wLDE3Nkg0OFY0OEgyMDhWMjA4Wk03Miw3NlExMiwxMiwwLDEsMSw4NCw4OCwxMiwxMiwwLDAsMSw3Miw3NlptNDQsMGExMiwxMiwwLDEsMSwxMiwxMkExMiwxMiwwLDAsMSwxMTYsNzZabTQ0LDBhMTIsMTIsMCwxLDEsMTIsMTJBMTIsMTIsMCwwLDEsMTYwLDc2Wm0yNCwyOEg3MmE4LDgsMCwwLDAtOCw4djcyYTgsOCwwLDAsMCw4LDhIMTg0YTgsOCwwLDAsMCw4LThWMTEyQTgsOCwwLDAsMCwxODQsMTA0Wm0tOCw3Mkg4MFYxMjBoOTZaIj48L3BhdGg+PC9zdmc+",
                category: "room_services"
            }
        }),
        policies: Array(10).fill(0).map((_, index) => {
            return {
                name: `No bobux ${index}`,
                icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHJvbGU9ImltZyIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBkPSJNMTguOTI2IDIzLjk5OCAwIDE4Ljg5MiA1LjA3NS4wMDIgMjQgNS4xMDhaTTE1LjM0OCAxMC4wOWwtNS4yODItMS40NTMtMS40MTQgNS4yNzMgNS4yODIgMS40NTN6Ij48L3BhdGg+PC9zdmc+",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sagittis neque vitae turpis tempor, eget facilisis libero tempor. Phasellus nisl velit, porta quis metus eu, laoreet mattis nulla. Curabitur feugiat sapien sit amet ligula tincidunt, in feugiat sapien consequat. Quisque pharetra massa lacus, ut sollicitudin erat dictum at. Aenean ligula risus, pulvinar a eros sed, dictum semper ligula. Nunc porta aliquet mattis. Ut vitae hendrerit orci."
            }
        }),
        previewimages: []
    });

    const [hotelRooms, setHotelRooms] = useState<Room[]>(
        Array(6).fill(0).map((_, index) => ({
            id: index,
            hotelid: 1,
            description: "",
            price: 69,
            size: 420,
            capacity: 2,
            type: "Superior Twin Room",
            discount: 0,
            previewimages: [],
            beds: [{ name: 'Single', count: 2 }],
            amenities: []
        }))
    );

    const [reviewData, setReviewData] = useState<Review[]>(
        Array(100).fill(0).map((_, index) => ({
            id: index,
            userid: 1,
            roomid: 1,
            created_at: Date.now(),
            rating: [],
            description: "",
            pros: "",
            cons: "",
            like_count: 0,
            response: ""
        }))
    );

    const [similarHotels, setSimilarHotels] = useState<Hotel[]>(
        Array(6).fill(0).map((_, index) => ({
            id: index,
            name: `Similar Hotel ${index}`,
            classification: 4,
            location: "Barcelona, Spain",
            description: "",
            amenities: [],
            policies: [],
            previewimages: []
        }))
    );

    return (
        <>
            <div className="px-[104px] flex flex-col w-full h-fit gap-y-[40px] mb-[100px] font-roboto">
                <RoomName name={hotelData.name} location={hotelData.location} />
                <RoomNavbar sections={["Overview", "Amenities", "Location", "Rooms", "Reviews", "Policies"]} />
                <RoomOverview />
                <div className="flex">
                    <div className="flex flex-col w-[1000px] h-fit gap-y-[40px]">
                        <HotelDescription hotelData={hotelData} />
                        <HotelAmenities hotelData={hotelData} />
                        <RoomLocation />
                        <HotelRooms rooms={hotelRooms} />
                    </div>
                    {/* keep same reservation sidebar component for layout */}
                    <RoomReserve />
                </div>
                <RoomReviews reviewData={reviewData} />
                <HotelPolicies hotelData={hotelData} />
            </div>
            <SimilarHotels location={hotelData.location} otherHotelData={similarHotels} />
        </>
    );
}
