require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");

// Remove trailing slash so CORS origin matches the browser's Origin header
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

const app = express();

// CORS — allow the frontend origin + handle preflight
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Explicitly respond to all OPTIONS preflight requests
app.options("*", cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/create-payment-link
 * Body: { name, phone, amount (rupees) }
 * Returns: { payment_link_url }
 */
app.post("/api/create-payment-link", async (req, res) => {
  const { name, phone, amount } = req.body;

  if (!name || !phone || !amount) {
    return res.status(400).json({ error: "name, phone and amount are required" });
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  if (isNaN(amountInPaise) || amountInPaise < 100) {
    return res.status(400).json({ error: "Amount must be at least ₹1" });
  }

  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: "Hair Salon Appointment Payment",
      customer: {
        name: name,
        contact: "+91" + phone,
      },
      notify: { sms: true, email: false },
      reminder_enable: false,
      notes: {
        customer_name: name,
        customer_phone: phone,
        amount_inr: String(amount),
      },
      // Razorpay appends ?razorpay_payment_id=...&razorpay_signature=... etc.
      callback_url: `${FRONTEND_URL}/payment-status`,
      callback_method: "get",
    });

    return res.json({ payment_link_url: paymentLink.short_url });
  } catch (err) {
    console.error("Razorpay error:", err);
    return res.status(500).json({ error: "Failed to create payment link", details: err.message });
  }
});

/**
 * GET /api/verify-payment
 * Query params forwarded from Razorpay callback:
 *   razorpay_payment_id, razorpay_payment_link_id,
 *   razorpay_payment_link_reference_id, razorpay_payment_link_status, razorpay_signature
 * Returns: { success, payment_id, amount, name, phone, status }
 */
app.get("/api/verify-payment", async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_signature,
  } = req.query;

  if (!razorpay_payment_id || !razorpay_payment_link_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing payment parameters" });
  }

  // Razorpay signature verification
  const payload =
    razorpay_payment_link_id + "|" +
    razorpay_payment_link_reference_id + "|" +
    razorpay_payment_link_status + "|" +
    razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid payment signature" });
  }

  // Fetch full payment details (amount, notes) from Razorpay
  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    return res.json({
      success: true,
      payment_id: razorpay_payment_id,
      amount: payment.amount / 100,
      currency: payment.currency,
      name: payment.notes?.customer_name || "",
      phone: payment.notes?.customer_phone || "",
      status: payment.status,
    });
  } catch (err) {
    console.error("Razorpay fetch error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch payment details" });
  }
});

// Root route
app.get("/", (_req, res) => res.json({ service: "Hair Salon Backend API", status: "running" }));

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Local dev: listen normally. Vercel serverless: export the app.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log("Backend running at http://localhost:" + PORT);
  });
}

module.exports = app;
