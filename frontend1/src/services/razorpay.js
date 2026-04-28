export function isRazorpayAvailable() {
  return typeof window !== "undefined" && typeof window.Razorpay === "function";
}

export async function waitForRazorpay({ timeoutMs = 8000 } = {}) {
  if (isRazorpayAvailable()) return true;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 50));
    if (isRazorpayAvailable()) return true;
  }
  return false;
}

