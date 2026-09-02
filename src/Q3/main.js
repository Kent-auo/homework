import { input } from "@inquirer/prompts";
import { searchCoffee } from "./lib/qdrant.js";
import { spinner } from "./utils/spinner.js";

try {
  while (true) {
    const query = (
      await input({
        message: "請輸入想查詢的咖啡（例如：低熱量、奶咖啡、巧克力風味）：",
      })
    ).trim();

    if (query === "") continue;

    if (query.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const spin = spinner("搜尋中...").start();

    const results = await searchCoffee(query, 5);

    spin.stop();

    if (results.length === 0) {
      console.log("\n查無相關咖啡\n");
      continue;
    }

    for (const [i, r] of results.entries()) {
      console.log(`\n${i + 1}. ${r.name}`);
      console.log(`   相似度：${r.score.toFixed(3)}`);
      console.log(`   類別：${r.category}`);
      console.log(`   主要成分：${r.main_ingredients}`);
      console.log(`   熱量：${r.calories_kcal} kcal`);
      console.log(`   咖啡因：${r.caffeine_mg} mg`);
      console.log(`   價格：NT$ ${r.price}`);
      console.log(`   產地：${r.origin}`);
      console.log(`   風味：${r.flavor}`);
      console.log(`   製作難度：${r.difficulty}`);
    }

    console.log();
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}