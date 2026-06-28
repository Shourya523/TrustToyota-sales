import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Ensure custom_widgets table exists
async function ensureTableExists() {
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS custom_widgets (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                query TEXT NOT NULL,
                type TEXT NOT NULL,
                x_key TEXT NOT NULL,
                y_key TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
    } catch (e) {
        console.error("Failed to create custom_widgets table:", e);
    }
}

export async function GET() {
    await ensureTableExists();
    try {
        const res = await db.execute(sql`SELECT * FROM custom_widgets ORDER BY created_at DESC`);
        
        // For each widget, we also want to fetch its current live data!
        const liveWidgets = [];
        for (const widget of res.rows as any[]) {
            try {
                // Execute the stored SQL query to get real-time live data
                const dataRes = await db.execute(sql.raw(widget.query));
                
                // Clean the rows: cast numeric-looking strings to actual numbers
                const cleanedRows = dataRes.rows.map((row: any) => {
                    const cleaned: any = {};
                    for (const key of Object.keys(row)) {
                        const val = row[key];
                        if (typeof val === 'string' && /^\d+$/.test(val)) {
                            cleaned[key] = parseInt(val, 10);
                        } else if (typeof val === 'string' && /^\d+\.\d+$/.test(val)) {
                            cleaned[key] = parseFloat(val);
                        } else {
                            cleaned[key] = val;
                        }
                    }
                    return cleaned;
                });

                liveWidgets.push({
                    id: widget.id,
                    title: widget.title,
                    type: widget.type,
                    xKey: widget.x_key,
                    yKey: widget.y_key,
                    data: cleanedRows,
                    createdAt: widget.created_at
                });
            } catch (err: any) {
                console.error(`Failed to fetch data for widget: ${widget.title}`, err.message);
                // Still return the widget structure but with empty data
                liveWidgets.push({
                    id: widget.id,
                    title: widget.title,
                    type: widget.type,
                    xKey: widget.x_key,
                    yKey: widget.y_key,
                    data: [],
                    createdAt: widget.created_at,
                    error: err.message
                });
            }
        }

        return Response.json({ widgets: liveWidgets });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await ensureTableExists();
    try {
        const { title, query, type, xKey, yKey } = await req.json();

        if (!title || !query || !type || !xKey || !yKey) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        await db.execute(sql`
            INSERT INTO custom_widgets (title, query, type, x_key, y_key)
            VALUES (${title}, ${query}, ${type}, ${xKey}, ${yKey})
        `);

        return Response.json({ success: true });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await ensureTableExists();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
            await db.execute(sql`DELETE FROM custom_widgets WHERE id = ${Number(id)}`);
        } else {
            await db.execute(sql`DELETE FROM custom_widgets`);
        }

        return Response.json({ success: true });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
