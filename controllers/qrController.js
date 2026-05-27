// controllers/qrController.js
import prisma from "../models/prisma.js";

// GET /api/qrimages
export async function getAll(req, res) {
  try {
    const list = await prisma.qRImage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        business: { select: { name: true, code: true } },
        qrDevices: { include: { device: { select: { name: true, deviceCode: true } } } },
        _count: { select: { transactions: true } }
      }
    });
    res.json({ ok: true, data: list });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

// GET /api/qrimages/:id
export async function getOne(req, res) {
  try {
    const item = await prisma.qRImage.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        business: true,
        qrDevices: { include: { device: true } },
        transactions: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    });
    if (!item) return res.status(404).json({ ok: false, message: "Không tìm thấy" });
    res.json({ ok: true, data: item });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

// POST /api/qrimages
export async function create(req, res) {
  try {
    const { name, amount, accountName, accountNo, businessId, deviceIds } = req.body;
    if (!name || !amount || !accountName || !accountNo || !businessId) {
      return res.status(400).json({ ok: false, message: "Thiếu thông tin bắt buộc" });
    }
    const item = await prisma.qRImage.create({
      data: {
        name, amount, accountName, accountNo,
        businessId: Number(businessId),
        qrDevices: deviceIds?.length
          ? { create: deviceIds.map(id => ({ deviceId: Number(id) })) }
          : undefined
      },
      include: { qrDevices: { include: { device: true } } }
    });
    res.status(201).json({ ok: true, data: item });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}

// PUT /api/qrimages/:id
export async function update(req, res) {
  try {
    const { name, amount, accountName, accountNo, deviceIds } = req.body;
    // Xóa QRDevice cũ, tạo lại mới
    await prisma.qRDevice.deleteMany({ where: { qrId: Number(req.params.id) } });
    const item = await prisma.qRImage.update({
      where: { id: Number(req.params.id) },
      data: {
        name, amount, accountName, accountNo,
        qrDevices: deviceIds?.length
          ? { create: deviceIds.map(id => ({ deviceId: Number(id) })) }
          : undefined
      },
      include: { qrDevices: { include: { device: true } } }
    });
    res.json({ ok: true, data: item });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, message: "Không tìm thấy" });
    }
    res.status(500).json({ ok: false, message: err.message });
  }
}

// DELETE /api/qrimages/:id
export async function remove(req, res) {
  try {
    await prisma.qRDevice.deleteMany({ where: { qrId: Number(req.params.id) } });
    await prisma.qRImage.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true, message: "Đã xóa" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, message: "Không tìm thấy" });
    }
    res.status(500).json({ ok: false, message: err.message });
  }
}