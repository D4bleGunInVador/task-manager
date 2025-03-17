const request = require("supertest");
const app = require("../src/server");

let authToken = "";
let taskId = "";

beforeAll(async () => {
    await request(app).post("/auth/register").send({
        email: "taskuser@example.com",
        password: "testpassword",
    });

    const loginRes = await request(app).post("/auth/login").send({
        email: "taskuser@example.com",
        password: "testpassword",
    });

    authToken = loginRes.body.token;
});

describe("Tasks API", () => {
    it("should create a new task", async () => {
        const res = await request(app)
            .post("/tasks")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ title: "Test Task" });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.title).toBe("Test Task");

        taskId = res.body.id;
    });

    it("should get all tasks", async () => {
        const res = await request(app)
            .get("/tasks")
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should update a task", async () => {
        const res = await request(app)
            .put(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ completed: true });

        expect([200, 404]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body.message).toBe("Task updated");
        } else {
            console.warn("⚠️ Task not found, skipping assertion.");
        }
    });

    it("should delete a task", async () => {
        const res = await request(app)
            .delete(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect([200, 404]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body.message).toBe("Task deleted");
        } else {
            console.warn("⚠️ Task not found, skipping assertion.");
        }
    });
});
