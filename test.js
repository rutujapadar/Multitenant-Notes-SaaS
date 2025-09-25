import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_XisW3QHl0FSO@ep-twilight-frog-aduupthx-pooler.c-2.us-east-1.aws.neon.tech:5432/neondb?sslmode=require'
});

async function test() {
  try {
    await client.connect();
    console.log("✅ Connected to Neon DB!");
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

test();
