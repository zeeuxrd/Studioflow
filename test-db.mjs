import pg from 'pg';
const { Client } = pg;

// We bypass the connection string parsing entirely by providing the raw credentials
const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.uhnpnxdbtkdbsoltzaqg',
  password: 'Minesota32)/',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function test() {
  console.log("Attempting to connect to Supabase...");
  try {
    await client.connect();
    console.log("SUCCESS! The credentials are correct and we are connected to the database!");
    await client.end();
  } catch (err) {
    console.error("CONNECTION FAILED:", err.message);
  }
}

test();
