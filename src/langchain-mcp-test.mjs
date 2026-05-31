import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { MultiServerMCPClient, loadMcpTools } from '@langchain/mcp-adapters'
import { ChatOpenAI } from '@langchain/openai'
import chalk from 'chalk'
import { HumanMessage, ToolMessage, SystemMessage } from '@langchain/core/messages'

const envPath = path.resolve(fileURLToPath(import.meta.url), "../../.env");
dotenv.config({
  path: envPath
})

/**
 * 聊天模型
 */
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
    'my-mcp-server': {
      command: 'node',
      args: [
        'E:/tool-test/src/my-mcp-server.mjs'
      ]
    }
  }
})

/**
 * 获取 MCP 工具并绑定到模型
 */
const tools = await mcpClient.getTools()
const modelWithTools = model.bindTools(tools)

/**
 * 获取 MCP 资源
 */
const resources = await mcpClient.listResources()
let resourceContent = ''
for (const [serverName, resource] of Object.entries(resources)) {
  const [{ uri }] = resource
  const content = await mcpClient.readResource(serverName, uri)
  resourceContent += content[0].text
}

const runAgentWithTools = async (query) => {

  /**
   * 创建消息列表
   */
  const messages = [
    new SystemMessage(resourceContent), // 系统提示词
    new HumanMessage(query) // 用户输入
  ]

  console.log(chalk.green('开始执行对话'))

  // AI 模型响应
  const response = await modelWithTools.invoke(messages)
  messages.push(response)


  if (response.tool_calls && response.tool_calls.length > 0) {
    // console.log(response.tool_calls)
    /**
     * 有工具调用，开始执行工具调用
     */
    console.log(`检测到有工具调用，开始执行工具调用`)
    console.log(`工具调用数量：${response.tool_calls.length}`)
    console.log(`工具调用列表：${response.tool_calls.map(toolCall => toolCall.name).join(', ')}`)

    for (const toolCall of response.tool_calls) {
      const tool = tools.find(tool => tool.name === toolCall.name)
      if (tool) {
        console.log(`开始执行工具：${tool.name}`)
        const toolResult = await tool.invoke(toolCall.args)
        console.log(`工具执行结果：${toolResult}`)
        messages.push(new ToolMessage({
          content: toolResult,
          tool_call_id: toolCall.id,
        }))
      }
    }
    const nextResponse = await modelWithTools.invoke(messages)
    messages.push(nextResponse)
    console.log(chalk.green('对话结束'))
    console.log(chalk.green('对话内容：'), nextResponse.content)
  } else {
    /**
     * 没有工具调用，直接输出响应
     */
    console.log(response.content)
  }

}

await runAgentWithTools('请查询下002的信息')

/**
 * 关闭 MCP 客户端
 */
await mcpClient.close()






