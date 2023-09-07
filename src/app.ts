import * as express from "express";
import * as cors from "cors";

import { usersRouter } from "./routes/user";
import { petsRouter } from "./routes/pet";

// APP INITIALIZATION

export const app = express();

// MIDDLEWARES

app.use(
  cors({
    origin: ["https://pet-finder-7msn.onrender.com", "http://localhost:1234"],
  })
);
app.use(express.json({ limit: "50mb" }));

// ROUTES

app.use("/api/users", usersRouter);
app.use("/api/pets", petsRouter);
