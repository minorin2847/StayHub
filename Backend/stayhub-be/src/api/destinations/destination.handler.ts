import db from "@/database/db.js";
import type { Request, Response } from "express";

export const getDestinations = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let query = "SELECT * FROM destinations";
    let params: any[] = [];

    if (category) {
      query += " WHERE category = $1"; 
      params.push(category);
    }

    const data = await db.any(query, params);

    
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500)
  }
};