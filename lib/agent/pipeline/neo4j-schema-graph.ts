import neo4j, { Driver } from 'neo4j-driver';

const URI = process.env.NEO4J_URI || '';
const USER = process.env.NEO4J_USERNAME || '';
const PASSWORD = process.env.NEO4J_PASSWORD || '';
const DATABASE = process.env.NEO4J_DATABASE || 'neo4j';

let driverInstance: Driver | null = null;

export function getNeo4jDriver(): Driver {
    if (!driverInstance) {
        driverInstance = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    }
    return driverInstance;
}

export async function getGraphSchemaContext(): Promise<string> {
    const session = getNeo4jDriver().session({ database: DATABASE });
    
    try {
        // Query to get all node labels and their properties
        const nodeQuery = `
            CALL db.schema.nodeTypeProperties()
            YIELD nodeType, propertyName, propertyTypes
            RETURN nodeType, collect({property: propertyName, types: propertyTypes}) as properties
        `;
        
        // Query to get relationships between node types
        const relQuery = `
            CALL db.schema.relTypeProperties()
            YIELD relType
            RETURN relType
        `;
        
        // Let's just do a basic visualization-oriented query for schema
        const schemaQuery = `
            CALL db.schema.visualization()
            YIELD nodes, relationships
            RETURN nodes, relationships
        `;

        const result = await session.run(schemaQuery);
        
        if (result.records.length === 0) {
            return "No schema graph found in Neo4j.";
        }

        const record = result.records[0];
        const nodes = record.get('nodes');
        const relationships = record.get('relationships');

        let context = "Graph Schema:\\n";
        
        context += "Nodes:\\n";
        nodes.forEach((node: any) => {
            context += `- ${node.labels.join(', ')}\\n`;
        });

        context += "\\nRelationships:\\n";
        relationships.forEach((rel: any) => {
            const startNode = nodes.find((n: any) => n.identity.toString() === rel.start.toString());
            const endNode = nodes.find((n: any) => n.identity.toString() === rel.end.toString());
            if (startNode && endNode) {
                context += `- (${startNode.labels.join(', ')}) -[${rel.type}]-> (${endNode.labels.join(', ')})\\n`;
            }
        });

        console.log("[Pipeline] Fetched Neo4j Schema Graph context.");
        return context;
    } catch (err) {
        console.error("[Pipeline] Error fetching Neo4j schema context:", err);
        return "Failed to fetch schema graph.";
    } finally {
        await session.close();
    }
}
