import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";
import { ZodError } from "zod";
import { CustomError } from "../util/CustomError";

 
 
 
 
 export const  handleError =(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): void=> {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGES.SERVER_ERROR;
    let errors: { message: string }[] | undefined;

    console.log('Inside error handler ==>')

        console.error("An error occurred", {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : "No stack available",
          method: req.method,
          url: req.url,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        });

    // Handle specific error types
   if (err instanceof ZodError) {
     statusCode = HTTP_STATUS.BAD_REQUEST;
     message = ERROR_MESSAGES.VALIDATION_ERROR;
     errors = err.errors.map((e) => ({ message: e.message }));
   } else if (err instanceof CustomError) {
     statusCode = err.statusCode;
     message = err.message;
   } else if (err instanceof Error) {
     statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
     message = err.message || ERROR_MESSAGES.SERVER_ERROR;
   } else {
     statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
     message = ERROR_MESSAGES.SERVER_ERROR;
   }

    // Send response
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(errors && { errors }), // Include errors array only if it exists
      ...(process.env.NODE_ENV === "development" &&
        err instanceof Error && { stack: err.stack }),
    });

    next();
  }