import re

import pandas as pd

from data_loader import load_recommendation_data


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
        for interest in re.split(r"[|/,]", str(value))
        if normalize_text(interest)
    ]


def get_activity_interest_column(activities: pd.DataFrame) -> str | None:
    """
    Find the column that contains activity tags/categories.
    """

    possible_columns = (
        "interests",
        "interest",
        "categories",
        "category",
        "tags",
        "tag",
    )

    normalized_columns = {
        normalize_text(column): column for column in activities.columns
    }

    for column in possible_columns:
        if column in normalized_columns:
            return normalized_columns[column]

    return None


def build_recommendation_profiles(
    destinations: pd.DataFrame, activities: pd.DataFrame
) -> pd.DataFrame:
    """
    Build one recommendation profile for each destination.

    Combines destination attributes with activity interests.
    """

    destination_profiles = destinations.copy()
    activity_profiles = activities.copy()
    # Normalize text fields in both DataFrames
    destination_profiles["style"] = destinations["style"].apply(normalize_text)
    destination_profiles["budget_level"] = destinations["budget_level"].apply(
        normalize_text
    )
    destination_profiles["best_season"] = destinations["best_season"].apply(
        normalize_text
    )

    interest_column = get_activity_interest_column(activities)
    if interest_column:
        activity_profiles["interests"] = activities[interest_column].apply(
            parse_interests
        )
    else:
        activity_profiles["interests"] = [[] for _ in range(len(activity_profiles))]

    """
    Example:
    'Adventure|Food'
    ->
    ['adventure', 'food']
    """
    activity_profiles = activity_profiles.explode("interests")

    # Remove empty interests
    activity_profiles = activity_profiles[
        activity_profiles["interests"].notna() & (activity_profiles["interests"] != "")
    ]

    # Count each interest for every destination
    if activity_profiles.empty:
        interest_counts = pd.DataFrame(columns=["destination_id"])
    else:
        interest_counts = (
            activity_profiles.groupby(["destination_id", "interests"])
            .size()
            .unstack(fill_value=0)
            .reset_index()
        )

    profiles = destination_profiles[
        [
            "destination_id",
            "city",
            "country",
            "region",
            "style",
            "budget_level",
            "budget_score",
            "best_season",
            "season_months",
        ]
    ].copy()
    
    profiles = profiles.merge(interest_counts, on="destination_id", how="left")
    
    profiles.fillna(0, inplace=True)  # Fill NaN values with 0 for interest counts
    
    return profiles
  
  
def main():
    destinations, activities, _ = load_recommendation_data()

    profiles = build_recommendation_profiles(
        destinations=destinations,
        activities=activities,
    )

    print("\nDestination Profiles:")
    print(profiles.head())

    print("\nProfile Columns:")
    print(profiles.columns.tolist())

    print("\nTotal Profiles:")
    print(len(profiles))


if __name__ == "__main__":
    main()
