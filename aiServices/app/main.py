from fastapi import FastAPI
from pydantic import BaseModel
from app.services.chat import ask

app = FastAPI()


class PromptRequest(BaseModel):
    prompt: str


@app.get("/")
def read_root():
    return {
        "message": "Hello, World!"
    }  # for testing purposes, you can remove this later


@app.post("/chat")
def chat(request: PromptRequest):
    response = ask(request.prompt)
    return {"response": response}
