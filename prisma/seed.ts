import { PrismaClient } from './generated/prisma';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Interface for the place data in the JSON file
interface PlaceData {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string;
}

// Types for our database models
interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Service {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Place {
  id: string;
  name: string;
  service_id: number;
  longitude: number;
  latitude: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Favorite {
  id: number;
  user_id: number;
  place_id: string;
  createdAt: Date;
  updatedAt: Date;
}

async function main() {
  console.log('Seeding database...');
  
  // Create users
  const users = await createUsers();
  console.log(`Created ${users.length} users`);
  
  // Create services
  const services = await createServices();
  console.log(`Created ${services.length} services`);
  
  // Create places from JSON file
  const places = await createPlacesFromJson(services);
  console.log(`Created ${places.length} places`);
  
  // Create favorites
  const favorites = await createFavorites(users, places);
  console.log(`Created ${favorites.length} favorites`);
  
  console.log('Seeding completed successfully!');
}

async function createUsers(): Promise<User[]> {
  // Clean up existing users
  await prisma.user.deleteMany();
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      username: 'admin',
      password: createHash('sha256').update('admin123').digest('hex')
    }
  }) as User;
  
  // Create regular users
  const regularUsers = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
      return prisma.user.create({
        data: {
          name: `User ${i + 1}`,
          username: `user${i + 1}`,
          password: createHash('sha256').update('password123').digest('hex')
        }
      }) as User;
    })
  );
  
  return [adminUser, ...regularUsers];
}

async function createServices(): Promise<Service[]> {
  // Clean up existing services
  await prisma.service.deleteMany();
  
  // Create services based on the types in the JSON file
  const services = await Promise.all([
    prisma.service.create({
      data: { name: 'Restaurants' }
    }),
    prisma.service.create({
      data: { name: 'Hotels' }
    }),
    prisma.service.create({
      data: { name: 'Grocery' }
    }),
    prisma.service.create({
      data: { name: 'Other' }
    })
  ]) as Service[];
  
  return services;
}

async function createPlacesFromJson(services: Service[]): Promise<Place[]> {
  // Clean up existing places
  await prisma.place.deleteMany();
  
  const places: Place[] = [];
  
  try {
    // Read the JSON file with place data
    const jsonPath = path.resolve(__dirname, '../resources/fake_places_1000.json');
    console.log(`Reading places from ${jsonPath}`);
    
    const placesData: PlaceData[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Found ${placesData.length} places in JSON file`);
    
    // Map service types to service IDs
    const serviceMap = new Map<string, number>();
    services.forEach(service => {
      const serviceName = service.name.toLowerCase();
      serviceMap.set(serviceName, service.id);
      
      // Add some aliases for mapping
      if (serviceName === 'restaurants') {
        serviceMap.set('restaurant', service.id);
        serviceMap.set('cafe', service.id);
        serviceMap.set('bar', service.id);
      } else if (serviceName === 'hotels') {
        serviceMap.set('hotel', service.id);
        serviceMap.set('motel', service.id);
      } else if (serviceName === 'grocery') {
        serviceMap.set('grocery', service.id);
        serviceMap.set('supermarket', service.id);
        serviceMap.set('market', service.id);
      }
    });
    
    // Process a subset of places (to avoid overwhelming the database)
    const maxPlaces = 100; // Limit to 100 places
    const placesToProcess = placesData.slice(0, maxPlaces);
    
    for (const placeData of placesToProcess) {
      // Map the place type to a service_id based on our services
      let serviceId = serviceMap.get(placeData.type.toLowerCase());
      
      // If no matching service, use "Other"
      if (!serviceId) {
        serviceId = services.find(s => s.name === 'Other')?.id || services[0].id;
      }
      
      // Use Prisma's executeRaw to create places with POINT geometry
      await prisma.$executeRawUnsafe(`
        INSERT INTO Place (id, name, service_id, location, longitude, latitude, createdAt, updatedAt)
        VALUES (?, ?, ?, ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')')), ?, ?, NOW(), NOW())
      `, 
      placeData.id, 
      placeData.name,
      serviceId,
      placeData.lng,
      placeData.lat,
      placeData.lng,
      placeData.lat
      );
      
      // Fetch the created place to return
      const place = await prisma.place.findUnique({
        where: { id: placeData.id }
      }) as Place | null;
      
      if (place) places.push(place);
    }
    
    return places;
  } catch (error) {
    console.error('Error creating places from JSON:', error);
    return [];
  }
}

async function createFavorites(users: User[], places: Place[]): Promise<Favorite[]> {
  // Clean up existing favorites
  await prisma.favorite.deleteMany();
  
  const favorites: Favorite[] = [];
  
  // For each user, add 1-3 random favorites
  for (const user of users) {
    const numFavorites = Math.floor(Math.random() * 3) + 1;
    const shuffledPlaces = [...places].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numFavorites && i < shuffledPlaces.length; i++) {
      const favorite = await prisma.favorite.create({
        data: {
          user_id: user.id,
          place_id: shuffledPlaces[i].id
        }
      }) as Favorite;
      
      favorites.push(favorite);
    }
  }
  
  return favorites;
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
