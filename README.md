# Concierge Chatbot Application

This project is a comprehensive concierge chatbot solution using a combination of AWS services like Lex, Lambda, SQS, OpenSearch, DynamoDB, and SES to provide users with restaurant recommendations based on their preferences.

## Overview

The Concierge Chatbot Application allows users to interact with a chatbot, specify their dining preferences, and receive restaurant recommendations based on the cuisine, location, and dining time. The application leverages AWS services to ensure scalability, security, and efficient data retrieval.

## Contributors
- Yash Amin (yva2006)
- Anish Nimbalkar (an4338)

## Video submission link
- https://youtu.be/dRagw-tuVxo

## Features

1. **Chat Interface**: A frontend chat interface to interact with the chatbot.
2. **API Integration**: Messages are processed through AWS API Gateway and passed to AWS Lex for natural language processing.
3. **DynamoDB Storage**: User session data is stored in DynamoDB, allowing the chatbot to remember the user's last search.
4. **OpenSearch Queries**: Restaurant data is indexed in OpenSearch and queried based on user preferences.
5. **Email Notifications**: AWS SES is used to send restaurant recommendations to the user via email.
6. **SQS Integration**: Messages are processed asynchronously using AWS SQS.

## Architecture

The application is designed using a serverless architecture to maximize scalability and efficiency.

1. **Frontend (Chatbot UI)**: Users interact with the chat interface built with JavaScript and jQuery.
2. **AWS Lex**: Lex handles the conversation flow and processes user input.
3. **Lambda Functions**: Lambda functions orchestrate communication between Lex, OpenSearch, DynamoDB, and SES.
4. **OpenSearch**: Indexes restaurant data based on various parameters like cuisine and location.
5. **DynamoDB**: Stores user session data and restaurant details.
6. **SES**: Sends email recommendations to users based on their search preferences.

## Technologies Used

- **AWS Lex**: Conversational AI for the chatbot.
- **AWS Lambda**: Serverless functions to process user requests.
- **AWS SQS**: Queue system for message handling.
- **AWS OpenSearch**: Search engine for querying restaurant data.
- **AWS DynamoDB**: NoSQL database for storing session and restaurant data.
- **AWS SES**: Email service for sending restaurant recommendations.
- **JavaScript/jQuery**: For the frontend interface.
- **Node.js**: Backend processing with AWS SDK v3.

## Usage

1. **Start a Conversation**: The user interacts with the chatbot interface and specifies their dining preferences.
2. **Receive Recommendations**: Based on the input, the chatbot fetches relevant restaurant details from OpenSearch and DynamoDB.
3. **Email Notification**: The user receives an email with detailed restaurant recommendations.

## Error Handling

1. **No Restaurants Found**: If no restaurants match the query, the user is informed and asked to modify their preferences.
2. **API Errors**: Any API errors are logged, and the user is prompted to try again later.

## Future Improvements

1. **Improve NLP Models**: Enhance the Lex chatbot with more advanced natural language understanding.
2. **User Authentication**: Add user authentication using AWS Cognito for better session management.
3. **Additional Filters**: Include more filters like price range, rating, and distance.
4. **Multi-lingual Support**: Implement support for multiple languages in the chatbot interface.
