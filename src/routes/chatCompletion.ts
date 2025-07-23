import { Router, Request, Response, RequestHandler } from 'express'
import { processChatCompletion } from '../services/openaiCompletionsService'
import { validateRequest } from '../middleware/auth'

const router = Router()

// Middleware to validate API token
router.use(validateRequest as RequestHandler)

// Chat completion endpoint
router.post('/completions', (async (req: Request, res: Response) => {
  // console.log('completions', JSON.stringify(req.body))
  try {
    const {
      messages,
      model = 'gpt-4o-mini',
      stream = false,
      channel = 'ccc',
      userId = '',
      appId = '',
      tools = []
    } = req.body
    if (!messages) {
      return res.status(400).json({ error: 'Missing "messages" in request body' })
    }

    const result = await processChatCompletion(messages, {
      model,
      stream,
      channel,
      userId,
      appId,
      tools
    })

    if (stream) {
      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      if (result instanceof ReadableStream) {
        // Handle Web ReadableStream
        const reader = result.getReader()

        // Process stream chunks
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }

          // Write chunks to response
          res.write(value)
        }

        // End the response
        res.end()
      } else {
        // Fallback for non-streaming response
        res.json(result)
      }
    } else {
      res.json(result)
    }
  } catch (err: any) {
    console.error('Chat Completions Error:', err)
    res.status(500).json({ error: err.message })
  }
}) as RequestHandler)

export const chatCompletionRouter = router
