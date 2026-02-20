import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Scissors,
  User,
  Phone,
  Hash,
  CalendarCheck,
} from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";

interface PaymentDetails {
  success: boolean;
  payment_id: string;
  amount: number;
  currency: string;
  name: string;
  phone: string;
  status: string;
  error?: string;
}

type VerifyState = "loading" | "success" | "failed" | "invalid";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerifyState>("loading");
  const [details, setDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get("razorpay_payment_id");
    const linkId = searchParams.get("razorpay_payment_link_id");
    const refId = searchParams.get("razorpay_payment_link_reference_id");
    const linkStatus = searchParams.get("razorpay_payment_link_status");
    const signature = searchParams.get("razorpay_signature");

    // If no Razorpay params present at all
    if (!paymentId || !linkId || !signature) {
      setState("invalid");
      return;
    }

    const params = new URLSearchParams({
      razorpay_payment_id: paymentId,
      razorpay_payment_link_id: linkId,
      razorpay_payment_link_reference_id: refId ?? "",
      razorpay_payment_link_status: linkStatus ?? "",
      razorpay_signature: signature,
    });

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-payment?${params}`)
      .then((r) => r.json())
      .then((data: PaymentDetails) => {
        setDetails(data);
        setState(data.success ? "success" : "failed");
      })
      .catch(() => {
        setState("failed");
      });
  }, [searchParams]);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <BackgroundBeams className="opacity-60" />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            state === "success"
              ? "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(52,211,153,0.12), transparent)"
              : state === "failed"
              ? "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(239,68,68,0.12), transparent)"
              : "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(120,80,255,0.15), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Top accent */}
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{
              background:
                state === "success"
                  ? "linear-gradient(to right, transparent, rgba(52,211,153,0.7), transparent)"
                  : state === "failed"
                  ? "linear-gradient(to right, transparent, rgba(239,68,68,0.6), transparent)"
                  : "linear-gradient(to right, transparent, rgba(139,92,246,0.6), transparent)",
            }}
          />

          <div className="px-8 pt-8 pb-8">
            {/* Salon header */}
            <div className="flex flex-col items-center mb-8 gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30 mb-2"
              >
                <Scissors className="w-7 h-7 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Hair Salon Booking
              </h1>
            </div>

            {/* Loading state */}
            {state === "loading" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
                <p className="text-neutral-300 text-sm">Verifying your payment…</p>
              </motion.div>
            )}

            {/* Invalid / no params */}
            {state === "invalid" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <XCircle className="w-20 h-20 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                <h2 className="text-xl font-semibold text-white">Invalid Page</h2>
                <p className="text-neutral-400 text-sm text-center">
                  No payment information found. Please go back and try again.
                </p>
                <a
                  href="/"
                  className="mt-2 px-6 py-2 rounded-lg border border-white/20 text-sm text-neutral-300 hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  ← Back to booking
                </a>
              </motion.div>
            )}

            {/* Success state */}
            {state === "success" && details && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6"
              >
                {/* Success icon with sparkle ring */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full overflow-hidden opacity-40">
                    <SparklesCore
                      background="transparent"
                      minSize={0.4}
                      maxSize={1.2}
                      particleDensity={120}
                      particleColor="#34d399"
                    />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 180, delay: 0.15 }}
                  >
                    <CheckCircle2 className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_24px_rgba(52,211,153,0.7)]" />
                  </motion.div>
                </div>

                <div className="text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    Payment Successful!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-neutral-400 text-sm"
                  >
                    Your appointment is confirmed. See you soon!
                  </motion.p>
                </div>

                {/* Amount highlight */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                  className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 text-center"
                >
                  <p className="text-xs text-neutral-500 mb-1 uppercase tracking-widest">
                    Amount Paid
                  </p>
                  <p className="text-4xl font-bold text-emerald-400">
                    ₹{details.amount.toLocaleString("en-IN")}
                  </p>
                </motion.div>

                {/* Details grid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="w-full space-y-3"
                >
                  <DetailRow
                    icon={<User className="w-4 h-4" />}
                    label="Customer"
                    value={details.name}
                  />
                  <DetailRow
                    icon={<Phone className="w-4 h-4" />}
                    label="Mobile"
                    value={`+91 ${details.phone}`}
                  />
                  <DetailRow
                    icon={<Hash className="w-4 h-4" />}
                    label="Payment ID"
                    value={details.payment_id}
                    mono
                  />
                  <DetailRow
                    icon={<CalendarCheck className="w-4 h-4" />}
                    label="Date"
                    value={new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                </motion.div>

                {/* CTA */}
                <motion.a
                  href="/"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-1 relative h-11 rounded-xl overflow-hidden font-semibold text-white text-sm flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-teal-600 group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Book Another Appointment
                  </span>
                </motion.a>
              </motion.div>
            )}

            {/* Failed state */}
            {state === "failed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-5 py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 180, delay: 0.1 }}
                >
                  <XCircle className="w-20 h-20 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white mb-1">
                    Payment Failed
                  </h2>
                  <p className="text-neutral-400 text-sm">
                    {details?.error || "We could not verify your payment. Please try again."}
                  </p>
                </div>
                <a
                  href="/"
                  className="px-6 py-2 rounded-lg border border-white/20 text-sm text-neutral-300 hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  ← Try again
                </a>
              </motion.div>
            )}
          </div>

          {/* Bottom accent */}
          <div
            className="absolute bottom-0 inset-x-0 h-px"
            style={{
              background:
                state === "success"
                  ? "linear-gradient(to right, transparent, rgba(52,211,153,0.5), transparent)"
                  : "linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent)",
            }}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-600 mt-4 flex items-center justify-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
          Secured by Razorpay · 256-bit SSL encryption
        </p>
      </motion.div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-4 py-2.5 gap-3">
      <div className="flex items-center gap-2 text-neutral-400 shrink-0">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span
        className={`text-sm text-white text-right truncate max-w-45 ${
          mono ? "font-mono text-xs text-neutral-300" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
