import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const res = await db.execute(sql`
            SELECT 
                "Location", 
                "SO", 
                "Model", 
                "delivery_month", 
                COUNT(*)::int AS count
            FROM delivery_data_clean
            WHERE "Location" IS NOT NULL AND "Location" != ''
            GROUP BY "Location", "SO", "Model", "delivery_month"
        `);

        // Data structures
        const locData = new Map<string, {
            totalDeliveries: number;
            sos: Record<string, number>;
            models: Record<string, number>;
            months: Record<string, number>;
        }>();

        const allMonths = new Set<string>();

        // Aggregate
        for (const row of res.rows) {
            const location = String(row.Location);
            const so = String(row.SO);
            const model = String(row.Model);
            const month = String(row.delivery_month);
            const count = Number(row.count);

            if (!locData.has(location)) {
                locData.set(location, { totalDeliveries: 0, sos: {}, models: {}, months: {} });
            }

            const data = locData.get(location)!;
            data.totalDeliveries += count;
            data.sos[so] = (data.sos[so] || 0) + count;
            data.models[model] = (data.models[model] || 0) + count;
            data.months[month] = (data.months[month] || 0) + count;
            allMonths.add(month);
        }

        const sortedMonths = Array.from(allMonths)
            .filter(Boolean)
            .sort((a, b) => new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime());
        
        const latestMonth = sortedMonths[0];
        const prevMonth = sortedMonths[1];

        // Format for UI
        const showroomCards = Array.from(locData.entries()).map(([location, data]) => {
            const topModels = Object.entries(data.models)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(m => m[0]);
            
            const topSO = Object.entries(data.sos).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
            
            let growth = 0;
            if (latestMonth && prevMonth) {
                const latestSales = data.months[latestMonth] || 0;
                const prevSales = data.months[prevMonth] || 0;
                if (prevSales > 0) {
                    growth = Math.round(((latestSales - prevSales) / prevSales) * 100);
                } else if (latestSales > 0) {
                    growth = 100;
                }
            }

            return {
                name: location,
                deliveries: data.totalDeliveries,
                topModels,
                topSO,
                growth
            };
        });

        // Rank them
        showroomCards.sort((a, b) => b.deliveries - a.deliveries);
        showroomCards.forEach((card, idx) => {
            (card as any).rank = idx + 1;
        });

        return Response.json({ showrooms: showroomCards });
    } catch (err) {
        console.error("Showrooms API Error:", err);
        return Response.json(
            { message: "Failed to fetch showroom data" },
            { status: 500 }
        );
    }
}
