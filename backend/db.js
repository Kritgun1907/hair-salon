/**
 * @file db.js
 * @description Singleton MongoDB connection manager for serverless environments.
 *
 * On platforms like Vercel, each invocation may cold-start a new process.
 * This module caches the connection promise so that concurrent requests
 * share the same connection rather than opening duplicates.
 */

const mongoose = require("mongoose");

/** Cached connection promise — shared across requests within one process. */
let connectionPromise = null;

/**
 * Connect to MongoDB Atlas (or local) using the MONGODB_URI env var.
 * Safe to call repeatedly — returns immediately if already connected.
 *
 * @returns {Promise<void>}
 * @throws {Error} If MONGODB_URI is missing or the connection fails.
 */
async function connectDB() {
  // Already connected — nothing to do
  if (mongoose.connection.readyState === 1) return;

  // If a previous connection is closing, wait for it to finish first
  if (mongoose.connection.readyState === 3) {
    await new Promise((resolve) =>
      mongoose.connection.once("disconnected", resolve)
    );
  }

  // A connection attempt is already in flight — wait for it
  if (connectionPromise) return connectionPromise;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  console.log("[db] Connecting to MongoDB…");

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // Fail fast on cold-start instead of 30 s
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log("[db] MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("[db] MongoDB connection failed:", err.message);
      connectionPromise = null; // Allow retry on next request
      throw err;
    });

  return connectionPromise;
}

module.exports = connectDB;
