const express = require("express");
const router = express.Router();
const MenuEvent = require("../models/MenuEvent");

router.post("/", async (req, res, next) => {
  try {
    const { vendorId, sessionId, eventType, query, productId, categoryId, metadata } = req.body;
    if (!vendorId || !sessionId || !eventType) {
      return res.status(400).json({ success: false, error: "vendorId, sessionId and eventType are required" });
    }
    const event = await MenuEvent.create({
      vendorId, sessionId, eventType, query, productId, categoryId, metadata,
    });
    res.status(201).json({ success: true, data: { eventId: event._id } });
  } catch (err) { next(err); }
});

module.exports = router;