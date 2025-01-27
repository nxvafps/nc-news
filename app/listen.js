const app = require("./app");
const db = require("./db");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    db.end();
  });
});
