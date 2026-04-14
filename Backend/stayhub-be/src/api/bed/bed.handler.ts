import db from "@/database/db.js";
import type { NextFunction, Request, Response } from "express";
import Bed from "./bed.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";

const bedColumns = new (pgPromise().helpers.ColumnSet)(
  [{ name: "name", skip: (c: any) => c.value === undefined }],
  {
    table: "beds",
  },
);

export async function findBedByName(name: string): Promise<Bed | null> {
  try {
    const bed = await db.oneOrNone(
      "SELECT * FROM beds WHERE name=$1",
      [name],
      (row) => new Bed(row),
    );
    if (!bed) throw new Error("Bed doesn't exist!");
    return bed;
  } catch (error) {
    console.error("Error while fetching bed by name!");
    return null;
  }
}

export async function getBeds(req: Request, res: Response, next: NextFunction) {
  try {
    const beds = await db.map("SELECT * FROM beds", [], (row) => new Bed(row));
    return res.status(200).json(beds);
  } catch (error) {
    console.log("Error while fetching beds");
    return res.status(500).send("Server error while fetching beds!");
  }
}

export async function addBeds(req: Request, res: Response, next: NextFunction) {
  const { name } = req.body;

  try {
    const bed = await findBedByName(name);
    if (bed) {
      return res.status(409).send("Bed already exists!");
    } else {
      const newBed = await db.one(
        "INSERT INTO beds(name) \
                VALUES ($(name)) \
                RETURNING name",
        {
          name: name,
        },
        (row) => new Bed(row),
      );

      return res.status(200).send("Bed created successfully!");
    }
  } catch (error) {
    console.error("Error while creating new bed!");
    return res.status(500).send("Error while creating new bed!");
  }
}

export async function editBed(req: Request, res: Response, next: NextFunction) {
  const { name } = req.params;
  const bedData = req.body;

  try {
    if (bedData.name) {
      const bed = await findBedByName(bedData);
      if (bed) {
        return res
          .status(409)
          .send(`Bed with name ${bedData.name} already exists!`);
      }
    }
    const query =
      (await pgPromise().helpers.update(bedData, bedColumns)) +
      pgPromise().as.format(" WHERE name=$1 RETURNING *", [name]);
    const newBed = await db.oneOrNone(query);
    if (!newBed) return res.status(404).send("Bed not found!");
    return res.status(200).json(newBed);
  } catch (error) {
    console.error("Error while editing bed!\n" + error.stack);
    return res.status(500).send("Error while editing bed!");
  }
}

export async function deleteBed(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name } = req.params;

  try {
    const bed = await db.oneOrNone(
      `
                DELETE FROM beds \
                WHERE name=$1 \
                RETURNING name
            `,
      [name],
    );
    if (!bed) return res.status(404).send("Bed not found or already deleted!");
    return res.status(200).json(bed);
  } catch (error) {
    console.error("Error while deleting bed!\n" + error.stack);
    return res.status(500).send("Error while deleting bed!");
  }
}

export async function insertBedToHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name } = req.body;
  rlsWrapper(
    "insert-bed-to-hotel",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        `
                INSERT INTO hotel_beds(hotelid, bed_name) \
                VALUES ($(hotelid), $(name)) \
                ON CONFLICT (hotelid, bed_name) DO NOTHING \
                RETURNING hotelid, bed_name
                `,
        {
          hotelid: req.user.hotelid,
          name: name,
        },
        (row: Partial<Bed>) => new Bed(row),
      );
    },
    (result) => {
      if (!result)
        return res.status(409).send("Bed already exists for the hotel!");
      return res.status(200).json(result);
    },
  );
}

export async function removeBedFromHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name } = req.params;
  rlsWrapper(
    "remove-bed-from-hotel",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        `
                DELETE FROM hotel_beds \
                WHERE hotelid=$(hotelid) AND bed_name=$(name) \
                RETURNING hotelid, bed_name
                `,
        {
          hotelid: req.user.hotelid,
          name: name,
        },
        (row: Partial<Bed>) => new Bed(row),
      );
    },
    (result) => {
      if (!result)
        return res.status(404).send("Bed not found or already deleted!");
      return res.status(200).json(result);
    },
  );
}
