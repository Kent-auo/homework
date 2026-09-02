import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";
    
const client = new OpenAI({ apiKey: OPENAI_API_KEY });

import { SYSTEM_PROMPT } from "./prompt.js";
import { runToolCalling } from "./function_call.js";

await initMessage(SYSTEM_PROMPT);

try {
  while (true) {
    const userQuestion = (
      await input({ message: "請輸入你的問題：" })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會...掰掰~~");
      break;
    }

    await addMessage(userQuestion);

    const content =
      await runToolCalling(getMessages()
      );

    console.log(content);

    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會...掰掰~~");
  } else {
    throw err;
  }
}