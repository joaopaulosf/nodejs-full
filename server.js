require("dotenv").config({ path: ".env" });
const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const path = require("path");
const app = express();
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const PORT = process.env.PORT || 3500;

// Routes
const root = require("./routes/root");
const employees = require("./routes/api/employees");
const register = require("./routes/register");
const auth = require("./routes/auth");

// Connect to MongoDB
connectDB();

// Custom middleware logger
app.use(logger);

// Handle options credentials check before CORS
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing (3rd party middleware)
app.use(cors(corsOptions));

// Build-in middleware to handle urlencoded data, "content-type: application/x-www-form-urlencoded"
app.use(express.urlencoded({ extended: false }));

// Build-in middleware for json
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve static files
app.use("/", express.static("public"));

// Routes
app.use("/", root);
app.use("/register", register);
app.use("/auth", auth);
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJWT);
app.use("/employees", employees);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
