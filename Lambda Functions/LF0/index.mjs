import {LexRuntimeV2Client, RecognizeTextCommand} from "@aws-sdk/client-lex-runtime-v2";

const lexClient = new LexRuntimeV2Client({region: "us-east-1"});

export const handler = async (event) => {
  try {
    console.log(event);
    // const body = JSON.parse(event);
    const userMessage = event.messages[0].unstructured.text;
    console.log(userMessage);
    const params = {
      botAliasId: "PE2YB2SD6D",
      botId: "NJYLFYBWZ9",
      localeId: "en_US",
      sessionId: "637423540591473",
      text: userMessage
    };
    // 637423540591169
    const command = new RecognizeTextCommand(params);
    const lexResponse = await lexClient.send(command);
    console.log
    const lexMessages = lexResponse.messages.map((message, index) => {
            return {
                "type": "unstructured",
                "unstructured": {
                    "id": index + 1,  // Unique ID for each message
                    "text": message.content || "Sorry, I didn't understand that.",
                }
            };
        });

        const response = {
            "messages": lexMessages
        };

    return response;
  } catch (error){
    console.error("Error interacting with Lex: ", error);
    return {
        "messages": [
            {
                "type": "unstructured",
                "unstructured": {
                    "id": 1,
                    "text": "I'm still under development, please come back later!",
                }
            }
        ]
    }
  }
};