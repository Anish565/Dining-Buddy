import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Client }  from '@opensearch-project/opensearch';


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

const dynamoDBClient = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIAZI2LHLFXQE4MB2QP',
    secretAccessKey:'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', 
  },
});

const  TABLE_NAME = 'last-Session-Info';

export async function saveSession(sessionId, email, location, cuisine){
    const params = {
        TableName: TABLE_NAME,
        Item: {
            'sessionID': {S: sessionId},
            'userEmail': {S: email},
            'LastLocation': {S: location},
            'LastCuisine': {S: cuisine},
            'TimeStamp': {S: new Date().toISOString()}
        }
    };
    
    const response = await dynamoDBClient.send(new PutItemCommand(params));
    return response.Item;
}

export async function getLastSession(sessionId){
    const params = {
        TableName: TABLE_NAME,
        Key: {
            'sessionID': { S: sessionId }  // Make sure the sessionID is in the correct format
        }
    };
    console.log(params);

    const response = await dynamoDBClient.send(new GetItemCommand(params));
    console.log(response);

    // Check if Item exists in the response
    if (response.Item) {
        return response.Item;
    } else {
        console.log('Session ID does not exist');
        return null;  // Session ID not found
    }
}


export async function recommendLastSession(cuisine){
    console.log(cuisine)
    const query = {
        index: "restaurants",
        body: {
            size: 2,
          query: {
            match: {
              "Cuisine": cuisine.toLowerCase(),
            }
          }
        }
      };
    
    const searchResponse = await opensearchClient.search(query);
    console.log(searchResponse.body.hits.hits);
    let restDets;
    if (searchResponse.body.hits.hits.length > 0){
        const restaurantIds = searchResponse.body.hits.hits.map(hit => hit._id);
      
        console.log(restaurantIds);
        restDets = await Promise.all(restaurantIds.map(async (id) => {
          
          const getItemParams = {
            TableName :'yelp-restaurants',
            Key: {
              'BusinessID': {S: id},
              'Cuisine': {S : cuisine.toLowerCase() }
            }
          };
          const response = await dynamoDBClient.send(new GetItemCommand(getItemParams));
          return response.Item;
        }));
       
      }
      return restDets;
}