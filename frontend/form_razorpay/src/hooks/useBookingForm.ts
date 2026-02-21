/**
 * @file useBookingForm.ts
 * @description Custom React hook encapsulating all booking-form logic.
 *
 * Manages form state, validation, dropdown data fetching, and the
 * full Razorpay checkout flow (load SDK → create order → open modal
 * → verify → redirect to /payment-status).
 *
 * Amount is **auto-calculated** from selected services.
 * Discount is entered as a **percentage** (0–100).
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type {
  BookingFormData,
  BookingFormErrors,
  ApiFormData,
  RazorpayResponse,
} from "@/types/booking";
import { loadRazorpayScript } from "@/services/razorpay";
import { fetchFormData, createOrder, verifyOrderPayment } from "@/services/api";

const today = new Date().toISOString().split("T")[0];

const EMPTY_FORM: BookingFormData = {
  name: "",
  phone: "",
  amount: "",
  age: "",
  gender: "",
  startTime: "",
  endTime: "",
  artist: "",
  serviceType: [],
  filledBy: "",
  searchService: [],
  discount: "",
  date: today,
};

export function useBookingForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<BookingFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [dropdownData, setDropdownData] = useState<ApiFormData>({
    artists: [],
    serviceTypes: [],
    staff: [],
    services: [],
  });

  // Load dropdown options on mount
  useEffect(() => {
    fetchFormData()
      .then(setDropdownData)
      .catch(() => {
        /* silently ignore — backend may not be running locally */
      });
  }, []);

  // ── Service display items for MultiSelect (append price to name) ───────────
  const serviceDisplayItems = useMemo(
    () =>
      dropdownData.services.map((s) => ({
        id: s.id,
        name: `${s.name} — ₹${s.price.toLocaleString("en-IN")}`,
      })),
    [dropdownData.services]
  );

  // ── Auto-calculated amount from selected services ──────────────────────────
  const subtotal = useMemo(() => {
    return formData.searchService.reduce((sum, id) => {
      const svc = dropdownData.services.find((s) => s.id === id);
      return sum + (svc?.price ?? 0);
    }, 0);
  }, [formData.searchService, dropdownData.services]);

  /** Discount percentage (clamped 0–100). */
  const discountPct = Math.min(100, Math.max(0, Number(formData.discount) || 0));

  /** Flat discount amount derived from percentage. */
  const discountAmt = Math.round(subtotal * (discountPct / 100));

  /** Final amount payable after discount. */
  const payable = Math.max(0, subtotal - discountAmt);

  // Keep formData.amount in sync so the rest of the flow sees it
  useEffect(() => {
    setFormData((prev) => {
      const next = String(payable);
      return prev.amount !== next ? { ...prev, amount: next } : prev;
    });
  }, [payable]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: BookingFormErrors = {};
    if (!formData.name.trim()) e.name = "Name is required";
    else if (formData.name.trim().length < 2) e.name = "At least 2 characters";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(formData.phone.trim()))
      e.phone = "Valid 10-digit Indian mobile number";
    if (subtotal <= 0) e.amount = "Select at least one service";
    else if (payable <= 0) e.amount = "Payable amount must be greater than ₹0";
    if (
      formData.age &&
      (isNaN(Number(formData.age)) ||
        Number(formData.age) < 1 ||
        Number(formData.age) > 120)
    )
      e.age = "Enter a valid age (1–120)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Change handlers ────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BookingFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelect = (field: keyof BookingFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof BookingFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /** For multi-select fields (string[] values) — replaces the whole array. */
  const handleMultiSelect =
    (field: keyof BookingFormData) => (values: string[]) => {
      setFormData((prev) => ({ ...prev, [field]: values }));
    };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFormData({ ...EMPTY_FORM, date: today });
    setErrors({});
    setPaymentError(null);
  };

  // ── Submit / payment flow ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setPaymentError(null);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded)
        throw new Error("Failed to load Razorpay SDK. Check your connection.");

      const order = await createOrder({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        amount: payable,
      });

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Hair Salon",
        description: "Appointment Payment",
        order_id: order.order_id,
        prefill: {
          name: formData.name.trim(),
          contact: `+91${formData.phone.trim()}`,
        },
        theme: { color: "#1c1917" },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setPaymentError("Payment was cancelled. Please try again.");
          },
        },
        handler: async (response: RazorpayResponse) => {
          const result = await verifyOrderPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            amount: order.amount,
          });

          if (result.success) {
            const params = new URLSearchParams({
              payment_id: result.payment_id,
              amount: String(result.amount),
              name: result.name,
              phone: result.phone,
            });
            navigate(`/payment-status?${params}`);
          } else {
            setPaymentError("Payment verification failed. Contact support.");
            setIsLoading(false);
          }
        },
      });

      rzp.open();
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    paymentError,
    dropdownData,
    serviceDisplayItems,
    subtotal,
    discountPct,
    discountAmt,
    payable,
    handleChange,
    handleSelect,
    handleMultiSelect,
    handleSubmit,
    handleReset,
  };
}
