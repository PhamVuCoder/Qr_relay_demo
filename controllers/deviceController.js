// controllers/deviceController.js
import prisma from "../models/prisma.js";

// GET /api/devices
export async function getAll(req, res) {
  try {
    const list = await prisma.device.findMany({
      orderBy: { createdAt: "desc" },
      include: { business: { select: { name: true, code: true } } }
    });
    res.json({ ok: true, data: list });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

// GET /api/devices/:id
export async function getOne(req, res) {
  try {
    const item = await prisma.device.findUnique({
      where: { id: Number(req.params.id) },
      include: { business: true }
    });
    if (!item) return res.status(404).json({ ok: false, message: "Không tìm thấy" });
    res.json({ ok: true, data: item });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

// POST /api/devices
export async function create(req, res) {
  try {
    const { deviceCode, name, model, power, note, businessId } = req.body;
    if (!deviceCode || !name || !businessId) {
      return res.status(400).json({ ok: false, message: "Thiếu deviceCode, name hoặc businessId" });
    }
    const item = await prisma.device.create({
      data: { deviceCode, name, model, power, note, businessId: Number(businessId) }
    });
    res.status(201).json({ ok: true, data: item });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ ok: false, message: "Mã thiết bị đã tồn tại" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ ok: false, message: "Điểm kinh doanh không tồn tại" });
    }
    res.status(500).json({ ok: false, message: err.message });
  }
}

// PUT /api/devices/:id
export async function update(req, res) {
  try {
    const { deviceCode, name, model, power, note, businessId } = req.body;
    const item = await prisma.device.update({
      where: { id: Number(req.params.id) },
      data: { deviceCode, name, model, power, note, businessId: Number(businessId) }
    });
    res.json({ ok: true, data: item });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, message: "Không tìm thấy" });
    }
    res.status(500).json({ ok: false, message: err.message });
  }
}

// DELETE /api/devices/:id
export async function remove(req, res) {
  try {
    await prisma.device.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ ok: true, message: "Đã xóa" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, message: "Không tìm thấy" });
    }
    res.status(500).json({ ok: false, message: err.message });
  }
}