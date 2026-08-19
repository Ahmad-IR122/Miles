import { useEffect, useState } from "react";
import { Box, Chip, Stack, TextField, Typography } from "@mui/material";

import { getTripRequest, updateInterests } from "../../api/itinerary";
import { interestOptions, MAX_INTERESTS } from "../../constants/interests";

type InterestsEditorProps = {
  tripRequestId: string;
  disabled?: boolean;
};

const InterestsEditor = ({ tripRequestId, disabled }: InterestsEditorProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [otherInterest, setOtherInterest] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getTripRequest(tripRequestId);
        setSelected(response.data.interests ?? []);
        setOtherInterest(response.data.other_interest ?? "");
      } catch (error) {
        console.error("Error loading trip request:", error);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, [tripRequestId]);

  const save = async (interests: string[], other: string) => {
    setSaving(true);
    try {
      await updateInterests(tripRequestId, interests, other);
    } catch (error) {
      console.error("Error saving interests:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (interest: string) => {
    const next = selected.includes(interest)
      ? selected.filter((item) => item !== interest)
      : [...selected, interest];

    if (next.length > MAX_INTERESTS) return;
    if (next.length === 0) return;

    setSelected(next);
    save(next, next.includes("Other") ? otherInterest : "");
  };

  if (!loaded) return null;

  const atLimit = selected.length >= MAX_INTERESTS;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Interests
        </Typography>
        {saving && (
          <Typography variant="caption" color="text.secondary">
            Saving...
          </Typography>
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        {interestOptions.map((interest) => {
          const isSelected = selected.includes(interest);

          return (
            <Chip
              key={interest}
              label={interest}
              color={isSelected ? "primary" : "default"}
              variant={isSelected ? "filled" : "outlined"}
              onClick={() => toggle(interest)}
              disabled={disabled || (!isSelected && atLimit)}
            />
          );
        })}
      </Stack>

      {selected.includes("Other") && (
        <TextField
          size="small"
          label="Tell us your interest"
          value={otherInterest}
          disabled={disabled}
          onChange={(event) => setOtherInterest(event.target.value)}
          onBlur={() => save(selected, otherInterest)}
          sx={{ mt: 2 }}
        />
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1 }}
      >
        Pick up to {MAX_INTERESTS}. Changes apply the next time you regenerate.
      </Typography>
    </Box>
  );
};

export default InterestsEditor;
