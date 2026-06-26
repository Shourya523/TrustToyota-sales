import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const location = searchParams.get('location');
        const model = searchParams.get('model');

        // We will build conditions conditionally. Since drizzle raw sql template 
        // doesn't easily compose strings safely without sql`` helper blocks dynamically, 
        // we can construct a plain string query but it's better to stick to sql fragments or use raw with bind params.
        // Wait, Drizzle `sql` can be concatenated but it's tricky. Let's use parameters or just raw query text since it's read-only and no user input in table/column names.
        
        let conditions = `1=1`;
        if (month) conditions += ` AND "delivery_month" = '${month.replace(/'/g, "''")}'`;
        if (location) conditions += ` AND "Location" = '${location.replace(/'/g, "''")}'`;
        if (model) conditions += ` AND "Model" = '${model.replace(/'/g, "''")}'`;

        const [
            totalDeliveries,
            monthlySales,
            modelDistribution,
            topModels,
            locations,
            salesOfficers,
            colours,
            remarks,
            budgetSOSales,
            midSOSales,
            luxurySOSales,
            filterLists,
        ] = await Promise.all([
            db.execute(sql.raw(`
        SELECT COUNT(*)::int AS count
        FROM delivery_data_clean
        WHERE ${conditions}
      `)),
            db.execute(sql.raw(`
        SELECT
          "delivery_month" AS month,
          COUNT(*)::int AS sales
        FROM delivery_data_clean
        WHERE "delivery_month" IS NOT NULL AND "delivery_month" != '' AND ${conditions}
        GROUP BY "delivery_month"
        ORDER BY MIN(TO_DATE("Date of Delivery", 'DD-Mon-YY'))
      `)),
            db.execute(sql.raw(`
        SELECT
          "Model" AS model,
          COUNT(*)::int AS count
        FROM delivery_data_clean
        WHERE "Model" IS NOT NULL AND "Model" != '' AND ${conditions}
        GROUP BY "Model"
        ORDER BY count DESC
      `)),
            db.execute(sql.raw(`
        SELECT
          "Model" AS model,
          COUNT(*)::int AS sold
        FROM delivery_data_clean
        WHERE "Model" IS NOT NULL AND "Model" != '' AND ${conditions}
        GROUP BY "Model"
        ORDER BY sold DESC
        LIMIT 10
      `)),
            db.execute(sql.raw(`
        SELECT
          "Location" AS location,
          COUNT(*)::int AS deliveries
        FROM delivery_data_clean
        WHERE "Location" IS NOT NULL AND "Location" != '' AND ${conditions}
        GROUP BY "Location"
        ORDER BY deliveries DESC
        LIMIT 10
      `)),
            db.execute(sql.raw(`
        SELECT
          "SO" AS sales_officer,
          COUNT(*)::int AS deliveries
        FROM delivery_data_clean
        WHERE "SO" IS NOT NULL AND "SO" != '' AND ${conditions}
        GROUP BY "SO"
        ORDER BY deliveries DESC
        LIMIT 10
      `)),
            db.execute(sql.raw(`
        SELECT
          "Colour" AS colour,
          COUNT(*)::int AS count
        FROM delivery_data_clean
        WHERE "Colour" IS NOT NULL AND "Colour" != '' AND ${conditions}
        GROUP BY "Colour"
        ORDER BY count DESC
      `)),
            db.execute(sql.raw(`
        SELECT
          "Remark" AS remark,
          COUNT(*)::int AS count
        FROM delivery_data_clean
        WHERE "Remark" IS NOT NULL AND "Remark" != '' AND ${conditions}
        GROUP BY "Remark"
        ORDER BY count DESC
      `)),
            db.execute(sql.raw(`
        SELECT
          "SO" AS sales_officer,
          COUNT(*)::int AS deliveries
        FROM delivery_data_clean
        WHERE "SO" IS NOT NULL AND "SO" != '' AND ${conditions}
        AND "Model" IN ('Glanza', 'Glanza MT', 'Glanza AMT', 'Glanza CNG', 'Taisor NT', 'Taisor T', 'Taisor CNG', 'Rumion', 'Rumion P', 'Rumion CNG')
        GROUP BY "SO"
        ORDER BY deliveries DESC
      `)),
            db.execute(sql.raw(`
        SELECT
          "SO" AS sales_officer,
          COUNT(*)::int AS deliveries
        FROM delivery_data_clean
        WHERE "SO" IS NOT NULL AND "SO" != '' AND ${conditions}
        AND "Model" IN ('Hyryder NH', 'Hyrdyer NH', 'Hyryder H', 'Hyrdyer H', 'Hyryder CNG', 'Hyrdyer CNG', 'Innova D', 'Hycross H', 'Hycross P', 'Hilux')
        GROUP BY "SO"
        ORDER BY deliveries DESC
      `)),
            db.execute(sql.raw(`
        SELECT
          "SO" AS sales_officer,
          COUNT(*)::int AS deliveries
        FROM delivery_data_clean
        WHERE "SO" IS NOT NULL AND "SO" != '' AND ${conditions}
        AND "Model" IN ('Fortuner', 'Legender', 'Camry', 'Vellfire', 'LC300')
        GROUP BY "SO"
        ORDER BY deliveries DESC
      `)),
            // Get all months, locations, and models for the dropdowns (unfiltered)
            db.execute(sql`
        SELECT 
          ARRAY(SELECT "delivery_month" FROM delivery_data_clean WHERE "delivery_month" IS NOT NULL AND "delivery_month" != '' GROUP BY "delivery_month" ORDER BY MIN(TO_DATE("Date of Delivery", 'DD-Mon-YY'))) as months,
          ARRAY(SELECT DISTINCT "Location" FROM delivery_data_clean WHERE "Location" IS NOT NULL AND "Location" != '') as locations,
          ARRAY(SELECT DISTINCT "Model" FROM delivery_data_clean WHERE "Model" IS NOT NULL AND "Model" != '') as models
      `),
        ]);

        const total = Number(totalDeliveries.rows[0]?.count ?? 0);
        const topModelObj = topModels.rows[0];
        const topLocObj = locations.rows[0];
        const topColourObj = colours.rows[0];
        const topSOObj = salesOfficers.rows[0];
        
        const filterData = filterLists.rows[0] as { months: string[], locations: string[], models: string[] };

        const insights = [
            total > 0 && topModelObj ? `**${topModelObj.model}** is the best-selling model, driving **${Math.round((Number(topModelObj.sold)) / total * 100)}%** of volume.` : null,
            total > 0 && topLocObj ? `**${topLocObj.location}** contributed **${Math.round((Number(topLocObj.deliveries)) / total * 100)}%** of total deliveries.` : null,
            topColourObj ? `**${topColourObj.colour}** is the most preferred vehicle colour.` : null,
            total > 0 && topSOObj ? `**${topSOObj.sales_officer}** generated **${Math.round((Number(topSOObj.deliveries)) / total * 100)}%** of total deliveries.` : null,
        ].filter(Boolean);

        return Response.json({
            kpis: {
                totalDeliveries: total,
            },
            monthlySales: monthlySales.rows,
            modelDistribution: modelDistribution.rows,
            topModels: topModels.rows,
            locations: locations.rows,
            salesOfficers: salesOfficers.rows,
            colours: colours.rows,
            remarks: remarks.rows,
            budgetSOSales: budgetSOSales.rows,
            midSOSales: midSOSales.rows,
            luxurySOSales: luxurySOSales.rows,
            insights,
            filterLists: filterData
        });
    } catch (err) {
        console.error("Dashboard API Error:", err);
        return Response.json(
            { message: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
