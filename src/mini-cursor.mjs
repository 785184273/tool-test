import { ChatOpenAI } from '@langchain/openai'
import { readFileTool, writeFileTool, execCommandTool, listDirectoryTool } from './all-tools.mjs'
import { HumanMessage, SystemMessage, ToolMessage, AIMessage } from '@langchain/core/messages'
import path from 'node:path'
import dotenv from 'dotenv'
import chalk from 'chalk'

const envPath = path.resolve(path.dirname(import.meta.filename), '../.env')
dotenv.config({
  path: envPath
})

const model = new ChatOpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  model: process.env.OPEN_AI_MODEL,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPEN_AI_BASE_URL
  }
})

const tools = [
  readFileTool,
  writeFileTool,
  execCommandTool,
  listDirectoryTool
]

// 绑定工具
const modelWithTools = model.bindTools(tools)

// 初始化消息列表

const runAgetWithTools = async (query) => {
  const messages = [
    new SystemMessage(`你是一个项目管理助手，使用工具完成任务。
      当前工作目录: ${process.cwd()}
  
      工具:
      - read_file: 读取文件内容
      - write_file: 写入文件内容
      - exec_command: 执行命令（支持指定工作目录）
      - list_directory: 列出目录内容
  
      重要规则 - exec_command:
      - workingDirectory 参数是可选的，如果未指定，则使用当前工作目录，如果指定了，则使用指定的目录。
      - 当使用了 workingDirectory 参数时，绝对不要在command 中使用cd命令，直接使用 workingDirectory 参数。
      - 错误示例: { command: "cd react-todo-app && pnpm install", workingDirectory: "react-todo-app" },这是错误的，因为 workingDirectory 已经在 react-todo-app 目录了。
      - 正确示例: { command: "pnpm install", workingDirectory: "react-todo-app" }
  
      回复要简洁，只说做了什么
    `),
    new HumanMessage(query)
  ]

  console.log(chalk.bgGreen('\n [正在等待AI思考...]'))
  let response = await modelWithTools.invoke(messages)

  // 没有工具调用，直接返回内容
  if (!response.tool_calls || response.tool_calls.length === 0) {
    console.log(chalk.bgGreen('AI最终回复: '), response.content)
    return response.content
  }

  while (response.tool_calls && response.tool_calls.length > 0) {
    console.log(`\n [检测到 ${response.tool_calls.length} 个工具调用]`)

    // 将AI返回的内容添加到消息列表中
    messages.push(response)

    // 有工具调用，调用工具并添加到消息列表中
    for (const toolCall of response.tool_calls) {
      const toolName = toolCall.name
      const tool = tools.find(t => t.name === toolName)
      if (!tool) {
        console.log(`\n [警告] 未找到工具: ${toolName}`)
        return `\n [警告] 未找到工具: ${toolName}`
      }
      console.log(`\n [调用工具: ${toolName}]`)
      const toolResult = await tool.invoke(toolCall.args)
      console.log(`\n [工具调用结果] ${toolResult}`)

      // 将工具调用结果添加到消息列表中
      messages.push(new ToolMessage({
        content: toolResult,
        tool_call_id: toolCall.id
      }))
    }

    console.log(chalk.bgGreen('\n [正在等待AI思考...]'))
    response = await modelWithTools.invoke(messages)
  }

  return response.content;
}

const prompt = `使用vite创建一个功能丰富的 vue todoList应用:
  1.创建项目: npm create vue@latest
  2.修改src/App.vue文件，实现完整功能的todoList应用:
    - 添加、删除、编辑、标记完成
    - 分类筛选(全部、进行中、已完成)
    - 统计信息显示
    - localStorage 持久化
  3.添加好看的css样式，美化UI界面
  4.添加动画
    - 添加/删除时的过渡动画
    - 筛选状态切换时的动画
  5.列出目录确认
  6.使用pnpm install安装依赖
  7.使用pnpm run dev运行项目
`

try {
  const content = await runAgetWithTools(prompt)
  console.log('AI最终回复: ', content)
} catch (error) {
  console.error('错误: ', error)
}