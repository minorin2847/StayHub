import db from "@/database/db.js";
import type { NextFunction, Request, Response } from "express";
import Amenity from "./amenity.js";
import rlsWrapper from "@/utils/rlsWrapper.js";

export async function findAmenityByName(name: string): Promise<Amenity> {
  const amenity = await db.oneOrNone(
    "SELECT * FROM amenities WHERE name = $1",
    [name],
  );
  if (!amenity) {
    throw Error(`Can't find amenity with name ${name}!`);
  }
  return new Amenity(amenity);
}

export function createAmenity(req: Request, res: Response, next: NextFunction) {
  const { name, icon, category } = req.body;

  if (!name || !icon || !category) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập đủ thông tin (name, icon, category)!" });
  }

  findAmenityByName(name)
    .then(() => res.status(409).send("Amenity đã tồn tại!"))
    .catch((err) => {
      rlsWrapper(
        "create-amenity",
        req.user,
        async (t) => {
          const amenity = await t.one(
            `INSERT INTO amenities(name, icon, category) 
             VALUES ($(name), $(icon), $(category)) 
             RETURNING name, icon, category`,
            {
              name: name,
              icon: icon,
              category: category,
            },
          );
          return new Amenity(amenity);
        },
        (newAmenity) => {
          console.log(
            `Created amenity: ${newAmenity.name} (${newAmenity.category})`,
          );
          res.status(200).json(newAmenity);
        },
      );
    });
}

export function getAmenityStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  rlsWrapper(
    "get-amenity-stats",
    req.user,
    async (t) => {
      const totalRes = await t.one("SELECT COUNT(*)::int as total FROM amenities");
      const totalCategoriesRes = await t.one(
        "SELECT COUNT(DISTINCT category)::int as total_categories FROM amenities",
      );
      const topCategoryRes = await t.oneOrNone(
        "SELECT category FROM amenities GROUP BY category ORDER BY COUNT(*) DESC LIMIT 1",
      );
      return {
        total: totalRes.total,
        totalCategories: totalCategoriesRes.total_categories,
        topCategory: topCategoryRes ? topCategoryRes.category : "N/A",
      };
    },
    (stats) => {
      res.status(200).json(stats);
    },
  );
}

export function getAmenityList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const searchName = req.query.name ? `%${req.query.name}%` : null;
  const filterCategory = req.query.category ? req.query.category : null;
  rlsWrapper(
    "list-amenities",
    req.user,
    async (t) => {
      let baseQuery = `FROM amenities WHERE 1=1`;
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (searchName) {
        baseQuery += ` AND name ILIKE $${paramIndex}`;
        queryParams.push(searchName);
        paramIndex++;
      }

      if (filterCategory) {
        baseQuery += ` AND category = $${paramIndex}`;
        queryParams.push(filterCategory);
        paramIndex++;
      }

      const dataQuery = `SELECT * ${baseQuery} ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit + 1, offset);

      const rawData = await t.any(dataQuery, queryParams);
      const hasNext = rawData.length > limit;
      const responseData = hasNext ? rawData.slice(0, limit) : rawData;

      return {
        response: responseData,
        hasNext: hasNext,
      };
    },
    (result) => {
      res.status(200).json(result);
    },
  );
}

export function editAmenity(req: Request, res: Response, next: NextFunction) {
  const originalName = req.params.name; //PK is name
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).send("Không có dữ liệu để cập nhật!");
  }

  rlsWrapper(
    "update-amenity",
    req.user,
    async (t) => {
      const setKeys = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");
      const values = Object.values(updateData);

      const query = `UPDATE amenities SET ${setKeys} WHERE name = $1 RETURNING *`;
      return await t.oneOrNone(query, [originalName, ...values]);
    },
    (updatedAmenity) => {
      if (!updatedAmenity) {
        return res.status(404).send("Không tìm thấy Amenity!");
      }
      res.status(200).json(updatedAmenity);
    },
  );
}

export function deleteAmenity(req: Request, res: Response, next: NextFunction) {
  const name = req.params.name;

  rlsWrapper(
    "delete-amenity",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        "DELETE FROM amenities WHERE name=$1 RETURNING name",
        [name],
      );
    },
    (result) => {
      if (!result) {
        return res.status(404).send("Không tìm thấy Amenity hoặc đã bị xóa!");
      }
      res.status(200).send("Xóa Amenity thành công");
    },
  );
}
