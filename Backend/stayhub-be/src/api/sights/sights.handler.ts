import db from "@/database/db.js";
import type { Request, Response } from "express";

const topSights = [
  "Vịnh Hạ Long", 
  "Hồ Gươm", 
  "Tràng An", 
  "Fansipan", 
  "Cao nguyên Mộc Châu"
];

export const getTopSights = async (req: Request, res: Response) => {
  try {
    // Sử dụng = ANY($1) thay vì IN $1 để map mảng chuẩn xác trong PostgreSQL
    const query = "SELECT * FROM vw_landmark_lowest_prices WHERE landmark_name = ANY($1)";
    
    // Đảm bảo truyền biến topSights dưới dạng một phần tử của mảng param
    const data = await db.any(query, [topSights]); 
    
    return res.status(200).json(data);
  } catch (error) {
    // Ghi log chi tiết lỗi ở Backend để dễ debug
    console.error("Error fetching top sights:", error);
    
    // Trả về một message chung chung cho Frontend để bảo mật Database
    return res.status(500).json({ error: "Internal Server Error" });
  }
};