import { closeIntent, elicitSlot, confirmIntent, fulfillIntent, denyIntent } from './intent.mjs';
// import { validateLocation, validateCuisine, validateDinitingTime, validateNumberOfMembers, validateEmail } from './validators.mjs';
import { getLastSession, recommendLastSession } from './lastSession.mjs';

export const handler = async (event) => {
    console.log("Received event from lex: ", JSON.stringify(event, null, 2));
    
    const session = event.sessionId;
    const intentName = event.sessionState?.intent?.name || 'UnknownIntent';
    const confirmStatus = event.sessionState?.intent?.confirmationState || "None";
    const sessionState = event.sessionState || {};
    const slots = event.sessionState?.intent?.slots || {};
    const lastSession = await getLastSession(session);
    
    console.log('last Session response',lastSession);
    
    switch (intentName) {
        case "GreetingIntent":
            if (lastSession){
                const lastCuisine = lastSession.LastCuisine.S;
                const restResponse = await recommendLastSession(lastCuisine);
                let message = 'Here are some restaurant recommendations based on your previous preferences:\n\n';

                restResponse.forEach((restaurant, index) => {
                    const name = restaurant.name.S;
                    const address = restaurant.address.S;
                    const rating = restaurant.rating.N;
                    const reviewCount = restaurant.review_count.N;
                
                    message += `${index + 1}. ${name} located at ${address}.\n\n  Rating: ${rating} stars based on ${reviewCount} reviews.\n\n`;
                });
                
                message += `We hope you enjoy your dining experience!`;

                
                return {
                    messages: [
                        {
                            contentType: 'SSML',
                            content: message
                        }],
                    sessionState: {
                        ...sessionState,
                        dialogAction: {
                            type: "ElicitIntent",
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
            return closeIntent(sessionState, session, intentName, "Fulfilled");
        
        case "ThankYouIntent":
            return closeIntent(sessionState, session, intentName, "Fulfilled");

        case "DiningSuggestionIntent":
            const location = slots.Location?.value;
            const cuisine = slots.Cuisine?.value;
            const diningtime = slots.DiningTime?.value;
            const members = slots.Members?.value;
            const email = slots.Email?.value;

            // Check if slots are missing and elicit them
            if (!location) return elicitSlot(sessionState, session, intentName, "Location");
            if (!cuisine) return elicitSlot(sessionState, session, intentName, "Cuisine");
            if (!diningtime) return elicitSlot(sessionState, session, intentName, "DiningTime");
            if (!members) return elicitSlot(sessionState, session, intentName, "Members");
            if (!email) return elicitSlot(sessionState, session, intentName, "Email");

            // Handle confirmation step
            if (confirmStatus === "None") {
                return confirmIntent(sessionState, session, intentName, slots);
            }

            // Fulfillment or Denial
            if (confirmStatus === "Confirmed") {
                return await fulfillIntent(sessionState, session, intentName, slots);
            }

            if (confirmStatus === "Denied") {
                return denyIntent(sessionState, session, intentName);
            }

        default:
            return closeIntent(sessionState, session, intentName, "Fulfilled");
    }
};
