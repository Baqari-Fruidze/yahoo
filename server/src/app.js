import express from "express";
import dotenv from "./dotenv.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import homeRoute from "./routes/homeRoute.js";
import userRoute from "./routes/userRoute.js";
import stockRoute from "./routes/stockRoute.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ----------------- Routes -----------------
app.use("/api/home", homeRoute);
app.use("/api/user", userRoute);
app.use("/api/stock", stockRoute);

export default app;
