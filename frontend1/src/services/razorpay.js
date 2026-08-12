/**
 * Razorpay is loaded on-demand (only when user clicks Buy Credits).
 * This avoids adding ~100KB of third-party JS to every page load.
 */

let scriptLoaded = false;
let scriptLoading = null;

function loadRazorpayScript() {
  if (scriptLoaded) return Promise.resolve(true);
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      scriptLoaded = true;
      resolve(true);
    };
    script.onerror = () => {
      scriptLoading = null; // Allow retry on next attempt
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return scriptLoading;
}

export function isRazorpayAvailable() {
  return typeof window !== "undefined" && typeof window.Razorpay === "function";
}

export async function waitForRazorpay({ timeoutMs = 8000 } = {}) {
  if (isRazorpayAvailable()) return true;

  // Inject script if not yet loaded
  await loadRazorpayScript();

  // Wait for global to become available after script injection
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 50));
    if (isRazorpayAvailable()) return true;
  }
  return false;
}
