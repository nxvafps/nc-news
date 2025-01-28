const endpointsJson = require("../endpoints.json");
const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

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
      test("201: adds a new topic and responds with the posted topic", async () => {
        const newTopic = {
          slug: "test-topic",
          description: "This is a test topic",
        };

        const { body } = await request(app)
          .post("/api/topics")
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

      test("400: responds with error when request body is missing required fields", async () => {
        const invalidTopic = {
          slug: "test-topic",
        };

        const { body } = await request(app)
          .post("/api/topics")
          .send(invalidTopic)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when slug is missing", async () => {
        const invalidTopic = {
          description: "This is a test topic",
        };

        const { body } = await request(app)
          .post("/api/topics")
          .send(invalidTopic)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("409: responds with error when topic slug already exists", async () => {
        const existingTopic = {
          slug: "mitch",
          description: "This is a duplicate topic",
        };

        const { body } = await request(app)
          .post("/api/topics")
          .send(existingTopic)
          .expect(409);

        expect(body.message).toBe("Topic already exists");
      });

      test("400: responds with error when request body is empty", async () => {
        const { body } = await request(app)
          .post("/api/topics")
          .send({})
          .expect(400);

        expect(body.message).toBe("Bad request");
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
            comment_count: expect.any(String),
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
        expect(articleWithComments.comment_count).toBe("11");
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
      test("201: adds a new article and responds with the posted article", async () => {
        const newArticle = {
          author: "butter_bridge",
          title: "Test Article",
          body: "This is a test article",
          topic: "cats",
        };

        const { body } = await request(app)
          .post("/api/articles")
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

      test("201: sets default article_img_url when not provided", async () => {
        const newArticle = {
          author: "butter_bridge",
          title: "Test Article",
          body: "This is a test article",
          topic: "cats",
        };

        const { body } = await request(app)
          .post("/api/articles")
          .send(newArticle)
          .expect(201);

        expect(body.article.article_img_url).toEqual(expect.any(String));
      });

      test("201: accepts custom article_img_url", async () => {
        const newArticle = {
          author: "butter_bridge",
          title: "Test Article",
          body: "This is a test article",
          topic: "cats",
          article_img_url: "https://test-image.jpg",
        };

        const { body } = await request(app)
          .post("/api/articles")
          .send(newArticle)
          .expect(201);

        expect(body.article.article_img_url).toBe(newArticle.article_img_url);
      });

      test("400: responds with error when request body is missing required fields", async () => {
        const invalidArticle = {
          author: "butter_bridge",
          // missing title
          body: "This is a test article",
          topic: "cats",
        };

        const { body } = await request(app)
          .post("/api/articles")
          .send(invalidArticle)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("404: responds with error when author does not exist", async () => {
        const newArticle = {
          author: "not_a_user",
          title: "Test Article",
          body: "This is a test article",
          topic: "cats",
        };

        const { body } = await request(app)
          .post("/api/articles")
          .send(newArticle)
          .expect(404);

        expect(body.message).toBe("Author not found");
      });

      test("404: responds with error when topic does not exist", async () => {
        const newArticle = {
          author: "butter_bridge",
          title: "Test Article",
          body: "This is a test article",
          topic: "not_a_topic",
        };

        const { body } = await request(app)
          .post("/api/articles")
          .send(newArticle)
          .expect(404);

        expect(body.message).toBe("Topic not found");
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

    describe("PATCH", () => {
      test("200: updates article votes and responds with updated article", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/articles/1")
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

      test("200: decrements votes when passed a negative value", async () => {
        const voteUpdate = { inc_votes: -100 };

        const { body } = await request(app)
          .patch("/api/articles/1")
          .send(voteUpdate)
          .expect(200);

        expect(body.article.votes).toBe(0);
      });

      test("400: responds with error when inc_votes is missing", async () => {
        const invalidVoteUpdate = {};

        const { body } = await request(app)
          .patch("/api/articles/1")
          .send(invalidVoteUpdate)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when inc_votes is not a number", async () => {
        const invalidVoteUpdate = { inc_votes: "not-a-number" };

        const { body } = await request(app)
          .patch("/api/articles/1")
          .send(invalidVoteUpdate)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("404: responds with error when article_id does not exist", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/articles/999")
          .send(voteUpdate)
          .expect(404);

        expect(body.message).toBe("Article not found");
      });

      test("400: responds with error when article_id is invalid", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/articles/not-an-id")
          .send(voteUpdate)
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
      test("201: adds a comment to an article and responds with the posted comment", async () => {
        const newComment = {
          username: "butter_bridge",
          body: "This is a test comment",
        };

        const { body } = await request(app)
          .post("/api/articles/1/comments")
          .send(newComment)
          .expect(201);

        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: newComment.body,
          article_id: 1,
          author: newComment.username,
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });

      test("400: responds with error when request body is missing required fields", async () => {
        const invalidComment = {
          username: "butter_bridge",
        };

        const { body } = await request(app)
          .post("/api/articles/1/comments")
          .send(invalidComment)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("404: responds with error when article_id does not exist", async () => {
        const newComment = {
          username: "butter_bridge",
          body: "This is a test comment",
        };

        const { body } = await request(app)
          .post("/api/articles/999/comments")
          .send(newComment)
          .expect(404);

        expect(body.message).toBe("Article not found");
      });

      test("404: responds with error when username does not exist", async () => {
        const newComment = {
          username: "not_a_user",
          body: "This is a test comment",
        };

        const { body } = await request(app)
          .post("/api/articles/1/comments")
          .send(newComment)
          .expect(404);

        expect(body.message).toBe("Username not found");
      });

      test("400: responds with error when article_id is invalid", async () => {
        const newComment = {
          username: "butter_bridge",
          body: "This is a test comment",
        };

        const { body } = await request(app)
          .post("/api/articles/not-an-id/comments")
          .send(newComment)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });
  });

  describe("/api/comments/:comment-id", () => {
    describe("PATCH", () => {
      test("200: updates comment votes and responds with updated comment", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/comments/1")
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

      test("200: decrements votes when passed a negative value", async () => {
        const voteUpdate = { inc_votes: -10 };

        const { body } = await request(app)
          .patch("/api/comments/1")
          .send(voteUpdate)
          .expect(200);

        expect(body.comment.votes).toBe(6);
      });

      test("400: responds with error when inc_votes is missing", async () => {
        const invalidVoteUpdate = {};

        const { body } = await request(app)
          .patch("/api/comments/1")
          .send(invalidVoteUpdate)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("400: responds with error when inc_votes is not a number", async () => {
        const invalidVoteUpdate = { inc_votes: "not-a-number" };

        const { body } = await request(app)
          .patch("/api/comments/1")
          .send(invalidVoteUpdate)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });

      test("404: responds with error when comment_id does not exist", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/comments/999")
          .send(voteUpdate)
          .expect(404);

        expect(body.message).toBe("Comment not found");
      });

      test("400: responds with error when comment_id is invalid", async () => {
        const voteUpdate = { inc_votes: 1 };

        const { body } = await request(app)
          .patch("/api/comments/not-a-number")
          .send(voteUpdate)
          .expect(400);

        expect(body.message).toBe("Bad request");
      });
    });

    describe("DELETE", () => {
      test("204: deletes the specified comment and returns no content", async () => {
        await request(app).delete("/api/comments/1").expect(204);

        const { body } = await request(app)
          .delete("/api/comments/1")
          .expect(404);
        expect(body.message).toBe("Comment not found");
      });

      test("404: responds with appropriate error message when comment_id does not exist", async () => {
        const { body } = await request(app)
          .delete("/api/comments/999")
          .expect(404);
        expect(body.message).toBe("Comment not found");
      });

      test("400: responds with appropriate error message when comment_id is invalid", async () => {
        const { body } = await request(app)
          .delete("/api/comments/not-a-number")
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
  });
});
