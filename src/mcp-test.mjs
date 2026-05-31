import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, ToolMessage } from '@langchain/core/messages'
import chalk from 'chalk'

const __dirname = path.resolve(fileURLToPath(import.meta.url), '../')
const envPath = path.resolve(__dirname, '../.env')
dotenv.config({ path: envPath })

const model = new ChatOpenAI({
  model: process.env.OPEN_AI_MODEL,
  apiKey: process.env.OPEN_AI_API_KEY,
  configuration: {
    baseURL: process.env.OPEN_AI_BASE_URL,
  }
})

/**
 * 多服务器 MCP 客户端
 */
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    "amap-maps-streamableHTTP": {
      "url": "https://mcp.amap.com/mcp?key=" + process.env.AMAP_MAPS_API_KEY
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        process.env.ALLOWED_PATHS
      ]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest"
      ]
    }
  }
})

const tools = await mcpClient.getTools()

/**
 * 绑定 MCP 工具到模型
 */
const modelWithTools = model.bindTools(tools)

/**
 * 消息列表
 */
const messages = [
  new HumanMessage('给出云南大理洱海周边的海景酒店信息，并给出每个酒店的详细介绍和价格，酒店图片等，在浏览器中打开酒店信息')
]

const runAgentWithTools = async (messages) => {

  console.log(chalk.bgGreen('🤔 正在思考...'))

  /**
   * 模型调用用户输入的问题
   */
  const response = await modelWithTools.invoke(messages)
  messages.push(response)

  if (response.tool_calls && response.tool_calls.length > 0) {

    console.log(chalk.bgGreen(`预计调用${response.tool_calls.length}个工具`))

    console.log(chalk.bgGreen('💡 思考完成，开始调用工具...'))

    for (const toolCall of response.tool_calls) {
      const tool = tools.find(tool => tool.name === toolCall.name)
      if (tool) {
        /**
         * 调用 MCP 工具
         */
        console.log(chalk.bgYellow(`正在调用${tool.name}工具...`))
        const toolResult = await tool.invoke(toolCall.args)

        // MCP工具返回的是结构化对象，需要转换为字符串供LangChain使用
        let contentForMessage;
        if (typeof toolResult === 'string') {
          contentForMessage = toolResult;
        } else if (toolResult && typeof toolResult === 'object') {
          if (toolResult.text) {
            contentForMessage = toolResult.text;
          } else if (toolResult.content) {
            contentForMessage = typeof toolResult.content === 'string' 
              ? toolResult.content 
              : JSON.stringify(toolResult.content, null, 2);
          } else {
            contentForMessage = JSON.stringify(toolResult, null, 2);
          }
        } else {
          contentForMessage = String(toolResult);
        }

        console.log(toolResult)
        // 将工具调用结果添加到消息列表
        messages.push(new ToolMessage({
          content: contentForMessage,
          tool_call_id: toolCall.id,
        }))
        console.log(chalk.bgYellow(`${tool.name}工具调用完成`))
      }
    }
    /**
     * 模型根据消息列表上下文继续思考
     */
    const nextResponse = await modelWithTools.invoke(messages)
    messages.push(nextResponse)

    if (nextResponse.tool_calls && nextResponse.tool_calls.length > 0) {
      await runAgentWithTools(messages)
    } else {
      console.log(chalk.bgGreen('💡 思考完成，没有需要调用的工具'))
      console.log(chalk.bgGreen('💡 最终答案：\n'))
      console.log(nextResponse.content)
    }

  } else {
    console.log(chalk.bgGreen('💡 思考完成，没有需要调用的工具'))
    console.log(chalk.bgGreen('💡 最终答案：\n'))
    console.log(response.content)
  }
}

await runAgentWithTools(messages)

await mcpClient.close()
