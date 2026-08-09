import { useEffect, useState } from "react";
import { api } from "../api/api";

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import PlaceIcon from "@mui/icons-material/Place";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";

type Activity = string;

type Day = {
  day: number;
  activities: Activity[];
};

type Trip = {
  destination?: string;
  startDate?: string;
  endDate?: string;
  days?: Day[];
};

const Itinerary = () => {
  const [itineraries, setItineraryData] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await api.get("/itinerary");
        const payload = response?.data?.data ?? response?.data ?? [];
        setItineraryData(payload);
      } catch (error) {
        console.error("Error fetching itinerary data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }} gutterBottom>
        Travel Itineraries
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Your planned trips and daily activities.
      </Typography>

      <Stack spacing={4}>
        {itineraries.map((trip, index) => (
          <Card
            key={index}
            elevation={4}
            sx={{
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 2 }}
              >
                <PlaceIcon color="primary" />

                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {trip.destination}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={2}
                sx={{ flexWrap: "wrap", mb: 3 }}
              >
                <Chip
                  icon={<CalendarMonthIcon />}
                  label={`Start: ${trip.startDate}`}
                />

                <Chip icon={<EventIcon />} label={`End: ${trip.endDate}`} />
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {(trip.days ?? []).map((day) => (
                <Box key={day.day} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Day {day.day}
                  </Typography>

                  <List>
                    {(day.activities ?? []).map((activity, activityIndex) => (
                      <ListItem key={activityIndex}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "success.main",
                              boxShadow: 1,
                            }}
                          />
                        </ListItemIcon>

                        <ListItemText primary={activity} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default Itinerary;
