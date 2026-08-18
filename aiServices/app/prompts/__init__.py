"""Prompt templates and prompt builders for the AI service."""

from .itinerary_prompt import (
    build_itinerary_prompt,
    build_regenerate_activity_prompt,
    build_regenerate_day_prompt,
    build_regenerate_itinerary_prompt,
)
from .rag_prompts import history_prompt, system_prompt

__all__ = [
    "build_itinerary_prompt",
    "build_regenerate_activity_prompt",
    "build_regenerate_day_prompt",
    "build_regenerate_itinerary_prompt",
    "history_prompt",
    "system_prompt",
]
