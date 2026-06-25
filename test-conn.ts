import "dotenv/config";
import { db } from "./db";
import { deliveries } from "./db/schema";

async function main() {
    console.log(process.env.DATABASE_URL);

    const data = await db.select().from(deliveries);
    console.log(data);
}

main().catch(console.error);