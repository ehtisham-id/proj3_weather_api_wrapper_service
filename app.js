import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";

import indexRouter from "./routes/index.js";
import apiRouter from "./api/index.js";

configDotenv();

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
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});



app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));


app.use("/", indexRouter);
app.use("/api", apiRouter);


export default app;