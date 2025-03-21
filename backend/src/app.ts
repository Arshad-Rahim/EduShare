import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'
import { connectDB } from "./config/connectDB";
import { UserRoutes } from "./routes/userRoutes";
import { corsOptions } from "./middleware/corsOptionConfiguration";
import { handleError } from "./middleware/errorHandlingMiddleware";

connectDB();
const app = express();

app.use(cors(corsOptions));

app.use(cookieParser())

app.use(express.json());
app.use((error:any,req:Request,res:Response,next:NextFunction) => handleError(error,req,res,next));

app.use("/", new UserRoutes().router);



export default app;
