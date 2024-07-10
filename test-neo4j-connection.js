const neo4j = require('neo4j-driver');
require('dotenv').config(); // Make sure you have dotenv installed

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;
console.log('NEO4J_URI:', uri);
console.log('NEO4J_USER:', user);
console.log('NEO4J_PASSWORD:', password);
async function testConnection() {
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  try {
    const result = await session.run('RETURN "Connection successful!" AS message');
    console.log(result.records[0].get('message'));
  } catch (error) {
    console.error('Error connecting to Neo4j:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

testConnection();