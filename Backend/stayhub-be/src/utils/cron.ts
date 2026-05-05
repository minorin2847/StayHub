import cron from "node-cron";
import db from "../database/db.js";

export const createBookingPartitions = async () => {
  try {
    const today = new Date();
    // Create partitions for current month, next month, and the month after
    for (let i = 0; i <= 2; i++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      
      const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + i + 1, 1);
      const nextYear = nextMonthDate.getFullYear();
      const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, "0");

      const partitionName = `booking_y${year}m${month}`;
      const startDate = `${year}-${month}-01`;
      const endDate = `${nextYear}-${nextMonth}-01`;

      // Check if table 'booking' exists and is a partitioned table to avoid errors during initial setup
      const isPartitioned = await db.oneOrNone(`
        SELECT relkind FROM pg_class WHERE relname = 'booking'
      `);

      if (isPartitioned && isPartitioned.relkind === 'p') {
        await db.none(`
          CREATE TABLE IF NOT EXISTS ${partitionName} 
          PARTITION OF booking 
          FOR VALUES FROM ('${startDate}') TO ('${endDate}');
        `);
      }
    }
  } catch (error) {
    console.error("Failed to create booking partitions:", error);
  }
};

export const initCronJobs = () => {
  // Check and create partitions on server start
  createBookingPartitions();

  // Run on the 1st of every month at midnight to ensure upcoming partitions exist
  cron.schedule("0 0 1 * *", () => {
    console.log("Running scheduled job: createBookingPartitions");
    createBookingPartitions();
  });
};
