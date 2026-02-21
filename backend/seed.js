/**
 * Seed script — inserts ~150 realistic salon visits spanning the last 3 months.
 * Run: node seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Visit = require("./models/Visit");

const ARTISTS = ["Rahul", "Priya", "Amit", "Sneha", "Vikram"];
const FILLED_BY = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Owner"];

const SERVICES = [
  { name: "Haircut (Men)", price: 300 },
  { name: "Haircut (Women)", price: 500 },
  { name: "Hair Color", price: 1500 },
  { name: "Hair Spa", price: 800 },
  { name: "Beard Trim", price: 150 },
  { name: "Facial", price: 600 },
  { name: "Head Massage", price: 200 },
  { name: "Shaving", price: 100 },
  { name: "Hair Straightening", price: 2500 },
  { name: "Keratin Treatment", price: 4000 },
  { name: "Manicure", price: 400 },
  { name: "Pedicure", price: 500 },
  { name: "Threading", price: 50 },
  { name: "Waxing", price: 350 },
  { name: "Bridal Makeup", price: 5000 },
];

const SERVICE_TYPES = ["Hair", "Skin", "Nails", "Grooming", "Bridal"];

const CUSTOMERS = [
  { name: "Aarav Sharma", contact: "9876543210", age: 28, gender: "Male" },
  { name: "Ishita Patel", contact: "9876543211", age: 24, gender: "Female" },
  { name: "Rohan Gupta", contact: "9876543212", age: 35, gender: "Male" },
  { name: "Ananya Singh", contact: "9876543213", age: 22, gender: "Female" },
  { name: "Kabir Mehta", contact: "9876543214", age: 30, gender: "Male" },
  { name: "Diya Joshi", contact: "9876543215", age: 27, gender: "Female" },
  { name: "Arjun Reddy", contact: "9876543216", age: 40, gender: "Male" },
  { name: "Meera Nair", contact: "9876543217", age: 33, gender: "Female" },
  { name: "Vivaan Kumar", contact: "9876543218", age: 26, gender: "Male" },
  { name: "Pooja Verma", contact: "9876543219", age: 29, gender: "Female" },
  { name: "Aditya Rao", contact: "9876543220", age: 31, gender: "Male" },
  { name: "Neha Iyer", contact: "9876543221", age: 25, gender: "Female" },
  { name: "Siddharth Das", contact: "9876543222", age: 38, gender: "Male" },
  { name: "Kavya Bhat", contact: "9876543223", age: 21, gender: "Female" },
  { name: "Manish Tiwari", contact: "9876543224", age: 45, gender: "Male" },
  { name: "Ritu Agarwal", contact: "9876543225", age: 34, gender: "Female" },
  { name: "Deepak Mishra", contact: "9876543226", age: 50, gender: "Male" },
  { name: "Simran Kaur", contact: "9876543227", age: 23, gender: "Female" },
  { name: "Rajesh Pandey", contact: "9876543228", age: 42, gender: "Male" },
  { name: "Anjali Desai", contact: "9876543229", age: 36, gender: "Female" },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, min, max) {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(0, 0, 0, 0);
  return d;
}

function randomTime(startHour, endHour) {
  const h = startHour + Math.floor(Math.random() * (endHour - startHour));
  const m = Math.random() < 0.5 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
}

function generateVisit() {
  const customer = pick(CUSTOMERS);
  const services = pickN(SERVICES, 1, 4);
  const subtotal = services.reduce((sum, s) => sum + s.price, 0);
  const discountPercent = Math.random() < 0.3 ? pick([5, 10, 15, 20]) : 0;
  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const finalTotal = subtotal - discountAmount;

  const startH = 9 + Math.floor(Math.random() * 9); // 9 AM to 5 PM
  const durationMins = 30 + Math.floor(Math.random() * 4) * 30; // 30-150 min
  const endH = startH + Math.floor(durationMins / 60);
  const startM = Math.random() < 0.5 ? "00" : "30";
  const endM = (parseInt(startM) + durationMins % 60) % 60;

  const startTime = `${String(startH).padStart(2, "0")}:${startM}`;
  const endTime = `${String(Math.min(endH, 20)).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

  return {
    name: customer.name,
    contact: customer.contact,
    age: customer.age,
    gender: customer.gender,
    date: randomDate(90), // last 3 months
    startTime,
    endTime,
    artist: pick(ARTISTS),
    serviceType: pick(SERVICE_TYPES),
    services,
    filledBy: pick(FILLED_BY),
    subtotal,
    discountPercent,
    discountAmount,
    finalTotal,
    paymentStatus: Math.random() < 0.9 ? "success" : "pending",
    razorpayPaymentId: Math.random() < 0.9 ? `pay_${Math.random().toString(36).slice(2, 16)}` : null,
  };
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Visit.deleteMany({});
  console.log("Cleared existing visits");

  // Generate 150 visits
  const visits = Array.from({ length: 150 }, generateVisit);
  await Visit.insertMany(visits);
  console.log(`Inserted ${visits.length} visits`);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
