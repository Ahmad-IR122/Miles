import os
from functools import lru_cache
from io import BytesIO

import pandas as pd
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def _get_blob_service_client() -> BlobServiceClient:
    """Build the blob client lazily, on first actual use.

    Building this — and validating the env vars it needs — at import time
    means any process that merely imports this module (a CI import-check, a
    test run, or another feature's startup path in app.main) crashes if
    Azure Storage isn't configured, even though only the recommendations
    feature actually needs it. Deferring to first use isolates a missing
    config to that feature instead of taking down the whole app.
    """
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not connection_string:
        raise ValueError("AZURE_STORAGE_CONNECTION_STRING is missing")

    return BlobServiceClient.from_connection_string(connection_string)


def _get_container_name() -> str:
    container_name = os.getenv("AZURE_STORAGE_CONTAINER")
    if not container_name:
        raise ValueError("AZURE_STORAGE_CONTAINER is missing")

    return container_name


def load_csv(blob_name: str) -> pd.DataFrame:
    blob_client = _get_blob_service_client().get_blob_client(
        container=_get_container_name(),
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