import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, IndianRupee, Calendar,
  Clock, Tag, Percent, UserCheck,
} from "lucide-react";
import { SparklesCore } from "@/components/ui/sparkles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";
import AppLayout from "@/layouts/AppLayout";
import { useBookingForm } from "@/hooks/useBookingForm";

export default function BookingPage() {
  const {
    formData,
    errors,
    isLoading,
    paymentError,
    dropdownData,
    payable,
    finalAmount,
    discountVal,
    handleChange,
    handleSelect,
    handleMultiSelect,
    handleSubmit,
    handleReset,
  } = useBookingForm();

  return (
    <AppLayout subtitle="Appointment & Payment Form">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-stone-900">New Appointment</h2>
          <p className="text-sm text-stone-500 mt-1">
            Fill in the client details below. Fields marked{" "}
            <span className="text-red-500">*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Section 1: Client Details ── */}
          <Section title="Client Details" icon="01">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full Name" required error={errors.name}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <Input
                    id="name" name="name" type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    className={cn("pl-9", errors.name && "border-red-400 focus-visible:ring-red-300")}
                  />
                </div>
              </Field>

              <Field label="Phone Number" required error={errors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <Input
                    id="phone" name="phone" type="tel"
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    autoComplete="tel"
                    className={cn("pl-9", errors.phone && "border-red-400 focus-visible:ring-red-300")}
                  />
                </div>
              </Field>

              <Field label="Age" error={errors.age}>
                <Input
                  id="age" name="age" type="number"
                  placeholder="e.g. 28"
                  value={formData.age}
                  onChange={handleChange}
                  min="1" max="120"
                  className={cn(errors.age && "border-red-400 focus-visible:ring-red-300")}
                />
              </Field>

              <Field label="Gender">
                <Select value={formData.gender} onValueChange={handleSelect("gender")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* ── Section 2: Appointment Details ── */}
          <Section title="Appointment Details" icon="02">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Date of Filling">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <Input
                    id="date" name="date" type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field label="Artist">
                <Select value={formData.artist} onValueChange={handleSelect("artist")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownData.artists.length === 0 ? (
                      <SelectItem value="_loading" disabled>Loading…</SelectItem>
                    ) : (
                      dropdownData.artists.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Start Time" error={errors.startTime}>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <Input
                    id="startTime" name="startTime" type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field label="End Time" error={errors.endTime}>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <Input
                    id="endTime" name="endTime" type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field label="Service Type">
                <MultiSelect
                  items={dropdownData.serviceTypes}
                  values={formData.serviceType}
                  onValuesChange={handleMultiSelect("serviceType")}
                  placeholder="Select service types…"
                  searchPlaceholder="Search service types…"
                />
              </Field>

              <Field label="Search Services">
                <MultiSelect
                  items={dropdownData.services}
                  values={formData.searchService}
                  onValuesChange={handleMultiSelect("searchService")}
                  placeholder="Search & select services…"
                  searchPlaceholder="Type to search…"
                />
              </Field>

              <Field label="Filled By">
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none z-10" />
                  <Select value={formData.filledBy} onValueChange={handleSelect("filledBy")}>
                    <SelectTrigger className="w-full pl-9">
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {dropdownData.staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Field>
            </div>
          </Section>

          {/* ── Section 3: Payment ── */}
          <Section title="Payment" icon="03">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Amount (₹)" required error={errors.amount}>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <Input
                    id="amount" name="amount" type="number"
                    placeholder="e.g. 1500"
                    value={formData.amount}
                    onChange={handleChange}
                    min="1"
                    className={cn("pl-9", errors.amount && "border-red-400 focus-visible:ring-red-300")}
                  />
                </div>
              </Field>

              <Field label="Discount (₹)">
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <Input
                    id="discount" name="discount" type="number"
                    placeholder="e.g. 100"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    className="pl-9"
                  />
                </div>
              </Field>
            </div>

            {/* Payable summary */}
            <AnimatePresence>
              {formData.amount && !errors.amount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 rounded-xl border border-stone-200 bg-stone-50 px-5 py-4"
                >
                  <div className="flex items-center justify-between text-sm text-stone-500 mb-1">
                    <span>Service amount</span>
                    <span>₹{finalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex items-center justify-between text-sm text-emerald-600 mb-1">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" /> Discount
                      </span>
                      <span>− ₹{discountVal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="border-t border-stone-200 mt-2 pt-2 flex items-center justify-between font-bold text-stone-900">
                    <span>Total Payable</span>
                    <span className="text-xl">₹{payable.toLocaleString("en-IN")}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* Error banner */}
          <AnimatePresence>
            {paymentError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start justify-between gap-2 text-sm text-red-700"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {paymentError}
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="shrink-0 text-xs text-red-500 underline hover:text-red-700"
                >
                  Clear
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              Reset Form
            </button>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.015 }}
              whileTap={{ scale: isLoading ? 1 : 0.985 }}
              className="relative w-full sm:w-64 h-12 rounded-xl overflow-hidden font-semibold text-white disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 z-0 pointer-events-none">
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={60}
                  particleColor="#c8a97e"
                />
              </div>
              <div className="absolute inset-0 bg-stone-900 hover:bg-stone-800 transition-colors duration-200 z-0" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Redirecting…
                  </>
                ) : (
                  <>
                    {payable > 0
                      ? `Pay ₹${payable.toLocaleString("en-IN")} with Razorpay`
                      : "Pay with Razorpay"}
                  </>
                )}
              </span>
            </motion.button>
          </div>

          {/* Security note */}
          <p className="text-center text-xs text-stone-400 mt-4 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            Secured by Razorpay · 256-bit SSL encryption
          </p>
        </form>
      </motion.div>
    </AppLayout>
  );
}

// ─── Local UI sub-components ──────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/60">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-900 text-white text-xs font-bold">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold tracking-wide uppercase text-stone-500">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
