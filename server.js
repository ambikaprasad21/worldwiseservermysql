import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import app from "./app.js";

app.listen(8000, () => {
  console.log("server running on port 8000");
});
