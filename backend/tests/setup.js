const app = require("../src/server");

let server;

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
afterAll((done) => {
    server.close(() => {
        console.log("Server closed after tests.");
        done();
    });
});
