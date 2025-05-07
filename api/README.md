# Jack Pot API

A NestJS-based REST API for managing games, events, plants, and user relationships.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Jack-pot-/api
```

2. Install dependencies:
```bash
npm install
```

## Database Setup

1. Create a PostgreSQL database:
```bash
createdb jack_pot
```

2. Import the database schema:
```bash
psql -d jack_pot -f db/backup.sql
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=jack_pot

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
```

## Running the Application

1. Development mode:
```bash
npm run start:dev
or
npm start --watch
```

2. Production mode:
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Your License Here]
