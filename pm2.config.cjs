module.exports = {
    apps: [
        {
            name: "venasclub",
            script: "./src/server.js",
            env_production: {
                NODE_ENV: "production",
            },
            interpreter: "bun",
        },
    ],
};
