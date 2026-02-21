/**
 * @file booking.ts
 * @description TypeScript type definitions for the booking flow.
 *
 * Includes Razorpay SDK window augmentation, API response shapes,
 * and form-state interfaces used by useBookingForm.
 */
// ─── Razorpay SDK types ───────────────────────────────────────────────────────

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

// ─── API / dropdown types ─────────────────────────────────────────────────────

export interface DropdownItem {
  id: string;
  name: string;
}

/** Service item returned by the backend — includes a price. */
export interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

export interface ApiFormData {
  artists: DropdownItem[];
  serviceTypes: DropdownItem[];
  staff: DropdownItem[];
  services: ServiceItem[];
}

// ─── Form state types ─────────────────────────────────────────────────────────

export interface BookingFormData {
  name: string;
  phone: string;
  amount: string;
  age: string;
  gender: string;
  startTime: string;
  endTime: string;
  artist: string;
  serviceType: string[];
  filledBy: string;
  searchService: string[];
  discount: string;
  date: string;
}

export interface BookingFormErrors {
  name?: string;
  phone?: string;
  amount?: string;
  age?: string;
  gender?: string;
  startTime?: string;
  endTime?: string;
  artist?: string;
  serviceType?: string;
}
