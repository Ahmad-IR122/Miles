from fastapi import FastAPI
from pydantic import BaseModel
from app.services.chat import ask
from app.services.search_service import SearchService

app = FastAPI()
search_service = SearchService()

class PromptRequest(BaseModel):
  prompt: str

@app.get("/")
def read_root():
  return {"message": "Hello, World!" } # for testing purposes, you can remove this later

@app.post("/chat")
def chat(request: PromptRequest):
  response = ask(request.prompt)
  return {"response": response}

@app.post("/search") 
def search(request: PromptRequest):
  results = search_service.search(request.prompt)
  return {"results": results}