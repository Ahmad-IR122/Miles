from fastapi import FastAPI
from pydantic import BaseModel
from app.services.chat import ask
from app.services.itinerary import generate_itinerary
from app.models.travel import TravelPreferences, TravelDataItem

app = FastAPI()


class PromptRequest(BaseModel):
    prompt: str


class ItineraryRequest(BaseModel):
  preferences: TravelPreferences
  travel_data: list[TravelDataItem] = []

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.post("/chat")
def chat(request: PromptRequest):
    response = ask(request.prompt)
    return {"response": response}


@app.post("/itinerary")
def itinerary(request: ItineraryRequest):
    result = generate_itinerary(request.preferences, request.travel_data)
    return result
