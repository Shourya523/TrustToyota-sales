import "dotenv/config";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function main() {
    const models = await db.execute(sql`
        SELECT DISTINCT "Model" FROM delivery_data_clean WHERE "Model" IS NOT NULL AND "Model" != ''
    `);
    console.log(models.rows.map(r => r.Model));
}

main().catch(console.error);
