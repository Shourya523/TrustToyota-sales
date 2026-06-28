import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Fetch raw grouped data to process in memory for complex metrics
        const res = await db.execute(sql`
            SELECT 
                "SO", 
                "Model", 
                "Location", 
                "delivery_month", 
                COUNT(*)::int AS count
            FROM delivery_data_clean
            WHERE "SO" IS NOT NULL AND "SO" != ''
            GROUP BY "SO", "Model", "Location", "delivery_month"
        `);

        // Data structures
        const soData = new Map<string, {
            totalDeliveries: number;
            models: Record<string, number>;
            locations: Record<string, number>;
            months: Record<string, number>;
        }>();

        const allMonths = new Set<string>();

        // Aggregate
        for (const row of res.rows) {
            const so = String(row.SO);
            const model = String(row.Model);
            const location = String(row.Location);
            const month = String(row.delivery_month);
            const count = Number(row.count);

            if (!soData.has(so)) {
                soData.set(so, { totalDeliveries: 0, models: {}, locations: {}, months: {} });
            }

            const data = soData.get(so)!;
            data.totalDeliveries += count;
            data.models[model] = (data.models[model] || 0) + count;
            data.locations[location] = (data.locations[location] || 0) + count;
            data.months[month] = (data.months[month] || 0) + count;
            allMonths.add(month);
        }

        // Sort months to find 'latest' vs 'previous'
        // Months format usually like "Oct-23", "Nov-23"
        // Since we don't have perfect dates, we'll just sort by total timeline or mock growth if unknown.
        // Actually, we can use JS Date parsing by prepending "1 ".
        const sortedMonths = Array.from(allMonths)
            .filter(Boolean)
            .sort((a, b) => new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime());
        
        const latestMonth = sortedMonths[0];
        const prevMonth = sortedMonths[1];

        // Format for UI
        const teamCards = Array.from(soData.entries()).map(([so, data]) => {
            // Top 3 Models
            const topModels = Object.entries(data.models)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(m => m[0]);
            
            // Top Location
            const topLocation = Object.entries(data.locations).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
            
            // Average Monthly
            let avgMonthly = 0;
            const numMonths = Object.keys(data.months).length;
            if (numMonths > 0) {
                avgMonthly = Math.round(data.totalDeliveries / numMonths);
            }

            return {
                name: so,
                deliveries: data.totalDeliveries,
                topModels,
                topLocation,
                avgMonthly
            };
        });

        // Rank them
        teamCards.sort((a, b) => b.deliveries - a.deliveries);
        teamCards.forEach((card, idx) => {
            (card as any).rank = idx + 1;
        });

        return Response.json({ team: teamCards });
    } catch (err) {
        console.error("Team API Error:", err);
        return Response.json(
            { message: "Failed to fetch team data" },
            { status: 500 }
        );
    }
}
