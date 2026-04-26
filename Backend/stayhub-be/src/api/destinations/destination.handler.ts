import db from "@/database/db.js";
import type { Request, Response } from "express";

// 1. Khai báo danh sách các điểm đến theo từng mùa/category
const seasonalPicks: Record<string, string[]> = {
  spring: ['Cao nguyên Mộc Châu', 'Tràng An', 'Văn Miếu - Quốc Tử Giám', 'Yên Tử', 'Đồi A1'],
  summer: ['Vịnh Hạ Long', 'Cầu Sông Hàn', 'Vịnh Nha Trang', 'Biển Cửa Lò', 'Biển Thiên Cầm'],
  autumn: ['Hồ Gươm', 'Thác Bản Giốc', 'Pù Luông', 'Đại Nội Huế', 'Hồ Xuân Hương'],
  winter: ['Fansipan', 'Mẫu Sơn', 'Bến Nhà Rồng', 'Tòa Thánh Cao Đài', 'Mũi Cà Mau']
};

export const getDestinations = async (req: Request, res: Response) => {
  try {
    // Ép kiểu category về string và chuyển thành chữ thường (ví dụ: 'Spring' -> 'spring')
    const category = typeof req.query.category === 'string' ? req.query.category.toLowerCase() : undefined;
    
    let query = "SELECT * FROM vw_landmark_lowest_prices";
    let params: any[] = [];

    // Nếu client có truyền category lên
    if (category) {
      const targets = seasonalPicks[category];

      // Nếu category hợp lệ và có danh sách đi kèm
      if (targets && targets.length > 0) {
        // Dùng ANY($1) để tìm các cột có giá trị nằm trong mảng targets
        query += " WHERE landmark_name = ANY($1)"; 
        params.push(targets);
      } else {
        // Nếu truyền category linh tinh (ví dụ: ?category=hahalol), trả về mảng rỗng luôn
        return res.status(200).json([]);
      }
    }

    // Thực thi query với db.any (của thư viện pg-promise)
    const data = await db.any(query, params);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};