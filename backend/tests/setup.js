const app = require("../src/server");

let server;
const db = require("../src/models/db");

beforeAll((done) => {
    db.run("DELETE FROM users", () => {
        db.run("DELETE FROM tasks", done);
    });
});

beforeAll((done) => {
    server = app.listen(5001, () => {
        console.log("✅ Test server running on port 5001");
        done();
    });
});

afterAll((done) => {
    server.close(() => {
        console.log("❌ Test server stopped");
        done();
    });
});

