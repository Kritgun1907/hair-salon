require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");

// Remove trailing slash so CORS origin matches the browser's Origin header
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

const app = express();

// CORS — allow the frontend origin + handle preflight (including OPTIONS)
app.use(cors({
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
 * POST /api/create-order
 * Body: { name, phone, amount (rupees) }
 * Returns: { order_id, amount, currency, key_id }
 *
 * Uses Razorpay Orders API + embedded Checkout SDK on the frontend.
 * This enables prefill (name, phone) and locks the amount — no re-entry needed.
 */
app.post("/api/create-order", async (req, res) => {
  const { name, phone, amount } = req.body;

  if (!name || !phone || !amount) {
    return res.status(400).json({ error: "name, phone and amount are required" });
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  if (isNaN(amountInPaise) || amountInPaise < 100) {
    return res.status(400).json({ error: "Amount must be at least ₹1" });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        customer_name: name,
        customer_phone: phone,
        amount_inr: String(amount),
      },
    });

    return res.json({
      order_id: order.id,
      amount: order.amount,        // in paise
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,  // safe to expose — it's a public key
      name,
      phone,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return res.status(500).json({ error: "Failed to create order", details: err.message });
  }
});

/**
 * POST /api/verify-order-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, phone, amount }
 * Returns: { success, payment_id, amount, name, phone }
 */
app.post("/api/verify-order-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    name,
    phone,
    amount,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing payment parameters" });
  }

  const payload = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid payment signature" });
  }

  return res.json({
    success: true,
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
    amount: Number(amount) / 100,   // paise → rupees
    name: name || "",
    phone: phone || "",
  });
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

/**
 * GET /api/form-data
 * Returns dropdown data: artists, serviceTypes, staff, services
 * In production replace these arrays with real DB queries.
 */
app.get("/api/form-data", (_req, res) => {
  res.json({
    artists: [
      { id: "a1", name: "Priya Sharma" },
      { id: "a2", name: "Rahul Verma" },
      { id: "a3", name: "Sneha Patel" },
      { id: "a4", name: "Arjun Singh" },
      { id: "a5", name: "Meera Nair" },
    ],
    serviceTypes: [
      { id: "s1", name: "Haircut" },
      { id: "s2", name: "Hair Colour" },
      { id: "s3", name: "Highlights" },
      { id: "s4", name: "Keratin Treatment" },
      { id: "s5", name: "Blow Dry" },
      { id: "s6", name: "Beard Trim" },
      { id: "s7", name: "Hair Spa" },
      { id: "s8", name: "Scalp Treatment" },
      { id: "s9", name: "Waxing" },
      { id: "s10", name: "Facial" },
    ],
    staff: [
      { id: "f1", name: "Anjali Desai" },
      { id: "f2", name: "Vikram Joshi" },
      { id: "f3", name: "Pooja Mehta" },
    ],
    services: [
      { id: "sv1", name: "Classic Haircut — ₹300" },
      { id: "sv2", name: "Premium Haircut — ₹500" },
      { id: "sv3", name: "Global Hair Colour — ₹1500" },
      { id: "sv4", name: "Balayage — ₹3500" },
      { id: "sv5", name: "Keratin Smoothening — ₹4000" },
      { id: "sv6", name: "Blow Dry — ₹400" },
      { id: "sv7", name: "Beard Shaping — ₹200" },
      { id: "sv8", name: "Hair Spa — ₹800" },
      { id: "sv9", name: "Scalp Detox — ₹1200" },
      { id: "sv10", name: "Full Body Waxing — ₹1800" },
    ],
  });
});

// Local dev: listen normally. Vercel serverless: export the app.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log("Backend running at http://localhost:" + PORT);
  });
}

module.exports = app;
