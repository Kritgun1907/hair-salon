import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, IndianRupee, Scissors, CheckCircle2 } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import "./App.css";

interface FormData {
  name: string;
  phone: string;
  amount: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  amount?: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    amount: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Enter a valid amount";
    } else if (Number(formData.amount) < 1) {
      newErrors.amount = "Minimum amount is ₹1";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setPaymentError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create-payment-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            amount: Number(formData.amount),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment link");
      }

      // Redirect browser to Razorpay hosted payment page (shows UPI QR, cards, etc.)
      window.location.href = data.payment_link_url;
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", phone: "", amount: "" });
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <BackgroundBeams className="opacity-60" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(120,80,255,0.15), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-purple-500/60 to-transparent" />

          <div className="px-8 pt-8 pb-4">
            {/* Header */}
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
              <p className="text-neutral-400 text-sm text-center">
                Fill in your details and complete your payment securely
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle2 className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-white">
                    Payment Successful!
                  </h2>
                  <p className="text-neutral-400 text-sm text-center">
                    Thank you,{" "}
                    <span className="text-white font-medium">{formData.name}</span>!
                    Your booking is confirmed for ₹{Number(formData.amount).toLocaleString("en-IN")}.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="mt-2 px-6 py-2 rounded-lg border border-white/20 text-sm text-neutral-300 hover:text-white hover:border-white/40 transition-all duration-200"
                  >
                    Book another appointment
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Name field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-200 font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
                          focusedField === "name"
                            ? "text-purple-400"
                            : "text-neutral-500"
                        )}
                      />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        className={cn(
                          "pl-10",
                          errors.name && "border-red-500/60 focus-visible:ring-red-500/30"
                        )}
                        autoComplete="name"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-400 flex items-center gap-1"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-neutral-200 font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
                          focusedField === "phone"
                            ? "text-purple-400"
                            : "text-neutral-500"
                        )}
                      />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                        maxLength={10}
                        className={cn(
                          "pl-10",
                          errors.phone && "border-red-500/60 focus-visible:ring-red-500/30"
                        )}
                        autoComplete="tel"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-400"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Amount field */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-neutral-200 font-medium">
                      Amount to Pay
                    </Label>
                    <div className="relative">
                      <IndianRupee
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
                          focusedField === "amount"
                            ? "text-purple-400"
                            : "text-neutral-500"
                        )}
                      />
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="e.g. 500"
                        value={formData.amount}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("amount")}
                        onBlur={() => setFocusedField(null)}
                        min="1"
                        className={cn(
                          "pl-10",
                          errors.amount && "border-red-500/60 focus-visible:ring-red-500/30"
                        )}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.amount && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-400"
                        >
                          {errors.amount}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Amount preview */}
                  <AnimatePresence>
                    {formData.amount && !errors.amount && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-3 flex items-center justify-between"
                      >
                        <span className="text-sm text-neutral-400">Total payable</span>
                        <span className="text-lg font-bold text-white">
                          ₹{Number(formData.amount).toLocaleString("en-IN")}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment error banner */}
                  <AnimatePresence>
                    {paymentError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-2 text-sm text-red-400"
                      >
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {paymentError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment button */}
                  <div className="pt-2 pb-2">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      className="relative w-full h-12 rounded-xl overflow-hidden font-semibold text-white disabled:cursor-not-allowed group"
                    >
                      {/* Sparkles background */}
                      <div className="absolute inset-0 z-0">
                        <SparklesCore
                          background="transparent"
                          minSize={0.4}
                          maxSize={1}
                          particleDensity={80}
                          particleColor="#c084fc"
                        />
                      </div>

                      {/* Gradient background */}
                      <div className="absolute inset-0 bg-linear-to-r from-violet-600 via-purple-600 to-blue-600 group-hover:from-violet-500 group-hover:via-purple-500 group-hover:to-blue-500 transition-all duration-300 z-0" />

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                        style={{
                          background:
                            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />

                      {/* Button label */}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Redirecting to Razorpay…
                          </>
                        ) : (
                          <>
                            <IndianRupee className="w-4 h-4" />
                            Pay Now with Razorpay
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>

                  {/* Security note */}
                  <p className="text-center text-xs text-neutral-500 pb-1 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Secured by Razorpay · 256-bit SSL encryption
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export default App;
