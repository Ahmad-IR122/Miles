import os
from io import BytesIO

import pandas as pd
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv


load_dotenv()

ACCOUNT_URL = os.getenv("AZURE_STORAGE_ACCOUNT_URL")
CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER")
print(f"ACCOUNT_URL: {ACCOUNT_URL}")
print(f"CONTAINER_NAME: {CONTAINER_NAME}")
credential = DefaultAzureCredential()

blob_service_client = BlobServiceClient(
    account_url=ACCOUNT_URL,
    credential=credential,
)


def load_csv(blob_name: str) -> pd.DataFrame:
    blob_client = blob_service_client.get_blob_client(
        container=CONTAINER_NAME,
        blob=blob_name,
    )

    data = blob_client.download_blob().readall()

    return pd.read_csv(BytesIO(data))


def load_recommendation_data():
    destinations = load_csv(
        "destinations/destinations.csv"
    )

    activities = load_csv(
        "activities/activities.csv"
    )

    restaurants = load_csv(
        "restaurants/restaurants.csv"
    )

    return destinations, activities, restaurants
  
def main():
    destinations, activities, restaurants = load_recommendation_data()

    print("Destinations:", destinations.shape)
    print("Activities:", activities.shape)
    print("Restaurants:", restaurants.shape)


if __name__ == "__main__":
    main()