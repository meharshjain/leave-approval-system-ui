const path = require("path");
const express = require("express");

const port = process.env.PORT || 8000;
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client", "build")));

// Catch-all to serve React's index.html for client-side routing
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
