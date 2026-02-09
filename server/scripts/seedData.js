import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK using service account JSON file
const serviceAccountPath = join(__dirname, '..', 'config', 'serviceAccountKey.json');

if (!existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found at:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
});

const db = admin.firestore();

// Sample turf data
const footballTurfs = [
  {
    name: "Elite Football Arena",
    address: "123 Sports Complex, Andheri West, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
    pricePerHour: 1500,
    facilities: ["Floodlights", "Changing Rooms", "Parking", "Refreshments"],
    size: "7v7",
    surface: "Artificial Grass",
    available: true,
    rating: 4.5,
    totalReviews: 24
  },
  {
    name: "Champions Football Ground",
    address: "456 Victory Lane, Andheri East, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500",
    pricePerHour: 2000,
    facilities: ["Floodlights", "Changing Rooms", "Parking", "Cafeteria", "First Aid"],
    size: "11v11",
    surface: "Natural Grass",
    available: true,
    rating: 4.8,
    totalReviews: 45
  },
  {
    name: "Striker's Paradise",
    address: "789 Goal Street, Andheri, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=500",
    pricePerHour: 1200,
    facilities: ["Floodlights", "Changing Rooms", "Parking"],
    size: "5v5",
    surface: "Artificial Grass",
    available: true,
    rating: 4.2,
    totalReviews: 18
  }
];

const cricketTurfs = [
  {
    name: "Wicket Warriors Cricket Ground",
    address: "321 Boundary Road, Andheri West, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1540747913346-19e32da55943?w=500",
    pricePerHour: 1800,
    facilities: ["Practice Nets", "Changing Rooms", "Parking", "Bowling Machine"],
    pitchType: "Turf Wicket",
    available: true,
    rating: 4.6,
    totalReviews: 32
  },
  {
    name: "Century Cricket Arena",
    address: "654 Pavilion Avenue, Andheri East, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500",
    pricePerHour: 2200,
    facilities: ["Practice Nets", "Changing Rooms", "Parking", "Cafeteria", "Equipment Rental"],
    pitchType: "Cement Wicket",
    available: true,
    rating: 4.7,
    totalReviews: 28
  },
  {
    name: "Spin & Pace Cricket Club",
    address: "987 Cricket Lane, Andheri, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=500",
    pricePerHour: 1500,
    facilities: ["Practice Nets", "Changing Rooms", "Parking"],
    pitchType: "Matting Wicket",
    available: true,
    rating: 4.3,
    totalReviews: 15
  }
];

const basketballTurfs = [
  {
    name: "Slam Dunk Basketball Court",
    address: "147 Hoop Street, Andheri West, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500",
    pricePerHour: 1000,
    facilities: ["Floodlights", "Changing Rooms", "Parking", "Seating"],
    courtType: "Indoor",
    surface: "Wooden",
    available: true,
    rating: 4.4,
    totalReviews: 21
  },
  {
    name: "Three Pointer Arena",
    address: "258 Basketball Boulevard, Andheri East, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=500",
    pricePerHour: 800,
    facilities: ["Floodlights", "Changing Rooms", "Parking"],
    courtType: "Outdoor",
    surface: "Acrylic",
    available: true,
    rating: 4.1,
    totalReviews: 12
  }
];

const badmintonTurfs = [
  {
    name: "Smash Academy Badminton Courts",
    address: "369 Shuttle Lane, Andheri West, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500",
    pricePerHour: 600,
    facilities: ["AC Rooms", "Changing Rooms", "Parking", "Equipment Rental", "Coaching"],
    courts: 4,
    surface: "Wooden",
    available: true,
    rating: 4.7,
    totalReviews: 38
  },
  {
    name: "Shuttle Stars Badminton Club",
    address: "741 Racket Road, Andheri East, Mumbai",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    pricePerHour: 500,
    facilities: ["AC Rooms", "Changing Rooms", "Parking", "Refreshments"],
    courts: 6,
    surface: "Synthetic",
    available: true,
    rating: 4.5,
    totalReviews: 29
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed data...');

    // Seed Football Turfs
    console.log('⚽ Adding football turfs...');
    for (const turf of footballTurfs) {
      await db.collection('football').add({
        ...turf,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log('✅ Football turfs added');

    // Seed Cricket Turfs
    console.log('🏏 Adding cricket turfs...');
    for (const turf of cricketTurfs) {
      await db.collection('cricket').add({
        ...turf,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log('✅ Cricket turfs added');

    // Seed Basketball Turfs
    console.log('🏀 Adding basketball turfs...');
    for (const turf of basketballTurfs) {
      await db.collection('basketball').add({
        ...turf,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log('✅ Basketball turfs added');

    // Seed Badminton Turfs
    console.log('🏸 Adding badminton turfs...');
    for (const turf of badmintonTurfs) {
      await db.collection('badminton').add({
        ...turf,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log('✅ Badminton turfs added');

    console.log('🎉 Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
