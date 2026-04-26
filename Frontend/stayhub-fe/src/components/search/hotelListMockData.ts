export type HotelListItem = {
  id: number;
  name: string;
  image: string;
  badge?: string;
  city: string;
  distanceToCenter: string;
  distanceToBeach: string;
  transport?: string;
  reviews: number;
  rating: number;
  ratingLabel: string;
  stars: number;
  type: string;
  roomView: string;
  bedType: string;
  roomSize: string;
  benefits: string[];
  originalPrice?: number;
  price: number;
  taxes: number;
  discount?: string;
  warning?: string;
};

export type FilterChipGroup = {
  title: string;
  options: string[];
};

export type FilterSection = {
  key: string;
  title: string;
  contentType: "checkbox" | "chips" | "rating";
  options?: string[];
  chipGroups?: FilterChipGroup[];
};

export const hotelListMockData: HotelListItem[] = [
  {
    id: 1,
    name: "Melia Barcelona Sky",
    image: "/images/Top-Sight-1.jpg",
    badge: "Best Value",
    city: "Poblenou",
    distanceToCenter: "3.5 km from centre",
    distanceToBeach: "700 m from beach",
    transport: "Metro access",
    reviews: 1050,
    rating: 3.8,
    ratingLabel: "Good",
    stars: 4,
    type: "Spa Hotel",
    roomView: "Premium Room",
    bedType: "King Bed",
    roomSize: "36 m²",
    benefits: ["Free cancellation", "Spa access", "Beach view"],
    originalPrice: 1200,
    price: 1080,
    taxes: 82,
    discount: "10% off",
    warning: "Only 1 left at this price",
  },
  {
    id: 2,
    name: "Hotel 54 Barceloneta",
    image: "/images/Top-Sight-1.jpg",
    badge: "Guest Favorite",
    city: "Barceloneta",
    distanceToCenter: "1.4 km from centre",
    distanceToBeach: "100 m from beach",
    transport: "Metro access",
    reviews: 1231,
    rating: 4,
    ratingLabel: "Very Good",
    stars: 4,
    type: "Boutique Hotel",
    roomView: "Double Room",
    bedType: "Double Bed",
    roomSize: "24 m²",
    benefits: ["Free cancellation", "Rooftop bar"],
    originalPrice: 1100,
    price: 990,
    taxes: 110,
    discount: "10% off",
    warning: "Only 1 left at this price",
  },
  {
    id: 3,
    name: "SLS Barcelona",
    image: "/images/Top-Sight-1.jpg",
    badge: "Guest Favorite",
    city: "Port Forum",
    distanceToCenter: "5.0 km from centre",
    distanceToBeach: "100 m from beach",
    transport: "Shuttle service",
    reviews: 909,
    rating: 4.5,
    ratingLabel: "Very Good",
    stars: 5,
    type: "Luxury Hotel",
    roomView: "Panoramic Room",
    bedType: "King Bed",
    roomSize: "36 m²",
    benefits: ["Free cancellation", "Breakfast included"],
    price: 1440,
    taxes: 204,
  },
  {
    id: 4,
    name: "Renaissance Hotel",
    image: "/images/Top-Sight-1.jpg",
    badge: "Getaway Deal",
    city: "Poblenou",
    distanceToCenter: "3.2 km from centre",
    distanceToBeach: "110 m from beach",
    transport: "Metro access",
    reviews: 991,
    rating: 3.9,
    ratingLabel: "Good",
    stars: 4,
    type: "Seaside Hotel",
    roomView: "Sea View Room",
    bedType: "Queen Bed",
    roomSize: "28 m²",
    benefits: ["Free cancellation", "All sea view"],
    originalPrice: 1035,
    price: 875,
    taxes: 140,
    discount: "15% off",
    warning: "Only 1 left at this price",
  },
  {
    id: 5,
    name: "W Barcelona",
    image: "/images/Top-Sight-1.jpg",
    badge: "Best Location",
    city: "Barceloneta",
    distanceToCenter: "3.7 km from centre",
    distanceToBeach: "Beachfront",
    transport: "Metro access",
    reviews: 1200,
    rating: 4.6,
    ratingLabel: "Excellent",
    stars: 5,
    type: "Beach Hotel",
    roomView: "Sea View Room",
    bedType: "King Bed",
    roomSize: "36 m²",
    benefits: ["Breakfast included", "Spa access"],
    price: 1395,
    taxes: 200,
  },
  {
    id: 6,
    name: "Sofitel Barcelona Skipper",
    image: "/images/Top-Sight-1.jpg",
    city: "Port Olimpic",
    distanceToCenter: "2.0 km from centre",
    distanceToBeach: "200 m from beach",
    transport: "Metro access",
    reviews: 981,
    rating: 4.6,
    ratingLabel: "Very Good",
    stars: 5,
    type: "Beach Hotel",
    roomView: "Luxury King Room",
    bedType: "King Bed",
    roomSize: "34 m²",
    benefits: ["Free cancellation", "Pool access"],
    price: 1260,
    taxes: 180,
  },
  {
    id: 7,
    name: "Hotel Arts Barcelona",
    image: "/images/Top-Sight-1.jpg",
    badge: "Getaway Deal",
    city: "Port Olimpic",
    distanceToCenter: "1.8 km from centre",
    distanceToBeach: "230 m from beach",
    transport: "Metro access",
    reviews: 1278,
    rating: 5,
    ratingLabel: "Excellent",
    stars: 5,
    type: "Luxury Hotel",
    roomView: "Sea View Room",
    bedType: "King Bed",
    roomSize: "40 m²",
    benefits: ["Free cancellation", "Spa access"],
    originalPrice: 1500,
    price: 1280,
    taxes: 201,
    discount: "16% off",
  },
  {
    id: 8,
    name: "Hotel SB Diagonal Zero",
    image: "/images/Top-Sight-1.jpg",
    city: "Sant Marti",
    distanceToCenter: "4.5 km from centre",
    distanceToBeach: "300 m from beach",
    transport: "Metro access",
    reviews: 789,
    rating: 3.8,
    ratingLabel: "Good",
    stars: 4,
    type: "Spa Hotel",
    roomView: "Ocean View Suite",
    bedType: "King Bed",
    roomSize: "40 m²",
    benefits: ["Free cancellation", "Spa access"],
    originalPrice: 990,
    price: 840,
    taxes: 132,
    discount: "15% off",
    warning: "Only 1 left at this price",
  },
  {
    id: 9,
    name: "Eurostars Grand Marina",
    image: "/images/Top-Sight-1.jpg",
    city: "Port Vell",
    distanceToCenter: "1.4 km from centre",
    distanceToBeach: "900 m from beach",
    reviews: 1100,
    rating: 4.4,
    ratingLabel: "Very Good",
    stars: 4,
    type: "Harborfront Hotel",
    roomView: "Deluxe Room",
    bedType: "King Bed",
    roomSize: "33 m²",
    benefits: ["Free cancellation", "Breakfast included"],
    originalPrice: 1350,
    price: 1215,
    taxes: 162,
    discount: "10% off",
    warning: "Only 1 left at this price",
  },
  {
    id: 10,
    name: "Majestic Hotel & Spa",
    image: "/images/Top-Sight-1.jpg",
    badge: "Guest Favorite",
    city: "Passeig de Gracia",
    distanceToCenter: "850 m from centre",
    distanceToBeach: "4.8 km from beach",
    transport: "Metro access",
    reviews: 1218,
    rating: 4.5,
    ratingLabel: "Very Good",
    stars: 5,
    type: "Historic Hotel",
    roomView: "Twin Room",
    bedType: "2 Twin Beds",
    roomSize: "29 m²",
    benefits: ["Breakfast included", "Terrace lounge"],
    price: 1325,
    taxes: 196,
  },
];

export const hotelFilterSections: FilterSection[] = [
  {
    key: "type",
    title: "Type of Place",
    contentType: "chips",
    chipGroups: [
      {
        title: "Any Type",
        options: ["Resort", "Entire home"],
      },
    ],
  },
  {
    key: "roomBeds",
    title: "Rooms and Beds",
    contentType: "chips",
    chipGroups: [
      {
        title: "Bedrooms",
        options: ["Any"],
      },
      {
        title: "Beds",
        options: ["Any"],
      },
      {
        title: "Bathrooms",
        options: ["Any"],
      },
    ],
  },
  {
    key: "roomSize",
    title: "Room Size",
    contentType: "checkbox",
    options: ["Small (< 25 m²)", "Medium (26-40 m²)", "Large (> 41 m²)"],
  },
  {
    key: "distance",
    title: "Distance From Centre",
    contentType: "chips",
    chipGroups: [
      {
        title: "Range",
        options: ["1 km", "10+ km"],
      },
    ],
  },
  {
    key: "review",
    title: "Guest Review Score",
    contentType: "rating",
  },
  {
    key: "classification",
    title: "Property Classification",
    contentType: "rating",
  },
  {
    key: "amenities",
    title: "Amenities",
    contentType: "chips",
    chipGroups: [
      {
        title: "Popular",
        options: ["Air Conditioning", "Wi-Fi", "BBQ Grill", "TV", "Kitchen"],
      },
    ],
  },
  {
    key: "booking",
    title: "Booking Options",
    contentType: "checkbox",
    options: ["Free cancellation", "Reserve now, pay later", "Breakfast included"],
  },
  {
    key: "payment",
    title: "Payment Options",
    contentType: "checkbox",
    options: ["Pay now", "Pay at property", "Installments"],
  },
  {
    key: "propertyType",
    title: "Property Type",
    contentType: "checkbox",
    options: ["Hotel", "Resort", "Apartment", "Villa"],
  },
  {
    key: "accessibility",
    title: "Accessibility Features",
    contentType: "checkbox",
    options: ["Lift access", "Wheelchair friendly", "Accessible bathroom"],
  },
];
