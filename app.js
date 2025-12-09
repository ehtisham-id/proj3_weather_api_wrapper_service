require("dotenv").config();
import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import indexRouter from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(path.resolve(), "public")));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use("/", indexRouter);

module.exports = app;