require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const seedAdmin = require("./config/seedAdmin");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();
