# Peer Tutoring Center Check-In Software

A simple, touch-friendly web application for tracking student check-ins and check-outs at a peer tutoring center. Deployed at my high school, The Woodlands School!

## Features

- **Easy Check-In**: Students can quickly check in by typing their name or selecting from previous visits
- **Quick Check-Out**: One-click check-out with a simple rating system (1-5 stars)
- **Returning Students**: Fast check-in for students who have visited before
- **Real-time Updates**: Automatically refreshes the list of checked-in students
- **Touch-Optimized**: Large buttons and touch targets perfect for Chromebook kiosks

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend React app on `http://localhost:3000`

## Deploy (Vercel)

This repo is a monorepo with the React app in `frontend/`.

- Option A (recommended): In Vercel Project Settings, set **Root Directory** to `frontend`.
- Option B: Deploy the repo root as-is (a `vercel.json` is included to build `frontend/`).

### Data storage

By default, the deployed app uses **browser storage (localStorage)** on that computer (no backend required). This is ideal for a single kiosk computer.

- Data is saved **only in that browser on that device**.
- If you clear site data / use a different browser / use incognito, the data will be gone.

### Optional: use a backend API instead

If you *do* want a backend (multi-device, central reporting, etc.), set:

- `REACT_APP_DATA_MODE=api`
- `REACT_APP_API_BASE_URL=https://your-backend.example.com`

Then redeploy the frontend.

### Production Build

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend server:
```bash
cd backend
npm start
```

The frontend build will be served from the `frontend/build` directory. You can use a static file server or configure your backend to serve it.

## Usage

1. **Check In**: Click the green "CHECK IN" button
   - Type your name and press Enter, or
   - Click "I've checked in before" to see a list of previous students
   - Select your name from the list

2. **Check Out**: Click the orange "CHECK OUT" button
   - Select your name from the list of checked-in students
   - Rate your experience (1-5 stars)
   - Complete check-out

## Technology Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Styling**: CSS3 with modern design principles

## Database Schema

- **students**: Stores student information (id, name, first_seen)
- **check_ins**: Stores check-in/check-out records (id, student_id, check_in_time, check_out_time, rating)

## License

MIT





