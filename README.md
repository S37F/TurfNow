# TurfNow - Find & Book Sports Grounds Instantly

A full-stack turf booking platform built with React, Express, and Firebase. Users can browse turfs by sport, book time slots, and manage bookings. Owners can register and manage their turfs. Admins have a dashboard for platform oversight.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Chakra UI, React Router 6 |
| Backend | Express.js, Firebase Admin SDK |
| Database | Firebase Firestore (turfs) + Realtime Database (bookings, users, owners) |
| Auth | Firebase Authentication (email/password + Google) with custom claims |
| Payments | Razorpay / Stripe (optional, disabled by default) |

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Firestore, Realtime Database, and Authentication enabled
- Service account key JSON file

### 1. Clone & Install

```bash
git clone <repo-url>
cd Turf-Booking-Platfrom-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.production.example .env
```

Edit `.env` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_API_URL=http://localhost:5000/api
```

### 3. Firebase Service Account

Place your service account key at `server/config/serviceAccountKey.json`.  
Download from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key

### 4. Run Development

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

- Frontend: http://localhost:3001
- Backend API: http://localhost:5000

### 5. Seed Data (Optional)

```bash
cd server
npm run seed
```

## Project Structure

```
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components (Home, Login, Bookings, etc.)
│   ├── context/           # Auth context provider
│   ├── services/          # API client (axios)
│   ├── firebase-config/   # Firebase SDK initialization
│   └── style/             # CSS files
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   ├── middleware/        # Auth middleware
│   ├── config/            # Firebase Admin + constants
│   ├── services/          # Email service
│   └── scripts/           # Database seeding
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker Compose config
└── vite.config.js         # Vite build config
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/turfs/:sport` | No | List turfs by sport |
| POST | `/api/bookings` | Yes | Create booking |
| GET | `/api/bookings/my` | Yes | Get user's bookings |
| PATCH | `/api/bookings/:id/cancel` | Yes | Cancel booking |
| GET | `/api/bookings/slots` | Yes | Check booked slots |
| POST | `/api/reviews` | Yes | Create review |
| GET | `/api/reviews/:sport/:turfId` | No | Get reviews |
| POST | `/api/owners/register` | Yes | Register as owner |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/payments/status` | No | Payment gateway status |

## User Roles

- **User**: Browse turfs, book slots, view/cancel bookings
- **Owner**: Register, manage turfs, view bookings for their turfs
- **Admin**: Full platform access, manage users/owners, view all bookings

Roles are managed via Firebase custom claims set by the backend.

## Production Deployment (Docker)

```bash
# Build and run
docker compose up --build -d

# View logs
docker compose logs -f
```

The Docker image:
- Builds the React frontend with Vite
- Serves it via Express static files
- Runs the API server on port 5000
- Includes health checks

## Supported Sports

Football, Cricket, Basketball, Badminton

## License

ISC
