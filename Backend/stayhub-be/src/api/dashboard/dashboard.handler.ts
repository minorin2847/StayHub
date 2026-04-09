import type { NextFunction, Request, Response } from "express";
import db from "@/database/db.js";
import Role from "../roles/roles.js";
import { getRole } from "../roles/roles.handler.js";
import Employee from "../employee/employee.js";
import type { BranchTable } from "../branch/branch.type.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import type { RoleTableData } from "../roles/roles.type.js";

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
            res.status(200).json(result.length > 0 ? {hasNext: result[0].hasNext, response: result.map(i=>new Employee(i))}: []);

        }
    )

}

export async function getBranches(req: Request, res: Response, next: NextFunction) {
    let { query, hotelCountMin, hotelCountMax, sort, order, page } = req.query;

    const userRoles = (req.user.roles || []).join(",");
    try {
        const response = await db.tx(async t => {
            
            await t.none("SET LOCAL app.current_username = $1", [req.user.username]);
            await t.none("SET LOCAL app.roles = $1", [userRoles]);
            await t.none("SET LOCAL app.hotelid = $1", [req.user.hotelid || '']);
            await t.none("SET LOCAL app.branchid = $1", [req.user.branchid || '']);
            return t.manyOrNone("SELECT * FROM get_branches_by_page($(query),$(hotelCountMin),$(hotelCountMax),$(sort),$(order),$(page))", {
                query: query ?? null,
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
    let {name, location, sort, order, page} = req.query;
    const isOnlyBranchManager = req.user.roles.some((r: any) => r.name === 'MANAGE_BRANCH') && !req.user.roles.some((r: any) => r.name === 'ADMINISTRATOR');
    const branchid = isOnlyBranchManager ? req.user.branchid : (req.query.branchid ?? null);

    // use rlsWrapper
    rlsWrapper(
        "get-hotels-table",
        req.user,
        async t => {
            return await t.manyOrNone("SELECT * FROM get_hotels_by_page($(branchid), $(name), $(location), $(sort), $(order), $(page))", {
                branchid : branchid ?? null,
                name: name ?? null,
                location: location ?? null,
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

// export async function getDashboardRooms(req: Request, res: Response, next: NextFunction) {
//     let { type, sort, order, page } = req.query;
    
//     // 1. Phân lập quyền hạn (Scope Isolation)
//     const isOnlyHotelManager = req.user.roles.some((r: any) => r.name === 'MANAGE_HOTEL') && !req.user.roles.some((r: any) => ['ADMINISTRATOR', 'MANAGE_BRANCH'].includes(r.name));
//     const hotelid = isOnlyHotelManager ? req.user.hotelid : (req.query.hotelid ?? null);

//     // 2. Chạy RLS Wrapper bọc giao dịch Database
//     rlsWrapper(
//         "get-rooms-table",
//         req.user,
//         async t => {
//             return await t.manyOrNone("SELECT * FROM get_rooms_by_page($(hotelid), $(type), $(sort), $(order), $(page))", {
//                 hotelid: hotelid ?? null,
//                 type: type ?? null,
//                 sort: sort ?? 'id',
//                 order: order ?? 'asc',
//                 page: page ?? 1
//             });
//         },
//         result => {
//              const hasNext = result.length > 0 && result[0].hasNext !== undefined ? result[0].hasNext : false;
//              res.status(200).json(result.length > 0 ? { hasNext, response: result } : []);
//         }
//     )
// }
