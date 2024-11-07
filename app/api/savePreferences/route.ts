import { NextResponse } from 'next/server';
import driver from '../neo4j';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET;

interface JwtPayloadWithUserId extends jwt.JwtPayload {
  userId: string | number;
}

export async function POST(request: Request) {
  const session = driver.session();

  try {
    const { preferences } = await request.json();

    // Get the token from the HTTP-only cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId;
    try {
      if (!process.env.SECRET_KEY) {
        throw new Error('SECRET_KEY is not defined');
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayloadWithUserId;
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create or update the user node and link preferences
    await session.run(
      'MERGE (u:User {userId: $userId}) ' +
      'WITH u ' +
      'MERGE (p:Preferences {userId: $userId}) ' +
      'SET p.occasionChoices = $occasionChoices, ' +
      'p.colorPaletteChoices = $colorPaletteChoices, ' +
      'p.designChoices = $designChoices, ' +
      'p.fitChoices = $fitChoices, ' +
      'p.fabricChoices = $fabricChoices ' +
      'MERGE (u)-[:HAS_PREFERENCES]->(p)',
      {
        userId,
        occasionChoices: preferences[0],
        colorPaletteChoices: preferences[1],
        designChoices: preferences[2],
        fitChoices: preferences[3],
        fabricChoices: preferences[4]
      }
    );

    // Check if the graph exists
    const graphExistsResult = await session.run(
      'CALL gds.graph.exists("kurta_graph") YIELD exists RETURN exists'
    );

    const graphExists = graphExistsResult.records[0].get('exists');

    // Drop the existing graph if it exists
    if (graphExists) {
      await session.run('CALL gds.graph.drop("kurta_graph")');
    }

    // Create the graph
    await session.run(
      'CALL gds.graph.project(' +
      '"kurta_graph", ' +
      '["User", "Kurta", "Preferences"], ' +
      '{ ' +
      'BUYS: {orientation: "UNDIRECTED"}, ' +
      'WISHLIST: {orientation: "UNDIRECTED"}, ' +
      'CART: {orientation: "UNDIRECTED"}, ' +
      'HAS_PREFERENCES: {orientation: "UNDIRECTED"} ' +
      '})'
    );

    // Generate embeddings using FastRP (renamed mutateProperty to "new_embedding")
    await session.run(
      'CALL gds.fastRP.mutate("kurta_graph", { ' +
      'mutateProperty: "new_embedding", ' +  // Changed to "new_embedding"
      'embeddingDimension: 128, ' +
      'randomSeed: 42 ' +
      '})'
    );

    // Create similarity links using embeddings
    await session.run(
      'CALL gds.knn.write("kurta_graph", { ' +
      'nodeLabels: ["User"], ' +
      'relationshipTypes: ["BUYS", "WISHLIST", "CART"], ' +
      'nodeProperties: ["new_embedding"], ' +  // Use "new_embedding"
      'writeRelationshipType: "SIMILAR_TO", ' +
      'writeProperty: "similarity", ' +
      'topK: 4, ' +
      'concurrency: 1, ' +
      'randomSeed: 42 ' +
      '})'
    );

    return NextResponse.json({ message: 'Preferences and purchases saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Error saving preferences' }, { status: 500 });
  } finally {
    await session.close();
  }
}
