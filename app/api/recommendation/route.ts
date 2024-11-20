// /api/recommendation/route.ts
import { NextResponse } from 'next/server';
import driver from '../neo4j';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';
import neo4j from 'neo4j-driver';

const SECRET_KEY = process.env.JWT_SECRET;

// MySQL connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(request: Request) {
  const session = driver.session();
  let mysqlConnection;

  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // // Connect to MySQL
    // mysqlConnection = await mysql.createConnection(dbConfig);

    // // Check for existing recommendations within the last 7 days
    // const [existingRecs] = await mysqlConnection.execute(
    //   `SELECT prompt, image_url, seed, created_at 
    //    FROM user_recommendations 
    //    WHERE user_id = ? 
    //    AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
    //    ORDER BY created_at DESC
    //    LIMIT 1`,
    //   [userId]
    // );

    // if (Array.isArray(existingRecs) && existingRecs.length > 0) {
    //   // Return existing recommendations
    //   return NextResponse.json({ 
    //     prompts: existingRecs.map(rec => ({
    //       prompt: rec.prompt,
    //       imageUrl: rec.image_url,
    //       seed: rec.seed
    //     }))
    //   });
    // }

    // Generate new recommendations if none exist within 7 days
    const result = await session.run(
      `
     MATCH (u:User {userId: $userId})
MATCH (u)-[:HAS_PREFERENCES]->(p:Preferences)
OPTIONAL MATCH (u)-[:SIMILAR_TO]->(similar_user:User)
OPTIONAL MATCH (similar_user)-[:HAS_PREFERENCES]->(similar_preferences:Preferences)
OPTIONAL MATCH (similar_user)-[:BUYS|WISHLIST|CART]->(k:Kurta)
OPTIONAL MATCH (u)-[:BUYS|WISHLIST|CART]->(z:Kurta)

WITH u, 
     collect(DISTINCT z.color) AS user_colors,
     collect(DISTINCT z.sleeveStyle) AS user_sleeves,
     collect(DISTINCT z.hemlineStyle) AS user_hemlines,
     collect(DISTINCT z.necklineStyle) AS user_necklines,
     collect(DISTINCT k.color) AS similar_colors,
     collect(DISTINCT k.sleeveStyle) AS similar_sleeves,
     collect(DISTINCT k.hemlineStyle) AS similar_hemlines,
     collect(DISTINCT k.necklineStyle) AS similar_necklines,
     p.colorPaletteChoices AS user_color_palettes,
     collect(DISTINCT similar_preferences.colorPaletteChoices) AS similar_color_palettes

WITH
     user_colors + similar_colors + apoc.coll.flatten([user_color_palettes] + similar_color_palettes) AS combined_colors_and_palettes,
     user_sleeves + similar_sleeves AS combined_sleeves,
     user_hemlines + similar_hemlines AS combined_hemlines,
     user_necklines + similar_necklines AS combined_necklines

WITH
     apoc.coll.shuffle(combined_colors_and_palettes) AS shuffled_colors_and_palettes,
     apoc.coll.shuffle(combined_sleeves) AS shuffled_sleeves,
     apoc.coll.shuffle(combined_hemlines) AS shuffled_hemlines,
     apoc.coll.shuffle(combined_necklines) AS shuffled_necklines,
     size(combined_colors_and_palettes) AS color_size,
     size(combined_sleeves) AS sleeve_size,
     size(combined_hemlines) AS hemline_size,
     size(combined_necklines) AS neckline_size

WITH shuffled_colors_and_palettes, shuffled_sleeves, shuffled_hemlines, shuffled_necklines, 
     color_size, sleeve_size, hemline_size, neckline_size

WITH 
    shuffled_colors_and_palettes,
    shuffled_sleeves,
    shuffled_hemlines,
    shuffled_necklines,
    color_size,
    sleeve_size,
    hemline_size,
    neckline_size,
    apoc.map.fromLists(
        ['Neutral (Beige, Cream, White)', 'Bright (Red, Yellow, Orange)', 'Pastel (Light Blue, Mint Green, Lavender)', 'Dark (Navy Blue, Maroon, Black)'],
        [
            ['Beige', 'Cream', 'White', 'Gray', 'Tan', 'Brown', 'Khaki', 'Nude', 'Camel Brown', 'Taupe', 'Off White', 'Coffee Brown'],
            ['Red', 'Yellow', 'Orange', 'Pink', 'Lime Green', 'Fluorescent Green', 'Gold', 'Mustard', 'Peach', 'Coral', 'Bronze'],
            ['Light Blue', 'Mint Green', 'Lavender', 'Peach', 'Soft Pink', 'Mauve', 'Sea Green', 'Champagne', 'Turquoise Blue'],
            ['Navy Blue', 'Maroon', 'Black', 'Dark Gray', 'Charcoal', 'Burgundy', 'Teal', 'Magenta', 'Fuchsia', 'Violet', 'Purple']
        ]
    ) AS color_palette_mapping

WITH 
    apoc.coll.flatten(
        [color IN shuffled_colors_and_palettes |
            CASE
                WHEN apoc.text.indexOf(color, "(") >= 0 THEN
                    // Extract the color palette description and map to actual colors
                    CASE
                        WHEN color IN keys(color_palette_mapping) THEN
                            apoc.coll.randomItem(color_palette_mapping[color])
                        ELSE color
                    END
                ELSE color
            END
        ]
    ) AS final_colors,
    shuffled_sleeves,
    shuffled_hemlines,
    shuffled_necklines,
    color_size, sleeve_size, hemline_size, neckline_size

UNWIND range(0, 9) AS idx
WITH 
    final_colors[idx % color_size] AS color_or_palette,
    shuffled_sleeves[idx % sleeve_size] AS sleeve,
    shuffled_hemlines[idx % hemline_size] AS hemline,
    shuffled_necklines[idx % neckline_size] AS neckline
RETURN 
    color_or_palette AS color,
    sleeve AS sleeve,
    hemline AS hemline,
    neckline AS neckline


      `,
      { userId }
    );

    const userColors = result.records.map(record => record.get('color'));
    const userSleeves = result.records.map(record => record.get('sleeve'));
    const userHemlines = result.records.map(record => record.get('hemline'));
    const userNecklines = result.records.map(record => record.get('neckline'));

    console.log("User ID:", userId);
    console.log("Available Colors:", userColors);
    console.log("Available Sleeve Styles:", userSleeves);
    console.log("Available Hemline Styles:", userHemlines);
    console.log("Available Neckline Styles:", userNecklines);

    const prompts = result.records.map(record => ({
      color: record.get('color'),
      sleeveStyle: record.get('sleeve'),
      hemlineStyle: record.get('hemline'),
      necklineStyle: record.get('neckline')
    }));

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return NextResponse.json({ error: 'Error generating prompts' }, { status: 500 });
  } finally {
    // if (mysqlConnection) {
    //   await mysqlConnection.end();
    // }
    await session.close();
  }
}