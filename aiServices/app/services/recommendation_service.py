import ast
import re

import numpy as np
import pandas as pd

from data_loader import load_recommendation_data

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
    Normalize text by converting it to lowercase
    and removing surrounding whitespace.
    """

    if pd.isna(text):
        return ""

    return str(text).lower().strip()


def normalize_interest_scores(
    profiles: pd.DataFrame,
) -> pd.DataFrame:
    profiles = profiles.copy()

    for column in INTEREST_COLUMNS:
        max_value = profiles[column].max()

        if max_value > 0:
            profiles[column] = profiles[column] / max_value

    return profiles


def build_user_profile(
    user_preferences: dict,
) -> dict:
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
    Parse and normalize activity interest tags.

    Examples:

    Adventure|Food
        -> ["adventure", "food"]

    ['Adventure|Food']
        -> ["adventure", "food"]

    ['Adventure', 'Food']
        -> ["adventure", "food"]
    """

    if pd.isna(value):
        return []

    value = str(value).strip()

    interests = []

    if value.startswith("[") and value.endswith("]"):
        try:
            parsed = ast.literal_eval(value)

            if isinstance(parsed, list):
                for item in parsed:
                    parts = re.split(
                        r"[|/,]",
                        str(item),
                    )

                    interests.extend(
                        normalize_text(part) for part in parts if normalize_text(part)
                    )

                return interests

        except (ValueError, SyntaxError):
            pass

    return [
        normalize_text(part)
        for part in re.split(r"[|/,]", value)
        if normalize_text(part)
    ]


def get_activity_interest_column(
    activities: pd.DataFrame,
) -> str | None:
    """
    Find the column containing activity interest tags.
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
    destinations: pd.DataFrame,
    activities: pd.DataFrame,
) -> pd.DataFrame:
    """
    Build one recommendation profile
    for each destination.
    """

    destination_profiles = destinations.copy()
    activity_profiles = activities.copy()

    destination_profiles["style"] = destination_profiles["style"].apply(normalize_text)

    destination_profiles["budget_level"] = destination_profiles["budget_level"].apply(
        normalize_text
    )

    destination_profiles["best_season"] = destination_profiles["best_season"].apply(
        normalize_text
    )

    interest_column = get_activity_interest_column(activities)

    if interest_column:
        activity_profiles["interests"] = activity_profiles[interest_column].apply(
            parse_interests
        )
    else:
        activity_profiles["interests"] = [[] for _ in range(len(activity_profiles))]

    activity_profiles = activity_profiles.explode("interests")

    activity_profiles = activity_profiles[
        activity_profiles["interests"].notna() & (activity_profiles["interests"] != "")
    ]

    if activity_profiles.empty:
        interest_counts = pd.DataFrame(columns=["destination_id"])

    else:
        interest_counts = (
            activity_profiles.groupby(
                [
                    "destination_id",
                    "interests",
                ]
            )
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

    profiles = profiles.merge(
        interest_counts,
        on="destination_id",
        how="left",
    )

    for column in INTEREST_COLUMNS:
        if column not in profiles.columns:
            profiles[column] = 0

    profiles[INTEREST_COLUMNS] = profiles[INTEREST_COLUMNS].fillna(0)

    return profiles


def calculate_cosine_similarity(
    user_profile: dict,
    destination: pd.Series,
) -> float:
    """
    Calculate cosine similarity between
    user interests and destination interests.
    """

    user_vector = np.array(
        [
            user_profile["interests"].get(
                interest,
                0.0,
            )
            for interest in INTEREST_COLUMNS
        ],
        dtype=float,
    )

    destination_vector = np.array(
        [
            destination.get(
                interest,
                0.0,
            )
            for interest in INTEREST_COLUMNS
        ],
        dtype=float,
    )

    user_norm = np.linalg.norm(user_vector)

    destination_norm = np.linalg.norm(destination_vector)

    if user_norm == 0 or destination_norm == 0:
        return 0.0

    similarity = np.dot(
        user_vector,
        destination_vector,
    ) / (user_norm * destination_norm)

    return round(
        float(similarity),
        4,
    )


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


def calculate_budget_score(
    user_budget: str,
    destination_budget: str,
) -> float:

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


def calculate_budget_scores(
    profiles: pd.DataFrame,
    user_profile: dict,
) -> pd.DataFrame:

    profiles = profiles.copy()

    profiles["budget_score_match"] = profiles.apply(
        lambda destination: calculate_budget_score(
            user_profile.get(
                "budget_level",
                "",
            ),
            destination.get(
                "budget_level",
                "",
            ),
        ),
        axis=1,
    )

    return profiles


def calculate_season_score(
    travel_month: int,
    season_months,
) -> float:
    """
    Calculate how well the user's travel month
    matches the destination season.
    """

    try:
        if travel_month is None:
            return 0.0

        if season_months is None:
            return 0.0

        if isinstance(
            season_months,
            float,
        ) and pd.isna(season_months):
            return 0.0

        if isinstance(
            season_months,
            str,
        ):
            season_months = ast.literal_eval(season_months)

        if not isinstance(
            season_months,
            (
                list,
                tuple,
                set,
            ),
        ):
            return 0.0

        months = [int(month) for month in season_months]

        return 1.0 if int(travel_month) in months else 0.0

    except (
        ValueError,
        TypeError,
        SyntaxError,
    ):
        return 0.0


def calculate_season_scores(
    profiles: pd.DataFrame,
    user_profile: dict,
) -> pd.DataFrame:

    profiles = profiles.copy()

    profiles["season_score_match"] = profiles["season_months"].apply(
        lambda destination_season: calculate_season_score(
            user_profile.get("travel_month"),
            destination_season,
        )
    )

    return profiles


def calculate_style_score(
    user_style: str,
    destination_style: str,
) -> float:
    """
    Calculate how well the user's preferred
    travel style matches the destination style.
    """

    user_style = normalize_text(user_style)

    destination_style = normalize_text(destination_style)

    if not user_style or not destination_style:
        return 0.0

    if user_style == destination_style:
        return 1.0

    return 0.0


def calculate_style_scores(
    profiles: pd.DataFrame,
    user_profile: dict,
) -> pd.DataFrame:

    profiles = profiles.copy()

    profiles["style_score_match"] = profiles["style"].apply(
        lambda destination_style: calculate_style_score(
            user_profile.get(
                "style",
                "",
            ),
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
) -> list[dict]:
    """
    Generate personalized destination
    recommendations.
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

    profiles = calculate_final_scores(profiles)

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

def calculate_adjusted_rating_scores(
    restaurants: pd.DataFrame,
) -> pd.DataFrame:
    """
    Calculate an adjusted restaurant rating
    using rating and review count.

    Restaurants with many reviews receive
    more confidence in their rating.
    """

    restaurants = restaurants.copy()

    restaurants["rating"] = pd.to_numeric(
        restaurants["rating"],
        errors="coerce",
    ).fillna(0)

    restaurants["review_count"] = pd.to_numeric(
        restaurants["review_count"],
        errors="coerce",
    ).fillna(0)

    average_rating = restaurants["rating"].mean()

    minimum_reviews = restaurants["review_count"].median()

    if minimum_reviews <= 0:
        restaurants["adjusted_rating"] = restaurants["rating"]

    else:
        restaurants["adjusted_rating"] = (
            restaurants["review_count"]
            / (restaurants["review_count"] + minimum_reviews)
        ) * restaurants["rating"] + (
            minimum_reviews / (restaurants["review_count"] + minimum_reviews)
        ) * average_rating

    restaurants["adjusted_rating_score"] = restaurants["adjusted_rating"] / 5

    return restaurants


def recommend_restaurants(
    restaurants: pd.DataFrame,
    destination_id: str,
    user_budget: str,
    limit: int = 5,
) -> list[dict]:
    """
    Recommend restaurants for a selected
    destination.

    Restaurant ranking is based on:
    - Adjusted rating: 70%
    - Budget match: 30%
    """

    restaurants = calculate_adjusted_rating_scores(restaurants)

    destination_restaurants = restaurants[
        restaurants["destination_id"] == destination_id
    ].copy()

    if destination_restaurants.empty:
        return []

    destination_restaurants["budget_score_match"] = destination_restaurants[
        "budget_level"
    ].apply(
        lambda restaurant_budget: calculate_budget_score(
            user_budget,
            restaurant_budget,
        )
    )

    destination_restaurants["restaurant_score"] = (
        destination_restaurants["adjusted_rating_score"] * 0.70
        + destination_restaurants["budget_score_match"] * 0.30
    )

    destination_restaurants["restaurant_score"] = destination_restaurants[
        "restaurant_score"
    ].round(4)

    destination_restaurants["adjusted_rating"] = destination_restaurants[
        "adjusted_rating"
    ].round(2)

    destination_restaurants["adjusted_rating_score"] = destination_restaurants[
        "adjusted_rating_score"
    ].round(4)

    results = destination_restaurants.sort_values(
        by="restaurant_score",
        ascending=False,
    )

    recommendations = results[
        [
            "restaurant_id",
            "destination_id",
            "name",
            "cuisines",
            "budget_level",
            "average_price",
            "rating",
            "review_count",
            "adjusted_rating",
            "budget_score_match",
            "vegetarian_friendly",
            "vegan_options",
            "gluten_free",
            "restaurant_score",
        ]
    ].head(limit)

    return recommendations.to_dict(orient="records")

