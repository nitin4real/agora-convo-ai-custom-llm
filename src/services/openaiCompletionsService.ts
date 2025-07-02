import OpenAI from 'openai'
import { getConceptPhoto } from '../libs/tools'
import { ChatCompletionChunk, ChatCompletionMessageParam, ChatCompletionMessageToolCall, ChatCompletionTool, ChatCompletionToolMessageParam } from 'openai/resources/chat/completions'
import { config } from '../libs/utils'
import { getUserFunctions } from '../libs/edtech-functions'
import { ToolCallDelta } from 'openai/resources/beta/threads/runs/steps'
type ChatMessage = ChatCompletionMessageParam

interface ChatCompletionOptions {
  model?: string
  stream?: boolean
  userId: string
  channel: string
  appId: string
  tools?: any[]
}
interface FunctionCall {
  name: string
  arguments: string
}
interface RequestContext {
  userId: string
  channel: string
  appId: string
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.llm.openaiApiKey,
})


function createSystemMessage(): ChatMessage {
  return {
    role: 'system',
    content:
      `You will have access to Functions for Show Question, Show Image, And Publish Message. You can use any to send data to the user's Screen.`
  }
}

/**
 * Process a chat completion request with OpenAI
 * @param {ChatMessage[]} messages - Chat messages
 * @param {ChatCompletionOptions} options - Additional options
 * @returns {Promise<Object>} OpenAI response
 */
async function processChatCompletion(messages: ChatMessage[], options: ChatCompletionOptions) {
  const { model = 'gpt-4o-mini', stream = false, userId, channel, appId, tools } = options
  // console.log('Processing chat completion with options:', options)

  const systemMessage = createSystemMessage()
  const fullMessages = [systemMessage, ...messages]

  // Build request options
  const requestOptions = {
    model,
    messages: fullMessages,
    tools: getUserFunctions()
  }

  if (!stream) {
    console.log('Non-streaming mode')
  } else {
    return processStreamingRequest(requestOptions, fullMessages, {
      userId,
      channel,
      appId,
    })
  }
}


/**
 * Generate a streaming response
 * @param {Object} requestOptions - OpenAI request options
 * @param {ChatMessage[]} fullMessages - Complete message history
 * @param {RequestContext} context - Request context (userId, channel, appId)
 * @returns {Promise<ReadableStream>} Stream of events
 */
async function processStreamingRequest(requestOptions: any, fullMessages: ChatMessage[], context: RequestContext) {
  const { userId, channel, appId } = context
  let overAllIndex = 0;
  // Make initial streaming request
  const stream = (await openai.chat.completions.create({
    ...requestOptions,
    stream: true,
  })) as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>

  // Create encoder
  const encoder = new TextEncoder()

  // Create function call accumulators
  let toolCallList: FunctionCall[] = []

  // Create readable stream
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const part of stream) {

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(part)}\n\n`))
          // Handle function calls if needed
          const toolCalls = part.choices[0].delta?.tool_calls

          if (toolCalls) {
            toolCalls.forEach((toolCall: any) => {
              const toolCallIndex = toolCall.index
              if (toolCallList[toolCallIndex]) {
                if (toolCall.function?.arguments) {
                  toolCallList[toolCallIndex].arguments += toolCall.function?.arguments
                }
              } else {
                toolCallList[toolCallIndex] = {
                  name: toolCall.function?.name,
                  arguments: toolCall.function?.arguments
                }
              }
            })
          }

          // If finish_reason is encountered, attempt function call
          if (part.choices[0].finish_reason) {
            console.log('toolCallList', toolCallList)
            if (toolCallList.length > 0) {
              overAllIndex = toolCallList.length;
              toolCallList.forEach(async (toolCall) => {
                try {
                  // Parse arguments
                  const functionName = toolCall.name
                  const parsedArgs = JSON.parse(toolCall.arguments)
                  const question_data_to_frontend = {
                    type: "question",
                    questionDescription: parsedArgs.questionDescription,
                    options: parsedArgs.options
                  }

                  const image_data_to_frontend = {
                    type: "concept_image",
                    conceptName: "",
                    imageUrl: "",
                    imageDescription: ""
                  }

                  let publish_message_arguments = ""

                  if (functionName === 'show_question') {
                    publish_message_arguments = JSON.stringify(question_data_to_frontend)
                  } else if (functionName === 'show_image') {
                    const functionResult = getConceptPhoto(parsedArgs.conceptName)
                    image_data_to_frontend.conceptName = functionResult.name
                    image_data_to_frontend.imageUrl = functionResult.imageUrl
                    image_data_to_frontend.imageDescription = functionResult.description
                    publish_message_arguments = JSON.stringify(image_data_to_frontend)
                  }

                  let publish_message_tool_call: ToolCallDelta = {
                    id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
                    index: 1,
                    type: "function",
                    function: {
                      name: "_publish_message",
                      arguments: JSON.stringify({ content: publish_message_arguments })
                    }
                  }

                  overAllIndex++;

                  const toolCallParams: Partial<ChatCompletionChunk> = {
                    choices: [
                      {
                        index: 0,
                        delta: {
                          role: "assistant",
                          content: null,
                          tool_calls: [publish_message_tool_call]
                        },
                        finish_reason: null
                      }
                    ]
                  }

                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolCallParams)}\n\n`))

                } catch (err) {
                  console.error('Function call error:', err)
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Function call failed' })}\n\n`))
                }
              })
            }

            // End SSE stream
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
            return
          }
        }

        // Ensure we close the stream if we didn't encounter a finish_reason
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
      } catch (error) {
        console.error('OpenAI streaming error:', error)
        controller.error(error)
      }
    },
  })
}


export { processChatCompletion }
export type { ChatMessage, ChatCompletionOptions, RequestContext }

