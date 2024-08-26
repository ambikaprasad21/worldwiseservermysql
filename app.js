import express from "express";
import cors from "cors";
import globalErrorHandler from "./controller/errorController.js";
import pool from "./utils/db.js";
import authRouter from "./routes/authRoute.js";
import dataRouter from "./routes/dataRoute.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://wwvercel-l3km.vercel.app"],
    methods: ["GET", "POST", "DELETE"],
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  console.log("👋 Hello from worldwise server");
  next();
});

// app.get("/", (req, res) => {
//   pool.query("select * from users", (err, results) => {
//     if (err) {
//       console.log(err);
//       res.status(400).json({
//         status: "fail",
//         message: "There was some error",
//       });
//       return;
//     }
//     res.status(200).json({
//       status: "success",
//       data: results,
//     });
//   });
// });

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/data", dataRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
