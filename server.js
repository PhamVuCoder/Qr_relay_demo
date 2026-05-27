// server.js
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import "dotenv/config";
import webhookRouter from "./routes/webhook.js";
import { handleStatus } from "./controllers/webhookController.js";
import businessRouter from "./routes/business.js";
import deviceRouter from "./routes/device.js";
import qrImageRouter from "./routes/qrimage.js";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.use("/webhook", webhookRouter);
app.use("/api/businesses", businessRouter);
app.use("/api/devices", deviceRouter);
app.use("/api/qrimages", qrImageRouter);
app.get("/status", handleStatus);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
}).on("error", (err) => {
  console.error("❌ Server error:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  console.error(err.stack);
});