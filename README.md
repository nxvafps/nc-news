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

Create two files in the root directory:

- `.env.development`
- `.env.test`

Add the following content:

`.env.development`:

```
PGDATABASE=your_development_db
```

`.env.test`:

```
PGDATABASE=your_test_db
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

Available endpoints:

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

For full API documentation, visit: [API Documentation](http://ncnews.novafps.com/api)

## 🧪 Testing

Run the test suite:

```bash
npm test
```

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
