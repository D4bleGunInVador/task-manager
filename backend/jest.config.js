module.exports = {
    testEnvironment: "node",
    transformIgnorePatterns: ["/node_modules/(?!jsonwebtoken)"],
};
module.exports = {
    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
    testEnvironment: "node"
};
