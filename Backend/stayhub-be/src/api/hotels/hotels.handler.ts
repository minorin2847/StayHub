import db from "@/database/db.js";
import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import Hotel from "./hotels.js";




export async function getHotels(req: Request, res: Response, next: NextFunction) {
  const {branchid} = req.params;
  try {
    let hotels;
    if (branchid) {
      hotels = await db.map("SELECT * FROM hotels WHERE branchid = $1", [branchid], row => new Hotel(row));  
    }
    else {
      hotels = await db.map("SELECT * FROM hotels", [], row => new Hotel(row));
    }
    return res.status(200).json(hotels);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`There's a problem getting hotels:\n${error.stack}`)
    } else console.error("There's an unknown error getting hotels!")
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
    classification,
    description,
    password,
    previewimages,
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
      `INSERT INTO hotels (name, classification, description, branchid, location, previewimages, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, classification, branchid, location, previewimages, contact_email, contact_phone`,
      [
        name,
        classification || 0,
        description || '',
        effectiveBranchId,
        location,
        previewimages || [],
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
    previewimages,
  } = req.body;

  // Enforce branchid based on user role
  const user = (req as any).user;
  const isOnlyBranchManager = user && user.roles.some((r: any) => r.name === 'MANAGE_BRANCH') && !user.roles.some((r: any) => r.name === 'ADMINISTRATOR');
  // If the user's highest role is branch manager, force the branch ID to theirs!
  const effectiveBranchId = isOnlyBranchManager ? user.branchid : (branchid || null);

  try {
    const hotel = await db.oneOrNone(
      `UPDATE hotels 
       SET name = $1, branchid = $2, location = $3, contact_email = $4, contact_phone = $5, previewimages = $6, classification = $7, description = $8
       WHERE id = $9 
       RETURNING id, name, branchid, location, classification, contact_email, contact_phone`,
      [
        name,
        effectiveBranchId,
        location,
        contact_email || null,
        contact_phone || null,
        previewimages || [],
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