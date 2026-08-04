import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/lib/models/Transaction";
import { User } from "@/lib/models/User";

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

    // 2. Parse request payload
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment details for verification" },
        { status: 400 }
      );
    }



    // 3. Re-compute HMAC SHA256 Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay secret key is not configured on the server" },
        { status: 500 }
      );
    }

    const signInput = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(signInput)
      .digest("hex");

    await connectDB();

    // 4. Verify match
    if (expectedSignature === razorpay_signature) {
      // Signature is valid! Update Transaction & Upgrade User to Pro
      const transaction = await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "successful",
        },
        { new: true }
      );

      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction record not found but signature is valid" },
          { status: 404 }
        );
      }

      // Upgrade User Plan to 'pro'
      const updatedUser = await User.findByIdAndUpdate(
        payload.userId,
        { subscriptionPlan: "pro" },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: "User update failed, transaction updated successfully" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Payment verified successfully, you are now a Pro member!",
          subscriptionPlan: updatedUser.subscriptionPlan,
        },
        { status: 200 }
      );
    } else {
      // Signature mismatch! Mark transaction as failed
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );

      return NextResponse.json(
        { error: "Cryptographic signature verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error("Razorpay Payment Verification Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during verification" },
      { status: 500 }
    );
  }
}
