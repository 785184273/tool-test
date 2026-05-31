import { ChatOpenAI, tools } from "@langchain/openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const envPath = path.resolve(fileURLToPath(import.meta.url), "../../.env");

dotenv.config({ path: envPath });

const model = new ChatOpenAI({
  model: process.env.OPEN_AI_MODEL,
  apiKey: process.env.OPEN_AI_API_KEY,
  configuration: {
    baseURL: process.env.OPEN_AI_BASE_URL,
  }
});

const response = await model.invoke("今天有什么热点新闻？", {
  tools: [
    tools.webSearch(),
  ]
});
console.log(response.content);