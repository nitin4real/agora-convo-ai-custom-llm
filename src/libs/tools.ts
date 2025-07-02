import axios from 'axios'
import { config } from './utils'

interface PeerMessageResponse {
  data: any
}

interface FunctionArgs {
  filling?: string
  concept_name?: string
  data_point?: string
}

type FunctionHandler = (appId: string, userId: string, channel: string, args: FunctionArgs) => Promise<string> | string

/**
 * Send a peer message using Agora RTM REST API
 * @param {string} appId - Agora app ID
 * @param {string} fromUser - Sender user ID
 * @param {string} toUser - Recipient user ID
 * @returns {Promise<PeerMessageResponse>}
 */
async function sendPeerMessage(
  appId: string,
  fromUser: string,
  toUser: string,
  payload: string,
): Promise<PeerMessageResponse> {
  const url = `https://api.agora.io/dev/v2/project/${appId}/rtm/users/${fromUser}/peer_messages`

  const data = {
    destination: String(toUser),
    enable_offline_messaging: true,
    enable_historical_messaging: true,
    payload: payload,
  }

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: 'agora token= ' + config.agora.authToken,
        'Content-Type': 'application/json',
      },
    })
    console.log('Message sent successfully:', response.data)
    return response
  } catch (error) {
    console.error('Error sending peer message:', error)
    throw error
  }
}

export const listOfImagesWithConcepts = {
  "triangles": {
    imageUrl: 'data:image/png;base64,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',
    description: 'Image of a equilateral triangle.',
    name: 'Triangle'
  },
  "rightAngleTriangle": {
    imageUrl: 'https://ichef.bbci.co.uk/images/ic/480xn/p0dkvtlx.png',
    description: 'Image of a right angle triangle showing theta, hypotenuse h, opposite side o and adjecent a.',
    name: 'Right Angle Triangle'
  },
  "numbers": {
    name: 'Numbers System',
    imageUrl: "https://s3.eu-central-1.amazonaws.com/studysmarter-mediafiles/media/1865576/summary_images/Untitled_Artwork_93.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4OLDUDE42UZHAIET%2F20250517%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250517T030922Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=438a6854b77f858506ee5fb48213b1072d4bf05be308534578f4e6ed452f3ca2",
    description: "Image of number system, Natural numbers, Whole numbers, Integers, Rational numbers, Irrational numbers, Real numbers, Complex numbers. It shows the relationship between the different types of numbers."
  },
  "circles": {
    name: 'Circle',
    imageUrl: "https://dictionary.cambridge.org/images/thumb/circle_noun_001_02738.jpg?version=6.0.49",
    description: "Plain circle",
  },
  "pizza": {
    name: 'Pizza',
    imageUrl: "https://assets.surlatable.com/m/15a89c2d9c6c1345/72_dpi_webp-REC-283110_Pizza.jpg",
    description: "Pizza that is cut in 8 slices to use an example of circle",
  },
  "vectors": {
    name: 'Vectors',
    imageUrl: "https://mathinsight.org/media/image/image/vector.png",
    description: "A vector showing magnitude, direction, head and tail of a vector"
  }
}
/**
 * Order sandwich implementation
 * @param {string} userId - User ID
 * @param {string} channel - Channel
 * @param {string} filling - Sandwich filling
 * @returns {string} Confirmation message
 */
function orderSandwich(userId: string, channel: string, filling: string): string {
  console.log('Placing sandwich order for', userId, 'in', channel, 'with filling:', filling)
  return `Sandwich ordered with ${filling}. Enjoy!`
}

/**
 * Send photo implementation
 * @param {string} appId - Agora app ID
 * @param {string} userId - User ID
 * @param {string} channel - Channel
 * @returns {Promise<string>} Confirmation message
 */
async function sendPhoto(appId: string, userId: string, channel: string): Promise<string> {
  console.log('Sending photo to', userId, 'in', channel)

  const baseUrl = 'https://wam60lctyb.ufs.sh/f'
  const imageKeys = [
    'NW1E5hslypbTyr3pXL2RclXn8RktVdJgBrHwvPuqTQ07IaZK',
    'NW1E5hslypbTlfnx4uPvcHInBDXiCVuoxFkOeQ03bZs9g1J8',
    'NW1E5hslypbTYkNkclv7HblznpM10R5eNi7FIgK2UaEJXGsj',
    'NW1E5hslypbTps6TRQEUadZybDFIrAJWx9PVvq7Lik5s42CK',
    'NW1E5hslypbTKd7LgxLTJx0POtVY7r296oCajvpNeAkIHURE',
    'NW1E5hslypbToxjaZGD8nBTOwu9Qlxtg41JZcaSHmKRWhE6A',
    'NW1E5hslypbTfeQfhcgJX7CO6qwlaH1DP4hBcAfeT3VMoEIY',
    'NW1E5hslypbTAZfQ8kwVHtYufr7OCc1noEmRSIh5N3vLMkFK',
    'NW1E5hslypbTH3POzGldgaX05KqRFuM6Pz7QT8oBUCvm9NL1',
    'NW1E5hslypbTKsGWSQTJx0POtVY7r296oCajvpNeAkIHUREM',
    'NW1E5hslypbTcitWcAXjYIF82XSuziPgKHp3yrVwRJqvGcdD',
    'NW1E5hslypbTlsz4IxPvcHInBDXiCVuoxFkOeQ03bZs9g1J8',
    'NW1E5hslypbTcPtpRnXjYIF82XSuziPgKHp3yrVwRJqvGcdD',
    'NW1E5hslypbTdHrCp1xzBxhIYkECvTtU8Xb43SLM5f7dZacD',
    'NW1E5hslypbT1pC2GukLT4onszpWEaxCrMIVdPRmq5lf9bA3',
    'NW1E5hslypbTnetEdFd3AxIsubmQEtypwFHrVd1BGDShYUc0',
  ]
  const randomImageKey = imageKeys[Math.floor(Math.random() * imageKeys.length)]

  const payload = `{"img":"${baseUrl}/${randomImageKey}"}`

  // Call Agora's REST API to send the peer message
  await sendPeerMessage(appId, config.agentId, userId, payload)

  return `Photo sent successfully to user ${userId}.`
}

function getConceptPhoto(conceptName: string): {
  imageUrl: string
  description: string
  name: string
} {
  if (conceptName in listOfImagesWithConcepts) {
    return listOfImagesWithConcepts[conceptName as keyof typeof listOfImagesWithConcepts]
  } else {
    return {
      imageUrl: '',
      description: '',
      name: ''
    }
  }

}

function showConceptPhoto(userId: string, channel: string, conceptName: string): string {
  console.log('Showing concept photo for', userId, 'in', channel, 'with concept name:', conceptName)
  return `Concept photo shown for ${conceptName}.`
}

async function saveDataPoint(appId: string, userId: string, channel: string, message: string): Promise<string> {
  const payload = `{"textToDisplay":"${message}"}`
  console.log('Saving data point for', userId, 'in', channel, 'with message:', message)
  return `Data point saved for ${message}.`
}

async function sendQuestion(appId: string, userId: string, channel: string, message: string): Promise<string> {
  const payload = `{"textToDisplay":"${message}"}`
  console.log('Sending question for', userId, 'in', channel, 'with message:', message)
  return `Question sent for ${message}.`
}

/**
 * Function map to execute functions by name
 */
const functionMap: Record<string, FunctionHandler> = {
  save_data_point: (appId, userId, channel, args) => saveDataPoint(appId, userId, channel, args.data_point as string),
  send_question: (appId, userId, channel, args) => sendQuestion(appId, userId, channel, args.data_point as string),
  show_concept_photo: (appId, userId, channel, args) => showConceptPhoto(userId, channel, args.concept_name as string),
}

export { sendPeerMessage, orderSandwich, sendPhoto, functionMap, getConceptPhoto }
export type { PeerMessageResponse, FunctionArgs, FunctionHandler }
