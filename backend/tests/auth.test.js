const request = require("supertest");
const app = require("../src/server");

describe("Auth API", () => {
    let authToken = "";

    it("should register a new user", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                email: "test@example.com",
                password: "password123",
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe("User registered successfully");
    });

    it("should login an existing user", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "test@example.com",
                password: "password123",
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
        authToken = res.body.token;
    });

    it("should get user data with valid token", async () => {
        const res = await request(app)
            .get("/auth/me")
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("email");
    });

    it("should return 401 for protected route without token", async () => {
        const res = await request(app)
            .get("/auth/me");

        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toBe("Access denied. No token provided.");
    });
});
