import type Role from "@/api/roles/roles.js";
import db from "@/database/db.js";

export default function rlsWrapper(
    transactionName: string,
    user: any, 
    query: (t: any) => Promise<any>,
    result: (row: any) => any,
    fail?: (err: any) => any) {
    db.tx(transactionName, async t => {
        const roleStr = user.roles.map((i: Role)=>i.name).join(",");
        await t.none('SET ROLE stayhub');
        await t.none("SET LOCAL app.current_username = $1", [
            user.username,
        ]);
        await t.none("SET LOCAL app.roles = $1", [roleStr || ""]);
        await t.none("SET LOCAL app.hotelid = $1", [user.hotelid || ""]);
        await t.none("SET LOCAL app.branchid = $1", [
            user.branchid || "",
        ]);
        return await query(t);
    }).then(res => result(res))
    .catch(err => {
        if (err instanceof Error) {
            console.error(`There's a problem in ${transactionName}:\n${err.stack}`)
        } else console.error(`There's an unknown error in ${transactionName}!`)
        
        if (fail) fail(err);
    })
}
