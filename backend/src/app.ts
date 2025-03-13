import express from "express";
import cors from "cors";
import { connectDB } from "./config/connectDB";
import dotenv from "dotenv";
import { UserRoutes } from "./routes/userRoutes";
dotenv.config();

connectDB();
const app = express();
app.use(express.json());
app.use(cors());

app.use('/', new UserRoutes().router)

export default app;
