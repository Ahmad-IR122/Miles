import os
from io import BytesIO

import pandas as pd
from azure.storage.blob import BlobServiceClient
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

load_dotenv()
ACCOUNT_URL = os.getenv("AZURE_STORAGE_ACCOUNT_URL")
CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER")

credential = DefaultAzureCredential()
blob_service_client = BlobServiceClient(account_url=ACCOUNT_URL, credential=credential)



def load_csv(blob_name : str) -> pd.DataFrame:
    """
    Load a CSV file from Azure Blob Storage and return it as a pandas DataFrame.

    Args:
        blob_name (str): The name of the blob (CSV file) to load.

    Returns:
        pd.DataFrame: The loaded data as a pandas DataFrame.
    """
    
    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=blob_name)
    data = blob_client.download_blob().readall()
    
    return pd.read_csv(BytesIO(data))
  

def load_recommendation_data():
    """
    Load the recommendation data from Azure Blob Storage.

    Returns:
        tuple: A tuple containing two pandas DataFrames: destinations and activities.
    """
    destinations = load_csv("destinations.csv")
    activities = load_csv("activities.csv")
    restaurants = load_csv("restaurants.csv")
    return destinations, activities, restaurants
