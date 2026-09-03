import os
from functools import lru_cache
from io import BytesIO

import pandas as pd
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv


load_dotenv()

CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
ACCOUNT_URL = os.getenv("AZURE_STORAGE_ACCOUNT_URL")
CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER")


@lru_cache(maxsize=1)
def _get_blob_service_client() -> BlobServiceClient:
    """
    Create the Azure Blob Storage client lazily.

    Priority:
    1. Connection string, if configured.
    2. Account URL with DefaultAzureCredential.

    DefaultAzureCredential can use Azure CLI credentials locally
    and Managed Identity when deployed to Azure App Service.
    """

    if CONNECTION_STRING:
        return BlobServiceClient.from_connection_string(
            CONNECTION_STRING
        )

    if ACCOUNT_URL:
        credential = DefaultAzureCredential()

        return BlobServiceClient(
            account_url=ACCOUNT_URL,
            credential=credential,
        )

    raise ValueError(
        "Azure Storage is not configured. "
        "Set AZURE_STORAGE_CONNECTION_STRING "
        "or AZURE_STORAGE_ACCOUNT_URL."
    )


def load_csv(blob_name: str) -> pd.DataFrame:
    """
    Download a CSV file from Azure Blob Storage
    and return it as a pandas DataFrame.
    """

    if not CONTAINER_NAME:
        raise ValueError(
            "AZURE_STORAGE_CONTAINER is not configured."
        )

    blob_client = _get_blob_service_client().get_blob_client(
        container=CONTAINER_NAME,
        blob=blob_name,
    )

    data = blob_client.download_blob().readall()

    return pd.read_csv(BytesIO(data))


@lru_cache(maxsize=1)
def load_recommendation_data():
    """
    Load all datasets required by the recommendation system.
    """

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