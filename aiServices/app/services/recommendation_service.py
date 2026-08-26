import ast
import re

import numpy as np
import pandas as pd
from app.services.data_loader import load_recommendation_data

INTEREST_COLUMNS = [
    "adventure",
    "art & culture",
    "food",
    "history",
    "nature",
    "nightlife",
    "other",
    "relaxation",
    "shopping",
]

BUDGET_LEVELS = {
    "low": 1,
    "mid": 2,
    "high": 3,
}

SIMILARITY_WEIGHT = 0.60
BUDGET_WEIGHT = 0.20
SEASON_WEIGHT = 0.15
STYLE_WEIGHT = 0.05


def normalize_text(text: str) -> str:
    """
    Normalize the input text by converting it to lowercase and stripping whitespace.
    """

    if pd.isna(text):
        return ""

    return text.lower().strip()


def normalize_interest_scores(profiles: pd.DataFrame) -> pd.DataFrame:
    profiles = profiles.copy()

    for column in INTEREST_COLUMNS:
        max_value = profiles[column].max()

        if max_value > 0:
            profiles[column] = profiles[column] / max_value

    return profiles


def build_user_profile(user_preferences: dict) -> dict:
    user_interests = {
        normalize_text(interest) for interest in user_preferences.get("interests", [])
    }

    interest_vector = {
        interest: 1.0 if interest in user_interests else 0.0
        for interest in INTEREST_COLUMNS
    }

    return {
        "interests": interest_vector,
        "budget_level": normalize_text(user_preferences.get("budget_level", "")),
        "travel_month": user_preferences.get("travel_month"),
        "style": normalize_text(user_preferences.get("style", "")),
    }


def parse_interests(value: str) -> list[str]:
    """
    Parse and normalize interest tags.

    Examples:
    'Adventure|Food'
        -> ['adventure', 'food']

    "['Adventure|Food']"
        -> ['adventure', 'food']

    "['Adventure', 'Food']"
        -> ['adventure', 'food']
    """

    if pd.isna(value):
        return []

    value = str(value).strip()

    interests = []

    # Handle list-like strings
    if value.startswith("[") and value.endswith("]"):
        try:
            parsed = ast.literal_eval(value)

            if isinstance(parsed, list):
                for item in parsed:
                    parts = re.split(r"[|/,]", str(item))

                    interests.extend(
                        normalize_text(part) for part in parts if normalize_text(part)
                    )

                return interests

        except (ValueError, SyntaxError):
            pass

    # Handle normal strings
    return [
        normalize_text(part)
        for part in re.split(r"[|/,]", value)
        if normalize_text(part)
    ]


def get_activity_interest_column(activities: pd.DataFrame) -> str | None:
    """
    Find the column that contains activity interest tags.
    """

    possible_columns = (
        "interest_tags",
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


def calculate_cosine_similarity(user_profile: dict, destination: pd.Series) -> float:
    """
    Calculate cosine similarity between
    user interests and a destination profile.
    """

    user_vector = np.array(
        [user_profile["interests"].get(interest, 0.0) for interest in INTEREST_COLUMNS],
        dtype=float,
    )

    destination_vector = np.array(
        [destination.get(interest, 0.0) for interest in INTEREST_COLUMNS], dtype=float
    )

    user_norm = np.linalg.norm(user_vector)
    destination_norm = np.linalg.norm(destination_vector)

    if user_norm == 0 or destination_norm == 0:
        return 0.0
    similarity = np.dot(user_vector, destination_vector) / (
        user_norm * destination_norm
    )

    return round(float(similarity), 4)


def calculate_similarity_scores(
    profiles: pd.DataFrame,
    user_profile: dict,
) -> pd.DataFrame:

    profiles = profiles.copy()

    profiles["similarity_score"] = profiles.apply(
        lambda destination: calculate_cosine_similarity(
            user_profile,
            destination,
        ),
        axis=1,
    )

    return profiles


def calculate_budget_score(user_budget: str, destination_budget: str) -> float:

    user_budget = normalize_text(user_budget)
    destination_budget = normalize_text(destination_budget)

    user_value = BUDGET_LEVELS.get(user_budget)
    destination_value = BUDGET_LEVELS.get(destination_budget)

    if user_value is None or destination_value is None:
        return 0.0

    difference = abs(user_value - destination_value)

    if difference == 0:
        return 1.0

    if difference == 1:
        return 0.7

    return 0.3


def calculate_budget_scores(profiles: pd.DataFrame, user_profile: dict) -> pd.DataFrame:

    profiles = profiles.copy()

    profiles["budget_score_match"] = profiles.apply(
        lambda destination: calculate_budget_score(
            user_profile.get("budget_level", ""),
            destination.get("budget_level", ""),
        ),
        axis=1,
    )

    return profiles


def calculate_season_score(travel_month: int, season_months) -> float:
    """
    Calculate how well the user's travel month
    matches the destination season.

    Exact month match -> 1.0
    No match          -> 0.0
    """

    if travel_month is None or pd.isna(season_months):
        return 0.0

    try:
        # Handle values like:
        # "[6, 7, 8]"
        if isinstance(season_months, str):
            season_months = ast.literal_eval(season_months)

        if not isinstance(season_months, (list, tuple, set)):
            return 0.0

        months = [int(month) for month in season_months]

        return 1.0 if int(travel_month) in months else 0.0

    except (ValueError, TypeError, SyntaxError):
        return 0.0


def calculate_season_scores(profiles: pd.DataFrame, user_profile: dict) -> pd.DataFrame:
    profiles = profiles.copy()

    profiles["season_score_match"] = profiles["season_months"].apply(
        lambda destination_season: calculate_season_score(
            user_profile.get("travel_month"), destination_season
        )
    )

    return profiles


def calculate_style_score(user_style: str, destination_style: str) -> float:
    """
    Calculate how well the user's preferred style
    matches the destination style.
    """

    user_style = normalize_text(user_style)
    destination_style = normalize_text(destination_style)

    if not user_style or not destination_style:
        return 0.0
    if user_style == destination_style:
        return 1.0
    return 0.0


def calculate_style_scores(profiles: pd.DataFrame, user_profile: dict) -> pd.DataFrame:

    profiles = profiles.copy()

    profiles["style_score_match"] = profiles["style"].apply(
        lambda destination_style: calculate_style_score(
            user_profile.get("style", ""),
            destination_style,
        )
    )

    return profiles


def calculate_final_scores(
    profiles: pd.DataFrame,
) -> pd.DataFrame:
    profiles = profiles.copy()

    profiles["final_score"] = (
        profiles["similarity_score"] * SIMILARITY_WEIGHT
        + profiles["budget_score_match"] * BUDGET_WEIGHT
        + profiles["season_score_match"] * SEASON_WEIGHT
        + profiles["style_score_match"] * STYLE_WEIGHT
    )

    profiles["final_score"] = profiles["final_score"].round(4)

    return profiles


def recommend_destinations(
    user_preferences: dict,
    limit: int = 5,
) -> pd.DataFrame:
    """
    Generate personalized destination recommendations.

    Steps:
    1. Load recommendation data
    2. Build destination profiles
    3. Normalize interest scores
    4. Build user profile
    5. Calculate similarity
    6. Calculate budget, season, and style matches
    7. Calculate final score
    8. Rank destinations
    9. Return top N recommendations
    """

    destinations, activities, _ = load_recommendation_data()

    profiles = build_recommendation_profiles(
        destinations=destinations,
        activities=activities,
    )

    profiles = normalize_interest_scores(profiles)

    user_profile = build_user_profile(user_preferences)

    profiles = calculate_similarity_scores(
        profiles,
        user_profile,
    )

    profiles = calculate_budget_scores(
        profiles,
        user_profile,
    )

    profiles = calculate_season_scores(
        profiles,
        user_profile,
    )

    profiles = calculate_style_scores(
        profiles,
        user_profile,
    )

    profiles = calculate_final_scores(
        profiles,
    )

    results = profiles.sort_values(
        by="final_score",
        ascending=False,
    )

    recommendations = results[
        [
            "destination_id",
            "city",
            "country",
            "region",
            "style",
            "budget_level",
            "similarity_score",
            "budget_score_match",
            "season_score_match",
            "style_score_match",
            "final_score",
        ]
    ].head(limit)

    return recommendations.to_dict(orient="records")
