import db from "@/database/db.js";
import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import Hotel from "./hotels.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import path from "node:path";
import { supabaseAdmin } from "../../utils/initializeSession.js";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function getHotels(req: Request, res: Response, next: NextFunction) {
    const { branchid } = req.params;

    rlsWrapper(
        "get-hotels-list",
        req.user,
        async (t) => {
            // If branchid exists, we filter by it. 
            // If the user is a MANAGE_BRANCH who tries to access a different branchid, 
            // the RLS policy will automatically return an empty array.
            if (branchid) {
                return await t.map(
                    "SELECT * FROM hotels WHERE branchid = $1", 
                    [branchid], 
                    (row: any) => new Hotel(row)
                );
            }

            // Global fetch - RLS will still restrict this to only 
            // the hotels the user is allowed to see.
            return await t.map(
                "SELECT * FROM hotels", 
                [], 
                (row: any) => new Hotel(row)
            );
        },
        (hotels) => {
            res.status(200).json(hotels);
        }
    );
}

export async function createHotel(req: Request, res: Response, next: NextFunction) {
  const salt = crypto.randomBytes(16);
  const {
    name,
    branchid,
    location,
    contact_email,
    contact_phone,
    classification,
    description,
  } = req.body;

  if (!name || !location) {
    return res.status(400).json({ message: "Vui lòng nhập đủ thông tin bắt buộc!" });
  }

  // Enforce branchid based on user role
  const user = (req as any).user;
  const isOnlyBranchManager = user && user.roles.some((r: any) => r.name === 'MANAGE_BRANCH') && !user.roles.some((r: any) => r.name === 'ADMINISTRATOR');
  // If the user's highest role is branch manager, force the branch ID to theirs!
  const effectiveBranchId = isOnlyBranchManager ? user.branchid : (branchid || null);

  try {
    const hotel = await db.one(
      `INSERT INTO hotels (name, classification, description, branchid, location, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, classification, branchid, location, contact_email, contact_phone`,
      [
        name,
        classification || 0,
        description || '',
        effectiveBranchId,
        location,
        contact_email || null,
        contact_phone || null,
      ]
    );
    res.status(200).json({ message: "Created successfully", hotel });
  } catch (error) {
    next(error);
  }
}

export async function updateHotel(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const {
    name,
    branchid,
    location,
    contact_email,
    contact_phone,
    classification,
    description,
  } = req.body;

  // Enforce branchid based on user role
  const user = (req as any).user;
  const isOnlyBranchManager = user && user.roles.some((r: any) => r.name === 'MANAGE_BRANCH') && !user.roles.some((r: any) => r.name === 'ADMINISTRATOR');
  // If the user's highest role is branch manager, force the branch ID to theirs!
  const effectiveBranchId = isOnlyBranchManager ? user.branchid : (branchid || null);

  try {
    const hotel = await db.oneOrNone(
      `UPDATE hotels 
       SET name = $1, branchid = $2, location = $3, contact_email = $4, contact_phone = $5, classification = $6, description = $7
       WHERE id = $8 
       RETURNING id, name, branchid, location, classification, contact_email, contact_phone`,
      [
        name,
        effectiveBranchId,
        location,
        contact_email || null,
        contact_phone || null,
        classification || 0,
        description || '',
        id,
      ]
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({ message: "Updated successfully", hotel });
  } catch (error) {
    next(error);
  }
}

export async function deleteHotel(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    await db.none("DELETE FROM hotels WHERE id = $1", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
}


export async function uploadHotelImage(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const file = (req as any).file as Express.Multer.File | undefined;
    const hotelIdParam = req.params.hotelId;
    const hotelId = Number(hotelIdParam || user?.hotelid);

    if (!file) {
      return res.status(400).json({ message: "Missing image file" });
    }

    if (!hotelId || Number.isNaN(hotelId)) {
      return res.status(400).json({ message: "Invalid hotelId" });
    }

    const ext = path.extname(file.originalname) || "";
    const baseName = path.basename(file.originalname, ext);
    const safeName = sanitizeFileName(baseName);
    const unique = crypto.randomUUID();
    const objectPath = `${hotelId}/${Date.now()}-${safeName}-${unique}${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("hotel-images")
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return next(uploadError);
    }

    await rlsWrapper(
      "insert-hotel-image",
      user,
      async (t) => {
        return await t.one(
          `
          INSERT INTO hotel_images (hotelid, imageurl)
          VALUES ($1, $2)
          RETURNING id, hotelid, imageurl
          `,
          [hotelId, uploadData.path]
        );
      },
      (row) => {
        res.status(201).json({
          message: "Upload images successfully",
          image: row,
        });
      }
    );
  } catch (error) {
    next(error);
  }
}