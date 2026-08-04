import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/lib/models/Transaction";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Check Razorpay Keys configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured on the server" },
        { status: 500 }
      );
    }

    // 3. Define payment options
    const amount = 50000; // ₹500 in paise (500 * 100)
    const currency = "INR";
    const receipt = `rcpt_${payload.userId.toString().slice(-6)}_${Date.now()}`;

    // 4. Create order via Razorpay API
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    // 5. Connect to DB and save pending transaction
    await connectDB();
    await Transaction.create({
      user: payload.userId,
      razorpayOrderId: order.id,
      amount,
      currency,
      status: "pending",
    });

    // 6. Return order details to client
    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;
    console.error("Razorpay Order Creation Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate payment order" },
      { status: 500 }
    );
  }
}
