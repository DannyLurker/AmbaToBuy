import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ambatobuy";
const DB_NAME = process.env.DB_NAME || "Amba-To-Buy";

export async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return { client, db: client.db(DB_NAME) };
}

export { MongoClient };
