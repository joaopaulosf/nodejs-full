const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const path = require("path");
const root = require("./routes/root");
const employees = require("./routes/api/employees");
const app = express();
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const PORT = process.env.PORT || 3500;

// Custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing (3rd party middleware)
app.use(cors(corsOptions));

// Build-in middleware to handle urlencoded data, "content-type: application/x-www-form-urlencoded"
app.use(express.urlencoded({ extended: false }));

// Build-in middleware for json
app.use(express.json());

// Serve static files
app.use("/", express.static("public"));

// Routes
app.use("/", root);
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
