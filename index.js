// index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import facilsRouter from "./routes/facils.js";

const app = express();
app.use(cors());
app.use(express.json());

// 단일 헬스체크용
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/facils", facilsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
