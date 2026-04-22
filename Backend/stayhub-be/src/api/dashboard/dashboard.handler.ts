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

// Prerequisite: isLoggedIn
export function hasPermission(roles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRoles = req.user.roles
            if (userRoles.length===0) {
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
    }
}

// Prerequisite: isLoggedIn
export async function getEmployee(req: Request, res: Response, next: NextFunction) {
    try {
        res.status(200).json(req.user);
    } catch (err) {
        if (err instanceof Error) res.status(404).send(err.message);
        res.status(404).send("An unknown error occured!");
    }
}


export async function getEmployeeAccounts(req: Request, res: Response, next: NextFunction) {
    let { name, hotelid, branchid, roles, salaryMin, salaryMax, sort, order, page } = req.query;

    const userRoles = (req.user.roles.map(i=>i.name) || []).join(",");
    const rolesArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);
    rlsWrapper(
        "get-employees-table",
        req.user,
        async t => {
            return await t.manyOrNone("SELECT * FROM get_employees_by_page($(current), $(name),$(hotelid),$(branchid),$(roles),$(salaryMin),$(salaryMax),$(sort),$(order),$(page))", {
                current: req.user.username ?? null,
                name: name ?? null,
                hotelid: hotelid ?? null,
                branchid: branchid ?? null,
                roles: rolesArray ?? [],
                salaryMin: salaryMin ?? 0,
                salaryMax: salaryMax ?? 2147483647,
                sort: sort ?? 'id',
                order: order ?? 'asc',
                page: page ?? 1
            })
        },
        result => {
            res.status(200).json(result.length > 0 ? {hasNext: result[0].hasNext, response: result.map(i =>new Employee(i))}: []);

        }
    )

}

export async function getBranches(req: Request, res: Response, next: NextFunction) {
    let { name, hotelCountMin, hotelCountMax, sort, order, page } = req.query;

    const userRoles = (req.user.roles || []).join(",");
    try {
        const response = await db.tx(async t => {
            
            await t.none("SET LOCAL app.current_username = $1", [req.user.username]);
            await t.none("SET LOCAL app.roles = $1", [userRoles]);
            await t.none("SET LOCAL app.hotelid = $1", [req.user.hotelid || '']);
            await t.none("SET LOCAL app.branchid = $1", [req.user.branchid || '']);
            return t.manyOrNone("SELECT * FROM get_branches_by_page($(query),$(hotelCountMin),$(hotelCountMax),$(sort),$(order),$(page))", {
                query: name ?? null,
                hotelCountMin: hotelCountMin ?? 0,
                hotelCountMax: hotelCountMax ?? 2147483647,
                sort: sort ?? 'id',
                order: order ?? 'asc',
                page: page ?? 1
            })
        });
        res.status(200).json(response.length > 0 ? {hasNext: response[0].hasNext, response: response.map(i=>i as BranchTable)}: []);
    } catch (err) {
        if (err instanceof Error) {
            res.status(404).send(err.stack);
        }
        else {
            res.status(404).send("An unknown error occured!");
        }
    }

}

export async function getRoles(req: Request, res: Response, next: NextFunction) {
    let { name, tier, minCount, maxCount, sort, order, page } = req.query;
    rlsWrapper(
        'get-roles',
        req.user,
        async t => {
            return await t.manyOrNone("SELECT * FROM get_roles_by_page($(name), $(tier), $(minCount), $(maxCount), $(sort), $(order), $(page))", {
                name: name ?? null,
                tier: tier ?? null,
                minCount: minCount ?? 0,
                maxCount: maxCount ?? 1000,
                sort: sort ?? 'tier',
                order: order ?? 'ASC',
                page: page ?? '1'
            })
        },
        result => {
            res.status(200).json(result.length > 0 ? {hasNext: result[0].hasNext, response: result.map(i=>i as RoleTableData)}: []);
        }
    )

}
// get getDashboardHotels
export async function getDashboardHotels(req: Request, res: Response, next: NextFunction){
    let {name, location, classification, contact_email, contact_phone, room_count_min, room_count_max, sort, order, page, id} = req.query;
    const isOnlyBranchManager = req.user.roles.some((r: any) => r.name === 'MANAGE_BRANCH') && !req.user.roles.some((r: any) => r.name === 'ADMINISTRATOR');
    const branchid = isOnlyBranchManager ? req.user.branchid : (req.query.branchid ?? null);

    // use rlsWrapper
    rlsWrapper(
        "get-hotels-table",
        req.user,
        async t => {
            return await t.manyOrNone("SELECT * FROM get_hotels_by_page($(branchid), $(id), $(name), $(classification), $(contact_email), $(contact_phone), $(location), $(room_count_min), $(room_count_max), $(sort), $(order), $(page))", {
                branchid : branchid ?? null,
                id: id ? parseInt(id as string) : 0,
                name: name ?? '',
                classification: classification ? parseInt(classification as string) : 0,
                contact_email: contact_email ?? '',
                contact_phone: contact_phone ?? '',
                location: location ?? '',
                room_count_min: room_count_min ? parseInt(room_count_min as string) : 0,
                room_count_max: room_count_max ? parseInt(room_count_max as string) : 2147483647,
                sort: sort ?? 'id',
                order: order ?? 'asc',
                page: page ?? 1
            });
        },
        result => {
            const hasNext = result.length > 0 && result[0].hasNext != undefined ? result[0].hasNext : false;
            res.status(200).json(result.length > 0 ? {
                hasNext, response: result} : [] );
        }
    )
}


export async function getDashboardBeds(req: Request, res: Response, next: NextFunction) {
    const { name, minCount, maxCount, sort, order, page, excludeCurrent } = req.query;

    try {
        const result = await db.manyOrNone(
            "SELECT * FROM get_beds_by_page($(query), $(excludeId), $(minCount), $(maxCount), $(sort), $(order), $(page))",
            {
                query: name ?? null,
                excludeId: excludeCurrent === 'true' ? req.user.hotelid : null,
                minCount: minCount ? parseInt(minCount as string) : 0,
                maxCount: maxCount ? parseInt(maxCount as string) : 1000,
                sort: sort ?? 'name',
                order: order ?? 'asc',
                page: page ? parseInt(page as string) : 1
            }
        );

        const hasNext = result.length > 0 && result[0].has_next;
        
        // Coerce the response by removing the has_next property from the objects
        // (Optional: Postgres returns it, but you can filter it out if you want a clean array)
        const response: BedRecord[] = result.map(({ has_next, ...data }) => data);

        res.status(200).json({ hasNext: !!hasNext, response });
    } catch (error) {
        next(error);
    }
}

export async function getDashboardHotelBeds(req: Request, res: Response, next: NextFunction) {
    const { name, minCount, maxCount, sort, order, page } = req.query;


    rlsWrapper(
        "get-hotel-beds-table",
        req.user,
        async t => {
            // Coercing the return type here
            return await t.manyOrNone(
                "SELECT * FROM get_hotel_beds_by_page($(hotelid), $(query), $(minCount), $(maxCount), $(sort), $(order), $(page))", 
                {
                    hotelid: req.user.hotelid,
                    query: name ?? null,
                    minCount: minCount ? parseInt(minCount as string) : 0,
                    maxCount: maxCount ? parseInt(maxCount as string) : 100,
                    sort: sort ?? 'name',
                    order: order ?? 'asc',
                    page: page ? parseInt(page as string) : 1
                }
            );
        },
        (result: (HotelBedRecord & {has_next: boolean})[]) => {
            const hasNext = result.length > 0 && result[0].has_next;
            
            // Clean the response so it only contains HotelBedRecord data
            const response: HotelBedRecord[] = result.map(({ has_next, ...data }) => data);

            res.status(200).json({ hasNext: !!hasNext, response });
        }
    );
}

export async function getDashboardServices(req: Request, res: Response, next: NextFunction) {
    const { name, type, minPrice, maxPrice, sort, order, page } = req.query;
    type ServiceTable = Service & {has_next: boolean};
    rlsWrapper(
        "get-dashboard-services",
        req.user,
        async t => {
            return await t.manyOrNone(
                "SELECT * FROM get_services_by_page($(query), $(type), $(minPrice), $(maxPrice), $(sort), $(order), $(page))",
                {
                    query: name ?? null,
                    type: type ?? null,
                    minPrice: minPrice ? parseInt(minPrice as string) : 0,
                    maxPrice: maxPrice ? parseInt(maxPrice as string) : 2147483647,
                    sort: sort ?? 'id',
                    order: order ?? 'asc',
                    page: page ? parseInt(page as string) : 1
                },
                (row: any) => row as ServiceTable
            );
        },
        (result: ServiceTable[]) => {
            // Postgres returns the column as 'has_next'
            const hasNext = result.length > 0 ? result[0].has_next : false;
            
            // Map over the results, strip out the 'has_next' column, and instantiate the Service class
            const response = result.map(({ has_next, ...data }) => data);

            // Return empty array if no results, otherwise return the pagination object
            res.status(200).json(
                result.length > 0 
                    ? { hasNext: !!hasNext, response } 
                    : { hasNext: false, response: [] }
            );
        }
    );
}

export async function getDashboardRoomTypes(req: Request, res: Response, next: NextFunction) {
    const { 
        name, 
        minSize, maxSize, 
        minCapacity, maxCapacity, 
        minPrice, maxPrice, 
        minTotalBeds, maxTotalBeds, 
        amenities, beds, 
        sort, order, page 
    } = req.query;

    // Helper to ensure query params that should be arrays actually are arrays
    const normalizeArray = (param: any): string[] | null => {
        if (!param) return null;
        return Array.isArray(param) ? (param as string[]) : [param as string];
    };
    type Amenities = {
        name: string;
        icon: string;
        category: string;
    }
    type RoomTypeTable = RoomType & { amenities: Amenities[]; beds: RoomBed[]; total_beds: number; has_next: boolean }; // Replace 'any' with your RoomType interface/class

    rlsWrapper(
        "get-dashboard-room-types",
        req.user,
        async t => {
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
                    query: name ?? null,
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
                    sort: sort ?? 'name',
                    order: order ?? 'ASC',
                    page: page ? parseInt(page as string) : 1
                },
                (row: any) => row as RoomTypeTable
            );
        },
        (result: RoomTypeTable[]) => {
            // Check the has_next flag from the first row if it exists
            const hasNext = result.length > 0 ? result[0]?.has_next : false;
            
            // Remove the helper column has_next from the final objects
            const response = result.map(({ has_next, ...data }) => data);

            res.status(200).json({
                hasNext: !!hasNext,
                response: result.length > 0 ? response : []
            });
        }
    );
}

export async function getDashboardRooms(req: Request, res: Response, next: NextFunction) {
    // Extract only the query parameters relevant to rooms
    const { name, typeId, sort, order, page } = req.query;
    
    // Define the intersection type for the DB return shape
    type RoomTable = Room & { has_next: boolean };
    
    rlsWrapper(
        "get-dashboard-rooms",
        req.user,
        async t => {
            return await t.manyOrNone(
                "SELECT * FROM get_rooms_by_page($(query), $(typeId), $(sort), $(order), $(page))",
                {
                    query: name ?? null,
                    typeId: typeId ? parseInt(typeId as string) : null,
                    sort: sort ?? 'id',
                    order: order ?? 'asc',
                    page: page ? parseInt(page as string) : 1
                },
                (row: any) => row as RoomTable
            );
        },
        (result: RoomTable[]) => {
            // Postgres returns the column as 'has_next'
            const hasNext = result.length > 0 ? result[0]?.has_next : false;
            
            // Map over the results, strip out the 'has_next' column, and return the clean data
            const response = result.map(({ has_next, ...data }) => data);

            // Return empty array if no results, otherwise return the pagination object
            res.status(200).json(
                result.length > 0 
                    ? { hasNext: !!hasNext, response } 
                    : { hasNext: false, response: [] }
            );
        }
    );
}

export async function getDashboardGuests(req: Request, res: Response, next: NextFunction) {
    const { 
        query, 
        minVisit, 
        maxVisit, 
        fromLastStay, 
        toLastStay, 
        sort, 
        order, 
        page 
    } = req.query;

    // Define the type locally to include the pagination flag from Postgres
    type GuestTable = DashboardGuest & { has_next: boolean };

    rlsWrapper(
        "get-dashboard-guests",
        req.user,
        async t => {
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
                    query: query ?? null,
                    minVisit: minVisit ? parseInt(minVisit as string) : 0,
                    maxVisit: maxVisit ? parseInt(maxVisit as string) : 2147483647,
                    fromLastStay: fromLastStay ?? null, // Postgres handles string to DATE conversion
                    toLastStay: toLastStay ?? null,
                    sort: sort ?? 'id',
                    order: order ?? 'asc',
                    page: page ? parseInt(page as string) : 1
                },
                (row: any) => row as GuestTable
            );
        },
        (result: GuestTable[]) => {
            // Check if there's a next page using the flag from the first row
            const hasNext = result.length > 0 ? result[0].has_next : false;
            
            // Clean the data: remove 'has_next' from individual guest objects
            const response = result.map(({ has_next, ...data }) => data);

            res.status(200).json(
                result.length > 0 
                    ? { hasNext: !!hasNext, response } 
                    : { hasNext: false, response: [] }
            );
        }
    );
}