# Northcoders News API

## Project Summary

Northcoders News API is a RESTful API that provides news articles, comments, and user information. It allows users to interact with the data by performing CRUD operations (Create, Read, Update, Delete).

## 🚀 Hosted Version

Live API: [ncnews.novafps.com/api](http://ncnews.novafps.com/api)

## 🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Docker (Hosting)
- Jest (Testing)
- Supertest (API Testing)
- JWT (Authentication)
- bcrypt (Password Hashing)
- Swagger (API Documentation)

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

## 🚦 Available Scripts

- `npm start` - Start the server
- `npm test` - Run tests
- `npm run seed` - Seed the database
- `npm run setup-dbs` - Reset the databases

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

Authentication endpoints:

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

Protected endpoints (require authentication):

- POST /api/articles
- PATCH /api/articles/:article_id
- DELETE /api/articles/:article_id
- POST /api/topics
- POST /api/articles/:article_id/comments
- PATCH /api/comments/:comment_id
- DELETE /api/comments/:comment_id

  For full API documentation, visit: [API Documentation](http://ncnews.novafps.com/api-docs)

## 🧪 Testing

Run the test suite:

```bash
npm test
```

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
