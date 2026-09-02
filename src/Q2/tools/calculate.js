export const tools = [
  {
    type: "function",
    name: "calculate",
    description: "進行數學計算",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "數學運算式，例如 10 + 5 * 2",
        },
      },
      required: ["expression"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export async function calculate({ expression }) {
  try {
    return {
      result: eval(expression),
    };
  } catch (error) {
    return {
      error: "計算失敗",
    };
  }
}