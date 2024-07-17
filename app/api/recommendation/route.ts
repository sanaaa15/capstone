import { NextResponse } from 'next/server';
import driver from '../neo4j'; // Adjust the path as necessary
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import neo4j from 'neo4j-driver';

const SECRET_KEY = process.env.JWT_SECRET; // Use the same secret key as in login/route.ts

export async function POST(request: Request) {
  const session = driver.session();

  try {
    // Get the token from the HTTP-only cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(userId);
    const result = await session.run(
      `
      MATCH (u:User {userId: 9})
MATCH (u)-[:HAS_PREFERENCES]->(p:Preferences)
MATCH (u)-[:SIMILAR_TO]->(similar_user:User)
MATCH (similar_user)-[:BUYS|WISHLIST|CART]->(k:Kurta)
MATCH (u)-[:BUYS|WISHLIST|CART]->(z:Kurta)

// Collect user's preferences and similar users' kurta attributes
WITH u, 
     collect(DISTINCT z.color) AS user_colors,
     collect(DISTINCT z.fabric) AS user_fabrics,
     collect(DISTINCT z.designStyle) AS user_designs,
     collect(DISTINCT z.fit) AS user_fits,
     collect(DISTINCT z.sleeveStyle) AS user_sleeves,
     collect(DISTINCT z.hemlineStyle) AS user_hemlines,
     collect(DISTINCT z.necklineStyle) AS user_necklines,
     collect(DISTINCT k.color) AS similar_colors,
     collect(DISTINCT k.fabric) AS similar_fabrics,
     collect(DISTINCT k.designStyle) AS similar_designs,
     collect(DISTINCT k.fit) AS similar_fits,
     collect(DISTINCT k.sleeveStyle) AS similar_sleeves,
     collect(DISTINCT k.hemlineStyle) AS similar_hemlines,
     collect(DISTINCT k.necklineStyle) AS similar_necklines

// Combine user preferences and similar users' attributes
WITH
     user_colors + similar_colors AS combined_colors,
     user_fabrics + similar_fabrics AS combined_fabrics,
     user_designs + similar_designs AS combined_designs,
     user_fits + similar_fits AS combined_fits,
     user_sleeves + similar_sleeves AS combined_sleeves,
     user_hemlines + similar_hemlines AS combined_hemlines,
     user_necklines + similar_necklines AS combined_necklines

// Shuffle and return recommended attributes
WITH
     apoc.coll.shuffle(combined_colors) AS shuffled_colors,
     apoc.coll.shuffle(combined_fabrics) AS shuffled_fabrics,
     apoc.coll.shuffle(combined_designs) AS shuffled_designs,
     apoc.coll.shuffle(combined_fits) AS shuffled_fits,
     apoc.coll.shuffle(combined_sleeves) AS shuffled_sleeves,
     apoc.coll.shuffle(combined_hemlines) AS shuffled_hemlines,
     apoc.coll.shuffle(combined_necklines) AS shuffled_necklines,
     size(combined_colors) AS color_size,
     size(combined_fabrics) AS fabric_size,
     size(combined_designs) AS design_size,
     size(combined_fits) AS fit_size,
     size(combined_sleeves) AS sleeve_size,
     size(combined_hemlines) AS hemline_size,
     size(combined_necklines) AS neckline_size

// Return shuffled attributes as recommendations
UNWIND range(0, 9) AS idx
RETURN shuffled_colors[idx % color_size] AS color,
       shuffled_fabrics[idx % fabric_size] AS fabric,
       shuffled_designs[idx % design_size] AS design,
       shuffled_fits[idx % fit_size] AS fit,
       shuffled_sleeves[idx % sleeve_size] AS sleeve,
       shuffled_hemlines[idx % hemline_size] AS hemline,
       shuffled_necklines[idx % neckline_size] AS neckline  
      `,
      { userId }
    );

    const prompts = result.records.map(record => ({
      color: record.get('color'),
      fabric: record.get('fabric'),
      designStyle: record.get('design'),
      fit: record.get('fit'),
      sleeveStyle: record.get('sleeve'),
      hemlineStyle: record.get('hemline'),
      necklineStyle: record.get('neckline')
    }));
  
    const formattedPrompts = prompts.map(prompt => {
      let description = ` ${prompt.color} coloured`;
      if (prompt.fabric) description += ` made of ${prompt.fabric} fabric`;
      if (prompt.designStyle) description += `, with a ${prompt.designStyle} design`;
      if (prompt.sleeveStyle) description += `, ${prompt.sleeveStyle} sleeves`;
      if (prompt.hemlineStyle) description += `, ${prompt.hemlineStyle} hemline`;
      if (prompt.necklineStyle) description += `, ${prompt.necklineStyle} neckline`;
      description += `.`;
      return description;
    }).join('\n');

    console.log('Generated prompts:', formattedPrompts);
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return NextResponse.json({ error: 'Error generating prompts' }, { status: 500 });
  } finally {
    await session.close();
  }
}