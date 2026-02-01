import { Room } from "@/types/Room";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { useState } from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoBedOutline, IoPersonOutline, IoResizeOutline } from "react-icons/io5";
import { Review, ReviewCategory } from "@/types/Review";

export default function OtherRoom({ hotelName, otherRoomData }: {
    hotelName: string
    otherRoomData: Room[]
}) {
    const [reviewData, setReviewData] = useState<Review[][]>(Array(6).fill(0).map((_, roomIndex) => {
        return Array(100).fill(0).map((_, reviewIndex) => {
        return {
            id: reviewIndex,
            userid: 1,
            roomid: roomIndex,
            created_at: Date.now(),
            rating: [
                {
                    category: "Amenities",
                    icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAxNiAxNiIgaGVpZ2h0PSIyMDBweCIgd2lkdGg9IjIwMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZTogY3VycmVudENvbG9yOyIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1zdHJva2U9IiI+PHBhdGggZD0iTTggNi45ODJDOS42NjQgNS4zMDkgMTMuODI1IDguMjM2IDggMTIgMi4xNzUgOC4yMzYgNi4zMzYgNS4zMDkgOCA2Ljk4MiI+PC9wYXRoPjxwYXRoIGQ9Ik04LjcwNyAxLjVhMSAxIDAgMCAwLTEuNDE0IDBMLjY0NiA4LjE0NmEuNS41IDAgMCAwIC43MDguNzA3TDIgOC4yMDdWMTMuNUExLjUgMS41IDAgMCAwIDMuNSAxNWg5YTEuNSAxLjUgMCAwIDAgMS41LTEuNVY4LjIwN2wuNjQ2LjY0NmEuNS41IDAgMCAwIC43MDgtLjcwN0wxMyA1Ljc5M1YyLjVhLjUuNSAwIDAgMC0uNS0uNWgtMWEuNS41IDAgMCAwLS41LjV2MS4yOTN6TTEzIDcuMjA3VjEzLjVhLjUuNSAwIDAgMS0uNS41aC05YS41LjUgMCAwIDEtLjUtLjVWNy4yMDdsNS01eiI+PC9wYXRoPjwvc3ZnPg==",
                    rating: Math.floor(Math.random()*5)+1
                },
                                {
                    category: "Cleanliness",
                    icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBkPSJNMjAwLDgwYTgsOCwwLDAsMCw4LTgsNTYuMDYsNTYuMDYsMCwwLDAtNTYtNTZIODBBMTYsMTYsMCwwLDAsNjQsMzJWODBhMjQsMjQsMCwwLDEtMjQsMjQsOCw4LDAsMCwwLDAsMTZBNDAsNDAsMCwwLDAsODAsODBoMzJ2MjQuNjJhMjMuODcsMjMuODcsMCwwLDEtOSwxOC43NEw4NywxMzYuMTVhMzkuNzksMzkuNzksMCwwLDAtMTUsMzEuMjNWMjI0YTE2LDE2LDAsMCwwLDE2LDE2SDE5MmExNiwxNiwwLDAsMCwxNi0xNlYyMTEuNDdBMjcwLjg4LDI3MC44OCwwLDAsMCwxNzQsODBaTTgwLDMyaDcyYTQwLjA4LDQwLjA4LDAsMCwxLDM5LjIsMzJIODBaTTE5MiwyMTEuNDdWMjI0SDg4VjE2Ny4zOGEyMy44NywyMy44NywwLDAsMSw5LTE4Ljc0bDE2LTEyLjc5YTM5Ljc5LDM5Ljc5LDAsMCwwLDE1LTMxLjIzVjgwaDI3LjUyQTI1NC44NiwyNTQuODYsMCwwLDEsMTkyLDIxMS40N1oiPjwvcGF0aD48L3N2Zz4=",
                    rating: Math.floor(Math.random()*5)+1
                },
                                {
                    category: "Communication",
                    icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzMiIgZD0iTTQzMSAzMjAuNmMtMS0zLjYgMS4yLTguNiAzLjMtMTIuMmEzMy42OCAzMy42OCAwIDAgMSAyLjEtMy4xQTE2MiAxNjIgMCAwIDAgNDY0IDIxNWMuMy05Mi4yLTc3LjUtMTY3LTE3My43LTE2Ny04My45IDAtMTUzLjkgNTcuMS0xNzAuMyAxMzIuOWExNjAuNyAxNjAuNyAwIDAgMC0zLjcgMzQuMmMwIDkyLjMgNzQuOCAxNjkuMSAxNzEgMTY5LjEgMTUuMyAwIDM1LjktNC42IDQ3LjItNy43czIyLjUtNy4yIDI1LjQtOC4zYTI2LjQ0IDI2LjQ0IDAgMCAxIDkuMy0xLjcgMjYgMjYgMCAwIDEgMTAuMSAybDU2LjcgMjAuMWExMy41MiAxMy41MiAwIDAgMCAzLjkgMSA4IDggMCAwIDAgOC04IDEyLjg1IDEyLjg1IDAgMCAwLS41LTIuN3oiPjwvcGF0aD48cGF0aCBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzMiIgZD0iTTY2LjQ2IDIzMmExNDYuMjMgMTQ2LjIzIDAgMCAwIDYuMzkgMTUyLjY3YzIuMzEgMy40OSAzLjYxIDYuMTkgMy4yMSA4cy0xMS45MyA2MS44Ny0xMS45MyA2MS44N2E4IDggMCAwIDAgMi43MSA3LjY4QTguMTcgOC4xNyAwIDAgMCA3MiA0NjRhNy4yNiA3LjI2IDAgMCAwIDIuOTEtLjZsNTYuMjEtMjJhMTUuNyAxNS43IDAgMCAxIDEyIC4yYzE4Ljk0IDcuMzggMzkuODggMTIgNjAuODMgMTJBMTU5LjIxIDE1OS4yMSAwIDAgMCAyODQgNDMyLjExIj48L3BhdGg+PC9zdmc+",
                    rating: Math.floor(Math.random()*5)+1
                },
                                {
                    category: "Location",
                    icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xNy42NTcgMTYuNjU3TDEzLjQxNCAyMC45YTEuOTk4IDEuOTk4IDAgMDEtMi44MjcgMGwtNC4yNDQtNC4yNDNhOCA4IDAgMTExMS4zMTQgMHoiPjwvcGF0aD48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xNSAxMWEzIDMgMCAxMS02IDAgMyAzIDAgMDE2IDB6Ij48L3BhdGg+PC9zdmc+",
                    rating: Math.floor(Math.random()*5)+1
                },
                                {
                    category: "Value",
                    icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgaGVpZ2h0PSIyMDBweCIgd2lkdGg9IjIwMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZTogY3VycmVudENvbG9yOyIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1zdHJva2U9IiI+PGcgaWQ9IkJhZGdlX0RvbGxhciI+PGc+PHBhdGggZD0iTTEyLDIxLjk1M2MtLjg5NSwwLTEuNTQ1LS43NDMtMi4xMTgtMS40YTMuNjcxLDMuNjcxLDAsMCwwLTEuMDMzLS45NDYsMy44LDMuOCwwLDAsMC0xLjQ2Ni0uMDc3LDMuMDEyLDMuMDEyLDAsMCwxLTIuNDIxLS40OTQsMy4wMTQsMy4wMTQsMCwwLDEtLjQ5NC0yLjQyMSwzLjgyLDMuODIsMCwwLDAtLjA3Ny0xLjQ2NiwzLjY3MSwzLjY3MSwwLDAsMC0uOTQ2LTEuMDMzYy0uNjU1LS41NzMtMS40LTEuMjIyLTEuNC0yLjExOHMuNzQzLTEuNTQ1LDEuNC0yLjExOGEzLjY2LDMuNjYsMCwwLDAsLjk0Ni0xLjAzNCwzLjgxNSwzLjgxNSwwLDAsMCwuMDc3LTEuNDY1LDMuMDEyLDMuMDEyLDAsMCwxLC40OTQtMi40MjEsMy4wMTUsMy4wMTUsMCwwLDEsMi40MjItLjVBMy43OTQsMy43OTQsMCwwLDAsOC44NDksNC4zOWEzLjY2NiwzLjY2NiwwLDAsMCwxLjAzMy0uOTQ1Yy41NzMtLjY1NSwxLjIyMy0xLjQsMi4xMTgtMS40czEuNTQ1Ljc0MiwyLjExOCwxLjRhMy42NiwzLjY2LDAsMCwwLDEuMDM0Ljk0NiwzLjgwNywzLjgwNywwLDAsMCwxLjQ2NC4wNzcsMy4wMTgsMy4wMTgsMCwwLDEsMi40MjIuNSwzLjAxMiwzLjAxMiwwLDAsMSwuNSwyLjQyMiwzLjgxLDMuODEsMCwwLDAsLjA3NywxLjQ2NCwzLjY2LDMuNjYsMCwwLDAsLjk0NiwxLjAzNGMuNjU1LjU3MywxLjQsMS4yMjMsMS40LDIuMTE4cy0uNzQzLDEuNTQ1LTEuNCwyLjExOGEzLjY2NiwzLjY2NiwwLDAsMC0uOTQ1LDEuMDMzLDMuODE1LDMuODE1LDAsMCwwLS4wNzcsMS40NjUsMy4wMTIsMy4wMTIsMCwwLDEtLjUsMi40MjIsMy4wMTgsMy4wMTgsMCwwLDEtMi40MjEuNDk0LDMuODE4LDMuODE4LDAsMCwwLTEuNDY1LjA3NywzLjY3MywzLjY3MywwLDAsMC0xLjAzNC45NDZDMTMuNTQ1LDIxLjIxLDEyLjksMjEuOTUzLDEyLDIxLjk1M1pNOC4wOTMsMTguNWEyLjk1MiwyLjk1MiwwLDAsMSwxLjEzOC4xODMsNC4yMzMsNC4yMzMsMCwwLDEsMS40LDEuMjFjLjQ1NC41Mi45MjQsMS4wNTcsMS4zNjUsMS4wNTdzLjkxMS0uNTM3LDEuMzY2LTEuMDU3YTQuMjI1LDQuMjI1LDAsMCwxLDEuNC0xLjIxLDQuMzY1LDQuMzY1LDAsMCwxLDEuOTA4LS4xNTJjLjY3Mi4wNDEsMS4zNjYuMDg1LDEuNjUzLS4ycy4yNDUtLjk4Mi4yLTEuNjUzYTQuMzg3LDQuMzg3LDAsMCwxLC4xNTItMS45MDksNC4yNDEsNC4yNDEsMCwwLDEsMS4yMDktMS40Yy41Mi0uNDU0LDEuMDU3LS45MjQsMS4wNTctMS4zNjVzLS41MzctLjkxMS0xLjA1Ny0xLjM2NWE0LjIzNCw0LjIzNCwwLDAsMS0xLjIwOS0xLjQsNC4zODEsNC4zODEsMCwwLDEtLjE1Mi0xLjkwOGMuMDQxLS42NzEuMDg0LTEuMzY1LS4yLTEuNjUzcy0uOTgyLS4yNDYtMS42NTMtLjJhNC4zODQsNC4zODQsMCwwLDEtMS45MDgtLjE1Miw0LjIzNCw0LjIzNCwwLDAsMS0xLjQtMS4yMDljLS40NTQtLjUyLS45MjQtMS4wNTctMS4zNjUtMS4wNTdzLS45MTEuNTM3LTEuMzY1LDEuMDU3YTQuMjQxLDQuMjQxLDAsMCwxLTEuNCwxLjIwOSw0LjQxNyw0LjQxNywwLDAsMS0xLjkwOS4xNTJjLS42Ny0uMDQxLTEuMzY0LS4wODQtMS42NTMuMnMtLjI0NC45ODEtLjIsMS42NTJBNC4zNyw0LjM3LDAsMCwxLDUuMzE0LDkuMjNhNC4yMjYsNC4yMjYsMCwwLDEtMS4yMSwxLjRjLS41Mi40NTQtMS4wNTcuOTI1LTEuMDU3LDEuMzY1cy41MzcuOTExLDEuMDU3LDEuMzY2YTQuMjM4LDQuMjM4LDAsMCwxLDEuMjEsMS40LDQuMzc4LDQuMzc4LDAsMCwxLC4xNTIsMS45MWMtLjA0MS42NzItLjA4NCwxLjM2Ni4yLDEuNjUzcy45OC4yNDUsMS42NTMuMkM3LjU3OCwxOC41MTksNy44MzgsMTguNSw4LjA5MywxOC41WiI+PC9wYXRoPjxwYXRoIGQ9Ik0xNC41LDEzLjVhMi4wMDYsMi4wMDYsMCwwLDEtMiwydjEuMDFBLjUuNSwwLDAsMSwxMiwxN2EuNDkyLjQ5MiwwLDAsMS0uNS0uNDlWMTUuNWgtMS4yNWEuNS41LDAsMCwxLS41LS41LjUuNSwwLDAsMSwuNS0uNUgxMi41YTEsMSwwLDEsMCwwLTJoLTFhMiwyLDAsMCwxLDAtNFY3LjQ1M0EuNDczLjQ3MywwLDAsMSwxMiw3YS40OC40OCwwLDAsMSwuNS40NVY4LjVoMS4yNWEuNS41LDAsMCwxLC41LjUuNTA4LjUwOCwwLDAsMS0uNS41SDExLjVhMSwxLDAsMCwwLDAsMmgxQTIsMiwwLDAsMSwxNC41LDEzLjVaIj48L3BhdGg+PC9nPjwvZz48L3N2Zz4=",
                    rating: Math.floor(Math.random()*5)+1
                }
            ],
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            pros: "Pros",
            cons: "Cons",
            like_count: 3636,
            response: "Response"
        }    
    })
}))
    const reviewJudgement = (score: number): {name: string, color: string} => {
        if (score > 0 && score < 2.0) return {name: "Bad", color: "#f44336"};
        if (score < 3.0) return {name: "Okay", color: "#ff6900"};
        if (score < 4.0) return {name: "Average", color: "#f0b100"};
        if (score < 5.0) return {name: "Good", color: "#00c950"};
        return {name: "Excellent", color: "#2b7fff"};
    }

    const getAverageScore = (categories: ReviewCategory[]): number => {
        return categories.map(i=>i.rating).reduce((agg, val) => agg + val)/categories.length;
    }
    const getTotalAverageScore = (reviewData: Review[]): number => {
        return reviewData.map(i=>getAverageScore(i.rating)).reduce((agg, val) => agg+val)/reviewData.length;
    }
    return (
            <Carousel className="flex flex-col w-full h-fit mb-[100px] gap-y-[32px] bg-neutral-100/50 px-[104px]"
            opts={{
                    align: "start"
                }}>
            <div className="flex justify-between items-center">
                <p className="font-semibold text-[40px]">{`Other Rooms in ${hotelName}`}</p>
                    <div className="flex static gap-x-[8px] justify-center items-center">
                        <CarouselPrevious className="static flex w-[40px] h-[40px] translate-0"/>
                        <CarouselNext className="static flex w-[40px] h-[40px] translate-0"/>
                    </div>
            </div>

                <div className="w-full h-[581px]">

                    <CarouselContent className="">
                        {otherRoomData.map((obj, index) => (
                            <CarouselItem key={index} className="flex flex-col basis-1/4 gap-y-[16px]">
                                <div className="h-[220px] w-full border border-red-500 rounded-[20px]"></div>
                                <div className="flex flex-col gap-y-[8px] px-[16px] justify-start">
                                    <p className="font-semibold text-[20px]">{obj.type + " " + index}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-x-[4px]">
                                            <IoBedOutline size={16} />
                                            <p className="text-[14px]">{`${obj.beds.reduce((acc, val)=>acc+val.count, 0)} beds`}</p>
                                        </div>
                                        <div className="flex gap-x-[4px]">
                                            <IoPersonOutline size={16} />
                                            <p className="text-[14px]">{`${obj.capacity} people`}</p>
                                        </div>
                                        <div className="flex gap-x-[4px]">
                                            <IoResizeOutline size={16} />
                                            <p className="text-[14px]">{`${obj.size} m`}<sup>2</sup></p>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-200 rounded-[10px] px-[8px] py-[16px] w-full h-fit text-[14px]">{obj.description.split(".")[0]}</div>
                                    <div className="grid grid-cols-2 gap-y-[8px]">
                                        {obj.amenities.slice(0, 6).map((amenity, index) => (
                                            <div key={index} className={`flex gap-x-[8px] items-center ${index%2==0 ? "justify-start" : "justify-end"}`}>
                                                <img src={amenity.icon} alt={amenity.name} width={16} height={16} />
                                                <p className="text-[14px]">{amenity.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-x-[8px] items-center">
                                        <div className="bg-neutral-200 rounded-l-[15px] rounded-br-[10px] h-full w-[40px] flex justify-center items-center">
                                            <p className="font-semibold text-[16px]" style={{color: reviewJudgement(getTotalAverageScore(reviewData[index])).color}}>{getTotalAverageScore(reviewData[index]).toPrecision(2)}</p>
                                        </div>
                                        <p className="font-semibold text-[15px]" style={{color: reviewJudgement(getTotalAverageScore(reviewData[index])).color}}>{reviewJudgement(getTotalAverageScore(reviewData[index])).name}</p>
                                        <p className="font-semibold text-[13px] text-neutral-400">{`${reviewData[index].length} reviews`}</p>
                                    </div>
                                    <div className="flex justify-end gap-x-[8px]">
                                        {
                                            obj.discount > 0 && ( <>
                                                <div className="rounded-[20px] bg-green-200 text-green-500 text-[12px] px-[5px] py-[5px]">{`${obj.discount*100}% off`}</div>
                                                <p className="flex text-[15px] text-gray-300 line-through items-center -mr-[4px]">{`${obj.price}$`}</p>
                                            </>)
                                        }
                                        <p className="text-[18px] font-semibold">{`${(obj.price*(1-obj.discount)).toPrecision(2)}$/night`}</p>
                                    </div>

                                </div>

                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </div>
            </Carousel>
    )
}