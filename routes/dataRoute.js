import express from "express";
import authController from "../controller/authController.js";
import dataController from "../controller/dataController.js";
const dataRouter = express.Router();

dataRouter.use(authController.protect);

dataRouter.get("/", dataController.getAllCity);
dataRouter.get("/:id", dataController.getCityById);
dataRouter.post("/create", dataController.create);
dataRouter.delete("/delete", dataController.removeCity);

export default dataRouter;
