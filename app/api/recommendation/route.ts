// /api/recommendation/route.ts
import { NextResponse } from 'next/server';
import driver from '../neo4j';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(request: Request) {
  const session = driver.session();

  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, SECRET_KEY as string) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate new recommendations if none exist within 7 days
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      MATCH (u)-[:HAS_PREFERENCES]->(p:Preferences)
      
      // Get all possible data points
      OPTIONAL MATCH (u)-[:BUYS]->(bought:Kurta)
      OPTIONAL MATCH (u)-[:WISHLIST]->(wishlisted:Kurta)
      OPTIONAL MATCH (u)-[:CART]->(carted:Kurta)
      OPTIONAL MATCH (u)-[:SIMILAR_TO]->(similar:User)
      OPTIONAL MATCH (similar)-[:BUYS|WISHLIST|CART]->(similar_kurtas:Kurta)
      
      WITH u, p,
           // Collect all colors from different sources
           collect(DISTINCT bought.color) AS bought_colors,
           collect(DISTINCT wishlisted.color) AS wishlist_colors,
           collect(DISTINCT carted.color) AS cart_colors,
           collect(DISTINCT similar_kurtas.color) AS similar_colors,
           p.colorPaletteChoices AS pref_colors,
           
           // Collect all sleeve styles
           collect(DISTINCT bought.sleeveStyle) AS bought_sleeves,
           collect(DISTINCT wishlisted.sleeveStyle) AS wishlist_sleeves,
           collect(DISTINCT carted.sleeveStyle) AS cart_sleeves,
           collect(DISTINCT similar_kurtas.sleeveStyle) AS similar_sleeves,
           p.designChoices AS pref_sleeves,
           
           // Collect all hemline styles
           collect(DISTINCT bought.hemlineStyle) AS bought_hemlines,
           collect(DISTINCT wishlisted.hemlineStyle) AS wishlist_hemlines,
           collect(DISTINCT carted.hemlineStyle) AS cart_hemlines,
           collect(DISTINCT similar_kurtas.hemlineStyle) AS similar_hemlines,
           
           // Collect all neckline styles
           collect(DISTINCT bought.necklineStyle) AS bought_necklines,
           collect(DISTINCT wishlisted.necklineStyle) AS wishlist_necklines,
           collect(DISTINCT carted.necklineStyle) AS cart_necklines,
           collect(DISTINCT similar_kurtas.necklineStyle) AS similar_necklines

      WITH 
           // Debug information
           {
             bought: bought_colors,
             wishlist: wishlist_colors,
             cart: cart_colors,
             similar: similar_colors,
             preferences: pref_colors
           } as color_sources,
           {
             bought: bought_sleeves,
             wishlist: wishlist_sleeves,
             cart: cart_sleeves,
             similar: similar_sleeves,
             preferences: pref_sleeves
           } as sleeve_sources,
           {
             bought: bought_hemlines,
             wishlist: wishlist_hemlines,
             cart: cart_hemlines,
             similar: similar_hemlines
           } as hemline_sources,
           {
             bought: bought_necklines,
             wishlist: wishlist_necklines,
             cart: cart_necklines,
             similar: similar_necklines
           } as neckline_sources,
           
           // Combine all sources
           bought_colors + wishlist_colors + cart_colors + similar_colors + pref_colors AS all_colors,
           bought_sleeves + wishlist_sleeves + cart_sleeves + similar_sleeves + pref_sleeves AS all_sleeves,
           bought_hemlines + wishlist_hemlines + cart_hemlines + similar_hemlines AS all_hemlines,
           bought_necklines + wishlist_necklines + cart_necklines + similar_necklines AS all_necklines
      
      WITH 
           // Remove nulls and provide defaults if empty
           CASE 
             WHEN size([x IN all_colors WHERE x IS NOT NULL]) > 0 
             THEN [x IN all_colors WHERE x IS NOT NULL]
             ELSE ['Blue', 'Red', 'Green', 'Yellow', 'White'] 
           END AS combined_colors,
           
           CASE 
             WHEN size([x IN all_sleeves WHERE x IS NOT NULL]) > 0 
             THEN [x IN all_sleeves WHERE x IS NOT NULL]
             ELSE ['Full Sleeves', 'Half Sleeves', 'Quarter Sleeves'] 
           END AS combined_sleeves,
           
           CASE 
             WHEN size([x IN all_hemlines WHERE x IS NOT NULL]) > 0 
             THEN [x IN all_hemlines WHERE x IS NOT NULL]
             ELSE ['Straight', 'Curved', 'Asymmetric'] 
           END AS combined_hemlines,
           
           CASE 
             WHEN size([x IN all_necklines WHERE x IS NOT NULL]) > 0 
             THEN [x IN all_necklines WHERE x IS NOT NULL]
             ELSE ['Round Neck', 'V-Neck', 'Mandarin'] 
           END AS combined_necklines,
           
           // Debug flags
           size([x IN all_colors WHERE x IS NOT NULL]) = 0 as using_default_colors,
           size([x IN all_sleeves WHERE x IS NOT NULL]) = 0 as using_default_sleeves,
           size([x IN all_hemlines WHERE x IS NOT NULL]) = 0 as using_default_hemlines,
           size([x IN all_necklines WHERE x IS NOT NULL]) = 0 as using_default_necklines,
           
           // Pass through source information
           color_sources, sleeve_sources, hemline_sources, neckline_sources

      WITH *,
           apoc.coll.shuffle(combined_colors) AS shuffled_colors,
           apoc.coll.shuffle(combined_sleeves) AS shuffled_sleeves,
           apoc.coll.shuffle(combined_hemlines) AS shuffled_hemlines,
           apoc.coll.shuffle(combined_necklines) AS shuffled_necklines
      
      UNWIND range(0, 9) AS idx
      WITH idx, 
           shuffled_colors[idx % size(shuffled_colors)] AS color,
           shuffled_sleeves[idx % size(shuffled_sleeves)] AS sleeve,
           shuffled_hemlines[idx % size(shuffled_hemlines)] AS hemline,
           shuffled_necklines[idx % size(shuffled_necklines)] AS neckline,
           using_default_colors, using_default_sleeves, using_default_hemlines, using_default_necklines,
           color_sources, sleeve_sources, hemline_sources, neckline_sources
      
      RETURN 
        color, sleeve, hemline, neckline,
        using_default_colors, using_default_sleeves, using_default_hemlines, using_default_necklines,
        color_sources, sleeve_sources, hemline_sources, neckline_sources
      `,
      { userId }
    );

    const prompts = result.records.map(record => ({
      color: record.get('color'),
      sleeveStyle: record.get('sleeve'),
      hemlineStyle: record.get('hemline'),
      necklineStyle: record.get('neckline')
    }));

    const debugInfo = result.records[0].get('color_sources');
    const usingDefaults = {
      colors: result.records[0].get('using_default_colors'),
      sleeves: result.records[0].get('using_default_sleeves'),
      hemlines: result.records[0].get('using_default_hemlines'),
      necklines: result.records[0].get('using_default_necklines')
    };

    console.log('Debug Info:', {
      usingDefaults,
      sources: {
        colors: debugInfo,
        sleeves: result.records[0].get('sleeve_sources'),
        hemlines: result.records[0].get('hemline_sources'),
        necklines: result.records[0].get('neckline_sources')
      }
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return NextResponse.json({ error: 'Error generating prompts' }, { status: 500 });
  } finally {
    await session.close();
  }
}