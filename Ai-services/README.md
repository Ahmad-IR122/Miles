# AI Services

This project is a small FastAPI service that wraps Azure OpenAI and exposes a simple HTTP API for chat-style prompts.

## What it does

- Starts a FastAPI application.
- Accepts a prompt in JSON format.
- Sends the prompt to Azure OpenAI using the configured deployment.
- Returns the model response as JSON.

## API endpoints

- GET / returns a simple health check message.
- POST /chat accepts a prompt and returns the generated response.

Example request body:

{
	"prompt": "Write a short welcome message"
}

## Configuration

The app reads its settings from a .env file in the Ai-services folder.

Required environment variables:

- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_DEPLOYMENT
- AZURE_OPENAI_API_KEY
- AZURE_OPENAI_API_VERSION


## How to run

1. Open a terminal in the Ai-services folder.
2. Install the dependencies with pip install -r requirements.txt.
3. Create a .env file with the variables above.
4. Start the service with uvicorn app.main:app --reload.
5. Open http://127.0.0.1:8000/ to verify the app is running.

## Example usage

Send a POST request to /chat with a prompt in the body. For example, using curl:

curl -X POST http://127.0.0.1:8000/chat -H "Content-Type: application/json" -d "{\"prompt\":\"Hello!\"}"

also you ccan use api test tools like : postman 
## Project structure

```md
Ai-services/
├── README.md
├── requirements.txt
├── pyproject.toml
├── config.py
└── app/
	├── __init__.py
	├── config.py
	├── main.py
	├── clients/
	│   ├── __init__.py
	│   └── azure_openai.py
	├── prompts/
	│   └── deleteit.txt
	└── services/
		└── chat.py
```

- app/main.py contains the FastAPI routes.
- app/services/chat.py sends prompts to Azure OpenAI.
- app/clients/azure_openai.py builds the Azure OpenAI client.
- app/config.py loads environment settings.
