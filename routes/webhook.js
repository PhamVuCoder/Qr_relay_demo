import { Router } from "express";
import { handleWebhook, handleStatus, handleSimulate } from "../controllers/webhookController.js";

const router = Router();

router.post("/sepay", handleWebhook);        // Sepay thật gọi vào
router.post("/simulate", handleSimulate);    // Frontend test gọi vào
router.get("/status", handleStatus);

export default router;