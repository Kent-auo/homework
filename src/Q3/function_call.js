import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { spinner } from "./utils/spinner.js";
import { toOpenAITool } from "./utils/func-tool.js";
import * as allTools from "./tools/index.js";

const toolList = Object.values(allTools);

const tools = toolList.map(toOpenAITool);

const TOOLS_BY_NAME = Object.fromEntries(
  toolList.map((tool) => [tool.name, tool])
);

const MAX_TOOL_ROUNDS = 8;

export async function runToolCalling(history) {
  let response = await client.responses.create({
    model: DEFAULT_MODEL,
    input: history,
    tools,
    tool_choice: "auto",
  });

  for (
    let round = 1;
    round <= MAX_TOOL_ROUNDS;
    round++
  ) {
    const functionCalls = response.output.filter(
      (item) => item.type === "function_call"
    );

    // 已經沒有 tool call，直接回傳答案
    if (functionCalls.length === 0) {
      return response.output_text;
    }

    const toolOutputs = [];

    for (const functionCall of functionCalls) {
      const fnName = functionCall.name;

      const tool = TOOLS_BY_NAME[fnName];

      if (!tool) {
        throw new Error(
          `模型要求了未註冊的工具：${fnName}`
        );
      }

      const args = tool.parameters.parse(
        JSON.parse(functionCall.arguments)
      );

      console.log(
        `\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`
      );

      const result = await tool.fn(args);

      toolOutputs.push({
        type: "function_call_output",
        call_id: functionCall.call_id,
        output: JSON.stringify(result),
      });
    }

    const spin = spinner("思考中...").start();

    response = await client.responses.create({
      model: DEFAULT_MODEL,
      previous_response_id: response.id,
      input: toolOutputs,
    });

    spin.stop();
  }

  throw new Error(
    `Tool calling 超過 ${MAX_TOOL_ROUNDS} 輪，已停止執行`
  );
}