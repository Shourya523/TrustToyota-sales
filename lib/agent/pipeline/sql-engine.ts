import { generateText } from '@/lib/agent/pipeline/model';
import { groq } from '@ai-sdk/groq';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const DELIVERIES_TABLE_SCHEMA = `
Target PostgreSQL Table:
Table Name: "delivery_data_clean"
Columns (MUST use double quotes for capitalization and spaces, e.g. "Name of Customer", "SO", "Model", "Vin No.", "Date of Delivery", "Payment Received", "Perm reg RTO"):
  - "id": SERIAL (Primary Key)
  - "Name of Customer": TEXT (Customer's name)
  - "Model": TEXT (Car model)
  - "Vin No.": TEXT (VIN number)
  - "Suffix": TEXT
  - "Colour": TEXT
  - "Payment Received": TEXT
  - "Date of Delivery": TEXT (Date string, e.g., "12-Oct-23")
  - "Location": TEXT (Showroom/dealership location)
  - "SO": TEXT (Sales Officer name)
  - "Remark": TEXT
  - "RTO": TEXT
  - "Perm reg RTO": INTEGER
  - "Documents Handover": INTEGER
  - "Temp Reg": INTEGER
  - "Perm Reg": INTEGER
  - "Refund": INTEGER
  - "Pending Accessories": INTEGER
  - "Toyota Connect App": INTEGER
  - "delivery_month": TEXT (e.g. "Oct-23")
`;

export async function generateSQL(
    query: string,
    plan: string,
    schemaGraph: string,
    errorFeedback?: string
): Promise<string> {
    const prompt = `User Question: "${query}"
    
Plan:
${plan}

Active Graph Schema:
${schemaGraph}

Database Schema (Target Table):
${DELIVERIES_TABLE_SCHEMA}

${errorFeedback ? `\nPREVIOUS ERROR TO FIX:\n${errorFeedback}\n` : ''}

Output ONLY valid PostgreSQL without markdown blocks or explanation. Use the exact table name ("delivery_data_clean") and exact cased column names from the Database Schema above. Remember: columns containing capital letters (like "SO", "Model", "Location", "Date of Delivery") MUST be double-quoted with their exact case.`;

    const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: `You are an expert PostgreSQL developer. You translate plans into optimized SQL queries. 
Always ignore NULL values when performing groupings, aggregations, or finding top categories (e.g., ensure "Location" IS NOT NULL, "SO" IS NOT NULL, etc. are used where appropriate). 
Date and Month Parsing Rules:
  - "delivery_month" uses format 'Mon-YY' (e.g., 'Oct-23'). Always use TO_DATE("delivery_month", 'Mon-YY') for sorting or parsing.
  - "Date of Delivery" uses format 'DD-Mon-YY' (e.g., '12-Oct-23'). Always use TO_DATE("Date of Delivery", 'DD-Mon-YY') for parsing. NEVER use 'MM-DD-YY' or 'YYYY-MM-DD'.
Output ONLY the raw SQL query string.`,
        prompt,
    });

    return text.replace(/```sql/gi, '').replace(/```/g, '').trim();
}

export async function executeWithRepair(
    query: string,
    plan: string,
    schemaGraph: string,
    maxRetries: number = 3
): Promise<{ data: any; finalSql: string }> {
    let currentSql = await generateSQL(query, plan, schemaGraph);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`[Pipeline] SQL Engine Attempt ${attempt}:`, currentSql);
        try {
            // Validator/Execute step
            const result = await db.execute(sql.raw(currentSql));
            console.log(`[Pipeline] SQL Execution Successful.`);
            return { data: result.rows, finalSql: currentSql };
        } catch (err: any) {
            console.error(`[Pipeline] SQL Execution Failed:`, err.message);
            if (attempt === maxRetries) {
                throw new Error(`Failed to execute SQL after ${maxRetries} attempts. Last error: ${err.message}`);
            }
            console.log(`[Pipeline] Repairing Query...`);
            currentSql = await generateSQL(query, plan, schemaGraph, err.message);
        }
    }
    
    throw new Error('Unexpected execution failure');
}
