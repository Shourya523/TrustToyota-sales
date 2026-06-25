import { db } from '@/db'
import { tool } from 'ai'
import { sql } from 'drizzle-orm'
import { z } from 'zod'

export function getAgentTools() {
    return {
        executeSql: tool({
            description: "Execute read-only sql queries on delivery_data_clean table",
            inputSchema: z.object({ query: z.string() }),
            execute: async ({ query }) => {
                if (!query.trim().toLowerCase().startsWith("select")) {
                    throw new Error("Only select queries are allowed")
                }
                try {
                    const result = await db.execute(sql.raw(query));
                    return result.rows;
                } catch (err: any) {
                    console.error("SQL Error:", err);
                    return { error: err.message, detail: err.detail || err.cause?.message || "Unknown SQL error" };
                }
            }
        }),
        getSchema: tool({
            description: "Get delivery_data_clean schema. ALWAYS call this first.",
            inputSchema: z.object({
                confirm: z.boolean().describe("Always pass true")
            }),
            execute: async () => {
                return {
                    table: "delivery_data_clean",
                    columns: [
                        "id",
                        "Name of Customer",
                        "Model",
                        "Vin No.",
                        "Suffix",
                        "Colour",
                        "Payment Received",
                        "Date of Delivery",
                        "Location",
                        "SO",
                        "Remark",
                        "RTO",
                        "Perm reg RTO",
                        "Documents Handover",
                        "Temp Reg",
                        "Perm Reg",
                        "Refund",
                        "Pending Accessories",
                        "Toyota Connect App",
                        "delivery_month"
                    ]
                }
            }
        }),
        getChartTool: tool({
            description: "Call this when the user asks for a chart, graph, or visual. Do NOT call executeSql first! Provide the SQL query directly to this tool and it will fetch the data and render the chart.",
            inputSchema: z.object({
                query: z.string().describe("The SQL query to fetch data for the chart"),
                type: z.enum(["bar", "line", "pie", "area"]).describe("Chart type"),
                title: z.string().describe("Chart title"),
                xKey: z.string().describe("The column name to use for X axis or labels"),
                yKey: z.string().describe("The column name to use for Y axis or values"),
            }),
            execute: async ({ query, type, title, xKey, yKey }) => {
                if (!query.trim().toLowerCase().startsWith("select")) {
                    throw new Error("Only select queries are allowed");
                }
                try {
                    const result = await db.execute(sql.raw(query));
                    return { chartConfig: { type, title, data: result.rows, xKey, yKey } };
                } catch (err: any) {
                    console.error("SQL Error in Chart Tool:", err);
                    return { error: err.message, detail: err.detail || err.cause?.message || "Unknown SQL error" };
                }
            }
        }),
        predictTrend: tool({
            description: "Predict future values based on historical data using Linear Regression. Call this when the user asks for advanced forecasts (e.g., 'predict next month deliveries' or 'forecast revenue').",
            inputSchema: z.object({
                query: z.string().describe("A SQL query that MUST return exactly two columns: the first column as a time label (e.g. month name), and the second column as a numeric value to predict. MUST be ordered chronologically."),
                predictPeriods: z.number().optional().describe("How many future periods to predict (e.g., 1 for next month, 3 for next quarter). Defaults to 1."),
            }),
            execute: async ({ query, predictPeriods = 1 }) => {
                try {
                    const result = await db.execute(sql.raw(query));
                    if (result.rows.length < 2) return { error: "Not enough historical data points for prediction." };
                    
                    const keys = Object.keys(result.rows[0]);
                    const yKey = keys[1];
                    
                    // Simple Linear Regression
                    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
                    const n = result.rows.length;
                    
                    result.rows.forEach((row, idx) => {
                        const x = idx + 1;
                        const y = Number(row[yKey]);
                        sumX += x;
                        sumY += y;
                        sumXY += x * y;
                        sumX2 += x * x;
                    });
                    
                    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                    const intercept = (sumY - slope * sumX) / n;
                    
                    const predictions = [];
                    for (let i = 1; i <= predictPeriods; i++) {
                        const futureX = n + i;
                        const predictedY = Math.max(0, intercept + slope * futureX); // No negative sales
                        predictions.push({ 
                            period_offset: `+${i}`, 
                            predicted_value: Math.round(predictedY) 
                        });
                    }
                    
                    return { 
                        historical_data: result.rows,
                        trend_analysis: { slope: slope.toFixed(2), intercept: intercept.toFixed(2) },
                        predictions 
                    };
                } catch (err: any) {
                    console.error("Prediction Tool Error:", err);
                    return { error: err.message, detail: err.detail || err.cause?.message || "Unknown error" };
                }
            }
        })


    }
}
