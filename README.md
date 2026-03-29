# Recall Data Visualization

A fullstack application that serves recall data from a CSV file via a REST API and displays it on an interactive line chart with date filtering.

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
npm install
```

### Running in Development

```bash
npm run dev
```

This starts both the backend (http://localhost:3000) and the frontend (http://localhost:5173) concurrently. The frontend proxies API requests to the backend.

### Running Individually

```bash
# Server only
npm run dev -w server

# Client only
npm run dev -w client
```

## API

### `GET /recall`

Returns recall data from the CSV, optionally filtered by date range. Includes a 3-second artificial delay.

| Parameter | Type   | Required | Format       | Description            |
|-----------|--------|----------|--------------|------------------------|
| `from_ts` | string | No       | `YYYY-MM-DD` | Inclusive start date   |
| `to_ts`   | string | No       | `YYYY-MM-DD` | Inclusive end date     |

**Examples:**

```
GET /recall
GET /recall?from_ts=2020-01-01
GET /recall?from_ts=2020-01-01&to_ts=2022-01-01
```

**Response:**

```json
[
  { "date": "2020-01-01", "recall": 17.5261053319564 },
  { "date": "2020-01-02", "recall": 35.465436707097034 }
]
```

## Testing

```bash
# Run all tests
npm test

# Server tests only
npm run test -w server

# Client tests only
npm run test -w client
```

## Project Structure

```
RecallAssignment/
├── recall_data.csv        # Source data
├── server/                # Express REST API
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── app.ts         # Express app factory
│   │   ├── routes/        # Route handlers
│   │   ├── services/      # CSV parsing, delay
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── middleware/     # Logging, error handling
│   │   └── utils/         # Logger
│   └── tests/
├── client/                # React SPA
│   ├── src/
│   │   ├── main.tsx       # App entry
│   │   ├── App.tsx        # Root component
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API client
│   │   ├── schemas/       # Zod validation
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   └── tests/
└── eslint.config.js
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Recharts, react-datepicker
- **Backend**: Express 4, TypeScript, Zod, PapaParse, Pino
- **Testing**: Vitest, React Testing Library, Supertest

## Key Design Decisions

- **In-memory CSV cache** with binary search for O(log n) date filtering
- **Zod validation** on both client and server for type-safe data handling
- **TanStack Query** for client-side caching, deduplication, and refetch management
- **Auto-fetch on page load** shows the full dataset immediately
