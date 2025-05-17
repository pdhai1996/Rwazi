import { PrismaClient } from "@prisma/generated/prisma";

// Define service types
export const testServices = [
  { id: 1, name: 'Store' },
  { id: 2, name: 'Gas Stations' },
  { id: 3, name: 'Coffee' },
];

// Define test locations
// Central coordinate for reference: New York City (40.7128, -74.0060)
export const testPlaces = [
  // Stores (within 5km radius)
  {
    id: '001-store-nearby',
    name: 'Downtown Grocery',
    service_id: 1,
    // About 1.2km from center
    latitude: 40.7228,
    longitude: -74.0160,
  },
  {
    id: '002-store-nearby',
    name: 'City Mart',
    service_id: 1,
    // About 2.5km from center
    latitude: 40.7328,
    longitude: -74.0260,
  },
  {
    id: '003-store-far',
    name: 'Suburban Shop',
    service_id: 1,
    // About 15km from center
    latitude: 40.8128,
    longitude: -74.1060,
  },
  
  // Gas Stations (mix of nearby and far)
  {
    id: '004-gas-nearby',
    name: 'Quick Fill Gas',
    service_id: 2,
    // About 0.8km from center
    latitude: 40.7178,
    longitude: -74.0100,
  },
  {
    id: '005-gas-nearby',
    name: 'Urban Gas Station',
    service_id: 2,
    // About 3km from center
    latitude: 40.7328,
    longitude: -73.9760,
  },
  {
    id: '006-gas-far',
    name: 'Highway Fuel Stop',
    service_id: 2,
    // About 20km from center
    latitude: 40.6128,
    longitude: -73.8060,
  },
  
  // Coffee Shops (mix of nearby and far)
  {
    id: '007-coffee-nearby',
    name: 'Morning Brew Café',
    service_id: 3,
    // About 0.5km from center
    latitude: 40.7158,
    longitude: -74.0020,
  },
  {
    id: '008-coffee-nearby',
    name: 'Espresso Corner',
    service_id: 3,
    // About 1.8km from center
    latitude: 40.7278,
    longitude: -73.9960,
  },
  {
    id: '009-coffee-keywords-nearby',
    name: 'Premium Coffee House',
    service_id: 3,
    // About 4km from center
    latitude: 40.7428,
    longitude: -73.9760,
  },
  {
    id: '010-coffee-far',
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
  longitude: -74.0060
};

// Function to load test data into the database
export const loadTestData = async (prisma: PrismaClient): Promise<void> => {
  // Insert service types
  await prisma.service.createMany({
    data: testServices,
    skipDuplicates: true,
  });

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
      now
    );
  }
};

// Function to clear test data from the database
export const clearTestData = async (prisma: PrismaClient): Promise<void> => {
  const placeIds = testPlaces.map(place => place.id);
  await prisma.place.deleteMany({
    where: {
      id: {
        in: placeIds,
      },
    },
  });
  
  const serviceIds = testServices.map(service => service.id);
  await prisma.service.deleteMany({
    where: {
      id: {
        in: serviceIds,
      },
    },
  });
};