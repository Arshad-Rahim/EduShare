import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/connectDB";
import { UserRoutes } from "./routes/userRoutes";
import { corsOptions } from "./middleware/corsOptionConfiguration";

connectDB();
const app = express();

app.use(cors(corsOptions));

app.use(express.json());

app.use("/", new UserRoutes().router);

export default app;
