// src/services/toolDefinitions.ts - Function definitions for OpenAI

interface FunctionParameter {
  type: string
  properties: Record<
    string,
    {
      type: string
      description: string
    }
  >
  required: string[]
}

interface FunctionDefinition {
  name: string
  description: string
  parameters: FunctionParameter
}

/**
 * Function definitions for LLM function calling
 */
const functions: FunctionDefinition[] = [
  {
    name: 'save_data_point',
    description: 'Use this to save a data point for the user.',
    parameters: {
      type: 'object',
      properties: {
        data_point: {
          type: 'string',
          description: 'The data point to save for the user.',
        },
      },
      required: ['data_point'],
    },
  },
]

export { functions }
export type { FunctionDefinition, FunctionParameter }
