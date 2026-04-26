export interface SearchResult {
    hotel_name: string;
    hotelid: number;
    hotel_classification: number;
    hotel_location: string;
    hotel_city: string;
    avg_room_rating: number | string; // NUMERIC from DB
    review_count: number | string;    // BIGINT from DB
    roomtypeid: number;
    roomtype_name: string;
    roomtype_size: number;
    roomtype_bed: string;
    total_beds: number | string;      // BIGINT from DB
    roomtype_capacity: number;
    roomtype_base_price: number;
    roomtype_images: string[];
    roomtype_amenities: string[];
    room_count: number | string;      // BIGINT from DB
    deal_name: string | null;
    deal_starttime: Date | string | null;
    deal_endtime: Date | string | null;
    deal_discount_price: number | null;
    final_price: number;
    pricerange: number[];             // Note: PostgreSQL automatically lowercases column names in result sets unless double-quoted
    has_next: boolean;
}