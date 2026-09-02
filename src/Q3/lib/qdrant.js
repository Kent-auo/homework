import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_URL, QDRANT_API_KEY } from "../../Q3/config.js";
import { client } from "../../Q3/lib/openai.js";

export const qdrant = new QdrantClient({
  url: QDRANT_URL,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY }),
  checkCompatibility: false,
});

export const COFFEE_COLLECTION = "coffee";
export const EMBEDDING_DIM = 1536;
export const EMBEDDING_MODEL = "text-embedding-3-small";

export async function embed(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

export async function searchCoffee(query, limit = 5) {
  const vector = await embed(query);

  const response = await qdrant.query(COFFEE_COLLECTION, {
    query: vector,
    limit,
    with_payload: true,
  });

  return response.points.map((r) => ({
    score: r.score,

    name: r.payload.name,
    category: r.payload.category,
    main_ingredients: r.payload.main_ingredients,

    calories_kcal: r.payload.calories_kcal,
    caffeine_mg: r.payload.caffeine_mg,

    difficulty: r.payload.difficulty,

    price: r.payload.price,
    origin: r.payload.origin,
    flavor: r.payload.flavor,
  }));
}