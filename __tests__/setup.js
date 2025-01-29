const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("Database Connection", () => {
  test("database connects successfully", () => {
    expect(db).toBeDefined();
  });
});
