/**
 * @file LandingPage.tsx
 * @description Hero landing page with animated entry transitions.
 *
 * Contains a headline, tagline, two CTA buttons (Book / Analytics),
 * and decorative feature pills at the bottom.
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ClipboardList, BarChart2, Scissors, Sparkles } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";

export default function LandingPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">

        {/* Animated scissors badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-stone-600 tracking-widest uppercase">
            Premium Salon Management
          </span>
        </motion.div>

        {/* Hero headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-stone-900 leading-none mb-6"
        >
          Expert
          <br />
          <span className="relative inline-block">
            Hair Dresser
            {/* Underline accent */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.55 }}
              className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full origin-left"
              style={{ background: "linear-gradient(to right, #a8906e, #d4a96a)" }}
            />
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
          className="max-w-xl text-lg text-stone-500 mb-12 leading-relaxed"
        >
          Book appointments, process payments, and track your salon's
          performance — all in one place.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          {/* Primary: Booking */}
          <Link to="/booking">
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-stone-900 text-white font-semibold text-base shadow-lg shadow-stone-900/20 hover:bg-stone-800 hover:shadow-xl hover:shadow-stone-900/30 transition-all duration-200 cursor-pointer"
            >
              <ClipboardList className="w-5 h-5 transition-transform group-hover:rotate-6 duration-200" />
              Book Appointment
            </motion.div>
          </Link>

          {/* Secondary: Analytics */}
          <Link to="/analytics">
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-stone-300 bg-white text-stone-800 font-semibold text-base shadow-sm hover:border-stone-400 hover:shadow-md hover:bg-stone-50 transition-all duration-200 cursor-pointer"
            >
              <BarChart2 className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
              View Analytics
            </motion.div>
          </Link>
        </motion.div>

        {/* Decorative feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-20 flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: <Scissors className="w-3.5 h-3.5" />, label: "Appointment Booking" },
            { icon: <ClipboardList className="w-3.5 h-3.5" />, label: "Service Tracking" },
            { icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Revenue Analytics" },
            { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Artist Management" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-500 shadow-sm"
            >
              {icon}
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}
