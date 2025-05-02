import express from "express";
import { login } from "../controllers/authentication.controller.js";

const routes = express.Router();

routes.post("/login", login);

export { routes };
