# Northcoders News API

## Project Summary

Northcoders News API is a RESTful API that provides news articles, comments, and user information. It allows users to interact with the data by performing CRUD operations (Create, Read, Update, Delete).

## 🚀 Hosted Version

- Live API: [ncnews.novafps.com/api](https://ncnews.novafps.com/api)
- Documentation: [here](https://ncnews.novafps.com/api-docs)

## 🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Docker (Hosting)
- Jest & Jest-Extended (Testing)
- Supertest (API Testing)
- JWT (Authentication)
- bcrypt (Password Hashing)
- Swagger (API Documentation)
- Winston (Logging)

## ⚙️ Prerequisites

- Node.js >= 14.0.0
- PostgreSQL >= 12.0.0

## 🔧 Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/nxvafps/nc-news.git
cd nc-news
```

2. Install dependencies:

```bash
npm install
```

3. Create environment files:

Create the following files in the root directory:

- `.env.development`
- `.env.test`

Add the following content:

`.env.development`:

```env
PGDATABASE=your_development_db
PORT=8080
JWT_SECRET=your_secure_secret_key
SWAGGER_URL=http://localhost:8080
```

`.env.test`:

```env
PGDATABASE=your_test_db
PORT=8080
JWT_SECRET=your_secure_secret_key
SWAGGER_URL=http://localhost:8080
```

For production, create `.env.production` with:

```env
PGDATABASE=your_production_db
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGHOST=your_db_host
PORT=8080
JWT_SECRET=your_secure_secret_key
SWAGGER_URL=your_api_url
```

> **Important**: Generate a secure random string for JWT_SECRET. Never commit your actual secret keys to version control.

You can generate a secure secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. Setup and seed database:

```bash
npm run setup-dbs
npm run seed
```

## 🐳 Docker Setup

1. Make sure you have Docker and Docker Compose installed on your system.

2. Create a `.env` file in the root directory with the following environment variables:

```env
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_database_name
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=your_database_name
PGHOST=db
NODE_ENV=development
JWT_SECRET=your_secure_secret
```

3. Build and start the containers:

```bash
# Development mode
npm run docker-build

# Or production mode
npm run setup-all
```

4. The API will be available at:

   - API: http://localhost:8080/api
   - Documentation: http://localhost:8080/api-docs

5. To stop the containers:

```bash
npm run docker-stop
```

### Docker Commands Reference

- `npm run docker-dev` - Start development environment with Docker
- `npm run docker-stop` - Stop Docker containers
- `npm run setup-all` - Setup production environment (Docker + DB setup)

The Docker setup includes:

- Node.js application container
- PostgreSQL database container
- Automatic database healthcheck
- Volume persistence for database data

## 🚦 Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed the database
- `npm run setup-dbs` - Reset the databases
- `npm run docker-dev` - Start development environment with Docker
- `npm run docker-stop` - Stop Docker containers
- `npm run setup-all` - Setup production environment (Docker + DB setup)

## 📚 API Documentation

All available endpoints:

- GET /api/topics
- POST /api/topics
- GET /api/articles
- POST /api/articles
- GET /api/articles/:article_id
- PATCH /api/articles/:article_id
- DELETE /api/articles/:article_id
- GET /api/articles/:article_id/comments
- POST /api/articles/:article_id/comments
- PATCH /api/comments/:comment_id
- DELETE /api/comments/:comment_id
- GET /api/users
- GET /api/users/:username
- DELETE /api/users/:username
- PUT /api/users/:username/avatar

Authentication endpoints:

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

### Protected Endpoints (require authentication)

- POST /api/articles
- PATCH /api/articles/:article_id
- DELETE /api/articles/:article_id
- POST /api/topics
- POST /api/articles/:article_id/comments
- PATCH /api/comments/:comment_id
- DELETE /api/comments/:comment_id (owner only)
- PATCH /api/users/:username (owner only)
- DELETE /api/users/:username (owner only)
- PUT /api/users/:username/avatar (owner only)

For full API documentation, visit: [API Documentation](http://ncnews.novafps.com/api-docs)

### Rate Limiting

The API implements rate limiting to prevent abuse:

- Global: 100 requests per 15 minutes per IP
- Auth endpoints (/api/auth/\*): 5 requests per hour per IP
- API endpoints (/api/\*): 50 requests per 15 minutes per IP

When rate limits are exceeded, the API will respond with a 429 status code and an error message.

Rate limit information is included in the response headers:

- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining in the current time window
- `RateLimit-Reset`: Time when the rate limit will reset (in Unix epoch seconds)

### Logging

The application uses Winston for logging with the following configuration:

#### Log Files

- `logs/error.log` - Contains error-level logs only
- `logs/combined.log` - Contains all log levels

#### Environment-specific Behavior

- Development: Logs to both files and console
- Production: Logs to files only
- Test: Silent logging (no output)

#### Configuration

Log level can be configured via environment variables:

```env
LOG_LEVEL=info # Optional: Set custom logging level (error, warn, info, debug)
```

## 🚀 Local Development

1. Start the development server:

```bash
npm run dev
```

2. Visit the API at http://localhost:8080/api
3. View API documentation at http://localhost:8080/api-docs

## 🧪 Testing

Run the test suite:

```bash
npm test
```

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
