// controllers/webhookController.js
import { getState, setState, clearState, getRawState } from "../models/relayState.js";

const PRICE_PER_MIN = Number(process.env.PRICE_PER_MIN) || 1000;

function relayControl(turn) {
  const time = new Date().toLocaleTimeString("vi-VN");
  console.log(`[${time}] 🔌 RELAY → ${turn.toUpperCase()}`);

  // Khi có Shelly thật → bỏ comment đoạn này
  // await fetch(`${process.env.SHELLY_SERVER}/device/relay/control`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //   body: new URLSearchParams({
  //     auth_key: process.env.SHELLY_AUTH,
  //     id:       process.env.SHELLY_ID,
  //     channel:  "0",
  //     turn,
  //   }),
  // });
}

export function handleWebhook(req, res) {
  const secret = process.env.SEPAY_SECRET || "test_secret_123";

  if (req.headers["x-api-key"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const amount  = req.body.transferAmount;
  console.log("📦 Body nhận được:", req.body);
  const minutes = Math.floor(amount / PRICE_PER_MIN);

  console.log(`💰 Nhận ${amount.toLocaleString()}đ → ${minutes} phút`);

  if (minutes <= 0) {
    return res.json({ ok: false, message: "Số tiền không đủ" });
  }

  const raw = getRawState();
  let totalMs;

  if (raw.activeTimer && raw.endTime) {
    // Đang chạy → cộng dồn
    const remaining = raw.endTime - Date.now();
    totalMs = remaining + minutes * 60 * 1000;
    clearState();
    console.log(`⏱  Cộng dồn → còn ${Math.round(totalMs / 60000)} phút`);
  } else {
    // Chưa chạy → bật mới
    totalMs = minutes * 60 * 1000;
    relayControl("on");
  }

  const endTime = Date.now() + totalMs;
  const timer   = setTimeout(() => {
    relayControl("off");
    clearState();
    console.log("✅ Hết giờ → Relay OFF");
  }, totalMs);

  setState(timer, endTime);

  res.json({
    ok:        true,
    minutes,
    totalLeft: Math.round(totalMs / 60000),
  });
}

export function handleStatus(req, res) {
  res.json(getState());
}
export function handleSimulate(req, res) {
  // Chỉ cho phép khi môi trường là development
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Không khả dụng trên production" });
  }

  const amount  = req.body.transferAmount;
  const minutes = Math.floor(amount / PRICE_PER_MIN);

  console.log(`🧪 [SIMULATE] ${amount.toLocaleString()}đ → ${minutes} phút`);

  if (minutes <= 0) {
    return res.json({ ok: false, message: "Số tiền không đủ" });
  }

  const raw = getRawState();
  let totalMs;

  if (raw.activeTimer && raw.endTime) {
    const remaining = raw.endTime - Date.now();
    totalMs = remaining + minutes * 60 * 1000;
    clearState();
  } else {
    totalMs = minutes * 60 * 1000;
    relayControl("on");
  }

  const endTime = Date.now() + totalMs;
  const timer = setTimeout(() => {
    relayControl("off");
    clearState();
    console.log("✅ Hết giờ → Relay OFF");
  }, totalMs);

  setState(timer, endTime);

  res.json({ ok: true, minutes, totalLeft: Math.round(totalMs / 60000) });
}