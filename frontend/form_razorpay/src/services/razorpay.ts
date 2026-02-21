/**
 * @file razorpay.ts
 * @description Dynamically loads the Razorpay Checkout SDK.
 *
 * The script tag is injected once on first call; subsequent calls
 * resolve immediately without reinserting the tag.
 */

/** Injects the Razorpay Checkout `<script>` tag into the DOM. */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
