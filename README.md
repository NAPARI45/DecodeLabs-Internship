# 🌙 Lune Pool — Women's Cycle Tracker

A full stack women's reproductive health tracker built across three DecodeLabs projects. Lune Pool allows users to log their menstrual cycle, track symptoms, view predictions, and see their cycle history — all powered by a real backend API and MongoDB database.

---

## 📋 Projects Overview

| Project | Focus | Status |
|---------|-------|--------|
| Project 1 | Responsive Frontend (HTML, CSS, JS) | ✅ Complete |
| Project 2 | Backend API (Node.js, Express) | ✅ Complete |
| Project 3 | Database Integration (MongoDB, Mongoose) | ✅ Complete |

---

## ✨ Features

- **Dashboard** — cycle day progress ring, next period countdown, ovulation estimate, and phase-based wellness tips
- **Calendar** — monthly view with colour-coded period days, fertile window, ovulation day, and predicted future dates
- **Log** — log period start/end dates, flow intensity, cramps, mood, and notes
- **History** — view all past cycles with average cycle length, average period length, and symptom summaries

---

## 🛠 Tech Stack

### Frontend
- HTML5 (semantic elements)
- CSS3 (CSS Grid, Flexbox, mobile-first responsive design)
- Vanilla JavaScript (fetch API, async/await, DOM manipulation)

### Backend
- Node.js
- Express.js (REST API)
- Mongoose (MongoDB ODM)
- MongoDB (database)
- dotenv (environment variables)
- cors (cross-origin resource sharing)

---

## 📁 Project Structure

```
Responsive-frontend/
├── index.html          # App structure and all four page sections
├── styles.css          # All styling — mobile-first, responsive
├── script.js           # Frontend logic — fetch calls, rendering
│
└── luna-backend/
    ├── server.js           # Express app setup and MongoDB connection
    ├── .env                # Environment variables (not committed)
    ├── .gitignore
    ├── package.json
    │
    ├── models/
    │   └── Cycle.js        # Mongoose schema — cycle data blueprint
    │
    └── routes/
        └── cycles.js       # All API endpoints (GET, POST, DELETE)
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org) (v18 or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running as a service)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/NAPARI45/DecodeLabs-Internship.git
cd Responsive-frontend
```

**2. Install backend dependencies**
```bash
cd luna-backend
npm install
```

**3. Create your environment file**

Create a `.env` file inside `luna-backend/`:
```
MONGODB_URI=mongodb://localhost:27017/luna
PORT=3000
```

**4. Start the backend server**
```bash
node server.js
```

You should see:
```
✅ Connected to MongoDB
🌙 Luna API running on http://localhost:3000
```

**5. Open the frontend**

In VS Code, right-click `index.html` and select **Open with Live Server**.

The app will open at `http://127.0.0.1:5500`.

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cycles` | Fetch all logged cycles |
| GET | `/cycles/latest` | Fetch the most recent cycle |
| GET | `/cycles/:id` | Fetch one cycle by ID |
| POST | `/cycles` | Save a new cycle log |
| DELETE | `/cycles/:id` | Delete a cycle by ID |

### Example POST request body

```json
{
  "startDate": "2026-05-01",
  "endDate":   "2026-05-05",
  "flow":      "medium",
  "cramps":    "mild",
  "mood":      "happy",
  "notes":     "Felt tired but manageable"
}
```

### Example response

```json
{
  "success": true,
  "message": "Cycle logged successfully",
  "cycle": {
    "_id":       "664f3b2a1c4e5d6f7a8b9c0d",
    "startDate": "2026-05-01",
    "endDate":   "2026-05-05",
    "flow":      "medium",
    "cramps":    "mild",
    "mood":      "happy",
    "notes":     "Felt tired but manageable",
    "createdAt": "2026-05-01T10:00:00.000Z"
  }
}
```

---

## 🗄 Database Schema

Collection: `cycles`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `startDate` | String | ✅ Yes | — |
| `endDate` | String | No | — |
| `flow` | String | No | spotting, light, medium, heavy |
| `cramps` | String | No | none, mild, moderate, severe |
| `mood` | String | No | happy, neutral, sad, anxious, irritable |
| `notes` | String | No | — |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

---

## 📱 Responsive Design

The app is built mobile-first with two breakpoints:

| Breakpoint | Layout |
|------------|--------|
| Default (mobile) | Single column, bottom navigation |
| 768px+ (tablet) | Sidebar navigation appears |
| 1024px+ (desktop) | Wider content area |

---

## 🔮 Cycle Predictions

Predictions are calculated on the frontend using the last logged cycle:

- **Next period** — `lastStartDate + cycleLength (default 28 days)`
- **Ovulation** — `nextPeriodDate − 14 days`
- **Fertile window** — 5 days before ovulation
- **Current phase** — based on cycle day (Menstrual → Follicular → Ovulation → Luteal)

---

## 👩‍💻 Built By

**NAPARI45** — DecodeLabs Full Stack Development Internship, Batch 2026

Powered by [DecodeLabs](https://www.decodelabs.tech)