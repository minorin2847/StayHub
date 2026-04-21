import db from "@/database/db.js";
import type { NextFunction, Request, Response } from "express";
import Amenity from "./amenity.js";
import rlsWrapper from "@/utils/rlsWrapper.js";

// Helper to find Amenity
export async function findAmenityByName(name: string): Promise<Amenity | null> {
  const amenity = await db.oneOrNone(
    "SELECT * FROM amenities WHERE name = $1",
    [name],
  );
  return amenity ? new Amenity(amenity) : null;
}

// 1. API: Stats
export function getAmenityStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  rlsWrapper(
    "get-amenity-stats",
    req.user,
    async (t) => {
      const totalRes = await t.one(
        "SELECT COUNT(*)::int as total FROM amenities",
      );
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
    (stats) => res.status(200).json(stats),
  );
}

// 2. API: List (Using SQL Function)
export function getAmenityList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const page = parseInt(req.query.page as string) || 1;
  const name = (req.query.name as string) || null;
  const category = (req.query.category as string) || null;
  const sortColumn = (req.query.sort as string) || "name";
  const sortDir = (req.query.order as string) || "ASC";
  const excludeCurrent = req.query.excludeCurrent === 'true';
  const minCount = req.query.minCount ? parseInt(req.query.minCount as string) : 0;
  const maxCount = req.query.maxCount ? parseInt(req.query.maxCount as string) : 1000;

  rlsWrapper(
    "list-amenities",
    req.user,
    async (t) => {
      const rawData = await t.any(
        `SELECT * FROM get_amenities_by_page($(name), $(category), $(excludeId), $(minCount), $(maxCount), $(sort), $(order), $(page))`,
        {
            name, category, 
            excludeId: excludeCurrent ? req.user.hotelid : null, 
            minCount, maxCount, 
            sort: sortColumn, order: sortDir, page
        }
      );

      const hasNext = rawData.length > 0 ? rawData[0].has_next : false;
      const response = rawData.map(({ has_next, ...rest }) => rest);

      return { response, hasNext };
    },
    (result) => res.status(200).json(result),
  );
}

// 3. API: Create
export function createAmenity(req: Request, res: Response, next: NextFunction) {
  const { name, icon, category } = req.body;

  if (!name || !icon || !category) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập đủ thông tin (name, icon, category)!" });
  }

  db.oneOrNone("SELECT name FROM amenities WHERE name = $1", [name])
    .then((existingAmenity) => {
      if (existingAmenity) {
        return res.status(409).send("Amenity đã tồn tại!");
      }

      rlsWrapper(
        "create-amenity",
        req.user,
        async (t) => {
          const amenity = await t.one(
            `INSERT INTO amenities(name, icon, category) 
             VALUES ($(name), $(icon), $(category)) 
             RETURNING name, icon, category`,
            { name, icon, category },
          );
          return new Amenity(amenity);
        },
        (newAmenity) => res.status(200).json(newAmenity),
      );
    })
    .catch((err) => next(err));
}

// 4. API: Update
export function editAmenity(req: Request, res: Response, next: NextFunction) {
  const originalName = req.params.name;
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).send("Không có dữ liệu để cập nhật!");
  }

  rlsWrapper(
    "update-amenity",
    req.user,
    async (t) => {
      const setKeys = Object.keys(updateData)
        .map((key, index) => `"${key}" = $${index + 2}`)
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

// 5. API: Delete
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
        return res.status(404).send("Lỗi xóa amenity!");
      }
      res.status(200).send("Xóa thành công");
    },
  );
}

// 6. API: Get Hotel Amenities
export function getHotelAmenities(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const page = parseInt(req.query.page as string) || 1;
  const name = (req.query.name as string) || null;
  const category = (req.query.category as string) || null;
  const sortColumn = (req.query.sort as string) || "name";
  const sortDir = (req.query.order as string) || "ASC";

  rlsWrapper(
    "list-hotel-amenities",
    req.user,
    async (t) => {
      const rawData = await t.any(
        `SELECT * FROM get_hotel_amenities_by_page($(hotelid), $(name), $(category), $(sort), $(order), $(page))`,
        {
            hotelid: req.user.hotelid,
            name, category, sort: sortColumn, order: sortDir, page
        }
      );

      const hasNext = rawData.length > 0 ? rawData[0].has_next : false;
      const response = rawData.map(({ has_next, ...rest }) => rest);

      return { response, hasNext };
    },
    (result) => res.status(200).json(result),
  );
}

// 7. API: Insert Amenity To Hotel
export async function insertAmenityToHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name } = req.body;
  rlsWrapper(
    "insert-amenity-to-hotel",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        `
                INSERT INTO hotel_amenities(hotelid, amenity_name) \
                VALUES ($(hotelid), $(name)) \
                ON CONFLICT (hotelid, amenity_name) DO NOTHING \
                RETURNING hotelid, amenity_name
                `,
        {
          hotelid: req.user.hotelid,
          name: name,
        }
      );
    },
    (result) => {
      if (!result)
        return res.status(409).send("Amenity already exists for the hotel!");
      return res.status(200).json(result);
    },
  );
}

// 8. API: Remove Amenity From Hotel
export async function removeAmenityFromHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name } = req.params;
  rlsWrapper(
    "remove-amenity-from-hotel",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        `
                DELETE FROM hotel_amenities \
                WHERE hotelid=$(hotelid) AND amenity_name=$(name) \
                RETURNING hotelid, amenity_name
                `,
        {
          hotelid: req.user.hotelid,
          name: name,
        }
      );
    },
    (result) => {
      if (!result)
        return res.status(404).send("Amenity not found or already deleted from hotel!");
      return res.status(200).json(result);
    },
  );
}
