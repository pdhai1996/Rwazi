import { PrismaClient } from './generated/prisma';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Interface for the place data in the JSON file
interface PlaceData {
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string;
}

// Interface for the service data in the JSON file
interface ServiceData {
  slug: string;
  name: string;
  service: string;
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
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Place {
  id: number;
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
  place_id: number;
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
  // const favorites = await createFavorites(users, places);
  // console.log(`Created ${favorites.length} favorites`);
  
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
  // Places have foreign key constraints to services, so delete them first
  await prisma.place.deleteMany();
  // Clean up existing services
  await prisma.service.deleteMany();
  
  try {
    // Read the JSON file with service data
    const jsonPath = path.resolve(__dirname, '../resources/fake_services.json');
    console.log(`Reading services from ${jsonPath}`);
    
    const servicesData: ServiceData[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Found ${servicesData.length} services in JSON file`);
    
    // Create services from the JSON data
    const services = await Promise.all(
      servicesData.map(serviceData => 
        prisma.service.create({
          data: { 
            name: serviceData.name,
            slug: serviceData.slug
          }
        }) as Promise<Service>
      )
    );
    
    // Add an "Other" service category if it doesn't already exist
    const otherService = services.find(s => s.name === 'Other');
    if (!otherService) {
      const other = await prisma.service.create({
        data: { 
          name: 'Other',
          slug: 'other'
        }
      }) as Service;
      services.push(other);
    }
    
    return services;
  } catch (error) {
    console.error('Error creating services from JSON:', error);
    
    // Fallback to default services if JSON import fails
    const defaultServices = await Promise.all([
      prisma.service.create({ data: { name: 'Store', slug: 'store' } }),
      prisma.service.create({ data: { name: 'Gas Station', slug: 'gas-station' } }),
      prisma.service.create({ data: { name: 'Eatery', slug: 'eatery' } }),
      prisma.service.create({ data: { name: 'Clinic', slug: 'clinic' } }),
      prisma.service.create({ data: { name: 'Other', slug: 'other' } })
    ]) as Service[];
    
    return defaultServices;
  }
}

async function createPlacesFromJson(services: Service[]): Promise<Place[]> {
  // Clean up existing places
  await prisma.place.deleteMany();
  
  const places: Place[] = [];
  
  try {
    // Read the JSON file with place data
    const jsonPath = path.resolve(__dirname, '../resources/fake_places_2000.json');
    console.log(`Reading places from ${jsonPath}`);
    
    const placesData: PlaceData[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Found ${placesData.length} places in JSON file`);
    
    // Map service types to service IDs
    const serviceMap = new Map<string, number>();
    services.forEach(service => {
      const serviceName = service.name.toLowerCase();
      serviceMap.set(serviceName, service.id);
      
      // Map service slugs from fake_services.json to our service IDs
      // Create mappings between type values in places data and service names
      if (serviceName === 'store') {
        serviceMap.set('store', service.id);
        serviceMap.set('shop', service.id);
        serviceMap.set('mall', service.id);
      } else if (serviceName === 'gas station') {
        serviceMap.set('gas', service.id);
        serviceMap.set('gas-station', service.id);
        serviceMap.set('petrol', service.id);
      } else if (serviceName === 'eatery') {
        serviceMap.set('eatery', service.id);
        serviceMap.set('restaurant', service.id);
        serviceMap.set('cafe', service.id);
        serviceMap.set('diner', service.id);
      } else if (serviceName === 'clinic') {
        serviceMap.set('clinic', service.id);
        serviceMap.set('hospital', service.id);
        serviceMap.set('doctor', service.id);
      }
    });
    
    // Process a subset of places (to avoid overwhelming the database)
    const maxPlaces = 2000; // Use up to 2000 places
    const placesToProcess = placesData.slice(0, maxPlaces);
    
    let count = 0;
    for (const placeData of placesToProcess) {
      // Map the place type to a service_id based on our services
      let serviceId = serviceMap.get(placeData.type.toLowerCase());
      
      // If no matching service, use "Other"
      if (!serviceId) {
        serviceId = services.find(s => s.name === 'Other')?.id || services[0].id;
      }
      
      // Use Prisma's executeRaw to create places with POINT geometry
      // Note: We're not providing an ID since it's auto-incremented now
      await prisma.$executeRawUnsafe(`
        INSERT INTO Place (name, service_id, location, longitude, latitude, createdAt, updatedAt)
        VALUES (?, ?, ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')')), ?, ?, NOW(), NOW())
      `, 
      placeData.name,
      serviceId,
      placeData.lng,
      placeData.lat,
      placeData.lng,
      placeData.lat
      );
      
      count++;
      if (count % 100 === 0) {
        console.log(`Created ${count} places...`);
      }
    }
    
    // Fetch all created places to return
    const allPlaces = await prisma.place.findMany() as Place[];
    return allPlaces;
  } catch (error) {
    console.error('Error creating places from JSON:', error);
    return [];
  }
}

// async function createFavorites(users: User[], places: Place[]): Promise<Favorite[]> {
  // Clean up existing favorites
  // await prisma.favorite.deleteMany();
  
  // const favorites: Favorite[] = [];
  
  // // For each user, add 1-3 random favorites
  // for (const user of users) {
  //   const numFavorites = Math.floor(Math.random() * 3) + 1;
  //   const shuffledPlaces = [...places].sort(() => 0.5 - Math.random());
    
  //   for (let i = 0; i < numFavorites && i < shuffledPlaces.length; i++) {
  //     const favorite = await prisma.favorite.create({
  //       data: {
  //         user_id: user.id,
  //         place_id: shuffledPlaces[i].id
  //       }
  //     }) as Favorite;
      
  //     favorites.push(favorite);
  //   }
  // }
  
  // return favorites;
// }

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
