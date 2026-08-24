from app.services.data_loader import load_recommendation_data

import pandas as pd

destinations, activities, restaurants = load_recommendation_data()


def normalize_text(text: str) -> str:
    """
    Normalize the input text by converting it to lowercase and stripping whitespace.
    """

    if pd.isna(text):
        return ""

    return text.lower().strip()


def parse_interests(
    value: str,
) -> list[
    str
]:  # this function used to clean and parse the interests from the CSV files, splitting them by '|' and converting them to lowercase
    """
    Convert activity interest tags into a list.

    Example:
    'Adventure|Food'
    ->
    ['adventure', 'food']
    """

    if pd.isna(value):
        return []
    return [
        normalize_text(interest)
        for interest in str(value).split("|")
        if normalize_text(interest)
    ]


def build_recommendation_profiles(destinations: pd.DataFrame, activities: pd.DataFrame) -> pd.DataFrame:
    """
    Build one recommendation profile for each destination.

    Combines destination attributes with activity interests.
    """
    
    destination_profiles = destinations.copy()
    activity_profiles = activities.copy()
    # Normalize text fields in both DataFrames
    destination_profiles['style'] = destinations['style'].apply(normalize_text)
    destination_profiles["budget_level"] = destinations["budget_level"].apply(normalize_text)
    destination_profiles["best_season"] = destinations["best_season"].apply(normalize_text)
    
    activity_profiles["interests"] = activities["interests"].apply(parse_interests)
    """
    Example:
    'Adventure|Food'
    ->
    ['adventure', 'food']
    """
    activity_profiles = activity_profiles.explode("interests")
    
    # Remove empty interests
    activity_profiles = activity_profiles[
    activity_profiles["interests"].notna()
    & (activity_profiles["interests"] != "")
    ]


