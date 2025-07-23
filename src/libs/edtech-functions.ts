import { ChatCompletionTool } from "openai/resources/chat/completions";
import { listOfImagesWithConcepts } from "./tools";

const getEdtechFunctions = (): ChatCompletionTool[] => {
    return [{
        type: "function",
        function: {
            name: "show_question",
            description: "ALways use this function to show question to the user on the screen. Always use this function to ask a multiple choice question to the user.",
            parameters: {
                type: "object",
                properties: {
                    questionDescription: {
                        type: "string",
                        description: "The text of the quiz question"
                    },
                    options: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        minItems: 4,
                        maxItems: 4,
                        description: "An array of answer options"
                    }
                },
                required: ["questionDescription", "options"]
            }
        }
    }, {
        type: "function",
        function: {
            name: "show_image",
            description: "This function will show a image to the user and tell you the metadata about the image. You can then use this image to explain the concept to the user.",
            parameters: {
                type: "object",
                properties: {
                    conceptName: {
                        type: "string",
                        enum: Object.keys(listOfImagesWithConcepts),
                        description: "Name of the concept you want to show the user."
                    }
                },
                required: ["conceptName"]
            }
        }
    }];
}

export { getEdtechFunctions as getUserFunctions }