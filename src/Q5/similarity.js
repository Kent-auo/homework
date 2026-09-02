import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const MODEL = "text-embedding-3-small";

/**
 * 取得 Embedding
 */
async function embed(text) {
  const response = await client.embeddings.create({
    model: MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Cosine Similarity
 */
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

  const normA = Math.sqrt(
    a.reduce((sum, val) => sum + val * val, 0)
  );

  const normB = Math.sqrt(
    b.reduce((sum, val) => sum + val * val, 0)
  );

  return dot / (normA * normB);
}

/**
 * 計算一組句子的相似度
 */
async function testGroup(name, sentences) {
  console.log(`\n===== ${name} =====`);

  const embeddings = await Promise.all(
    sentences.map(embed)
  );

  let total = 0;
  let count = 0;

  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      const similarity = cosineSimilarity(
        embeddings[i],
        embeddings[j]
      );

      total += similarity;
      count++;

      console.log(
        `"${sentences[i]}"  <->  "${sentences[j]}"`
      );
      console.log(
        `相似度：${similarity.toFixed(4)}\n`
      );
    }
  }

  const average = total / count;

  console.log(
    `${name}平均相似度：${average.toFixed(4)}`
  );

  return average;
}

async function main() {
  // 第1組：意思相近
  const group1 = [
    "我喜歡貓",
    "貓咪很可愛",
    "我養了一隻貓",
  ];

  // 第2組：意思不同
  const group2 = [
    "今天天氣很好",
    "我要去買菜",
    "電腦壞掉了",
  ];

  // 第3組：自行設計
  const group3 = [
    "我喜歡喝拿鐵",
    "紅茶拿鐵有奶蓋",
    "卡布奇諾有很多奶泡",
  ];

  const avg1 = await testGroup(
    "第1組（意思相近）",
    group1
  );

  const avg2 = await testGroup(
    "第2組（意思不同）",
    group2
  );

  const avg3 = await testGroup(
    "第3組（自選主題）",
    group3
  );

  console.log("\n===== 結果分析 =====");

  console.log(
    `第1組平均相似度：${avg1.toFixed(4)}`
  );

  console.log(
    `第2組平均相似度：${avg2.toFixed(4)}`
  );

  console.log(
    `第3組平均相似度：${avg3.toFixed(4)}`
  );

  if (avg1 > avg2) {
    console.log(
      "\n 第1組相似度高於第2組，符合預期。"
    );
  } else {
    console.log(
      "\n 結果不符合預期，需進一步分析。"
    );
  }
}

main().catch(console.error);