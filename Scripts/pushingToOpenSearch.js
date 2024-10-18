const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { Client } = require('@opensearch-project/opensearch');




const dynamodb = new DynamoDBClient({
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'AKIAZI2LHLFXQE4MB2QP',
            secretAccessKey: '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'
        }
    });


const client = new Client({
    node: "https://search-dinnerbuddydomain-yuopireyv6r7m6vva56p53wk5y.aos.us-east-1.on.aws",
    auth: {
        username: "luffy5656",
        password: "Zoro@1017#Sanji"
    },
    ssl: {
        rejectUnauthorized: false
    }
});

async function indexRestaurant(items) {
    const bulkBody = [];

    items.forEach(item => {
        bulkBody.push({
            index: {
                _index: "restaurants",
                _id: item.BusinessID
            }
        });
        bulkBody.push({
            RestaurantID: item.BusinessID,
            Cuisine: item.Cuisine,
        });
    });

    try {
        const response = await client.bulk({ refresh: true, body: bulkBody });
        if (response.errors) {
            console.error("Error when indexing restaurants",response.errors);
        } else {
            console.log("Successfully indexed restaurants to OpenSearch");
        }
    } catch (err) {
        console.log("Error", err);
    }
    }

async function main() {
    try {
        const command = new ScanCommand({
            TableName: "yelp-restaurants"
        });
        const data = await dynamodb.send(command);

        if (data.Items) {
            await indexRestaurant(data.Items.map(item => {
                return {
                    BusinessID: item.BusinessID.S,
                    Cuisine: item.Cuisine.S
                };
            }));
        }
    } catch (err) {
        console.log("Error", err);
    }
}

main();