const request = require("supertest");
const app = require("../app/app");

describe("Auth endpoints", () => {
  describe("POST /api/auth/signup", () => {
    test("201: creates a new user and returns token", async () => {
      const newUser = {
        username: "testuser",
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };

      const { body } = await request(app)
        .post("/api/auth/signup")
        .send(newUser)
        .expect(201);

      expect(body.user).toMatchObject({
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
      });
      expect(body.token).toBeDefined();
    });

    test("400: responds with error when required fields are missing", async () => {
      const { body } = await request(app)
        .post("/api/auth/signup")
        .send({})
        .expect(400);

      expect(body.message).toBe("Missing username");
    });

    test("400: responds with error when username is missing", async () => {
      const invalidUser = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };

      const { body } = await request(app)
        .post("/api/auth/signup")
        .send(invalidUser)
        .expect(400);

      expect(body.message).toBe("Missing username");
    });

    test("400: responds with error when name is missing", async () => {
      const invalidUser = {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
      };

      const { body } = await request(app)
        .post("/api/auth/signup")
        .send(invalidUser)
        .expect(400);

      expect(body.message).toBe("Missing name");
    });

    test("400: responds with error when email is missing", async () => {
      const invalidUser = {
        username: "testuser",
        name: "Test User",
        password: "Password123!",
      };

      const { body } = await request(app)
        .post("/api/auth/signup")
        .send(invalidUser)
        .expect(400);

      expect(body.message).toBe("Missing email");
    });

    test("400: responds with error when password is missing", async () => {
      const invalidUser = {
        username: "testuser",
        name: "Test User",
        email: "test@example.com",
      };

      const { body } = await request(app)
        .post("/api/auth/signup")
        .send(invalidUser)
        .expect(400);

      expect(body.message).toBe("Missing password");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      const newUser = {
        username: "testuser",
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };
      await request(app).post("/api/auth/signup").send(newUser);
    });
    test("200: returns user and token for valid credentials", async () => {
      const credentials = {
        email: "test@example.com",
        password: "Password123!",
      };

      const { body } = await request(app)
        .post("/api/auth/login")
        .send(credentials)
        .expect(200);

      expect(body.user).toBeDefined();
      expect(body.token).toBeDefined();
    });

    test("401: responds with error for invalid credentials", async () => {
      const credentials = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const { body } = await request(app)
        .post("/api/auth/login")
        .send(credentials)
        .expect(401);

      expect(body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /api/auth/me", () => {
    test("200: returns current user when authenticated", async () => {
      const newUser = {
        username: "testuser",
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };
      await request(app).post("/api/auth/signup").send(newUser);

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: newUser.email,
        password: newUser.password,
      });

      const { body } = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(body.user).toMatchObject({
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
      });
    });

    test("401: responds with error when no token provided", async () => {
      const { body } = await request(app).get("/api/auth/me").expect(401);

      expect(body.message).toBe("No token provided");
    });
  });
});
