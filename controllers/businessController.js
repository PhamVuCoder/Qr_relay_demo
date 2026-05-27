// controllers/businessController.js
import prisma from "../models/prisma.js";

// GET /api/businesses — Lấy tất cả điểm kinh doanh
export async function getAll(req, res) {
  try {
    const list = await prisma.businessPoint.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { devices: true, qrImages: true }
        }
      }
    });
    res.json({ ok: true, data: list });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

// GET /api/businesses/:id — Lấy 1 điểm kinh doanh
export async function getOne(req, res) {
  try {
    const item = await prisma.businessPoint.findUnique({
      where: { id: Number(req.params.id) },
      include: { devices: true, qrImages: true }
    });
    if (!item) return res.status(404).json({ ok: false, message: "Không tìm thấy" });
    res.json({ ok: true, data: item });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

// POST /api/businesses — Tạo mới
export async function create(req, res) {
  try {
    const { name, address, phone, code, lat, lng } = req.body;
    if (!name || !address || !code) {
      return res.status(400).json({ ok: false, message: "Thiếu name, address hoặc code" });
    }
    const item = await prisma.businessPoint.create({
      data: { name, address, phone, code, lat, lng }
    });
    res.status(201).json({ ok: true, data: item });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ ok: false, message: "Mã điểm kinh doanh đã tồn tại" });
    }
    res.status(500).json({ ok: false, message: err.message });
  }
}

// PUT /api/businesses/:id — Cập nhật
export async function update(req, res) {
  try {
    const { name, address, phone, code, lat, lng } = req.body;
    const item = await prisma.businessPoint.update({
      where: { id: Number(req.params.id) },
      data: { name, address, phone, code, lat, lng }
    });
    res.json({ ok: true, data: item });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, message: "Không tìm thấy" });
    }
    res.status(500).json({ ok: false, message: err.message });
  }
}

// DELETE /api/businesses/:id — Xóa
export async function remove(req, res) {
  try {
    await prisma.businessPoint.delete({
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