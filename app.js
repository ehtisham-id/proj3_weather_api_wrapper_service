import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import session from "express-session";

import indexRouter from "./ui/routes/index.js";
import apiRouter from "./api/index.js";

configDotenv();

const app = express();
const server = express();

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

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false // true only if using HTTPS
    }
}));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});



app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'ui/views'));


app.use("/", indexRouter);
server.use("/api", apiRouter);


export default {app, server};