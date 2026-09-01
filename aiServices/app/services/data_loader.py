import os
from functools import lru_cache
from io import BytesIO

import pandas as pd
from azure.identity import AzureCliCredential
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()

CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
ACCOUNT_URL = os.getenv("AZURE_STORAGE_ACCOUNT_URL")
CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER")


@lru_cache
def get_blob_service_client() -> BlobServiceClient:
    """Built lazily, on first actual use, rather than at import time.

    This module used to construct the client at import time, which meant a
    missing/invalid config crashed the entire app on startup — every
    router, including ones with nothing to do with recommendations
    (health, itinerary, chat...) — before any of them even finished
    loading. Deferring it means that only actually calling load_csv() (i.e.
    hitting the recommendations feature) requires storage to be
    configured; everything else keeps working.

    Prefers the connection string: it carries its own account key, so it
    works for local dev without an `az login`. Falls back to
    account-url + AzureCliCredential if only that's configured (e.g. an
    environment where the CLI is already signed in).
    """
    if CONNECTION_STRING:
        return BlobServiceClient.from_connection_string(CONNECTION_STRING)

    if ACCOUNT_URL:
        return BlobServiceClient(
            account_url=ACCOUNT_URL,
            credential=AzureCliCredential(),
        )

    raise RuntimeError(
        "Neither AZURE_STORAGE_CONNECTION_STRING nor AZURE_STORAGE_ACCOUNT_URL "
        "is set. Recommendations data loads from Azure Blob Storage and "
        "needs one of these env vars — see .env.example."
    )


def load_csv(blob_name: str) -> pd.DataFrame:
    blob_client = get_blob_service_client().get_blob_client(
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


