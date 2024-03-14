# Robot Web

This is a chatbot website built using Next.js, Material-UI, and MongoDB. It utilizes [langchain.js](https://github.com/langchain-ai/langchainjs) for conversation control.

## Features

- :memo: Conversation history
- :bulb: AI preset management
- :globe_with_meridians: Search and Browser plugins

## Usage

1. Create your own local environment variables by following the instructions in `.env.local.tpl`.
2. Start the development server: `yarn dev`
3. Open your browser and visit `http://localhost:3000`

## Deploy

To deploy the chatbot website, you can follow these steps:

1. Sign up for an account on [Vercel](https://vercel.com/) if you don't have one already.
2. Import your repository into Vercel by connecting your GitHub account and selecting the repository.
3. Define the necessary environment variables in the Vercel dashboard. This may include the MongoDB connection string and any other configuration options.
4. Optionally, if you want to integrate with MongoDB Atlas, you can create a new cluster and obtain the connection string.
5. Once the environment variables are defined, Vercel will automatically deploy your application.
6. Open your browser and visit the deployed URL to see your chatbot website in action.

## Services

This project utilizes the following services:

- [OpenAI API](https://openai.com/): Used for AI-powered conversation.
- [MongoDB (atlas)](https://www.mongodb.com/): Used as the database for storing conversation history and other data.
- [AWS S3](https://aws.amazon.com/s3/): Used for storing files and media assets.
- [BrightData SERP API (optional)](https://brightdata.com/): Used for search and browser plugins.

To use these services, you need to register and obtain API keys for each service. Once you have the API keys, you can configure them as environment variables in project and vercel.
