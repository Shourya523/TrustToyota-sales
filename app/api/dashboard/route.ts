import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [
            totalDeliveries,
            monthlySales,
            modelDistribution,
            topModels,
            locations,
            salesOfficers,
            colours,
            remarks,
        ] = await Promise.all([
            db.execute(sql`
        SELECT COUNT(*)::int AS count
        FROM delivery_data_clean
      `),
            db.execute(sql`
        SELECT
          "delivery_month" AS month,
          COUNT(*)::int AS sales
        FROM delivery_data_clean
        WHERE "delivery_month" IS NOT NULL AND "delivery_month" != ''
        GROUP BY "delivery_month"
        ORDER BY MIN(TO_DATE("Date of Delivery", 'DD-Mon-YY'))
      `),

            db.execute(sql`
        SELECT
          "Model" AS model,
          COUNT(*)::int AS count
        FROM delivery_data_clean
        WHERE "Model" IS NOT NULL AND "Model" != ''
        GROUP BY "Model"
        ORDER BY count DESC
      `),

            db.execute(sql`
        SELECT
          "Model" AS model,
          COUNT(*)::int AS sold
        FROM delivery_data_clean
        WHERE "Model" IS NOT NULL AND "Model" != ''
        GROUP BY "Model"
        ORDER BY sold DESC
        LIMIT 10
      `),

            db.execute(sql`
        SELECT
          "Location" AS location,
          COUNT(*)::int AS deliveries
        FROM delivery_data_clean
        WHERE "Location" IS NOT NULL AND "Location" != ''
        GROUP BY "Location"
        ORDER BY deliveries DESC
        LIMIT 10
      `),

            db.execute(sql`
        SELECT
          "SO" AS sales_officer,
          COUNT(*)::int AS deliveries
        FROM delivery_data_clean
        WHERE "SO" IS NOT NULL AND "SO" != ''
        GROUP BY "SO"
        ORDER BY deliveries DESC
        LIMIT 10
      `),

            db.execute(sql`
        SELECT
          "Colour" AS colour,
          COUNT(*)::int AS count
        FROM delivery_data_clean
        WHERE "Colour" IS NOT NULL AND "Colour" != ''
        GROUP BY "Colour"
        ORDER BY count DESC
      `),

            db.execute(sql`
        SELECT
          "Remark" AS remark,
          COUNT(*)::int AS count
        FROM delivery_data_clean
        WHERE "Remark" IS NOT NULL AND "Remark" != ''
        GROUP BY "Remark"
        ORDER BY count DESC
      `),
        ]);

        return Response.json({
            kpis: {
                totalDeliveries: totalDeliveries.rows[0]?.count ?? 0,
            },
            monthlySales: monthlySales.rows,
            modelDistribution: modelDistribution.rows,
            topModels: topModels.rows,
            locations: locations.rows,
            salesOfficers: salesOfficers.rows,
            colours: colours.rows,
            remarks: remarks.rows,
        });
    } catch (err) {
        console.error("Dashboard API Error:", err);
        return Response.json(
            { message: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
