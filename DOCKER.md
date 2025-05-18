# Docker Setup for LocationSearch API

This document provides instructions on how to run the LocationSearch API using Docker.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Basic knowledge of Docker commands

## Configuration

The application uses the following environment variables:

- `NODE_ENV`: The environment to run in (development, production, test)
- `PORT`: The port to expose the API on
- `DATABASE_URL`: The database connection string

These variables are set in the `docker-compose.yaml` file and in the `.env.production` file.

## Running the Application

### Starting the Services

To start all services (API and databases), run:

```bash
docker-compose up -d
```

This will:

1. Start the MySQL database service
2. Build and start the LocationSearch API

### Database Setup

The application includes a dedicated service (`db-setup`) that automatically handles:

1. Waiting for the database to be ready
2. Running migrations
3. Seeding the database with initial data

This happens automatically when you start the application with `docker-compose up`. No manual steps required!

### Accessing the API

The API will be available at:

- API Endpoints: http://localhost:8081/api
- Swagger Documentation: http://localhost:8081/api/docs

### Stopping the Services

To stop all services, run:

```bash
docker-compose down
```

### Running Tests

To run tests in a Docker environment, use:

```bash
docker-compose -f docker-compose.testing.yaml up
```

## Troubleshooting

### Database Connection Issues

If the API fails to connect to the database, check:

1. The `DATABASE_URL` environment variable in `.env.production`
2. That the MySQL service is running (`docker-compose ps`)
3. MySQL logs (`docker-compose logs mysql`)

### API Not Starting

If the API fails to start, check:

1. API logs (`docker-compose logs api`)
2. That all required environment variables are set
3. That the database is properly initialized

## Development with Docker

For development purposes, you can mount your local source code as a volume to enable hot reloading:

```bash
docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```
