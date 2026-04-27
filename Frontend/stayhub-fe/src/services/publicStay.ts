import type {
  CartSnapshot,
  PublicHotelDetail,
  PublicRoomDetail,
  ReservationSnapshot,
  TripItem,
} from "@/types/PublicStay";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_URL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const { query, headers, ...init } = options;
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error ??
      payload?.message ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchHotelDetail(
  hotelId: number,
  filters: {
    adults?: number;
    children?: number;
    checkin?: string;
    checkout?: string;
  },
) {
  return requestJson<PublicHotelDetail>(`/hotels/${hotelId}`, {
    query: filters,
  });
}

export async function fetchRoomDetail(
  hotelId: number,
  roomTypeId: number,
  filters: {
    checkin?: string;
    checkout?: string;
  },
) {
  return requestJson<PublicRoomDetail>(`/hotels/${hotelId}/rooms/${roomTypeId}`, {
    query: filters,
  });
}

export async function addRoomToCart(payload: {
  hotelID: number;
  roomTypeID: number;
  checkin_date: string;
  checkout_date: string;
  num_adults: number;
  num_children?: number;
  final_price?: number;
  special_requests?: string;
}) {
  return requestJson<{ message: string; reserveId: number; cart: CartSnapshot | null }>(
    "/user/reserves/add",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchCart() {
  return requestJson<{ cart: CartSnapshot | null }>("/user/reserves/cart", {
    method: "GET",
    credentials: "include",
  });
}

export async function removeCartRoom(roomId: number) {
  return requestJson<{ message: string }>(`/user/reserves/remove/${roomId}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function submitCart(payload: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  id_card_number?: string;
  address?: string;
  method?: string;
}) {
  return requestJson<{ message: string; reserveID: number; paymentStatus: string }>(
    "/user/reserves/submit",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchReservation(reservationId: number) {
  return requestJson<{ reservation: ReservationSnapshot }>(
    `/user/reserves/reservations/${reservationId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
}

export async function payReservation(reservationId: number, method: string) {
  return requestJson<{
    reservationId: number;
    status: string;
    paymentStatus: string;
    reservation?: ReservationSnapshot | null;
  }>(`/user/reserves/reservations/${reservationId}/pay`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ method }),
  });
}

export async function fetchTrips() {
  return requestJson<{ trips: TripItem[] }>("/user/reserves/history", {
    method: "GET",
    credentials: "include",
  });
}