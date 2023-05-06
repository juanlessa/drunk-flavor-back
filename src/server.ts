import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";

import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json()); //enable use of JSON

app.use(routes);

//errors middleware
/*
app.use(
    (err: Error, request: Request, response: Response, next: NextFunction) => {
        if (err instanceof AppError) {
            return response.status(err.statusCode).json({
                status: "error",
                message: err.message,
            });
        }
        console.error(err);

        return response.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
);
*/
app.listen(3333, () => {
    console.log("🚀 Server started on port 3333");
});