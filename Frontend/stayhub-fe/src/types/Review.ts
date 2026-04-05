export type ReviewCategory = {
    category: string,
    icon: string,
    rating: number
}

export type RoomView = {
    id: number;
    userid: number;
    roomid: number;
    created_at: number;
    rating: ReviewCategory[];
    description: string;
    pros: string;
    cons: string;
    like_count: number;
    response: string
}

export type HotelView = {
    id: number;
    name: string;
    userid: number;
    hotelid: number;
    created_at: number;
    rating: ReviewCategory[];
    description: string;
    pros: string;
    cons: string;
    liked_count: number;
    response: string
}