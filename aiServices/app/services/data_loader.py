import os
from io import BytesIO

import pandas as pd
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv


load_dotenv()

CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER")


if not CONNECTION_STRING:
    raise ValueError("AZURE_STORAGE_CONNECTION_STRING is missing")

if not CONTAINER_NAME:
    raise ValueError("AZURE_STORAGE_CONTAINER is missing")


blob_service_client = BlobServiceClient.from_connection_string(
    CONNECTION_STRING
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