import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"; // AWS SDK v3
import {saveSession} from './lastSession.mjs';
const sqsClient = new SQSClient();

const QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/637423540591/Q1"

export function elicitSlot(sessionState, session, intentName, slotToElicit) {
        return {
            sessionState: {
                ...sessionState,
                dialogAction: {
                    type: "ElicitSlot",
                    slotToElicit: slotToElicit,
                    intent: {
                        name: intentName,
                        state: "InProgress"
                    }
                },
                sessionId: session
            }
        };
    }
export function confirmIntent(sessionState, session, intentName, slots) {
        return {
            sessionState: {
                ...sessionState,
                dialogAction: {
                    type: "ConfirmIntent"
                },
                intent: {
                    name: intentName,
                    state: "InProgress",
                    slots: slots
                },
                sessionId: session
            }
        };
    }

export async function fulfillIntent(sessionState, session, intentName, slots) {
        const messageBody = JSON.stringify({
            Location: slots.Location?.value?.interpretedValue,
            Cuisine: slots.Cuisine?.value?.interpretedValue,
            DiningTime: slots.DiningTime?.value?.interpretedValue,
            Members: slots.Members?.value?.interpretedValue,
            Email: slots.Email?.value?.interpretedValue,
        });

        const params = {
            QueueUrl: QUEUE_URL,
            MessageBody: messageBody,
        };
    
        try {
            const command = new SendMessageCommand(params);
            const result = await sqsClient.send(command);
            console.log('Message sent to SQS:', result.MessageId);
        } catch (error) {
            console.error('Error sending message to SQS:', error);
        }
        const Location = slots.Location?.value?.interpretedValue;
        const Cuisine = slots.Cuisine?.value?.interpretedValue;
        const Email= slots.Email?.value?.interpretedValue;
        const response = await saveSession(session, Email, Location, Cuisine)
            return {
                sessionState: {
                    ...sessionState,
                    dialogAction: {
                        type: "Delegate",
                    },
                    intent: {
                        name: intentName,
                        state: "Fulfilled",
                        slots: slots
                    },
                    sessionId: session
                }
            };
            
}
    
export function denyIntent(sessionState, session, intentName) {
        return {
            sessionState: {
                ...sessionState,
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: intentName,
                    state: "Failed"
                },
                sessionId: session
            }
        };
    }
    
export function closeIntent(sessionState, session, intentName, state) {
        return {
            sessionState: {
                ...sessionState,
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: intentName,
                    state: state
                },
                sessionId: session
            }
        };
    }