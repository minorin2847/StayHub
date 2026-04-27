export type PublicAmenity = {
  name: string;
  icon: string;
  category: string;
};

export type PublicPolicy = {
  name: string;
  icon: string;
  description: string;
};

export type PublicRoomBed = {
  name: string;
  count: number;
};

export type PublicReview = {
  id: number;
  userId: number;
  roomId: number;
  createdAt: string;
  rating: number;
  description: string;
  pros?: string | null;
  cons?: string | null;
  likeCount: number;
  response?: string | null;
  user: {
    name: string;
    avatar?: string | null;
  };
};

export type PublicRoomType = {
  id: number;
  hotelId: number;
  name: string;
  size: number;
  capacity: number;
  price: number;
  description: string;
  beds: PublicRoomBed[];
  totalBeds: number;
  amenities: PublicAmenity[];
  image: string;
  availableRoomCount: number;
  totalRoomCount: number;
};

export type PublicHotelListItem = {
  id: number;
  name: string;
  classification: number;
  cityAbbreviation?: string | null;
  location: string;
  description: string;
  image: string;
  rating: number;
  ratingLabel: string;
  reviewCount: number;
  availableRoomCount: number;
  priceFrom: number | null;
  amenities: PublicAmenity[];
  policies: PublicPolicy[];
  roomTypes: PublicRoomType[];
  featuredRoom: PublicRoomType;
  matchDateRange?: {
    checkin: string;
    checkout: string;
  } | null;
};

export type PublicHotelDetail = {
  id: number;
  name: string;
  classification: number;
  cityAbbreviation?: string | null;
  location: string;
  description: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  image: string;
  images: string[];
  rating: number;
  ratingLabel: string;
  reviewCount: number;
  amenities: PublicAmenity[];
  policies: PublicPolicy[];
  roomTypes: PublicRoomType[];
  reviews: PublicReview[];
  stay?: {
    checkin: string;
    checkout: string;
  } | null;
};

export type PublicRoomDetail = {
  id: number;
  hotelId: number;
  hotelName: string;
  hotelLocation: string;
  hotelClassification: number;
  hotelRating: number;
  name: string;
  size: number;
  capacity: number;
  price: number;
  description: string;
  beds: PublicRoomBed[];
  amenities: PublicAmenity[];
  image: string;
  images: string[];
  availableRoomCount: number;
  policies: PublicPolicy[];
  reviews: PublicReview[];
  otherRooms: PublicRoomType[];
  stay?: {
    checkin: string;
    checkout: string;
  } | null;
};

export type CartRoom = {
  id: number;
  reserveid: number;
  hotelid: number;
  roomtypeid: number;
  roomid: number | null;
  confirmation_code: string;
  booking_status: string;
  payment_status: string;
  checkin_date: string;
  checkout_date: string;
  num_adults: number;
  num_children: number;
  final_price: number;
  special_requests?: string | null;
  hotel_name: string;
  hotel_location: string;
  hotel_image: string;
  room_type_id: number;
  room_type_name: string;
  room_name?: string | null;
  size: number;
  capacity: number;
  base_price: number;
  room_image: string;
};

export type CartSnapshot = {
  id: number;
  userID: number;
  guestID?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  totalRooms: number;
  rooms: CartRoom[];
};

export type ReservationSnapshot = {
  id: number;
  userID: number;
  guestID?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  totalRooms: number;
  guest?: {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
    idCardNumber?: string | null;
    address?: string | null;
  } | null;
  rooms: CartRoom[];
};

export type TripItem = {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  totalRooms: number;
  rooms: Array<{
    reservedRoomId: number;
    hotelId: number;
    hotelName: string;
    hotelLocation: string;
    hotelImage: string;
    roomId: number | null;
    roomName?: string | null;
    roomTypeId: number;
    roomTypeName: string;
    roomImage: string;
    checkinDate: string;
    checkoutDate: string;
    bookingStatus: string;
    paymentStatus: string;
    finalPrice: number;
    confirmationCode: string;
    bookingId?: number | null;
    bookingOverallStatus?: string | null;
  }>;
};

export type HotelSearchFilters = {
  location?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  checkin?: string;
  checkout?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  reviewMin?: number;
  roomSizes?: string[];
  classifications?: number[];
  amenities?: string[];
  sort?: string;
};
