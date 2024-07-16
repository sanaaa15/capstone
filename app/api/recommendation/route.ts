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

    const result = await session.run(
      `
      MATCH (user:User {id: $userId})
      MATCH (user)-[:LIKES]->(prefs:Preference)
      MATCH (user)-[:PURCHASED]->(boughtKurta:Purchase)
      WITH user, prefs, 
           collect(boughtKurta) AS purchasedKurtas,
           ['Cotton', 'Silk', 'Linen', 'Polyester', 'Rayon', 'Wool', 'Chiffon', 'Georgette'] AS allFabrics,
           ['Blue', 'Green', 'Red', 'Black', 'Yellow', 'White', 'Gray', 'Purple', 'Pink', 'Orange', 'Brown', 'White'] AS allColors,
           ['Printed', 'Embroidered', 'Plain'] AS allDesignStyles,
           ['Full Sleeve', 'Half Sleeve', 'Three-Quarter Sleeve', 'Short Sleeve'] AS allSleeveStyles,
           ['Straight', 'Flared', 'Curved'] AS allHemlineStyles,
           ['Round Neck', 'V-Neck', 'Mandarin Collar', 'Shirt Collar', 'Square Neck'] AS allNecklineStyles,
           ['A-line', 'Straight', 'Anarkali'] AS allShapes
      WITH user, prefs, purchasedKurtas, 
           allFabrics, allColors, allDesignStyles, allSleeveStyles, 
           allHemlineStyles, allNecklineStyles, allShapes,
           [kurta IN purchasedKurtas | kurta.colour] AS purchasedColors,
           [kurta IN purchasedKurtas | kurta.fabric] AS purchasedFabrics,
           [kurta IN purchasedKurtas | kurta.Print_or_Pattern_Type] AS purchasedDesignStyles,
           [kurta IN purchasedKurtas | kurta.sleeve_styling] AS purchasedSleeveStyles,
           [kurta IN purchasedKurtas | kurta.hemline] AS purchasedHemlineStyles,
           [kurta IN purchasedKurtas | kurta.Neck] AS purchasedNecklineStyles,
           [kurta IN purchasedKurtas | kurta.Shape] AS purchasedShapes
      UNWIND range(1, 10) AS i
      RETURN 
        CASE 
          WHEN size(purchasedColors) > 0 AND rand() < 0.5 THEN purchasedColors[toInteger(rand() * size(purchasedColors))]
          WHEN prefs IS NOT NULL AND size(prefs.colorTones) > 0 AND rand() < 0.7 THEN prefs.colorTones[toInteger(rand() * size(prefs.colorTones))]
          ELSE allColors[toInteger(rand() * size(allColors))]
        END AS color,
        
        CASE 
          WHEN size(purchasedFabrics) > 0 AND rand() < 0.5 THEN purchasedFabrics[toInteger(rand() * size(purchasedFabrics))]
          WHEN prefs IS NOT NULL AND size(prefs.fabrics) > 0 AND rand() < 0.7 THEN prefs.fabrics[toInteger(rand() * size(prefs.fabrics))]
          ELSE allFabrics[toInteger(rand() * size(allFabrics))]
        END AS fabric,
        
        CASE 
          WHEN size(purchasedDesignStyles) > 0 AND rand() < 0.6 THEN purchasedDesignStyles[toInteger(rand() * size(purchasedDesignStyles))]
          ELSE allDesignStyles[toInteger(rand() * size(allDesignStyles))]
        END AS designStyle,
        
        CASE 
          WHEN size(purchasedSleeveStyles) > 0 AND rand() < 0.6 THEN purchasedSleeveStyles[toInteger(rand() * size(purchasedSleeveStyles))]
          ELSE allSleeveStyles[toInteger(rand() * size(allSleeveStyles))]
        END AS sleeveStyle,
        
        CASE 
          WHEN size(purchasedHemlineStyles) > 0 AND rand() < 0.6 THEN purchasedHemlineStyles[toInteger(rand() * size(purchasedHemlineStyles))]
          ELSE allHemlineStyles[toInteger(rand() * size(allHemlineStyles))]
        END AS hemlineStyle,
        
        CASE 
          WHEN size(purchasedNecklineStyles) > 0 AND rand() < 0.6 THEN purchasedNecklineStyles[toInteger(rand() * size(purchasedNecklineStyles))]
          ELSE allNecklineStyles[toInteger(rand() * size(allNecklineStyles))]
        END AS necklineStyle,
        
        CASE 
          WHEN size(purchasedShapes) > 0 AND rand() < 0.6 THEN purchasedShapes[toInteger(rand() * size(purchasedShapes))]
          ELSE allShapes[toInteger(rand() * size(allShapes))]
        END AS shape,
        
        CASE 
          WHEN prefs IS NOT NULL AND size(prefs.priceRange) = 2 THEN toInteger(rand() * (prefs.priceRange[1] - prefs.priceRange[0]) + prefs.priceRange[0])
          ELSE toInteger(rand() * 80 + 20)
        END AS price
      LIMIT 10
      `,
      { userId }
    );

    const prompts = result.records.map(record => ({
      color: record.get('color'),
      fabric: record.get('fabric'),
      designStyle: record.get('designStyle'),
      sleeveStyle: record.get('sleeveStyle'),
      hemlineStyle: record.get('hemlineStyle'),
      necklineStyle: record.get('necklineStyle'),
      shape: record.get('shape'),
      price: neo4j.int(record.get('price')).toNumber() // Convert Neo4j integer to JavaScript number
    }));

    const formattedPrompts = prompts.map(prompt => {
      let description = ` ${prompt.color} coloured`;
      if (prompt.fabric) description += ` made of ${prompt.fabric} fabric`;
      if (prompt.designStyle) description += `, with a ${prompt.designStyle} design`;
      if (prompt.sleeveStyle) description += `, ${prompt.sleeveStyle} sleeves`;
      if (prompt.hemlineStyle) description += `, ${prompt.hemlineStyle} hemline`;
      if (prompt.necklineStyle) description += `, ${prompt.necklineStyle} neckline`;
      if (prompt.shape) description += `, ${prompt.shape} shape`;
      description += `, priced at Rs. ${prompt.price}.`;
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