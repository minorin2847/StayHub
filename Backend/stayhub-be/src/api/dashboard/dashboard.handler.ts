import type { NextFunction, Request, Response } from "express";
import db from "@/database/db.js";
import Role from "../roles/roles.js";
import { getRole } from "../roles/roles.handler.js";
import Employee from "../employee/employee.js";
import type { BranchTable } from "../branch/branch.type.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import type { RoleTableData } from "../roles/roles.type.js";
import type { BedRecord, HotelBedRecord, RoomBed } from "../bed/bed.type.js";
import type Service from "../services/services.js";
import type { Room, RoomType } from "../rooms/room.js";
import type Guest from "../guests/guests.js";
import type { DashboardGuest } from "../guests/guests.type.js";
import type { DashboardBooking } from "../bookings/booking.type.js";
import type { DashboardReserve } from "../reserves/reserve.type.js";

// Prerequisite: isLoggedIn
export function hasPermission(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = req.user.roles;
      if (userRoles.length === 0) {
        throw new Error("Employee doesn't have any roles!");
      }
      for (const requiredRole of roles) {
        for (const userRole of userRoles) {
          if (requiredRole == userRole.name) {
            next();
            return;
          }
        }
      }
      res.status(401).send("Unauthorized!");
    } catch (err) {
      if (err instanceof Error) res.status(404).send(err.message);
      res.status(404).send("An unknown error occured!");
    }
  };
}

// Prerequisite: isLoggedIn
export async function getEmployee(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    if (err instanceof Error) res.status(404).send(err.message);
    res.status(404).send("An unknown error occured!");
  }
}

export async function getEmployeeAccounts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let {
    name,
    hotelid,
    branchid,
    roles,
    salaryMin,
    salaryMax,
    sort,
    order,
    page,
  } = req.query;

  const rolesArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);
  rlsWrapper(
    "get-employees-table",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_employees_by_page($(current), $(name),$(hotelid),$(branchid),$(roles),$(salaryMin),$(salaryMax),$(sort),$(order),$(page))",
        {
          current: req.user.username ?? null,
          name: name ?? null,
          hotelid: hotelid ?? null,
          branchid: branchid ?? null,
          roles: rolesArray ?? [],
          salaryMin: salaryMin ?? 0,
          salaryMax: salaryMax ?? 2147483647,
          sort: sort ?? "id",
          order: order ?? "asc",
          page: page ?? 1,
        },
      );
    },
    (result) => {
      res.status(200).json(
        result.length > 0
          ? {
              hasNext: result[0].hasNext,
              response: result.map((i) => new Employee(i)),
            }
          : [],
      );
    },
  );
}

export async function getBranches(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let { query, name, hotelCountMin, hotelCountMax, sort, order, page } =
    req.query;

  rlsWrapper(
    "get-branches-table",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_branches_by_page($(query),$(hotelCountMin),$(hotelCountMax),$(sort),$(order),$(page))",
        {
          query: query || name || null,
          hotelCountMin: hotelCountMin ?? 0,
          hotelCountMax: hotelCountMax ?? 2147483647,
          sort: sort ?? "id",
          order: order ?? "asc",
          page: page ?? 1,
        },
      );
    },
    (result) => {
      res.status(200).json(
        result.length > 0
          ? {
              hasNext: result[0].hasNext,
              response: result.map((i) => i as BranchTable),
            }
          : [],
      );
    },
  );
}

export async function getRoles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let { name, tier, minCount, maxCount, sort, order, page } = req.query;
  rlsWrapper(
    "get-roles",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_roles_by_page($(name), $(tier), $(minCount), $(maxCount), $(sort), $(order), $(page))",
        {
          name: name ?? null,
          tier: tier ?? null,
          minCount: minCount ?? 0,
          maxCount: maxCount ?? 1000,
          sort: sort ?? "tier",
          order: order ?? "ASC",
          page: page ?? "1",
        },
      );
    },
    (result) => {
      res.status(200).json(
        result.length > 0
          ? {
              hasNext: result[0].hasNext,
              response: result.map((i) => i as RoleTableData),
            }
          : [],
      );
    },
  );
}

export async function getDashboardHotels(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let {
    name,
    location,
    classification,
    contact_email,
    contact_phone,
    room_count_min,
    room_count_max,
    sort,
    order,
    page,
    id,
  } = req.query;
  const isOnlyBranchManager =
    req.user.roles.some((r: any) => r.name === "MANAGE_BRANCH") &&
    !req.user.roles.some((r: any) => r.name === "ADMINISTRATOR");
  const branchid = isOnlyBranchManager
    ? req.user.branchid
    : (req.query.branchid ?? null);

  // use rlsWrapper
  rlsWrapper(
    "get-hotels-table",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_hotels_by_page($(branchid), $(id), $(name), $(classification), $(contact_email), $(contact_phone), $(location), $(room_count_min), $(room_count_max), $(sort), $(order), $(page))",
        {
          branchid: branchid ?? null,
          id: id ? parseInt(id as string) : 0,
          name: name ?? "",
          classification: classification
            ? parseInt(classification as string)
            : 0,
          contact_email: contact_email ?? "",
          contact_phone: contact_phone ?? "",
          location: location ?? "",
          room_count_min: room_count_min
            ? parseInt(room_count_min as string)
            : 0,
          room_count_max: room_count_max
            ? parseInt(room_count_max as string)
            : 2147483647,
          sort: sort ?? "id",
          order: order ?? "asc",
          page: page ?? 1,
        },
      );
    },
    (result) => {
      const hasNext =
        result.length > 0 && result[0].hasNext != undefined
          ? result[0].hasNext
          : false;
      res.status(200).json(
        result.length > 0
          ? {
              hasNext,
              response: result,
            }
          : [],
      );
    },
  );
}

export async function getDashboardBeds(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, query, minCount, maxCount, sort, order, page, excludeCurrent } =
    req.query;

  try {
    const result = await db.manyOrNone(
      "SELECT * FROM get_beds_by_page($(query), $(excludeId), $(minCount), $(maxCount), $(sort), $(order), $(page))",
      {
        query: query ?? name ?? null,
        excludeId: excludeCurrent === "true" ? req.user.hotelid : null,
        minCount: minCount ? parseInt(minCount as string) : 0,
        maxCount: maxCount ? parseInt(maxCount as string) : 1000,
        sort: sort ?? "name",
        order: order ?? "asc",
        page: page ? parseInt(page as string) : 1,
      },
    );

    const hasNext = result.length > 0 && result[0].has_next;
    const response: BedRecord[] = result.map(({ has_next, ...data }) => data);

    res.status(200).json({ hasNext: !!hasNext, response });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardHotelBeds(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, query, minCount, maxCount, sort, order, page } = req.query;

  rlsWrapper(
    "get-hotel-beds-table",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_hotel_beds_by_page($(hotelid), $(query), $(minCount), $(maxCount), $(sort), $(order), $(page))",
        {
          hotelid: req.user.hotelid,
          query: query ?? name ?? null,
          minCount: minCount ? parseInt(minCount as string) : 0,
          maxCount: maxCount ? parseInt(maxCount as string) : 100,
          sort: sort ?? "name",
          order: order ?? "asc",
          page: page ? parseInt(page as string) : 1,
        },
      );
    },
    (result: (HotelBedRecord & { has_next: boolean })[]) => {
      const hasNext = result.length > 0 && result[0].has_next;
      const response: HotelBedRecord[] = result.map(
        ({ has_next, ...data }) => data,
      );

      res.status(200).json({ hasNext: !!hasNext, response });
    },
  );
}

export async function getDashboardServices(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, query, type, minPrice, maxPrice, sort, order, page } =
    req.query;
  type ServiceTable = Service & { has_next: boolean };
  rlsWrapper(
    "get-dashboard-services",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_services_by_page($(query), $(type), $(minPrice), $(maxPrice), $(sort), $(order), $(page))",
        {
          query: query ?? name ?? null,
          type: type ?? null,
          minPrice: minPrice ? parseInt(minPrice as string) : 0,
          maxPrice: maxPrice ? parseInt(maxPrice as string) : 2147483647,
          sort: sort ?? "id",
          order: order ?? "asc",
          page: page ? parseInt(page as string) : 1,
        },
      );
    },
    (result: ServiceTable[]) => {
      const hasNext = result.length > 0 ? result[0].has_next : false;
      const response = result.map(({ has_next, ...data }) => data);

      res
        .status(200)
        .json(
          result.length > 0
            ? { hasNext: !!hasNext, response }
            : { hasNext: false, response: [] },
        );
    },
  );
}

export async function getDashboardRoomTypes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const {
    name,
    query,
    minSize,
    maxSize,
    minCapacity,
    maxCapacity,
    minPrice,
    maxPrice,
    minTotalBeds,
    maxTotalBeds,
    amenities,
    beds,
    sort,
    order,
    page,
  } = req.query;

  const normalizeArray = (param: any): string[] | null => {
    if (!param) return null;
    return Array.isArray(param) ? (param as string[]) : [param as string];
  };
  type Amenities = {
    name: string;
    icon: string;
    category: string;
  };
  type RoomTypeTable = RoomType & {
    amenities: Amenities[];
    beds: RoomBed[];
    total_beds: number;
    has_next: boolean;
  };

  rlsWrapper(
    "get-dashboard-room-types",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        `SELECT * FROM get_room_types_by_page(
                    $(query), 
                    $(minSize), $(maxSize), 
                    $(minCapacity), $(maxCapacity), 
                    $(minPrice), $(maxPrice), 
                    $(minTotalBeds), $(maxTotalBeds), 
                    $(amenities), $(beds), 
                    $(sort), $(order), $(page)
                )`,
        {
          query: query ?? name ?? null,
          minSize: minSize ? parseInt(minSize as string) : 0,
          maxSize: maxSize ? parseInt(maxSize as string) : 1000,
          minCapacity: minCapacity ? parseInt(minCapacity as string) : 0,
          maxCapacity: maxCapacity ? parseInt(maxCapacity as string) : 1000,
          minPrice: minPrice ? parseInt(minPrice as string) : 0,
          maxPrice: maxPrice ? parseInt(maxPrice as string) : 2147483647,
          minTotalBeds: minTotalBeds ? parseInt(minTotalBeds as string) : 0,
          maxTotalBeds: maxTotalBeds ? parseInt(maxTotalBeds as string) : 100,
          amenities: normalizeArray(amenities),
          beds: normalizeArray(beds),
          sort: sort ?? "name",
          order: order ?? "ASC",
          page: page ? parseInt(page as string) : 1,
        },
      );
    },
    (result: RoomTypeTable[]) => {
      const hasNext = result.length > 0 ? result[0]?.has_next : false;
      const response = result.map(({ has_next, ...data }) => data);

      res.status(200).json({
        hasNext: !!hasNext,
        response: result.length > 0 ? response : [],
      });
    },
  );
}

export async function getDashboardRooms(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, query, typeId, sort, order, page } = req.query;
  type RoomTable = Room & { has_next: boolean };

  rlsWrapper(
    "get-dashboard-rooms",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_rooms_by_page($(query), $(typeId), $(sort), $(order), $(page))",
        {
          query: query ?? name ?? null,
          typeId: typeId ? parseInt(typeId as string) : null,
          sort: sort ?? "id",
          order: order ?? "asc",
          page: page ? parseInt(page as string) : 1,
        },
      );
    },
    (result: RoomTable[]) => {
      const hasNext = result.length > 0 ? result[0]?.has_next : false;
      const response = result.map(({ has_next, ...data }) => data);

      res
        .status(200)
        .json(
          result.length > 0
            ? { hasNext: !!hasNext, response }
            : { hasNext: false, response: [] },
        );
    },
  );
}

export async function getDashboardGuests(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const {
    name,
    query,
    minVisit,
    maxVisit,
    fromLastStay,
    toLastStay,
    sort,
    order,
    page,
  } = req.query;

  type GuestTable = DashboardGuest & { has_next: boolean };

  rlsWrapper(
    "get-dashboard-guests",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        `SELECT * FROM get_guests_by_page(
                    $(query), 
                    $(minVisit), 
                    $(maxVisit), 
                    $(fromLastStay), 
                    $(toLastStay), 
                    $(sort), 
                    $(order), 
                    $(page)
                )`,
        {
          query: query ?? name ?? null,
          minVisit: minVisit ? parseInt(minVisit as string) : 0,
          maxVisit: maxVisit ? parseInt(maxVisit as string) : 2147483647,
          fromLastStay: fromLastStay ?? null,
          toLastStay: toLastStay ?? null,
          sort: sort ?? "id",
          order: order ?? "asc",
          page: page ? parseInt(page as string) : 1,
        },
      );
    },
    (result: GuestTable[]) => {
      const hasNext = result.length > 0 ? result[0].has_next : false;
      const response = result.map(({ has_next, ...data }) => data);

      res
        .status(200)
        .json(
          result.length > 0
            ? { hasNext: !!hasNext, response }
            : { hasNext: false, response: [] },
        );
    },
  );
}

export async function getDashboardBookings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const {
    name,
    query,
    roomId,
    checkinAfter,
    checkinBefore,
    checkoutAfter,
    checkoutBefore,
    status,
    hasReserve,
    sort,
    order,
    page,
  } = req.query;

  type BookingTable = DashboardBooking & { has_next: boolean };

  rlsWrapper(
    "get-dashboard-bookings",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        `SELECT * FROM get_bookings_by_page(
                    $(query), 
                    $(roomId), 
                    $(checkinAfter), 
                    $(checkinBefore), 
                    $(checkoutAfter), 
                    $(checkoutBefore), 
                    $(status), 
                    $(hasReserve),
                    $(sort), 
                    $(order), 
                    $(page)
                )`,
        {
          query: query ?? name ?? null,
          roomId: roomId ? parseInt(roomId as string) : null,
          checkinAfter: checkinAfter ?? null,
          checkinBefore: checkinBefore ?? null,
          checkoutAfter: checkoutAfter ?? null,
          checkoutBefore: checkoutBefore ?? null,
          status: status ?? null,
          hasReserve:
            hasReserve === "true"
              ? true
              : hasReserve === "false"
                ? false
                : null,
          sort: sort ?? "checkin",
          order: order ?? "asc",
          page: page ? parseInt(page as string) : 1,
        },
      );
    },
    (result: BookingTable[]) => {
      const hasNext = result.length > 0 ? result[0].has_next : false;
      const response = result.map(({ has_next, ...data }) => data);

      res
        .status(200)
        .json(
          result.length > 0
            ? { hasNext: !!hasNext, response }
            : { hasNext: false, response: [] },
        );
    },
  );
}

export async function getDashboardPolicies(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, category, sort, order, page } = req.query;
  rlsWrapper(
    "get-dashboard-policies",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_policies_by_page($(name), $(category), $(sort), $(order), $(page))",
        {
          name: name ?? null,
          category: category ?? null,
          sort: sort ?? "updated_at",
          order: order ?? "DESC",
          page: page ? parseInt(page as string) : 1,
        },
      );
    },
    (result) => {
      const hasNext = result.length > 0 ? result[0].has_next : false;
      const response = result.map(({ has_next, ...data }) => data);

      res
        .status(200)
        .json(
          result.length > 0
            ? { hasNext: !!hasNext, response }
            : { hasNext: false, response: [] },
        );
    },
  );
}

export async function getDashboardAmenities(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const {
    name,
    category,
    sort,
    order,
    page,
    excludeCurrent,
    minCount,
    maxCount,
  } = req.query;
  rlsWrapper(
    "get-dashboard-amenities",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        "SELECT * FROM get_amenities_by_page($(name), $(category), $(exclude_hotel_id), $(min_count), $(max_count) , $(sort), $(order), $(page))",
        {
          name: name ?? null,
          category: category ?? null,
          exclude_hotel_id: excludeCurrent === "true" ? req.user.hotelid : null,
          min_count: minCount ? parseInt(minCount as string) : 0,
          max_count: maxCount ? parseInt(maxCount as string) : 1000,
          sort: sort ?? "name",
          order: order ?? "ASC",
          page: page ? parseInt(page as string) : 1,
        },
      );
    },
    (result) => {
      const hasNext = result.length > 0 ? result[0].has_next : false;
      const response = result.map(({ has_next, ...data }) => data);

      res
        .status(200)
        .json(
          result.length > 0
            ? { hasNext: !!hasNext, response }
            : { hasNext: false, response: [] },
        );
    },
  );
}


export async function getDashboardReserves(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const {
    query,
    roomId,
    overallStatus,
    bookingStatus,
    paymentStatus,
    sort,
    order,
    page,
  } = req.query;

  type ReserveTable = DashboardReserve & { has_next: boolean };

  rlsWrapper(
    "get-dashboard-reserves",
    req.user,
    async (t) => {
      return await t.manyOrNone(
        `SELECT * FROM get_reserves_by_page(
                    $(query), 
                    $(roomId), 
                    $(overallStatus), 
                    $(bookingStatus), 
                    $(paymentStatus), 
                    $(sort), 
                    $(order), 
                    $(page)
                )`,
        {
          query: query ?? null,
          roomId: roomId ? parseInt(roomId as string, 10) : null,
          overallStatus: overallStatus ?? null,
          bookingStatus: bookingStatus ?? null,
          paymentStatus: paymentStatus ?? null,
          sort: sort ?? "created_at",
          order: order ?? "desc", // Defaulting to DESC for reserves based on the SQL function
          page: page ? parseInt(page as string, 10) : 1,
        },
      );
    },
    (result: ReserveTable[]) => {
      const hasNext = result.length > 0 ? result[0].has_next : false;
      const response = result.map(({ has_next, ...data }) => data);

      res
        .status(200)
        .json(
          result.length > 0
            ? { hasNext: !!hasNext, response }
            : { hasNext: false, response: [] },
        );
    },
  );
}