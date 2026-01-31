export type ReviewCategory = {
    category: string,
    icon: string,
    rating: number
}

export type Review = {
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