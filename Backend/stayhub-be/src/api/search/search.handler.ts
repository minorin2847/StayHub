import type { Request, Response, NextFunction } from "express";

import type { SearchResult } from "./search.js";
import db from "@/database/db.js";

export async function searchRooms(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      minPrice,
      maxPrice,
      minAvailableRoom,
      minBedCount,
      minSize,
      maxSize,
      minReviewScore,
      classification,
      amenities,
      abbreviation,
      sortBy,
      page,
    } = req.query;

    let parsedAmenities: string[] | null = null;
    if (Array.isArray(amenities)) {
    parsedAmenities = (amenities as string[]).map((a) => a.trim());
    } else if (typeof amenities === "string") {
    // Fallback just in case a client sends it as a comma-separated string
    parsedAmenities = amenities.split(",").map((a) => a.trim());
    }
    const result = await db.manyOrNone<SearchResult>(
      `SELECT * FROM search_by_page(
        $(minPrice), 
        $(maxPrice), 
        $(minAvailableRoom), 
        $(minBedCount),
        $(minSize), 
        $(maxSize), 
        $(minReviewScore), 
        $(classification), 
        $(amenities),
        $(city_abbreviation),
        $(sortBy), 
        $(page)
      )`,
      {
        minPrice: minPrice ? parseInt(minPrice as string, 10) : null,
        maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : null,
        minAvailableRoom: minAvailableRoom ? parseInt(minAvailableRoom as string, 10) : null,
        minBedCount: minBedCount ? parseInt(minBedCount as string, 10) : null,
        minSize: minSize ? parseInt(minSize as string, 10) : null,
        maxSize: maxSize ? parseInt(maxSize as string, 10) : null,
        minReviewScore: minReviewScore ? parseFloat(minReviewScore as string) : null,
        classification: classification ? parseInt(classification as string, 10) : null,
        // Convert comma-separated string to text array for PostgreSQL
        amenities: parsedAmenities,
        city_abbreviation: abbreviation ? abbreviation as string : null,
        sortBy: sortBy ?? "highest_review",
        page: page ? parseInt(page as string, 10) : 1,
      }
    );

    // Extract the shared metadata from the first row and strip it from the list
    const hasNext = result.length > 0 ? result[0]?.has_next : false;
    const priceRange = result.length > 0 ? result[0]?.pricerange : [];
    
    const response = result.map(({ has_next, pricerange, ...data }) => data);

    res.status(200).json({
      hasNext: !!hasNext,
      priceRange: priceRange,
      response: response,
    });

  } catch (error) {
    console.error("Error executing searchRooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
    next(error);
  }
}