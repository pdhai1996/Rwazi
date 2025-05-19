# LocationSearch API

A location-based search service that helps users find places by coordinates, radius, service types, and keywords with spatial querying capabilities.

## Table of Contents

- [Features](#features)
- [Getting Started with Docker Compose](#getting-started-with-docker-compose)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Accessing the Application](#accessing-the-application)
  - [Stopping the Application](#stopping-the-application)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Places](#places)
  - [Services](#services)
  - [Favorites](#favorites)
- [Testing Guide](#testing-guide)
  - [Initial Credentials](#initial-credentials)
  - [Testing Approaches](#testing-approaches)
  - [Common Testing Scenarios](#common-testing-scenarios)
  - [Seeding Test Data](#seeding-test-data)

## Features

- Search for places by geographical location (latitude/longitude)
- Filter by distance radius (kilometer)
- Filter by service type
- Search by keywords
- Paginated results with distance calculations
- Spatial indexing for fast geo-queries and scaling


## Getting Started with Docker Compose

The simplest way to run this application is using Docker Compose, which will set up the entire environment including the database, migrations, and API server.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js version 20
- npx and dotenv (for development and test modes)

### Installation

To install the application and its dependencies:

1. Clone the repository:
```bash
git clone <repository-url>
cd LocationSearch
```

2. Install dependencies:
```bash
npm install
```

3. Install npx globally (if not already installed):
```bash
npm install -g npx
```

4. If you're developing locally (outside Docker), install additional development dependencies:
```bash
npm install -D dotenv-cli
```

### Configuration

The application uses environment variables for configuration. Sample configuration files are provided in the `config` directory:

1. Copy the sample environment file for your environment:
   ```bash
   cp config/.env.example config/.env.[environment]
   ```
   Where `[environment]` is one of: `development`, `test`, or `production`

2. Edit the file with your specific settings if needed.

> **Important Security Note**: The sample environment files in the `config` directory contain default configurations for development, testing and production. For a production deployment, you should:
> 
> 1. Create your own environment files with secure credentials
> 2. Never commit environment files containing sensitive information to version control
> 3. Add `.env` and similar files to your `.gitignore`
> 4. Consider using a secure secrets management solution for production deployments

### Running the Application

#### Production Mode

To start the application in production mode:

```bash
docker-compose up -d
```

This command:
1. Builds the API image
2. Starts a MySQL database container
3. Runs database migrations and seeds initial data
4. Starts the API server on port 8081

#### Development Mode

For development with a separate database:

```bash
docker-compose -f docker-compose.dev.yaml up -d
```

This starts just the MySQL databases (development and test) without the API, allowing you to run the app locally using your Node.js installation.



### Accessing the Application

After starting the containers:

- API Endpoints: http://localhost:8081/api
- Swagger Documentation: http://localhost:8081/api/docs

### Stopping the Application

To stop all running containers:

```bash
docker-compose down
```

To stop and remove volumes (this will delete all data):

```bash
docker-compose down -v
```

## API Reference

The LocationSearch API provides the following endpoints:

### Authentication

- **POST /api/auth/login**: Authenticate users and receive an access token
- **POST /api/auth/refresh**: Get a new access token using a refresh token

### Places

- **GET /api/places/search**: Search for places by location (latitude/longitude), radius, service type, and keywords
  - Required parameters: `lat`, `lng`, `radius`
  - Optional parameters: `serviceId`, `keyword`, `page`, `pageSize`
  - Returns places with distance calculation from search point and pagination

### Services

- **GET /api/services**: Get all available service categories
  - Returns a list of all service categories with id, name, and slug

### Favorites

- **POST /api/favorites**: Add a place to user's favorites
- **GET /api/favorites**: Get user's favorited places with pagination
- **DELETE /api/favorites/:favoriteId**: Remove a place from favorites
- **GET /api/favorites/check/:placeId**: Check if a place is in the user's favorites

All API endpoints are documented with Swagger UI, accessible at http://localhost:8081/api/docs when the application is running.

## Testing Guide

### Initial Credentials

When the application is first set up, a default admin user is created with the following credentials:

- **Username**: `admin`
- **Password**: `admin123`

To initialize this user in a development environment:

```bash
npm run db:seed:dev
```

You can use these credentials to authenticate with the `/api/auth/login` endpoint to obtain access tokens for testing protected endpoints.

### Testing Approaches

#### Manual Testing with Swagger UI

The easiest way to test the API is through the Swagger UI interface:

1. Start the application using one of the methods described above
2. Navigate to http://localhost:8081/api/docs in your browser
3. Use the Swagger interface to:
   - Login with the admin credentials
   - Copy the returned JWT token
   - Authorize using the lock icon at the top of the page
   - Test any endpoint by clicking on it, filling required parameters, and clicking "Execute"

#### API Testing with Postman or Similar Tools

1. Import the collection (if available in the project repository)
2. Set up an environment with a variable for the base URL (http://localhost:8081/api)
3. Make a POST request to `/auth/login` with the admin credentials
4. Save the returned token to use in subsequent requests
5. Add the token to the Authorization header as `Bearer {token}` for protected endpoints

#### Automated Tests

This project includes several test suites:

- **Unit Tests**: Test individual components in isolation
  ```bash
  npm run test
  ```

- **Integration Tests**: Test API endpoints with a test database
  ```bash
  npm run test:integration
  ```

### Common Testing Scenarios

- **Authentication Flow**: 
  - Login → Get resources with token → Refresh token → Access with new token

- **Location Search**: 
  - Test different radius values and filter combinations
  - The seed data is initialized in New York City
  - Recommended test coordinates:
    ```
    latitude: 40.7128
    longitude: -74.0060
    radius: 5 (km)
    ```
  - Note: All place information is fake and used for testing purposes only

- **Favorites Management**: 
  - Add places to favorites → List favorites → Remove from favorites

### Seeding Test Data

The application uses Prisma's seeding mechanism to populate the database with initial data, including the default admin user mentioned above. If you need to create additional test users or reset the database to its initial state, you can use the following methods:

#### Running the Seed Script Manually

To manually run the seed script and create the default admin user (or reset it if modified):

```bash
# In development mode (local)
npx prisma db seed

# In Docker environment
docker-compose exec api npx prisma db seed
```

#### Creating Custom Users

If you need to create additional users for testing:

1. You can modify the seed script in `prisma/seed.ts` to include additional users with custom credentials
2. Alternatively, you can use the API to create users (if your application includes user registration endpoints)

#### Resetting the Database

To reset the database to its initial state with seed data:

```bash
# In development mode (local)
npx prisma migrate reset --force

# In Docker environment
docker-compose exec api npx prisma migrate reset --force
```

This will drop all tables, run migrations, and execute the seed script to recreate the initial data including the default admin user.

> **Note**: The seed script is automatically run when you start the application in production or development mode using the Docker Compose setup.

