import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [monthRes, modelRes, locRes, soRes] = await Promise.all([
            db.execute(sql`
                SELECT "delivery_month", COUNT(*)::int as count 
                FROM delivery_data_clean 
                WHERE "delivery_month" IS NOT NULL AND "delivery_month" != '' 
                GROUP BY "delivery_month"
            `),
            db.execute(sql`
                SELECT "delivery_month", "Model", COUNT(*)::int as count 
                FROM delivery_data_clean 
                WHERE "delivery_month" IS NOT NULL AND "delivery_month" != '' AND "Model" IS NOT NULL AND "Model" != '' 
                GROUP BY "delivery_month", "Model"
            `),
            db.execute(sql`
                SELECT "delivery_month", "Location", COUNT(*)::int as count 
                FROM delivery_data_clean 
                WHERE "delivery_month" IS NOT NULL AND "delivery_month" != '' AND "Location" IS NOT NULL AND "Location" != '' 
                GROUP BY "delivery_month", "Location"
            `),
            db.execute(sql`
                SELECT "delivery_month", "SO", COUNT(*)::int as count 
                FROM delivery_data_clean 
                WHERE "delivery_month" IS NOT NULL AND "delivery_month" != '' AND "SO" IS NOT NULL AND "SO" != '' 
                GROUP BY "delivery_month", "SO"
            `)
        ]);

        // Helper to sort months chronologically (assuming Format like "Mar-24")
        const sortMonths = (months: string[]) => {
            return months.sort((a, b) => new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime());
        };

        const allMonths = Array.from(new Set(monthRes.rows.map(r => String(r.delivery_month))));
        const sortedMonths = sortMonths(allMonths);
        
        const latestMonth = sortedMonths[0];
        const prevMonth = sortedMonths[1];

        // Overall Increase
        let increase = 0;
        let latestMonthName = latestMonth ? latestMonth.split('-')[0] : "Recent";
        if (latestMonth && prevMonth) {
            const latestSales = Number(monthRes.rows.find(r => r.delivery_month === latestMonth)?.count || 0);
            const prevSales = Number(monthRes.rows.find(r => r.delivery_month === prevMonth)?.count || 0);
            if (prevSales > 0) {
                increase = Math.round(((latestSales - prevSales) / prevSales) * 100);
            } else if (latestSales > 0) {
                increase = 100;
            }
        }

        // Find Drivers & Concerns by calculating Deltas
        const getDelta = (rows: any[], key: string) => {
            const entities = new Set(rows.map(r => String(r[key])));
            const deltas: { name: string, delta: number, latestCount: number }[] = [];
            
            for (const entity of entities) {
                const latestCount = Number(rows.find(r => String(r[key]) === entity && String(r.delivery_month) === latestMonth)?.count || 0);
                const prevCount = Number(rows.find(r => String(r[key]) === entity && String(r.delivery_month) === prevMonth)?.count || 0);
                deltas.push({ name: entity, delta: latestCount - prevCount, latestCount });
            }
            return deltas.sort((a, b) => b.delta - a.delta); // Highest delta first
        };

        const modelDeltas = getDelta(modelRes.rows, "Model");
        const locDeltas = getDelta(locRes.rows, "Location");
        const soDeltas = getDelta(soRes.rows, "SO");

        // Drivers = highest positive delta
        const drivenBy = [
            modelDeltas[0]?.delta > 0 ? modelDeltas[0].name : null,
            locDeltas[0]?.delta > 0 ? locDeltas[0].name : null,
            soDeltas[0]?.delta > 0 ? soDeltas[0].name : null
        ].filter(Boolean);

        // Concerns = lowest negative delta
        const areasOfConcern = [
            locDeltas[locDeltas.length - 1]?.delta < 0 ? locDeltas[locDeltas.length - 1].name : null,
            modelDeltas[modelDeltas.length - 1]?.delta < 0 ? modelDeltas[modelDeltas.length - 1].name + " deliveries" : null
        ].filter(Boolean);

        // Fallbacks if no concerns found (everything is growing)
        if (areasOfConcern.length === 0 && modelDeltas.length > 0) {
            // Just take the worst performing one even if positive
            areasOfConcern.push(modelDeltas[modelDeltas.length - 1].name + " lagging behind");
        }

        const performanceSummary = {
            monthName: latestMonthName,
            increase,
            drivenBy,
            areasOfConcern
        };

        // Forecast: 3-month trailing average
        const forecastMonths = sortedMonths.slice(0, 3);
        const uniqueModels = Array.from(new Set(modelRes.rows.map(r => String(r.Model))));
        
        const forecasts = uniqueModels.map(model => {
            let total = 0;
            let monthsWithData = 0;
            
            for (const month of forecastMonths) {
                const count = Number(modelRes.rows.find(r => String(r.Model) === model && String(r.delivery_month) === month)?.count || 0);
                total += count;
                monthsWithData++;
            }
            
            return {
                model,
                expected: monthsWithData > 0 ? Math.round(total / monthsWithData) : 0,
                // Get historical data points for a mini sparkline chart
                history: forecastMonths.reverse().map(month => ({
                    month,
                    count: Number(modelRes.rows.find(r => String(r.Model) === model && String(r.delivery_month) === month)?.count || 0)
                }))
            };
        }).sort((a, b) => b.expected - a.expected).slice(0, 5); // Top 5 models

        return Response.json({
            performanceSummary,
            forecasts
        });

    } catch (err) {
        console.error("Reports API Error:", err);
        return Response.json(
            { message: "Failed to fetch report data" },
            { status: 500 }
        );
    }
}
