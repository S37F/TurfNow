# Turf Booking Platform - Backend API

A robust backend API for the Turf Booking Platform built with Node.js, Express, and Firebase.

## Features

- 🔐 JWT-based authentication with Firebase
- 🏟️ Complete CRUD operations for turfs
- 📅 Booking management system
- 💳 Payment integration (Razorpay & Stripe)
- ⭐ Reviews and ratings
- 👨‍💼 Admin panel
- 🛡️ Rate limiting and security headers
- 📊 Dashboard statistics

## Prerequisites

- Node.js (v16 or higher)
- Firebase project with Admin SDK credentials
- Razorpay/Stripe account (for payment processing)

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your credentials:
- Firebase Admin SDK credentials
- Payment gateway credentials
- Other configuration

4. Seed initial data (optional):
```bash
npm run seed
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Turfs
- `GET /api/turfs/:sport` - Get all turfs by sport
- `GET /api/turfs/:sport/:id` - Get single turf
- `POST /api/turfs/:sport` - Create turf (Admin only)
- `PUT /api/turfs/:sport/:id` - Update turf (Admin only)
- `DELETE /api/turfs/:sport/:id` - Delete turf (Admin only)

### Bookings
- `GET /api/bookings/user/:userId` - Get user bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:userId` - Update booking
- `DELETE /api/bookings/:userId` - Cancel booking
- `GET /api/bookings/slots/:turfName/:date` - Get booked slots

### Payments
- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify payment
- `POST /api/payments/stripe/create-intent` - Create Stripe payment intent

### Reviews
- `GET /api/reviews/:sport/:turfId` - Get turf reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/:id` - Delete review

### Admin
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/make-admin/:userId` - Make user admin

## Firebase Setup

1. Go to Firebase Console
2. Create a new project or select existing one
3. Enable Authentication (Email/Password and Google)
4. Enable Firestore Database
5. Enable Realtime Database
6. Generate Admin SDK private key
7. Add credentials to `.env` file

## Security

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Firebase token verification
- Admin role-based access control

## License

ISC
