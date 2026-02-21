/**
 * @file index.js
 * @description Express server for the Hair Salon application.
 *
 * Responsibilities:
 *   - Razorpay payment integration (Orders API + Payment Links)
 *   - Booking form dropdown data (static JSON)
 *   - Health-check endpoint with MongoDB diagnostics
 *   - Analytics routes (delegated to ./routes/analytics)
 *
 * Deployed on Vercel as a serverless function via `module.exports = app`.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

// ── Database ─────────────────────────────────────────────────────────────────
const connectDB = require("./db");
connectDB().catch((err) => console.error("[server] MongoDB boot error:", err));

// ── Configuration ────────────────────────────────────────────────────────────
/** Frontend URL used for Razorpay payment-link callbacks (redirect after pay). */
const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/+$/, "");

// ── Express app ──────────────────────────────────────────────────────────────
const app = express();

// Allow all origins — acceptable for an internal salon management tool
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Razorpay client (lazy — only created when credentials are provided) ─────
const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validate required payment fields and convert amount to paise.
 * @param {object} body  - Express req.body
 * @param {object} res   - Express response (used to send 400 on failure)
 * @returns {{ name: string, phone: string, amountInPaise: number } | null}
 *          Parsed values, or null if validation failed (response already sent).
 */
function validatePaymentInput(body, res) {
  const { name, phone, amount } = body;

  if (!name || !phone || !amount) {
    res.status(400).json({ error: "name, phone and amount are required" });
    return null;
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  if (isNaN(amountInPaise) || amountInPaise < 100) {
    res.status(400).json({ error: "Amount must be at least ₹1" });
    return null;
  }

  return { name: name.trim(), phone: phone.trim(), amountInPaise };
}

/**
 * Generate an HMAC-SHA256 hex signature for Razorpay verification.
 * @param {string} payload - Concatenated payload string
 * @returns {string} Hex digest
 */
function hmacSha256(payload) {
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");
}

// ─── Payment Routes ──────────────────────────────────────────────────────────

/**
 * POST /api/create-order
 * @body {{ name: string, phone: string, amount: number }} — amount in rupees
 * @returns {{ order_id, amount, currency, key_id, name, phone }}
 *
 * Creates a Razorpay Order for the embedded Checkout SDK on the frontend.
 * Amount is locked server-side so the customer cannot alter it.
 */
app.post("/api/create-order", async (req, res) => {
  if (!razorpay) return res.status(503).json({ error: "Payment service not configured" });

  const parsed = validatePaymentInput(req.body, res);
  if (!parsed) return; // 400 already sent

  try {
    const order = await razorpay.orders.create({
      amount: parsed.amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        customer_name: parsed.name,
        customer_phone: parsed.phone,
        amount_inr: String(req.body.amount),
      },
    });

    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      name: parsed.name,
      phone: parsed.phone,
    });
  } catch (err) {
    console.error("[payment] Order creation error:", err);
    return res.status(500).json({ error: "Failed to create order", details: err.message });
  }
});

/**
 * POST /api/verify-order-payment
 * @body {{ razorpay_order_id, razorpay_payment_id, razorpay_signature, name, phone, amount }}
 * @returns {{ success, payment_id, order_id, amount, name, phone }}
 *
 * Verifies the HMAC-SHA256 signature returned by Razorpay embedded checkout.
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

  const expected = hmacSha256(razorpay_order_id + "|" + razorpay_payment_id);
  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid payment signature" });
  }

  return res.json({
    success: true,
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
    amount: Number(amount) / 100,
    name: name || "",
    phone: phone || "",
  });
});

/**
 * POST /api/create-payment-link
 * @body {{ name: string, phone: string, amount: number }} — amount in rupees
 * @returns {{ payment_link_url: string }}
 *
 * Creates a Razorpay Payment Link (legacy flow). Razorpay redirects the
 * customer back to the frontend /payment-status page with query params.
 */
app.post("/api/create-payment-link", async (req, res) => {
  if (!razorpay) return res.status(503).json({ error: "Payment service not configured" });

  const parsed = validatePaymentInput(req.body, res);
  if (!parsed) return;

  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: parsed.amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: "Hair Salon Appointment Payment",
      customer: { name: parsed.name, contact: "+91" + parsed.phone },
      notify: { sms: true, email: false },
      reminder_enable: false,
      notes: {
        customer_name: parsed.name,
        customer_phone: parsed.phone,
        amount_inr: String(req.body.amount),
      },
      callback_url: `${FRONTEND_URL}/payment-status`,
      callback_method: "get",
    });

    return res.json({ payment_link_url: paymentLink.short_url });
  } catch (err) {
    console.error("[payment] Payment link error:", err);
    return res.status(500).json({ error: "Failed to create payment link", details: err.message });
  }
});

/**
 * GET /api/verify-payment
 * @query razorpay_payment_id, razorpay_payment_link_id,
 *        razorpay_payment_link_reference_id, razorpay_payment_link_status,
 *        razorpay_signature
 * @returns {{ success, payment_id, amount, currency, name, phone, status }}
 *
 * Verifies the Razorpay Payment Link callback signature, then fetches
 * full payment details (amount, customer info) for the confirmation page.
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
  if (!razorpay) return res.status(503).json({ success: false, error: "Payment service not configured" });

  // Reconstruct the payload and verify HMAC signature
  const payload = [
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_payment_id,
  ].join("|");

  if (hmacSha256(payload) !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid payment signature" });
  }

  // Fetch full payment details from Razorpay API
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
    console.error("[payment] Fetch error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch payment details" });
  }
});

// ─── Static Data ─────────────────────────────────────────────────────────────

/**
 * GET /api/form-data
 * Returns dropdown options for the booking form:
 *   artists, serviceTypes, staff, services.
 *
 * In a production app this data would live in the database;
 * for now it's hard-coded so the frontend renders instantly.
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
      { id: "sv1", name: "Classic Haircut", price: 300 },
      { id: "sv2", name: "Premium Haircut", price: 500 },
      { id: "sv3", name: "Global Hair Colour", price: 1500 },
      { id: "sv4", name: "Balayage", price: 3500 },
      { id: "sv5", name: "Keratin Smoothening", price: 4000 },
      { id: "sv6", name: "Blow Dry", price: 400 },
      { id: "sv7", name: "Beard Shaping", price: 200 },
      { id: "sv8", name: "Hair Spa", price: 800 },
      { id: "sv9", name: "Scalp Detox", price: 1200 },
      { id: "sv10", name: "Full Body Waxing", price: 1800 },
    ],
  });
});

// ─── Utility Routes ──────────────────────────────────────────────────────────

/** Root route — confirms the API is running. */
app.get("/", (_req, res) =>
  res.json({ service: "Hair Salon Backend API", status: "running" })
);

/**
 * GET /api/health
 * Returns server status + MongoDB connection state.
 * readyState codes: 0 = disconnected, 1 = connected,
 *                   2 = connecting, 3 = disconnecting
 */
app.get("/api/health", async (_req, res) => {
  try {
    await connectDB();
    res.json({
      status: "ok",
      mongoState: mongoose.connection.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
      mongoUri: process.env.MONGODB_URI ? "set" : "NOT SET",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      mongoState: mongoose.connection.readyState,
      mongoUri: process.env.MONGODB_URI ? "set" : "NOT SET",
      error: err.message,
    });
  }
});

// ─── Analytics Routes (mounted sub-router) ──────────────────────────────────
app.use("/api/analytics", require("./routes/analytics"));

// ─── Server / Vercel Export ──────────────────────────────────────────────────
// When run locally (`node index.js`), start an HTTP server.
// On Vercel, the exported Express app is wrapped automatically.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log("Backend running at http://localhost:" + PORT);
  });
}

module.exports = app;
