import db from "@/database/db.js";
import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function hasPermission(role: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const requiredRole = await getRole(role);
            const roles = req.user.roles;
            if (roles.length===0) {
                throw new Error("Employee doesn't have any roles!");
            }
            for (const role of roles) {
                if (role.tier < requiredRole.tier || role.name == requiredRole.name) {
                    next();
                    return;
                }
            }
            res.status(401).send("Unauthorized!");
        } catch (err) {
            if (err instanceof Error) res.status(404).send(err.message);
            res.status(404).send("An unknown error occured!");
        }
    }
}


export async function getHotels(req: Request, res: Response, next: NextFunction) {
  try {
    const hotels = await db.any("SELECT id, name, classification, branchid, location, description, amenities, policies, previewimages, contact_email, contact_phone FROM hotels");
    return res.status(200).json({ response: hotels });
  } catch (error) {
    next(error);
  }
}

export async function createHotel(req: Request, res: Response, next: NextFunction) {
  const salt = crypto.randomBytes(16);
  const {
    name,
    branchid,
    location,
    contact_email,
    contact_phone,
    password,
    previewimages,
  } = req.body;

  if (!name || !location) {
    return res.status(400).json({ message: "Vui lòng nhập đủ thông tin bắt buộc!" });
  }

  try {
    crypto.pbkdf2(password || "123456", salt, 310000, 32, "sha256", async (err, hashed) => {
      if (err) return next(err);
      try {
        const hotel = await db.one(
          `INSERT INTO hotels (name, classification, branchid, location, previewimages, contact_email, contact_phone, salt, hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, name, classification, branchid, location, previewimages, contact_email, contact_phone`,
          [
            name,
            0, // Default classification
            branchid || null,
            location,
            previewimages || [],
            contact_email || null,
            contact_phone || null,
            salt,
            hashed,
          ]
        );
        res.status(200).json({ message: "Created successfully", hotel });
      } catch (dbError) {
        next(dbError);
      }
    });
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
    previewimages,
  } = req.body;

  try {
    const hotel = await db.oneOrNone(
      `UPDATE hotels 
       SET name = $1, branchid = $2, location = $3, contact_email = $4, contact_phone = $5, previewimages = $6
       WHERE id = $7 
       RETURNING id, name, branchid, location, contact_email, contact_phone`,
      [
        name,
        branchid || null,
        location,
        contact_email || null,
        contact_phone || null,
        previewimages || [],
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