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


@lru_cache(maxsize=1)
def _get_blob_service_client() -> BlobServiceClient:
    """Build the Azure Blob client lazily.

    Building this at import time meant a missing/misconfigured storage
    config crashed the entire app on startup -- not just the one feature
    (dataset lookups) that actually needs it. Constructing it here means
    that failure only happens when something actually calls load_csv(),
    so callers can catch it and degrade gracefully.

    Prefers the connection string: it carries its own account key, so it
    works for local dev without an `az login`. Falls back to
    account-url + AzureCliCredential if only that's configured.
    """
    if CONNECTION_STRING:
        return BlobServiceClient.from_connection_string(CONNECTION_STRING)

    if ACCOUNT_URL:
        return BlobServiceClient(
            account_url=ACCOUNT_URL,
            credential=AzureCliCredential(),
        )

    raise ValueError(
        "Neither AZURE_STORAGE_CONNECTION_STRING nor AZURE_STORAGE_ACCOUNT_URL "
        "is set -- check your .env file."
    )


def load_csv(blob_name: str) -> pd.DataFrame:
    if not CONTAINER_NAME:
        raise ValueError(
            "AZURE_STORAGE_CONTAINER is not set -- check your .env file."
        )

    blob_client = _get_blob_service_client().get_blob_client(
        container=CONTAINER_NAME,
        blob=blob_name,
    )

    data = blob_client.download_blob().readall()

    return pd.read_csv(BytesIO(data))


@lru_cache(maxsize=1)
def load_recommendation_data():
    destinations = load_csv("destinations/destinations.csv")
    activities = load_csv("activities/activities.csv")
    restaurants = load_csv("restaurants/restaurants.csv")

    return destinations, activities, restaurants