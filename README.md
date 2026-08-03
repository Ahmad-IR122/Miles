# AI-Powered Travel Assistant

## Introduction
This project aims to build an AI powered travel assistant that help users build personalized itineraries based on travel destination, preferencese, available information, and travel requirements.

The objective is to provide users with an intelligent system that combines AI capabilities, retrieval-based information, and backend services to deliver relevant travel recommendations.


## Getting Started

### Prerequisites

Before running the project, make sure you have:

- Python 3.11+
- Required environment variables configured

## Project Structure
```
.
├── backend/
│   ├── routers/       # API endpoints
│   ├── services/      # Business logic
│   ├── schemas/       # Data validation models
│   └── core/          # Configuration and shared backend components
│
├── .pipelines/        # PR validation pipelines
├── aiServices/        # AI Services
└── frontend/
```
- `backend/` — FastAPI backend service. See `backend/README.md` for setup and run instructions.
