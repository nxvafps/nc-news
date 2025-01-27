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

describe("invalid route", () => {
  it("should respond with a status code of 404 when given an invalid route", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/invalid").expect(404);
    expect(message).toBe(`Can't find /api/invalid on this server`);
  });
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", async () => {
    const {
      body: { endpoints },
    } = await request(app).get("/api").expect(200);
    expect(endpoints).toEqual(endpointsJson);
  });
});

describe("GET /api/topics", () => {
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

    expect(body.topics).toEqual([
      {
        description: "The man, the Mitch, the legend",
        slug: "mitch",
      },
      {
        description: "Not dogs",
        slug: "cats",
      },
      {
        description: "what books are made of",
        slug: "paper",
      },
    ]);
  });
});

describe("GET /api/articles/:article_id", () => {
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

  test("404: responds with appropriate error message when article_id does not exist", async () => {
    const { body } = await request(app).get("/api/articles/999").expect(404);
    expect(body.message).toBe("Article not found");
  });

  test("400: responds with appropriate error message when article_id is invalid", async () => {
    const { body } = await request(app)
      .get("/api/articles/not-an-id")
      .expect(400);
    expect(body.message).toBe("Invalid article ID");
  });
});
