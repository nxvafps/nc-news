const endpointsJson = require("../endpoints.json");
const app = require("../app/app");
const request = require("supertest");

describe("app", () => {
  describe("invalid route", () => {
    it("should respond with a status code of 404 when given an invalid route", async () => {
      const {
        body: { message },
      } = await request(app).get("/api/invalid").expect(404);
      expect(message).toBe(`Can't find /api/invalid on this server`);
    });
  });

  describe("/api", () => {
    describe("GET", () => {
      test("200: Responds with an object detailing the documentation for each endpoint", async () => {
        const {
          body: { endpoints },
        } = await request(app).get("/api").expect(200);
        expect(endpoints).toEqual(endpointsJson);
      });
    });
    describe("POST", () => {
      test("405: responds with error for POST method", async () => {
        const { body } = await request(app).post("/api").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
    describe("PATCH", () => {
      test("405: responds with error for PATCH method", async () => {
        const { body } = await request(app).patch("/api").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
    describe("DELETE", () => {
      test("405: responds with error for DELETE method", async () => {
        const { body } = await request(app).delete("/api").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
  });

  describe("/api/topics", () => {
    describe("GET", () => {
      test("200: responds with an array of all topic objects", async () => {
        const { body } = await request(app).get("/api/topics").expect(200);

        expect(Array.isArray(body.topics)).toBe(true);
        expect(body.topics).toHaveLength(3);

        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
    });
    describe("POST", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "Password123!",
        });

        token = loginResponse.body.token;
      });

      test("201: adds a new topic and responds with the posted topic", async () => {
        const newTopic = {
          slug: "test-topic",
          description: "This is a test topic",
        };

        const { body } = await request(app)
          .post("/api/topics")
          .set("Authorization", `Bearer ${token}`)
          .send(newTopic)
          .expect(201);

        expect(body.topic).toMatchObject({
          slug: newTopic.slug,
          description: newTopic.description,
        });

        const { body: getBody } = await request(app)
          .get("/api/topics")
          .expect(200);
        expect(getBody.topics).toContainEqual(newTopic);
      });

      test("401: responds with error when no token provided", async () => {
        const newTopic = {
          slug: "test-topic",
          description: "This is a test topic",
        };

        const { body } = await request(app)
          .post("/api/topics")
          .send(newTopic)
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("401: responds with error when invalid token provided", async () => {
        const newTopic = {
          slug: "test-topic",
          description: "This is a test topic",
        };

        const { body } = await request(app)
          .post("/api/topics")
          .set("Authorization", "Bearer invalid_token")
          .send(newTopic)
          .expect(401);

        expect(body.message).toBe("Invalid token");
      });

      test("400: responds with error when request body is missing required fields", async () => {
        const invalidTopic = {
          slug: "test-topic",
        };

        const { body } = await request(app)
          .post("/api/topics")
          .set("Authorization", `Bearer ${token}`)
          .send(invalidTopic)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });
    describe("PATCH", () => {
      test("405: responds with error for PATCH method", async () => {
        const { body } = await request(app).patch("/api/topics").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
    describe("DELETE", () => {
      test("405: responds with error for DELETE method", async () => {
        const { body } = await request(app).delete("/api/topics").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
  });

  describe("/api/articles", () => {
    describe("GET", () => {
      test("200: responds with an array of article objects with correct properties", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBeGreaterThan(0);

        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(article).not.toHaveProperty("body");
        });
      });

      test("200: articles are sorted by created_at in descending order", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });

      test("200: each article has the correct comment count", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        const articleWithComments = body.articles.find(
          (article) => article.article_id === 1
        );
        expect(articleWithComments.comment_count).toBe(11);
      });
    });

    describe("GET (queries)", () => {
      test("200: accepts sort_by query to sort by any valid column", async () => {
        const { body } = await request(app)
          .get("/api/articles?sort_by=title")
          .expect(200);

        expect(body.articles).toBeSortedBy("title", { descending: true });
      });

      test("200: accepts sort_by query for votes", async () => {
        const { body } = await request(app)
          .get("/api/articles?sort_by=votes")
          .expect(200);

        expect(body.articles).toBeSortedBy("votes", { descending: true });
      });

      test("200: accepts order query to set sort direction", async () => {
        const { body } = await request(app)
          .get("/api/articles?order=asc")
          .expect(200);

        expect(body.articles).toBeSortedBy("created_at", { ascending: true });
      });

      test("200: accepts both sort_by and order queries together", async () => {
        const { body } = await request(app)
          .get("/api/articles?sort_by=title&order=asc")
          .expect(200);

        expect(body.articles).toBeSortedBy("title", { ascending: true });
      });

      test("400: responds with error when sort_by column doesn't exist", async () => {
        const { body } = await request(app)
          .get("/api/articles?sort_by=invalid_column")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when order query is invalid", async () => {
        const { body } = await request(app)
          .get("/api/articles?order=invalid")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("200: defaults to sorting by created_at desc when no queries provided", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });

      test("200: accepts topic query to filter articles by topic", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=mitch")
          .expect(200);

        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });

      test("200: returns empty array when topic exists but has no articles", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=paper")
          .expect(200);

        expect(body.articles).toEqual([]);
      });

      test("404: responds with error when topic does not exist", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=not-a-topic")
          .expect(404);

        expect(body.message).toBe("Topic not found");
      });

      test("200: topic query works with other queries", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=mitch&sort_by=title&order=asc")
          .expect(200);

        expect(body.articles.length).toBeGreaterThan(0);
        expect(body.articles).toBeSortedBy("title", { ascending: true });
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
    });

    describe("GET (pagination)", () => {
      test("200: defaults to limit of 10 articles per page", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        expect(body.articles).toHaveLength(10);
        expect(body.total_count).toBe(13);
      });

      test("200: accepts limit query to change number of articles per page", async () => {
        const { body } = await request(app)
          .get("/api/articles?limit=5")
          .expect(200);

        expect(body.articles).toHaveLength(5);
        expect(body.total_count).toBe(13);
      });

      test("200: accepts page query to get specific page of results", async () => {
        const { body } = await request(app)
          .get("/api/articles?p=2&limit=5")
          .expect(200);

        expect(body.articles).toHaveLength(5);
        expect(body.total_count).toBe(13);
        expect(body.articles[0].article_id).not.toBe(1);
      });

      test("200: returns correct number of articles on last page", async () => {
        const { body } = await request(app)
          .get("/api/articles?p=3&limit=5")
          .expect(200);

        expect(body.articles).toHaveLength(3);
        expect(body.total_count).toBe(13);
      });

      test("200: works with existing sort and filter queries", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=mitch&sort_by=title&order=asc&limit=5&p=1")
          .expect(200);

        expect(body.articles).toHaveLength(5);
        expect(body.articles).toBeSortedBy("title", { ascending: true });
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });

      test("200: returns empty array when page number is too high", async () => {
        const { body } = await request(app)
          .get("/api/articles?p=999&limit=5")
          .expect(200);

        expect(body.articles).toEqual([]);
        expect(body.total_count).toBe(13);
      });

      test("400: responds with error when limit is not a number", async () => {
        const { body } = await request(app)
          .get("/api/articles?limit=not-a-number")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when page is not a number", async () => {
        const { body } = await request(app)
          .get("/api/articles?p=not-a-number")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when limit is negative", async () => {
        const { body } = await request(app)
          .get("/api/articles?limit=-5")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when page is negative", async () => {
        const { body } = await request(app)
          .get("/api/articles?p=-1")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when limit is zero", async () => {
        const { body } = await request(app)
          .get("/api/articles?limit=0")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });

    describe("POST", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "password123!A",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "password123!A",
        });

        token = loginResponse.body.token;
      });

      test("201: adds a new article and responds with the posted article", async () => {
        const newArticle = {
          author: "testuser",
          title: "Test Article",
          body: "This is a test article",
          topic: "cats",
        };

        const { body } = await request(app)
          .post("/api/articles")
          .set("Authorization", `Bearer ${token}`)
          .send(newArticle)
          .expect(201);

        expect(body.article).toMatchObject({
          article_id: expect.any(Number),
          author: newArticle.author,
          title: newArticle.title,
          body: newArticle.body,
          topic: newArticle.topic,
          article_img_url: expect.any(String),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });

      test("401: responds with error when no token provided", async () => {
        const newArticle = {
          author: "testuser",
          title: "Test Article",
          body: "This is a test article",
          topic: "cats",
        };

        const { body } = await request(app)
          .post("/api/articles")
          .send(newArticle)
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("401: responds with error when invalid token provided", async () => {
        const newArticle = {
          author: "testuser",
          title: "Test Article",
          body: "This is a test article",
          topic: "cats",
        };

        const { body } = await request(app)
          .post("/api/articles")
          .set("Authorization", "Bearer invalid_token")
          .send(newArticle)
          .expect(401);

        expect(body.message).toBe("Invalid token");
      });
    });

    describe("PATCH", () => {
      test("405: responds with error for PATCH method", async () => {
        const { body } = await request(app).patch("/api/articles").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });

    describe("DELETE", () => {
      test("405: responds with error for DELETE method", async () => {
        const { body } = await request(app).delete("/api/articles").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
  });

  describe("/api/articles/search", () => {
    describe("GET", () => {
      test("200: responds with articles matching search query in title or body", async () => {
        const { body } = await request(app)
          .get("/api/articles/search?q=mitch")
          .expect(200);

        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(
            article.title.toLowerCase().includes("mitch") ||
              article.body.toLowerCase().includes("mitch")
          ).toBe(true);
        });
      });

      test("200: supports pagination", async () => {
        const { body } = await request(app)
          .get("/api/articles/search?q=the&limit=5&p=1")
          .expect(200);

        expect(body.articles).toHaveLength(5);
        expect(body.total_count).toBeGreaterThan(5);
      });

      test("200: returns empty array when no matches found", async () => {
        const { body } = await request(app)
          .get("/api/articles/search?q=xyznotfound")
          .expect(200);

        expect(body.articles).toEqual([]);
        expect(body.total_count).toBe(0);
      });

      test("400: responds with error when no search query provided", async () => {
        const { body } = await request(app)
          .get("/api/articles/search")
          .expect(400);

        expect(body.message).toBe("Search query required");
      });
    });
  });

  describe("/api/articles/:article_id", () => {
    describe("GET", () => {
      test("200: responds with a single article object with correct properties", async () => {
        const { body } = await request(app).get("/api/articles/1").expect(200);

        expect(body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 100,
          article_img_url: expect.any(String),
        });
      });

      test("200: article response includes accurate comment_count", async () => {
        const { body } = await request(app).get("/api/articles/1").expect(200);

        expect(body.article.comment_count).toBe(11);
        expect(typeof body.article.comment_count).toBe("number");
      });

      test("404: responds with appropriate error message when article_id does not exist", async () => {
        const { body } = await request(app)
          .get("/api/articles/999")
          .expect(404);
        expect(body.message).toBe("Article not found");
      });

      test("400: responds with appropriate error message when article_id is invalid", async () => {
        const { body } = await request(app)
          .get("/api/articles/not-an-id")
          .expect(400);
        expect(body.message).toBe("Bad request");
      });
    });

    describe("PUT", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "password123!A",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "password123!A",
        });

        token = loginResponse.body.token;
      });

      test("200: updates article body when authenticated as owner", async () => {
        const newArticle = {
          author: "testuser",
          title: "Test Article",
          body: "Original article text",
          topic: "cats",
        };

        const articleResponse = await request(app)
          .post("/api/articles")
          .set("Authorization", `Bearer ${token}`)
          .send(newArticle);

        const articleId = articleResponse.body.article.article_id;

        const update = {
          body: "Updated article text",
        };

        const { body } = await request(app)
          .put(`/api/articles/${articleId}`)
          .set("Authorization", `Bearer ${token}`)
          .send(update)
          .expect(200);

        expect(body.article).toMatchObject({
          article_id: articleId,
          body: update.body,
          author: "testuser",
          title: "Test Article",
          topic: "cats",
          votes: 0,
          created_at: expect.any(String),
        });
      });

      test("401: responds with error when no token provided", async () => {
        const update = { body: "Updated text" };
        const { body } = await request(app)
          .put("/api/articles/1")
          .send(update)
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("403: responds with error when user is not the article owner", async () => {
        const update = { body: "Updated text" };
        const { body } = await request(app)
          .put("/api/articles/1")
          .set("Authorization", `Bearer ${token}`)
          .send(update)
          .expect(403);

        expect(body.message).toBe("Forbidden - user does not own the article");
      });

      test("404: responds with error when article_id does not exist", async () => {
        const update = { body: "Updated text" };
        const { body } = await request(app)
          .put("/api/articles/999")
          .set("Authorization", `Bearer ${token}`)
          .send(update)
          .expect(404);

        expect(body.message).toBe("Article not found");
      });

      test("400: responds with error when body field is missing", async () => {
        const { body } = await request(app)
          .put("/api/articles/1")
          .set("Authorization", `Bearer ${token}`)
          .send({})
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });

    describe("POST", () => {
      test("405: responds with error for POST method", async () => {
        const { body } = await request(app).post("/api/articles/1").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });

    describe("PATCH", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "password123!A",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "password123!A",
        });

        token = loginResponse.body.token;
      });

      test("200: updates article votes and responds with updated article", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/articles/1")
          .set("Authorization", `Bearer ${token}`)
          .send(voteUpdate)
          .expect(200);

        expect(body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 101,
          article_img_url: expect.any(String),
        });
      });

      test("401: responds with error when no token provided", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/articles/1")
          .send(voteUpdate)
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("401: responds with error when invalid token provided", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/articles/1")
          .set("Authorization", "Bearer invalid_token")
          .send(voteUpdate)
          .expect(401);

        expect(body.message).toBe("Invalid token");
      });

      test("400: responds with error when inc_votes is missing", async () => {
        const invalidVoteUpdate = {};

        const { body } = await request(app)
          .patch("/api/articles/1")
          .set("Authorization", `Bearer ${token}`)
          .send(invalidVoteUpdate)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });

    describe("DELETE", () => {
      let token;
      let adminToken;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "password123!A",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "password123!A",
        });
        token = loginResponse.body.token;

        const adminLoginResponse = await request(app)
          .post("/api/auth/login")
          .send({
            email: "rogersop@example.com",
            password: "password3",
          });
        adminToken = adminLoginResponse.body.token;
      });

      test("204: successfully deletes article when authenticated as owner", async () => {
        const newArticle = {
          author: "testuser",
          title: "Test Article",
          body: "This is a test article",
          topic: "cats",
        };

        const createResponse = await request(app)
          .post("/api/articles")
          .set("Authorization", `Bearer ${token}`)
          .send(newArticle);

        const articleId = createResponse.body.article.article_id;

        await request(app)
          .delete(`/api/articles/${articleId}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(204);

        const { body } = await request(app)
          .get(`/api/articles/${articleId}`)
          .expect(404);

        expect(body.message).toBe("Article not found");
      });

      test("401: responds with error when no token provided", async () => {
        const { body } = await request(app)
          .delete("/api/articles/1")
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("401: responds with error when invalid token provided", async () => {
        const { body } = await request(app)
          .delete("/api/articles/1")
          .set("Authorization", "Bearer invalid_token")
          .expect(401);

        expect(body.message).toBe("Invalid token");
      });

      test("403: responds with error when user is not the article owner", async () => {
        const { body } = await request(app)
          .delete("/api/articles/1")
          .set("Authorization", `Bearer ${token}`)
          .expect(403);

        expect(body.message).toBe("Forbidden - user does not own the article");
      });

      test("404: responds with error when article_id does not exist", async () => {
        const { body } = await request(app)
          .delete("/api/articles/999")
          .set("Authorization", `Bearer ${token}`)
          .expect(404);

        expect(body.message).toBe("Article not found");
      });

      test("400: responds with error when article_id is invalid", async () => {
        const { body } = await request(app)
          .delete("/api/articles/not-an-id")
          .set("Authorization", `Bearer ${token}`)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });
  });

  describe("/api/articles/:article_id/comments", () => {
    describe("GET", () => {
      test("200: responds with an array of comments for the given article_id", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments")
          .expect(200);

        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBeGreaterThan(0);

        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });

      test("200: comments are sorted by created_at in descending order", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments")
          .expect(200);

        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });

      test("200: returns empty array for article with no comments", async () => {
        const { body } = await request(app)
          .get("/api/articles/2/comments")
          .expect(200);

        expect(body.comments).toEqual([]);
      });

      test("404: responds with appropriate error message when article_id does not exist", async () => {
        const { body } = await request(app)
          .get("/api/articles/999/comments")
          .expect(404);

        expect(body.message).toBe("Article not found");
      });

      test("400: responds with appropriate error message when article_id is invalid", async () => {
        const { body } = await request(app)
          .get("/api/articles/not-an-id/comments")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });

    describe("GET (pagination)", () => {
      test("200: defaults to limit of 10 comments per page", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments")
          .expect(200);

        expect(body.comments).toHaveLength(10);
        expect(body.total_count).toBe(11);
      });

      test("200: accepts limit query to change number of comments per page", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?limit=5")
          .expect(200);

        expect(body.comments).toHaveLength(5);
        expect(body.total_count).toBe(11);
      });

      test("200: accepts page query to get specific page of results", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?p=2&limit=5")
          .expect(200);

        expect(body.comments).toHaveLength(5);
        expect(body.total_count).toBe(11);
        expect(body.comments[0].comment_id).not.toBe(1);
      });

      test("200: returns correct number of comments on last page", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?p=3&limit=5")
          .expect(200);

        expect(body.comments).toHaveLength(1);
        expect(body.total_count).toBe(11);
      });

      test("200: returns empty array when page number is too high", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?p=999&limit=5")
          .expect(200);

        expect(body.comments).toEqual([]);
        expect(body.total_count).toBe(11);
      });

      test("400: responds with error when limit is not a number", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?limit=not-a-number")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when page is not a number", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?p=not-a-number")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when limit is negative", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?limit=-5")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when page is negative", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?p=-1")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when limit is zero", async () => {
        const { body } = await request(app)
          .get("/api/articles/1/comments?limit=0")
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });

    describe("POST", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "Password123!",
        });

        token = loginResponse.body.token;
      });

      test("201: adds a comment to an article and responds with the posted comment", async () => {
        const newComment = {
          body: "This is a test comment",
        };

        const { body } = await request(app)
          .post("/api/articles/1/comments")
          .set("Authorization", `Bearer ${token}`)
          .send(newComment)
          .expect(201);

        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: newComment.body,
          article_id: 1,
          author: "testuser",
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });

      test("401: responds with error when no token provided", async () => {
        const newComment = {
          body: "This is a test comment",
        };

        const { body } = await request(app)
          .post("/api/articles/1/comments")
          .send(newComment)
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("401: responds with error when invalid token provided", async () => {
        const newComment = {
          body: "This is a test comment",
        };

        const { body } = await request(app)
          .post("/api/articles/1/comments")
          .set("Authorization", "Bearer invalid_token")
          .send(newComment)
          .expect(401);

        expect(body.message).toBe("Invalid token");
      });

      test("400: responds with error when request body is missing required fields", async () => {
        const invalidComment = {};

        const { body } = await request(app)
          .post("/api/articles/1/comments")
          .set("Authorization", `Bearer ${token}`)
          .send(invalidComment)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("404: responds with error when article_id does not exist", async () => {
        const newComment = {
          body: "This is a test comment",
        };

        const { body } = await request(app)
          .post("/api/articles/999/comments")
          .set("Authorization", `Bearer ${token}`)
          .send(newComment)
          .expect(404);

        expect(body.message).toBe("Article not found");
      });
    });

    describe("PATCH", () => {
      test("405: responds with error for PATCH method", async () => {
        const { body } = await request(app)
          .patch("/api/articles/1/comments")
          .expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });

    describe("DELETE", () => {
      test("405: responds with error for DELETE method", async () => {
        const { body } = await request(app)
          .delete("/api/articles/1/comments")
          .expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
  });

  describe("/api/comments/:comment-id", () => {
    describe("GET", () => {
      test("405: responds with error for GET method", async () => {
        const { body } = await request(app).get("/api/comments/1").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
    describe("PUT", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "Password123!",
        });

        token = loginResponse.body.token;
      });

      test("200: updates comment text when authenticated as owner", async () => {
        const newComment = {
          body: "Original comment text",
        };

        const commentResponse = await request(app)
          .post("/api/articles/1/comments")
          .set("Authorization", `Bearer ${token}`)
          .send(newComment);

        const commentId = commentResponse.body.comment.comment_id;

        const update = {
          body: "Updated comment text",
        };

        const { body } = await request(app)
          .put(`/api/comments/${commentId}`)
          .set("Authorization", `Bearer ${token}`)
          .send(update)
          .expect(200);

        expect(body.comment).toMatchObject({
          comment_id: commentId,
          body: update.body,
          article_id: 1,
          author: "testuser",
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });

      test("401: responds with error when no token provided", async () => {
        const update = {
          body: "Updated text",
        };

        const { body } = await request(app)
          .put("/api/comments/1")
          .send(update)
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("401: responds with error when invalid token provided", async () => {
        const update = {
          body: "Updated text",
        };

        const { body } = await request(app)
          .put("/api/comments/1")
          .set("Authorization", "Bearer invalid_token")
          .send(update)
          .expect(401);

        expect(body.message).toBe("Invalid token");
      });

      test("403: responds with error when user is not the comment owner", async () => {
        const update = {
          body: "Updated text",
        };

        const { body } = await request(app)
          .put("/api/comments/1")
          .set("Authorization", `Bearer ${token}`)
          .send(update)
          .expect(403);

        expect(body.message).toBe("Forbidden - user does not own the comment");
      });

      test("404: responds with error when comment_id does not exist", async () => {
        const update = {
          body: "Updated text",
        };

        const { body } = await request(app)
          .put("/api/comments/999")
          .set("Authorization", `Bearer ${token}`)
          .send(update)
          .expect(404);

        expect(body.message).toBe("Comment not found");
      });

      test("400: responds with error when comment_id is invalid", async () => {
        const update = {
          body: "Updated text",
        };

        const { body } = await request(app)
          .put("/api/comments/not-a-number")
          .set("Authorization", `Bearer ${token}`)
          .send(update)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when body field is missing", async () => {
        const invalidUpdate = {};

        const { body } = await request(app)
          .put("/api/comments/1")
          .set("Authorization", `Bearer ${token}`)
          .send(invalidUpdate)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });
    describe("POST", () => {
      test("405: responds with error for POST method", async () => {
        const { body } = await request(app).post("/api/comments/1").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
    describe("PATCH", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "Password123!",
        });

        token = loginResponse.body.token;
      });

      test("200: updates comment votes and responds with updated comment", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/comments/1")
          .set("Authorization", `Bearer ${token}`)
          .send(voteUpdate)
          .expect(200);

        expect(body.comment).toMatchObject({
          comment_id: 1,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
        });
      });

      test("401: responds with error when no token provided", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/comments/1")
          .send(voteUpdate)
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("401: responds with error when invalid token provided", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/comments/1")
          .set("Authorization", "Bearer invalid_token")
          .send(voteUpdate)
          .expect(401);

        expect(body.message).toBe("Invalid token");
      });

      test("400: responds with error when inc_votes is missing", async () => {
        const invalidVoteUpdate = {};

        const { body } = await request(app)
          .patch("/api/comments/1")
          .set("Authorization", `Bearer ${token}`)
          .send(invalidVoteUpdate)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });
    describe("DELETE", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "Password123!",
        });

        token = loginResponse.body.token;
      });

      test("204: successfully deletes comment when authenticated as owner", async () => {
        const newComment = {
          body: "Test comment to delete",
        };

        const commentResponse = await request(app)
          .post("/api/articles/1/comments")
          .set("Authorization", `Bearer ${token}`)
          .send(newComment);

        const commentId = commentResponse.body.comment.comment_id;

        await request(app)
          .delete(`/api/comments/${commentId}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(204);

        const { body } = await request(app)
          .delete(`/api/comments/${commentId}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(404);

        expect(body.message).toBe("Comment not found");
      });

      test("401: responds with error when no token provided", async () => {
        const { body } = await request(app)
          .delete("/api/comments/1")
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("401: responds with error when invalid token provided", async () => {
        const { body } = await request(app)
          .delete("/api/comments/1")
          .set("Authorization", "Bearer invalid_token")
          .expect(401);

        expect(body.message).toBe("Invalid token");
      });

      test("403: responds with error when user is not the comment owner", async () => {
        const { body } = await request(app)
          .delete("/api/comments/1")
          .set("Authorization", `Bearer ${token}`)
          .expect(403);

        expect(body.message).toBe("Forbidden - user does not own the comment");
      });

      test("404: responds with error when comment_id does not exist", async () => {
        const { body } = await request(app)
          .delete("/api/comments/999")
          .set("Authorization", `Bearer ${token}`)
          .expect(404);

        expect(body.message).toBe("Comment not found");
      });

      test("400: responds with error when comment_id is invalid", async () => {
        const { body } = await request(app)
          .delete("/api/comments/not-a-number")
          .set("Authorization", `Bearer ${token}`)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });
  });

  describe("/api/users", () => {
    describe("GET", () => {
      test("200: responds with an array of all user objects", async () => {
        const { body } = await request(app).get("/api/users").expect(200);

        expect(Array.isArray(body.users)).toBe(true);
        expect(body.users).toHaveLength(4);

        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });

      test("200: user objects contain the correct properties", async () => {
        const { body } = await request(app).get("/api/users").expect(200);

        expect(body.users[0]).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url: expect.any(String),
        });
      });
    });
    describe("POST", () => {
      test("405: responds with error for POST method", async () => {
        const { body } = await request(app).post("/api/users").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
    describe("PATCH", () => {
      test("405: responds with error for PATCH method", async () => {
        const { body } = await request(app).patch("/api/users").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
    describe("DELETE", () => {
      test("405: responds with error for DELETE method", async () => {
        const { body } = await request(app).delete("/api/users").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
  });

  describe("/api/users/:username", () => {
    describe("GET", () => {
      test("200: responds with a user object with correct properties", async () => {
        const { body } = await request(app)
          .get("/api/users/butter_bridge")
          .expect(200);

        expect(body.user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });

      test("404: responds with appropriate error message when username does not exist", async () => {
        const { body } = await request(app)
          .get("/api/users/not-a-user")
          .expect(404);

        expect(body.message).toBe("User not found");
      });
    });
    describe("POST", () => {
      test("405: responds with error for POST method", async () => {
        const { body } = await request(app).post("/api/users/name").expect(405);
        expect(body.message).toBe("Method not allowed");
      });
    });
    describe("PATCH", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "Password123!",
        });

        token = loginResponse.body.token;
      });

      test("200: updates user profile and returns updated user", async () => {
        const updates = {
          name: "Updated Name",
          avatar_url: "https://new-avatar-url.com/image.jpg",
        };

        const { body } = await request(app)
          .patch("/api/users/testuser")
          .set("Authorization", `Bearer ${token}`)
          .send(updates)
          .expect(200);

        expect(body.user).toMatchObject({
          username: "testuser",
          name: updates.name,
          avatar_url: updates.avatar_url,
        });
      });

      test("401: responds with error when no token provided", async () => {
        const { body } = await request(app)
          .patch("/api/users/testuser")
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("403: responds with error when trying to update another user's profile", async () => {
        const { body } = await request(app)
          .patch("/api/users/butter_bridge")
          .set("Authorization", `Bearer ${token}`)
          .expect(403);

        expect(body.message).toBe("Cannot update other users");
      });

      test("404: responds with error when username does not exist", async () => {
        const { body } = await request(app)
          .patch("/api/users/nonexistent")
          .set("Authorization", `Bearer ${token}`)
          .expect(404);

        expect(body.message).toBe("User not found");
      });
    });
    describe("DELETE", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "Password123!",
        });

        token = loginResponse.body.token;
      });

      test("204: successfully deletes user account when authenticated as owner", async () => {
        await request(app)
          .delete("/api/users/testuser")
          .set("Authorization", `Bearer ${token}`)
          .expect(204);

        const { body } = await request(app)
          .get("/api/users/testuser")
          .expect(404);

        expect(body.message).toBe("User not found");
      });

      test("401: responds with error when no token provided", async () => {
        const { body } = await request(app)
          .delete("/api/users/testuser")
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("403: responds with error when trying to delete another user's account", async () => {
        const { body } = await request(app)
          .delete("/api/users/butter_bridge")
          .set("Authorization", `Bearer ${token}`)
          .expect(403);

        expect(body.message).toBe("Cannot delete other users");
      });

      test("404: responds with error when username does not exist", async () => {
        const { body } = await request(app)
          .delete("/api/users/nonexistent")
          .set("Authorization", `Bearer ${token}`)
          .expect(404);

        expect(body.message).toBe("User not found");
      });
    });
  });

  describe("/api/users/:username/avatar", () => {
    describe("PUT", () => {
      let token;

      beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
          username: "testuser",
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        });

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "Password123!",
        });

        token = loginResponse.body.token;
      });

      test("200: updates user avatar and returns updated user", async () => {
        const newAvatar = {
          avatar_url: "https://new-avatar.com/image.jpg",
        };

        const { body } = await request(app)
          .put("/api/users/testuser/avatar")
          .set("Authorization", `Bearer ${token}`)
          .send(newAvatar)
          .expect(200);

        expect(body.user).toMatchObject({
          username: "testuser",
          name: "Test User",
          avatar_url: newAvatar.avatar_url,
        });
      });

      test("401: responds with error when no token provided", async () => {
        const { body } = await request(app)
          .put("/api/users/testuser/avatar")
          .expect(401);

        expect(body.message).toBe("No token provided");
      });

      test("403: responds with error when trying to update another user's avatar", async () => {
        const { body } = await request(app)
          .put("/api/users/butter_bridge/avatar")
          .set("Authorization", `Bearer ${token}`)
          .send({ avatar_url: "https://new-avatar.com/image.jpg" })
          .expect(403);

        expect(body.message).toBe("Cannot update other users");
      });

      test("400: responds with error when avatar_url is missing", async () => {
        const { body } = await request(app)
          .put("/api/users/testuser/avatar")
          .set("Authorization", `Bearer ${token}`)
          .send({})
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });
  });
});
