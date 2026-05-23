import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// ========== CẤU HÌNH ==========
const SEPAY_SECRET  = "test_secret_123"; // đổi sau khi có Sepay thật
const PRICE_PER_MIN = 1000;              // 1.000đ = 1 phút
// ================================

let activeTimer = null;
let endTime     = null;

function relayControl(turn) {
  // Giả lập relay — chưa có linh kiện
  const time = new Date().toLocaleTimeString("vi-VN");
  console.log(`[${time}] 🔌 RELAY → ${turn.toUpperCase()}`);
}

app.post("/webhook/sepay", (req, res) => {
  if (req.headers["x-api-key"] !== SEPAY_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const amount  = req.body.transferAmount;
  const minutes = Math.floor(amount / PRICE_PER_MIN);

  console.log(`💰 Nhận ${amount.toLocaleString()}đ → ${minutes} phút`);

  if (minutes <= 0) {
    return res.json({ ok: false, message: "Số tiền không đủ" });
  }

  let totalMs;
  if (activeTimer && endTime) {
    // Đang chạy → cộng dồn
    const remaining = endTime - Date.now();
    totalMs = remaining + minutes * 60 * 1000;
    clearTimeout(activeTimer);
    console.log(`⏱  Cộng dồn → tổng còn ${Math.round(totalMs / 60000)} phút`);
  } else {
    // Chưa chạy → bật mới
    totalMs = minutes * 60 * 1000;
    relayControl("on");
  }

  endTime = Date.now() + totalMs;

  activeTimer = setTimeout(() => {
    relayControl("off");
    activeTimer = null;
    endTime     = null;
    console.log("✅ Hết giờ → Relay OFF");
  }, totalMs);

  res.json({
    ok:        true,
    minutes,
    totalLeft: Math.round(totalMs / 60000),
  });
});

app.get("/status", (req, res) => {
  res.json({
    active:      !!activeTimer,
    secondsLeft: endTime ? Math.max(0, Math.round((endTime - Date.now()) / 1000)) : 0,
  });
});

app.listen(3000, () => {
  console.log("🚀 Server: http://localhost:3000");
});