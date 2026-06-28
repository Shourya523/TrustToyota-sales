// For now, this is a mock implementation of Semantic and Example Retrievers.
// In a full production setup, this would query a Vector Database (like pgvector or Pinecone) using embeddings.

export async function retrieveSemantics(query: string): Promise<string> {
    console.log("[Pipeline] Retrieving Semantic Context for:", query);
    
    // Mock business logic rules
    return `
Business Semantics & Metrics Definition:
- 'Growth' or 'Growth Percentage' is calculated as ((current_month - previous_month) / previous_month) * 100.
- 'Average Monthly' or 'Avg / Month' is calculated as the total deliveries divided by the number of active months for that entity.
- 'SO' stands for Sales Officer.
- 'Location' refers to the Showroom location.
- 'Model' refers to the vehicle model (e.g., 'Glanza', 'Urban Cruiser Taisor').
    `.trim();
}

export async function retrieveExamples(query: string): Promise<string> {
    console.log("[Pipeline] Retrieving Few-Shot Examples for:", query);

    // Mock few-shot SQL examples
    return `
Few-Shot Examples:

Question: "Which showroom had the highest deliveries last month?"
SQL: SELECT "Location", COUNT(*) as deliveries FROM delivery_data_clean WHERE delivery_month = (SELECT MAX(delivery_month) FROM delivery_data_clean) GROUP BY "Location" ORDER BY deliveries DESC LIMIT 1;

Question: "What is the top selling model across all locations?"
SQL: SELECT "Model", COUNT(*) as count FROM delivery_data_clean GROUP BY "Model" ORDER BY count DESC LIMIT 1;

Question: "Show me the average vehicles sold per month by Pranav"
SQL: SELECT "SO", COUNT(*)::float / COUNT(DISTINCT delivery_month) as avg_monthly FROM delivery_data_clean WHERE "SO" ILIKE '%Pranav%' GROUP BY "SO";
    `.trim();
}
