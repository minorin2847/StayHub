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

    const formattedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,  
      description: item.description, 
      category: item.category,
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Lỗi lấy destinations:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};