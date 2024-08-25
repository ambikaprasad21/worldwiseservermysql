import express from "express";
import authController from "./../controller/authController.js";
const authRouter = express.Router();

authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);

authRouter.post("/googleAuth", authController.googleAuth);
authRouter.get("/profile", authController.profile);

// authRouter.post("logout");

export default authRouter;
