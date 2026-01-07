import express from "express";

const app = express();
app.get("/health", (req, res) => {
  res.status(200).send("Ok from other side");
});
export default app;
