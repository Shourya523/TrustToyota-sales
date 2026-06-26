import "dotenv/config";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function run() {
    let conditions = `1=1`;
    try {
        console.log("Running SQL queries...");
        const res = await db.execute(sql.raw(`
            SELECT COUNT(*)::int AS count
            FROM delivery_data_clean
            WHERE ${conditions}
        `));
        console.log("Count:", res.rows[0]);
        
        const filterLists = await db.execute(sql`
        SELECT 
          ARRAY(SELECT DISTINCT "delivery_month" FROM delivery_data_clean WHERE "delivery_month" IS NOT NULL AND "delivery_month" != '' ORDER BY MIN(TO_DATE("Date of Delivery", 'DD-Mon-YY'))) as months,
          ARRAY(SELECT DISTINCT "Location" FROM delivery_data_clean WHERE "Location" IS NOT NULL AND "Location" != '') as locations,
          ARRAY(SELECT DISTINCT "Model" FROM delivery_data_clean WHERE "Model" IS NOT NULL AND "Model" != '') as models
      `);
        console.log("Filter Lists:", filterLists.rows[0]);
    } catch(e) {
        console.error("DB Error:", e);
    }
}
run();
