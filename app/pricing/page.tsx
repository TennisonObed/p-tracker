"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface CustomWindow extends Window {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
}

export default function PricingPage() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"></div>
      </div>
    );
  }

  // Inject Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as unknown as CustomWindow).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setPaymentLoading(true);
    setStatusMessage(null);

    try {
      // 1. Create order on the backend
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Are you offline?");
      }

      // 3. Configure checkout options
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "P-Tracker Premium",
        description: "Unlock Team Collaboration & Task Assignment",
        order_id: orderData.orderId,
        handler: async function (response: RazorpayResponse) {
          try {
            setPaymentLoading(true);
            // 4. Verify signature on the backend
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setStatusMessage({
              type: "success",
              text: "Success! You have unlocked Pro features. Access the Team page now!",
            });

            // 5. Refresh local user state
            await refreshUser();
          } catch (verifyErr) {
            const verr = verifyErr as Error;
            setStatusMessage({
              type: "error",
              text: verr.message || "An error occurred during verification.",
            });
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#6d28d9", // premium violet accent
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      const razorpayClass = (window as unknown as CustomWindow).Razorpay;
      if (!razorpayClass) {
        throw new Error("Razorpay SDK is not available.");
      }
      const rzp = new razorpayClass(options);
      rzp.open();
    } catch (err) {
      const errorObj = err as Error;
      setStatusMessage({
        type: "error",
        text: errorObj.message || "Something went wrong initiating checkout.",
      });
      setPaymentLoading(false);
    }
  };

  const isPro = user?.subscriptionPlan === "pro";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.15),_transparent_40%)]">
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-500">
                Pricing Plans
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Upgrade Your Tracking Experience
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                Unlock collaborative power to build and ship projects with your entire team.
              </p>
            </div>

            {statusMessage && (
              <div
                className={`mt-8 rounded-2xl p-4 text-center text-sm font-medium ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                    : "bg-rose-50 text-rose-800 border border-rose-100"
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <div className="mt-12 grid gap-8 md:grid-cols-2 md:px-6">
              {/* Free Tier Card */}
              <div className="relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Basic Tier</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Standard
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">
                    Perfect for individuals organizing their personal projects.
                  </p>
                  <p className="mt-6 flex items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">₹0</span>
                    <span className="ml-1 text-sm font-semibold text-slate-500">/ forever</span>
                  </p>

                  <ul className="mt-8 space-y-4">
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="mr-3 h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Up to 3 active projects
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="mr-3 h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Basic task list & statuses
                    </li>
                    <li className="flex items-center text-sm text-slate-400 line-through">
                      <svg className="mr-3 h-5 w-5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Team collaboration dashboard
                    </li>
                    <li className="flex items-center text-sm text-slate-400 line-through">
                      <svg className="mr-3 h-5 w-5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Assign tasks to members
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-2xl bg-slate-100 py-3 text-center text-sm font-semibold text-slate-400 cursor-not-allowed"
                  >
                    {isPro ? "Downgrade not available" : "Current Plan"}
                  </button>
                </div>
              </div>

              {/* Pro Tier Card */}
              <div className="relative flex flex-col justify-between rounded-3xl border-2 border-violet-500 bg-white p-8 shadow-xl transition-all hover:scale-[1.01]">
                <div className="absolute -top-4 right-8 rounded-full bg-violet-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Highly Recommended
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Pro Plan</h3>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      Premium
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">
                    Unlocks mock collaboration, team delegation, and unlimited projects.
                  </p>
                  <p className="mt-6 flex items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">₹500</span>
                    <span className="ml-1 text-sm font-semibold text-slate-500">/ one-time payment</span>
                  </p>

                  <ul className="mt-8 space-y-4">
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="mr-3 h-5 w-5 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited active projects
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="mr-3 h-5 w-5 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Premium Team Dashboard
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="mr-3 h-5 w-5 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Add team members & assign tasks
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <svg className="mr-3 h-5 w-5 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Priority support
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  {isPro ? (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={() => router.push("/team")}
                        className="w-full rounded-2xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                      >
                        Go to Team Dashboard
                      </button>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        You are a Pro member
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={paymentLoading}
                      className="w-full rounded-2xl bg-violet-600 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-violet-700 hover:shadow-violet-200/50 disabled:bg-violet-400 disabled:cursor-not-allowed"
                    >
                      {paymentLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                          Processing...
                        </span>
                      ) : (
                        "Upgrade to Pro"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
