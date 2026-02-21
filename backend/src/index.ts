import express, { type Express } from "express";

const app: Express = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
