import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { PrismaClient } from '@src/generated/prisma';
import client from '@prisma/client';

const prisma = client;
// Define service types
export const testServices = [
  { id: 1, name: 'Store', slug: 'store' },
  { id: 2, name: 'Gas Stations', slug: 'gas-stations' },
  { id: 3, name: 'Coffee', slug: 'coffee' },
];

// Define test user
export const testUser = {
  id: 999,
  username: 'placeTester',
  name: 'Place Test User',
  password: createHash('sha256').update('password123').digest('hex'),
};

// Define test locations
// Central coordinate for reference: New York City (40.7128, -74.0060)
export const testPlaces = [
  // Stores (within 5km radius)
  {
    id: 1,
    name: 'Downtown Grocery',
    service_id: 1,
    // About 1.2km from center
    latitude: 40.7228,
    longitude: -74.0160,
  },
  {
    id: 2,
    name: 'City Mart',
    service_id: 1,
    // About 2.5km from center
    latitude: 40.7328,
    longitude: -74.0260,
  },
  {
    id: 3,
    name: 'Suburban Shop',
    service_id: 1,
    // About 15km from center
    latitude: 40.8128,
    longitude: -74.1060,
  },
  
  // Gas Stations (mix of nearby and far)
  {
    id: 4,
    name: 'Quick Fill Gas',
    service_id: 2,
    // About 0.8km from center
    latitude: 40.7178,
    longitude: -74.0100,
  },
  {
    id: 5,
    name: 'Urban Gas Station',
    service_id: 2,
    // About 3km from center
    latitude: 40.7328,
    longitude: -73.9760,
  },
  {
    id: 6,
    name: 'Highway Fuel Stop',
    service_id: 2,
    // About 20km from center
    latitude: 40.6128,
    longitude: -73.8060,
  },
  
  // Coffee Shops (mix of nearby and far)
  {
    id: 7,
    name: 'Morning Brew Café',
    service_id: 3,
    // About 0.5km from center
    latitude: 40.7158,
    longitude: -74.0020,
  },
  {
    id: 8,
    name: 'Espresso Corner',
    service_id: 3,
    // About 1.8km from center
    latitude: 40.7278,
    longitude: -73.9960,
  },
  {
    id: 9,
    name: 'Premium Coffee House',
    service_id: 3,
    // About 4km from center
    latitude: 40.7428,
    longitude: -73.9760,
  },
  {
    id: 10,
    name: 'Suburban Coffee Shop',
    service_id: 3,
    // About 25km from center
    latitude: 40.5128,
    longitude: -73.9060,
  },
];

// New York City center point for reference in tests
export const nycCenter = {
  latitude: 40.7128,
  longitude: -74.0060,
};

// Generate a test JWT token for authentication
export const generateTestToken = () => {
  return jwt.sign(
    { id: testUser.id, username: testUser.username },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' },
  );
};

// Function to load test data into the database
export const loadTestData = async (prisma: PrismaClient): Promise<void> => {
  // Insert service types
  await prisma.service.createMany({
    data: testServices,
    skipDuplicates: true,
  });
  
  // Insert test user if not exists
  try {
    // Check if user exists first
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: testUser.id },
          { username: testUser.username },
        ],
      },
    });
    
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: testUser.id,
          username: testUser.username,
          name: testUser.name,
          password: testUser.password,
        },
      });
    }
  } catch (error) {
    console.log('User already exists or could not be created:', error);
  }

  // Insert places
  for (const place of testPlaces) {
    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO Place (id, name, service_id, longitude, latitude, location, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, POINT(?, ?), ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name),
       service_id = VALUES(service_id),
       longitude = VALUES(longitude),
       latitude = VALUES(latitude),
       location = VALUES(location),
       updatedAt = ?`,
      place.id,
      place.name,
      place.service_id,
      place.longitude,
      place.latitude,
      place.longitude,
      place.latitude,
      now,
      now,
      now,
    );
  }
};

// Function to clear test data from the database
export const clearTestData = async (prisma: PrismaClient): Promise<void> => {
  const placeIds: number[] = testPlaces.map(place => place.id);
  
  // First delete favorites that reference places
  await prisma.favorite.deleteMany({
    where: {
      place_id: {
        in: placeIds,
      },
    },
  });

  // Then delete the places
  await prisma.place.deleteMany({
    where: {
      id: {
        in: placeIds,
      },
    },
  });
  
  const serviceIds: number[] = testServices.map(service => service.id);
  await prisma.service.deleteMany({
    where: {
      id: {
        in: serviceIds,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: testUser.id,
    },
  });
};