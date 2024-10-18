import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand  } from "@aws-sdk/client-sqs"; // AWS SDK v3
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { Client }  from '@opensearch-project/opensearch';
import {SESClient, SendEmailCommand} from '@aws-sdk/client-ses';
import { marked } from 'marked';

// This is the Opensearch Client
const opensearchClient = new Client({
    node: "https://search-dinnerbuddydomain-yuopireyv6r7m6vva56p53wk5y.aos.us-east-1.on.aws",
    auth: {
        username: "luffy5656",
        password: "Zoro@1017#Sanji"
    },
    ssl: {
        rejectUnauthorized: false
    }
});

// This is the SQS Client
const sqsClient = new SQSClient();

// This is the DynamoDB Client
const dynamoDBClient = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIAZI2LHLFXQE4MB2QP',
    secretAccessKey:'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', 
  },
})

// This is the SES Client
const sesClient = new SESClient({ region: 'us-east-1'});

// Important Information
const SQS_URL = "https://sqs.us-east-1.amazonaws.com/637423540591/Q1";
const TABLE_NAME = 'yelp-restaurants';

export const handler = async (event) => {
  try{
    const inputBody = {
      QueueUrl: SQS_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 5,
      MessageAttributeNames: ["All"]
    };
    
    const command = new ReceiveMessageCommand(inputBody);
    const data = await sqsClient.send(command);
    
    if (data.Messages && data.Messages.length > 0){
      const message = data.Messages[0];
      
      const messageBody = JSON.parse(message.Body);
      
      const { Location, Cuisine, DiningTime, Members, Email } = messageBody;
      const query = {
        index: "restaurants",
        body: {
          query: {
            match: {
              "Cuisine": Cuisine.toLowerCase(),
            }
          }
        }
      };
      
      const searchResponse = await opensearchClient.search(query);
      // console.log(searchResponse.body.hits.hits[0]);
      let restaurantDets;
      if (searchResponse.body.hits.hits.length > 0){
        const restaurantIds = searchResponse.body.hits.hits.map(hit => hit._id);
      
        console.log(restaurantIds);
        restaurantDets = await Promise.all(restaurantIds.map(async (id) => {
          
          const getItemParams = {
            TableName :TABLE_NAME,
            Key: {
              'BusinessID': {S: id},
              'Cuisine': {S : Cuisine.toLowerCase() }
            }
          };
          const response = await dynamoDBClient.send(new GetItemCommand(getItemParams));
          return response.Item;
        }));
       
      } 
      // This is to delete the message
      const deleteParams = {
        QueueUrl: SQS_URL,
        ReceiptHandle: message.ReceiptHandle
      };
      const deleteCommand = new DeleteMessageCommand(deleteParams);
      await sqsClient.send(deleteCommand);
      const emailBody = generateEmailBody(restaurantDets, DiningTime);
      await sendEmail("an4338@nyu.edu", emailBody);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Message received successfully, Search executed successfully",
          messageBody: message.Body,
          searchResults: searchResponse.body.hits.hits,
          restaurantDets: restaurantDets,
          emailBody: emailBody
          // response: response.Item
        })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "No messages available in the queue"
        })
      };
    }
  } catch (error){  
    console.error("Error receiving messages", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error receiving messages",
        error: error.message
      })
    };
  }
  
  
  // Generating the Email Body
  function generateEmailBody(restaurantDets, DiningTime) {
    let emailBody = `Here are some restaurant recommendations for your meal at ${DiningTime} based on your preferences:\n\n`;
    
    restaurantDets.forEach((restaurant, index) => {
      const name = restaurant.name.S;
      const address = restaurant.address.S;
      const rating = restaurant.rating.N;
      const reviewCount = restaurant.review_count.N;
      
      emailBody += `- **${name}**\n  Located at *${address}*, this restaurant has a rating of **${rating} stars** based on **${reviewCount} reviews**.\n\n`
    });
    emailBody += `Enjoy your dining experience!\n\nBest regards,\n\nDinning Buddy`;
    
    return emailBody;
  }
  
  // Sending a email pleajje
  async function sendEmail(recipentEmail, body){
    const markedDownBody = marked(body);
    const params = {
      Destination: {
        ToAddresses: [recipentEmail],
      },
      Message: {
        Body: {
          Html: { Data: markedDownBody }
        },
        Subject: {Data: "Your Restaurant Recommendations" }
      },
      Source: "an4338@nyu.edu"
    };
    
    try {
      const data = await sesClient.send(new SendEmailCommand(params));
      console.log("Email sent successfully", data);
    } catch (error){
      console.error("Error sending email", error);
    }
  }
};
