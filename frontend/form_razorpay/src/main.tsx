/**
 * @file main.tsx
 * @description Application entry point.
 *
 * Mounts the React root with client-side routing:
 *   /                — Landing page (hero + CTA)
 *   /booking         — Appointment booking form with Razorpay checkout
 *   /payment-status  — Payment confirmation / failure screen
 *   /analytics       — Business analytics dashboard
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LandingPage from './pages/LandingPage'
import BookingPage from './pages/BookingPage'
import PaymentStatus from './pages/PaymentStatus'
import Analytics from './pages/Analytics'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
