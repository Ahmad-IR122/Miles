from app.services.data_loader import load_recommendation_data

import pandas as pd

destinations, activities, restaurants = load_recommendation_data()


def parse_interests(value): # this function used to clean and parse the interests from the CSV files, splitting them by '|' and converting them to lowercase
    if pd.isna(value):
        return []
    return [
        interest.strip().lower()
        for interest in str(value).split("|")
        if interest.strip()
    ]


def recommend_destinations(user_preferences):
  pass

