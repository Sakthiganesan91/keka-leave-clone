import express from "express";
import {
  login,
  logout,
  verifyToken,
} from "../controllers/authentication.controller.js";

const routes = express.Router();

routes.post("/login", login);

routes.post("/logout", logout);

routes.post("/verify-token", verifyToken);

export { routes };
