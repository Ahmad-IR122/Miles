"""Run from backend with: python -m unittest discover -s tests -v."""

import unittest
from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.security import get_current_user
from app.db import Base, get_db
from app.main import app
from app.models import Itinerary, ItineraryDay, Trip, User


class UpcomingItineraryTests(unittest.TestCase):
    def setUp(self):
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        self.addCleanup(engine.dispose)
        Base.metadata.create_all(engine)
        self.db = Session(engine)
        self.addCleanup(self.db.close)
        self.user = User(
            first_name="Test", last_name="User", email="owner@example.com"
        )
        self.other_user = User(
            first_name="Other", last_name="User", email="other@example.com"
        )
        self.db.add_all([self.user, self.other_user])
        self.db.commit()

        def override_db():
            yield self.db

        previous_overrides = app.dependency_overrides.copy()
        self.addCleanup(setattr, app, "dependency_overrides", previous_overrides)
        app.dependency_overrides[get_db] = override_db
        app.dependency_overrides[get_current_user] = lambda: self.user
        self.client = TestClient(app)
        self.addCleanup(self.client.close)

    def add_trip(self, days_from_today=1, user=None):
        start = date.today() + timedelta(days=days_from_today)
        trip = Trip(
            user_id=(user or self.user).id,
            destinations=[{"city": "Paris", "country": "France"}],
            start_date=start,
            end_date=start,
        )
        self.db.add(trip)
        self.db.commit()
        return trip

    def add_itinerary(self, trip, version=1):
        itinerary = Itinerary(trip_id=trip.id, version=version)
        self.db.add(itinerary)
        self.db.commit()
        return itinerary

    def test_no_trips_returns_successful_empty_result(self):
        response = self.client.get("/itinerary/upcoming")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json())

    def test_trip_without_itinerary_returns_successful_empty_result(self):
        self.add_trip()
        response = self.client.get("/itinerary/upcoming")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json())

    def test_skips_trip_without_itinerary_and_returns_nearest_available(self):
        self.add_trip(1)
        self.add_itinerary(self.add_trip(5))
        expected = self.add_itinerary(self.add_trip(2))
        day = ItineraryDay(
            itinerary_id=expected.id,
            day_number=1,
            date=expected.trip.start_date,
            title="Arrival",
        )
        self.db.add(day)
        self.db.commit()

        response = self.client.get("/itinerary/upcoming")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], expected.id)
        self.assertEqual(response.json()["trip_id"], expected.trip_id)
        self.assertEqual(response.json()["days"][0]["title"], "Arrival")

    def test_excludes_past_trips_and_other_users_itineraries(self):
        self.add_itinerary(self.add_trip(-1))
        self.add_itinerary(self.add_trip(1, self.other_user))
        response = self.client.get("/itinerary/upcoming")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json())

    def test_includes_today_and_selects_latest_version(self):
        trip = self.add_trip(0)
        expected = self.add_itinerary(trip, version=2)
        self.add_itinerary(trip, version=1)
        self.add_itinerary(self.add_trip(1))
        response = self.client.get("/itinerary/upcoming")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], expected.id)

    def test_authentication_is_required(self):
        del app.dependency_overrides[get_current_user]
        response = self.client.get("/itinerary/upcoming")
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
