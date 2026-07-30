import React, { useEffect, useState } from "react";
import { api } from "../api/api";

type Activity = string;
type Day = { day: number; activities: Activity[] };
type Trip = { destination?: string; startDate?: string; endDate?: string; days?: Day[] };

function Itinerary() {
  const [itineraries, setItineraryData] = useState<Trip[]>([]);

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const response = await api.get("/itinerary");
        const payload = response?.data?.data ?? response?.data ?? [];
        setItineraryData(payload);
      } catch (error) {
        console.error("Error fetching itinerary data:", error);
      }
    }

    fetchItinerary();
  }, []);

  return (
    <div>
      {itineraries && itineraries.length > 0 ? (
        itineraries.map((trip, index) => (
          <div key={index}>
            <h2>{trip.destination}</h2>

            <p>Start Date: {trip.startDate}</p>

            <p>End Date: {trip.endDate}</p>

            {(trip.days ?? []).map((day) => (
              <div key={day.day}>
                <h3>Day {day.day}</h3>

                <ul>
                  {(day.activities ?? []).map((activity, aIndex) => (
                    <li key={aIndex}>{activity}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Itinerary;