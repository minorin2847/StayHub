import crypto from "node:crypto";
import db from "./db.js";
import pgPromise from "pg-promise";
import path from "node:path";
import fs from "fs/promises";
import { fileURLToPath } from "node:url";

export default async function initialize() {
  // Initialize tables
  try {
    const pgp = pgPromise();
    const { QueryFile } = pgp;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const folderPath = path.join(__dirname, "definitions");
    
    const files = (await fs.readdir(folderPath)).sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" })
    );
    
    for (const file of files) {
      // BẮT BUỘC PHẢI CÓ { minify: false } ở đây
      const queryFile = new QueryFile("./database/definitions/" + file, { minify: false });
      await db.none(queryFile);
      console.log(`All ${file.split(".")[0]?.toLowerCase().split("_")[1]} initialized!`);
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(`An error occured when initializing database:\n${err.stack}`);
    } else console.error(`An unknown error occured when initializing database`);
    return; // Dừng lại nếu lỗi, không tạo admin nữa
  }

  // Initialize admin account
  const salt = Buffer.from('k:UK\br*"`F');
  const password = "123456";

  try {
    // Dùng pbkdf2Sync để đồng bộ hoá việc tạo password
    const hashed = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");

    await db.task("admin-creation", async (t) => {
      let roles = await t.manyOrNone(`
        INSERT INTO roles(name, tier) 
        VALUES ('ADMINISTRATOR', 1), ('MANAGE_BRANCH', 2), ('MANAGE_HOTEL', 3), 
               ('MANAGE_GUEST', 4), ('PROCESS_PAYMENT', 4), ('MANAGE_REVIEW', 4)
        ON CONFLICT DO NOTHING RETURNING name, tier;
      `);
      
      if (!roles || roles.length === 0) {
        roles = await t.many("SELECT name, tier FROM roles;");
      }
      console.log(`Initialize roles with values ${roles.map((i) => "name: " + i.name + "; tier: " + i.tier).join("\n")}!`);

      const user = await t.one(
        "SELECT * FROM create_initial_admin($(username), $(salt), $(hash), $(email), $(firstName), $(lastName), $(salary), $(hotelid), $(branchid));",
        {
          username: "admin", salt: salt, hash: hashed, email: "admin@stayhub.com",
          firstName: "John", lastName: "Admin", salary: 36363636, hotelid: null, branchid: null,
        }
      );
      console.log(`Initialized admin account with id ${user.id}!`);
    });
  } catch (err) {
    console.error(`An error occured while creating admin account:`, err);
  }
}