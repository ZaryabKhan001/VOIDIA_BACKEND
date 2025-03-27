import express from "express";
import dotenv from "dotenv";
import {} from "node:crypto";
import { dbConnect } from "./database/dbConnect.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import blogRouter from "./routes/blog.route.js";
import cors from "cors";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

dbConnect();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use("/api/auth", authRouter);

app.use("/api/posts", blogRouter);

app.listen(port, () => {
  console.log(`App Started on PORT: ${port}`);
});
