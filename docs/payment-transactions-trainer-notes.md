# Interactive Trainer Notes: Payments & Transactions in a Web App

## Session Goal
This is a simple 2-hour lesson for beginners. The goal is not to build a real payment provider today. The goal is to teach the basic flow of payments and transactions in a web app using a small, real-world example.

We will add a simple “Upgrade to Pro” feature to this project so students can learn:
- how a payment request moves through the app
- how a transaction is stored in the database
- how the frontend and backend work together
- how to handle success and failure safely

---

## Real-World Story to Start With
Tell the class this story:

“Imagine a user logs into your project tracker and wants to unlock premium features. They click Pay Now. The app should not only show a success message, it should also record that payment safely in the database.”

This is the same pattern used in:
- SaaS apps
- subscriptions
- e-commerce stores
- booking platforms
- membership systems

---

## Interactive Opening Questions
Ask students these questions before coding:
- What happens when a user clicks Pay Now?
- What should the app remember after payment?
- Why should the server check the payment instead of trusting the browser?
- What if the amount is zero or the user is not logged in?

Expected answer:
- the request goes to the server
- the server validates the request
- the server saves a transaction record
- the UI shows a response

---

## Simple Concept to Teach
A payment is the action.
A transaction is the record of that action.

Example:
- User clicks “Upgrade to Pro”
- Frontend sends the payment request
- Server creates a transaction record
- App shows success or error

This is the core idea.

---

## Simple Architecture to Draw
Use this simple flow on the board:

User → Frontend Button → API Route → Database → Response

Explain that the frontend is only the front door. The server is the trusted part.

---

## The Project Example
We will build a simple feature inside this app:
- a user clicks “Upgrade to Pro”
- the app sends a request to the backend
- the backend creates a transaction record
- the UI shows a message

This keeps the lesson realistic but still simple.

---

## Folder Structure for This Lesson
We will keep it simple:
- lib/models/Transaction.ts
- app/api/transactions/route.ts
- app/page.tsx or components/UpgradeCard.tsx

---

## Step-by-Step Teaching Prompts
These prompts are meant for you to read one by one while students build.

### Step 1 — Introduce the feature
Prompt to read:
“Today we are adding a small payment flow to p-tracker. We will make a user able to upgrade to Pro. The important idea is not the payment provider. The important idea is the flow.”

Ask:
- What should happen when the user clicks the button?
- What should the app save?

Expected explanation:
- the app should send a request
- the server should validate it
- the server should save the transaction

---

### Step 2 — Create the transaction model
Prompt to read:
“Let us create a Transaction model. This model will store the payment information in the database.”

Ask students to write this file:

```ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  method: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    method: {
      type: String,
      default: "card",
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
```

Ask:
- Why do we need a status field?
- Why do we validate the amount?

---

### Step 3 — Create the API route
Prompt to read:
“Now we will build the backend route. This route will receive the payment request and save the transaction.”

Ask students to create this file:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/lib/models/Transaction";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, description, method } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    await connectDB();

    const transaction = await Transaction.create({
      user: payload.userId,
      amount,
      currency: "USD",
      status: "paid",
      method: method || "card",
      description: description.trim(),
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

Ask:
- Why do we check the token first?
- Why do we validate the amount?
- Why is this route important?

---

### Step 4 — Add the frontend button
Prompt to read:
“Now we connect the backend to the user interface. When the user clicks the button, the app sends a request.”

Ask students to add a small UI component:

```tsx
"use client";

import { useState } from "react";

export default function UpgradeCard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 29,
          description: "Upgrade to Pro",
          method: "card",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      setMessage(`Payment successful: ${data.transaction.amount} USD`);
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Upgrade to Pro</h2>
      <p className="mt-2 text-sm text-slate-600">Unlock premium features for $29.</p>
      <button onClick={handleUpgrade} className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-white">
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
```

Ask:
- What is the role of this component?
- Why do we show a message after the request?

---

### Step 5 — Test the full flow
Prompt to read:
“Now we test the full experience. We will check whether the app behaves correctly from start to finish.”

Ask students to do this:
1. Log in
2. Click Pay Now
3. Check the response message
4. Check whether a transaction was created
5. Try invalid input like amount 0

Ask:
- What happens if the user is not logged in?
- What happens if the amount is invalid?
- Why is the backend validation important?

---

## Key Teaching Points
- A payment is the action.
- A transaction is the record.
- The browser can be changed by the user, so the server must validate requests.
- A successful UI message is not enough; a real transaction record should exist.
- A transaction should have a status like pending, paid, or failed.

---

## Common Mistakes to Mention
- Putting all logic only in the frontend
- Forgetting to validate the request
- Not checking authentication
- Not storing a transaction record
- Assuming the frontend success means the backend worked

---

## Mini Assignment
Ask students to choose one:
1. Add a “Cancel” transaction state
2. Show a transaction history list
3. Add a validation message when the amount is invalid
4. Change the feature from “Upgrade to Pro” to “Buy Credits”

---

## Short Wrap-Up
End the session by saying:
“Today we learned that payments are not just buttons. They are a flow of request, validation, storage, and response.”

---

## Suggested 2-Hour Timing
- 15 min: Story, concept, and opening questions
- 20 min: Explain architecture and model
- 40 min: Build backend route
- 25 min: Build frontend payment button
- 20 min: Test, fix, and discuss mistakes

---

## Next Topic Preview
Next session will be about performance optimization and best practices.
Students should start thinking about:
- reducing unnecessary API calls
- caching data
- keeping components simple
- avoiding expensive re-renders
