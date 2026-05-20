import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminPayload } from "@/lib/adminAuth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

// GET — all pending withdrawals
export async function GET() {
  try {
    const admin = await getAdminPayload();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const pending = await db
      .collection("transactions")
      .find({ type: "withdrawal", status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    const enriched = await Promise.all(
      pending.map(async (t) => {
        const user = await db.collection("users").findOne(
          { _id: new ObjectId(t.userId) },
          { projection: { username: 1, fullName: 1, email: 1 } }
        );

        return {
          id: t._id.toString(),
          userId: t.userId,
          userName: user?.username || user?.fullName || "Unknown",
          userEmail: user?.email || "",
          amount: t.amount,
          method: t.method,
          walletAddress: t.walletAddress,
          status: t.status,
          createdAt: t.createdAt?.toISOString() ?? "",
        };
      })
    );

    return NextResponse.json({ withdrawals: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — approve | leavePending | declineWithEmail | declineWithoutEmail
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminPayload();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId, action } = await req.json();

    const validActions = [
      "approve",
      "leavePending",
      "declineWithEmail",
      "declineWithoutEmail",
    ];

    if (!transactionId || !validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const tx = await db.collection("transactions").findOne({
      _id: new ObjectId(transactionId),
    });

    if (!tx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(tx.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = user.username || user.fullName || "User";
    const amt = tx.amount;
    const formattedAmount = `$${Number(amt).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const timestamp = new Date().toLocaleString();

    // ── APPROVE ──────────────────────────────────────────────────
    if (action === "approve") {
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        {
          $set: {
            status: "approved",
            approvedAt: new Date(),
          },
        }
      );

      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "✅ Withdrawal Approved",
          html: `
            <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
              <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
                  
                  <div style="background:linear-gradient(135deg,#10b981,#059669);padding:40px 30px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:12px;">✅</div>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">
                      Withdrawal Approved
                    </h1>
                    <p style="margin:10px 0 0;color:#d1fae5;font-size:15px;">
                      Your funds are now being processed.
                    </p>
                  </div>

                  <div style="padding:36px 30px;">
                    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
                      Hi <strong>${userName}</strong>,
                    </p>

                    <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#4b5563;">
                      Great news! Your withdrawal request has been approved and is currently being processed.
                      The funds should arrive in your selected wallet shortly.
                    </p>

                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:24px;margin-bottom:24px;">
                      <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;">Amount</td>
                          <td style="padding:8px 0;text-align:right;font-weight:700;color:#10b981;">
                            ${formattedAmount}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;">Method</td>
                          <td style="padding:8px 0;text-align:right;color:#111827;">
                            ${tx.method}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;">Wallet</td>
                          <td style="padding:8px 0;text-align:right;color:#111827;font-size:12px;word-break:break-all;">
                            ${tx.walletAddress}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;">Approved At</td>
                          <td style="padding:8px 0;text-align:right;color:#111827;">
                            ${timestamp}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
                      Thank you for choosing Aver Exchange.
                    </p>
                  </div>

                  <div style="padding:20px 30px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Aver Exchange. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error("Approve withdrawal mail error:", e);
      }

      return NextResponse.json({
        success: true,
        message: "Withdrawal approved",
      });
    }

    // ── LEAVE PENDING ─────────────────────────────────────────────
    if (action === "leavePending") {
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "⏳ Withdrawal Still Processing",
          html: `
            <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
              <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;">
                  
                  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px 30px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:12px;">⏳</div>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">
                      Processing Update
                    </h1>
                  </div>

                  <div style="padding:36px 30px;">
                    <p style="font-size:15px;color:#374151;">
                      Hi <strong>${userName}</strong>,
                    </p>

                    <p style="font-size:15px;line-height:1.8;color:#4b5563;">
                      Your withdrawal request for <strong>${formattedAmount}</strong>
                      is still being processed.
                    </p>

                    <p style="font-size:15px;line-height:1.8;color:#4b5563;">
                      If the request is taking longer than expected, please contact our support team
                      at <strong>support@averexchange.com</strong> for assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error("Leave pending mail error:", e);
      }

      return NextResponse.json({
        success: true,
        message: "User notified to contact support",
      });
    }

    // ── DECLINE WITH EMAIL ────────────────────────────────────────
    if (action === "declineWithEmail") {
      await db.collection("users").updateOne(
        { _id: new ObjectId(tx.userId) },
        { $inc: { balance: amt } }
      );

      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        {
          $set: {
            status: "declined",
            declinedAt: new Date(),
            refunded: true,
          },
        }
      );

      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "❌ Withdrawal Declined",
          html: `
            <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
              <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;">
                  
                  <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px 30px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:12px;">❌</div>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">
                      Withdrawal Declined
                    </h1>
                  </div>

                  <div style="padding:36px 30px;">
                    <p style="font-size:15px;color:#374151;">
                      Hi <strong>${userName}</strong>,
                    </p>

                    <p style="font-size:15px;line-height:1.8;color:#4b5563;">
                      Your withdrawal request for <strong>${formattedAmount}</strong>
                      via <strong>${tx.method}</strong> has been declined.
                    </p>

                    <p style="font-size:15px;line-height:1.8;color:#4b5563;">
                      The full amount has been refunded to your account balance.
                    </p>

                    <p style="font-size:14px;color:#6b7280;">
                      If you have questions, please contact support@averexchange.com.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error("Decline with email mail error:", e);
      }

      return NextResponse.json({
        success: true,
        message: "Withdrawal declined, user refunded and notified",
      });
    }

    // ── DECLINE WITHOUT EMAIL ─────────────────────────────────────
    if (action === "declineWithoutEmail") {
      await db.collection("users").updateOne(
        { _id: new ObjectId(tx.userId) },
        { $inc: { balance: amt } }
      );

      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        {
          $set: {
            status: "reversed",
            reversedAt: new Date(),
            refunded: true,
            emailSent: false,
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Withdrawal reversed silently, user refunded",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}






// import { NextRequest, NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { getAdminPayload } from "@/lib/adminAuth";
// import { ObjectId } from "mongodb";
// import { transporter } from "@/lib/mailer";

// // GET — all pending withdrawals
// export async function GET() {
//   try {
//     const admin = await getAdminPayload();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const client = await clientPromise;
//     const db = client.db();

//     const pending = await db
//       .collection("transactions")
//       .find({ type: "withdrawal", status: "pending" })
//       .sort({ createdAt: -1 })
//       .toArray();

//     const enriched = await Promise.all(
//       pending.map(async (t) => {
//         const user = await db.collection("users").findOne(
//           { _id: new ObjectId(t.userId) },
//           { projection: { username: 1, fullName: 1, email: 1 } }
//         );
//         return {
//           id: t._id.toString(),
//           userId: t.userId,
//           userName: user?.username || user?.fullName || "Unknown",
//           userEmail: user?.email || "",
//           amount: t.amount,
//           method: t.method,
//           walletAddress: t.walletAddress,
//           status: t.status,
//           createdAt: t.createdAt?.toISOString() ?? "",
//         };
//       })
//     );

//     return NextResponse.json({ withdrawals: enriched });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // POST — approve | leavePending | declineWithEmail | declineWithoutEmail
// export async function POST(req: NextRequest) {
//   try {
//     const admin = await getAdminPayload();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { transactionId, action } = await req.json();
//     const validActions = ["approve", "leavePending", "declineWithEmail", "declineWithoutEmail"];

//     if (!transactionId || !validActions.includes(action)) {
//       return NextResponse.json({ error: "Invalid request" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db();

//     const tx = await db.collection("transactions").findOne({
//       _id: new ObjectId(transactionId),
//     });
//     if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

//     const user = await db.collection("users").findOne({ _id: new ObjectId(tx.userId) });
//     if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

//     const userName = user.username || user.fullName || "User";
//     const amt = tx.amount;

//     // ── APPROVE ──────────────────────────────────────────────────
//     if (action === "approve") {
//       await db.collection("transactions").updateOne(
//         { _id: new ObjectId(transactionId) },
//         { $set: { status: "approved", approvedAt: new Date() } }
//       );

//       // Email user
//       try {
//         await transporter.sendMail({
//           from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: "✅ Withdrawal Approved!",
//           html: `
//             <div style="font-family:sans-serif;max-width:600px;">
//               <h2 style="color:#0f2744;">Withdrawal Approved!</h2>
//               <p>Hi <b>${userName}</b>,</p>
//               <p>Your withdrawal of <b>$${amt?.toLocaleString()}</b> via <b>${tx.method}</b> has been approved and is being processed.</p>
//               <p>Wallet: <code style="font-size:12px;">${tx.walletAddress}</code></p>
//               <p>— The Aver Exchange Team</p>
//             </div>
//           `,
//         });
//       } catch (e) { console.error("Approve withdrawal mail error:", e); }

//       return NextResponse.json({ success: true, message: "Withdrawal approved" });
//     }

//     // ── LEAVE PENDING ─────────────────────────────────────────────
//     if (action === "leavePending") {
//       // Email user to contact support
//       try {
//         await transporter.sendMail({
//           from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: "⏳ Withdrawal Processing Update",
//           html: `
//             <div style="font-family:sans-serif;max-width:600px;">
//               <h2 style="color:#0f2744;">Withdrawal Still Processing</h2>
//               <p>Hi <b>${userName}</b>,</p>
//               <p>Your withdrawal of <b>$${amt?.toLocaleString()}</b> is still being processed. Since it's taking longer than usual, please contact our support team to help escalate the issue.</p>
//               <p>Email us at: <b>support@averexchange.com</b></p>
//               <p>— The Aver Exchange Team</p>
//             </div>
//           `,
//         });
//       } catch (e) { console.error("Leave pending mail error:", e); }

//       return NextResponse.json({ success: true, message: "User notified to contact support" });
//     }

//     // ── DECLINE WITH EMAIL ────────────────────────────────────────
//     if (action === "declineWithEmail") {
//       // Refund balance
//       await db.collection("users").updateOne(
//         { _id: new ObjectId(tx.userId) },
//         { $inc: { balance: amt } }
//       );

//       // Update transaction status
//       await db.collection("transactions").updateOne(
//         { _id: new ObjectId(transactionId) },
//         { $set: { status: "declined", declinedAt: new Date(), refunded: true } }
//       );

//       // Email user
//       try {
//         await transporter.sendMail({
//           from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: "❌ Withdrawal Declined",
//           html: `
//             <div style="font-family:sans-serif;max-width:600px;">
//               <h2 style="color:#c0392b;">Withdrawal Declined</h2>
//               <p>Hi <b>${userName}</b>,</p>
//               <p>Your withdrawal request of <b>$${amt?.toLocaleString()}</b> via <b>${tx.method}</b> has been declined.</p>
//               <p>The amount has been <b>refunded to your account balance</b>.</p>
//               <p>If you believe this is an error or need assistance, please contact our support team at <b>support@averexchange.com</b>.</p>
//               <p>— The Aver Exchange Team</p>
//             </div>
//           `,
//         });
//       } catch (e) { console.error("Decline with email mail error:", e); }

//       return NextResponse.json({ success: true, message: "Withdrawal declined, user refunded and notified" });
//     }

//     // ── DECLINE WITHOUT EMAIL ─────────────────────────────────────
//     if (action === "declineWithoutEmail") {
//       // Refund balance silently
//       await db.collection("users").updateOne(
//         { _id: new ObjectId(tx.userId) },
//         { $inc: { balance: amt } }
//       );

//       // Update transaction as reversed (no email)
//       await db.collection("transactions").updateOne(
//         { _id: new ObjectId(transactionId) },
//         { $set: { status: "reversed", reversedAt: new Date(), refunded: true, emailSent: false } }
//       );

//       return NextResponse.json({ success: true, message: "Withdrawal reversed silently, user refunded" });
//     }

//     return NextResponse.json({ error: "Unknown action" }, { status: 400 });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }